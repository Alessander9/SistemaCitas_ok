import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { DatabaseService } from '../../database/database.service';
import { MockEmailProvider } from './providers/mock-email-provider';

describe('EmailsService', () => {
  let service: EmailsService;
  let db: { query: jest.Mock };
  let mockProvider: MockEmailProvider;

  const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';
  const TEMPLATE_ID = 'e0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    db = { query: jest.fn() };
    mockProvider = new MockEmailProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailsService,
        { provide: DatabaseService, useValue: db },
        { provide: MockEmailProvider, useValue: mockProvider },
      ],
    }).compile();

    service = module.get<EmailsService>(EmailsService);
  });

  // ===========================================================================
  // TEMPLATE COMPILER
  // ===========================================================================
  describe('compileTemplate', () => {
    it('should replace dynamic variables formatted as {{var}} or {{ var }}', () => {
      const template = 'Hola {{patient_name}}, tu cita de {{ service_name }} es el {{appointment_date}}.';
      const compiled = service.compileTemplate(template, {
        patient_name: 'Carlos Ruiz',
        service_name: 'Fisioterapia',
        appointment_date: '2026-09-10',
      });

      expect(compiled).toBe('Hola Carlos Ruiz, tu cita de Fisioterapia es el 2026-09-10.');
    });

    it('should replace unknown or undefined variables with an empty string', () => {
      const template = 'Dr(a). {{doctor}} en {{ clinic_name }}';
      const compiled = service.compileTemplate(template, { clinic_name: 'Clínica Sanitas' });

      expect(compiled).toBe('Dr(a).  en Clínica Sanitas');
    });
  });

  // ===========================================================================
  // TEMPLATES MANAGEMENT
  // ===========================================================================
  describe('getTemplates & createTemplate', () => {
    it('should seed default templates if clinic has none', async () => {
      const seededRow = {
        id: TEMPLATE_ID,
        clinic_id: CLINIC_ID,
        name: 'appointment_confirmation',
        subject: 'Confirmación',
        html_body: '<b>Cita</b>',
        variables: ['patient_name'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let queryCallCount = 0;
      db.query.mockImplementation(async (sql: string) => {
        queryCallCount++;
        if (sql.includes('INSERT INTO email_templates')) {
          return { rows: [] };
        }
        if (queryCallCount === 1) {
          return { rows: [] };
        }
        return { rows: [seededRow] };
      });

      const templates = await service.getTemplates(CLINIC_ID);
      expect(templates.length).toBeGreaterThanOrEqual(1);
      expect(templates[0].name).toBe('appointment_confirmation');
    });

    it('should throw BadRequestException when creating a template with duplicate name', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: TEMPLATE_ID, clinic_id: CLINIC_ID, name: 'custom_template' }],
      });

      await expect(
        service.createTemplate(CLINIC_ID, {
          name: 'custom_template',
          subject: 'Test',
          htmlBody: '<p>Test</p>',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when updating non-existent template', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.updateTemplate(CLINIC_ID, TEMPLATE_ID, { subject: 'Nuevo Asunto' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================================================
  // SEND EMAIL & LOGS
  // ===========================================================================
  describe('sendEmail', () => {
    it('should send email using template and log sent status in email_logs', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: TEMPLATE_ID,
              clinic_id: CLINIC_ID,
              name: 'appointment_confirmation',
              subject: 'Cita para {{patient_name}}',
              html_body: '<h1>Hola {{patient_name}}</h1>',
              variables: ['patient_name'],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }) // template lookup
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-1',
              clinic_id: CLINIC_ID,
              template_id: TEMPLATE_ID,
              to_email: 'carlos@example.com',
              subject: 'Cita para Carlos Ruiz',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        }); // insert email_log

      const log = await service.sendEmail(CLINIC_ID, {
        to: 'carlos@example.com',
        templateName: 'appointment_confirmation',
        variables: { patient_name: 'Carlos Ruiz' },
      });

      expect(log.status).toBe('sent');
      expect(log.subject).toBe('Cita para Carlos Ruiz');
      expect(mockProvider.sentMessages).toHaveLength(1);
      expect(mockProvider.sentMessages[0].html).toContain('Hola Carlos Ruiz');
    });

    it('should record failed status in email_logs if provider fails', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'log-2',
            clinic_id: CLINIC_ID,
            to_email: 'fail@example.com',
            subject: 'Notificación',
            status: 'failed',
            error_message: 'Simulated SMTP connection timeout or invalid address',
            created_at: new Date().toISOString(),
          },
        ],
      });

      const log = await service.sendEmail(CLINIC_ID, {
        to: 'fail@example.com',
        subject: 'Notificación',
        html: '<p>Test</p>',
      });

      expect(log.status).toBe('failed');
    });
  });

  // ===========================================================================
  // REMINDER ENGINE (24h Window & Idempotency)
  // ===========================================================================
  describe('triggerReminderSweep', () => {
    it('should find upcoming appointments, send reminder emails, and mark reminder_sent = true', async () => {
      const mockAppointments = [
        {
          appointment_id: 'appt-1',
          clinic_id: CLINIC_ID,
          clinic_name: 'Clínica Sanitas',
          clinic_phone: '+51 987 654 321',
          appointment_date: '2026-09-03',
          start_time: '10:00',
          patient_first_name: 'Elena',
          patient_last_name: 'Gómez',
          patient_email: 'elena@example.com',
          professional_first_name: 'Mario',
          professional_last_name: 'Vargas',
          service_name: 'Consulta General',
        },
      ];

      db.query
        .mockResolvedValueOnce({ rows: mockAppointments }) // query upcoming appointments
        .mockResolvedValueOnce({
          rows: [
            {
              id: TEMPLATE_ID,
              clinic_id: CLINIC_ID,
              name: 'appointment_reminder_24h',
              subject: 'Recordatorio {{patient_name}}',
              html_body: '<p>Cita mañana {{service_name}}</p>',
              variables: ['patient_name', 'service_name'],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }) // template lookup
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-3',
              clinic_id: CLINIC_ID,
              to_email: 'elena@example.com',
              subject: 'Recordatorio Elena Gómez',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        }) // insert log
        .mockResolvedValueOnce({ rowCount: 1 }); // update appointment reminder_sent = true

      const result = await service.triggerReminderSweep(CLINIC_ID);

      expect(result.scannedAppointments).toBe(1);
      expect(result.sentCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(mockProvider.sentMessages).toHaveLength(1);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointments SET reminder_sent = true'),
        ['appt-1'],
      );
    });

    it('should skip appointments without patient email gracefully', async () => {
      const mockAppointments = [
        {
          appointment_id: 'appt-2',
          clinic_id: CLINIC_ID,
          clinic_name: 'Clínica Sanitas',
          appointment_date: '2026-09-03',
          start_time: '11:00',
          patient_first_name: 'Sin',
          patient_last_name: 'Email',
          patient_email: null,
          professional_first_name: 'Mario',
          professional_last_name: 'Vargas',
          service_name: 'Consulta General',
        },
      ];

      db.query.mockResolvedValueOnce({ rows: mockAppointments });

      const result = await service.triggerReminderSweep(CLINIC_ID);

      expect(result.scannedAppointments).toBe(1);
      expect(result.sentCount).toBe(0);
      expect(mockProvider.sentMessages).toHaveLength(0);
    });
  });

  // ===========================================================================
  // RESEND & SPECIALIZED DOMAIN EMAIL DISPATCHERS
  // ===========================================================================
  describe('Resend & Domain Confirmation Emails', () => {
    it('should send appointment confirmation email to patient with S/. and booking code', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // getTemplateByName
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-1',
              clinic_id: CLINIC_ID,
              to_email: 'paciente@gmail.com',
              subject: 'Confirmación de tu cita — Clínica VitalSalud',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        }); // insert email_logs

      const log = await service.sendAppointmentConfirmationToPatient(CLINIC_ID, {
        bookingCode: 'CIT-2026-9999',
        patientName: 'Luis Fernández',
        patientEmail: 'paciente@gmail.com',
        serviceName: 'Fisioterapia y Rehabilitación',
        professionalName: 'Dra. María González',
        appointmentDate: '2026-11-20',
        startTime: '13:00',
        amount: 120,
      });

      expect(log).not.toBeNull();
      expect(log?.status).toBe('sent');
      expect(mockProvider.sentMessages).toHaveLength(1);
      const sent = mockProvider.sentMessages[0];
      expect(sent.to).toBe('paciente@gmail.com');
      expect(sent.html).toContain('CIT-2026-9999');
      expect(sent.html).toContain('Luis Fernández');
      expect(sent.html).toContain('S/. 120.00');
    });

    it('should send new appointment alert email to health center / clinic', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-2',
              clinic_id: CLINIC_ID,
              to_email: 'contacto@clinica.pe',
              subject: '[Nueva Cita] Fisioterapia - Luis Fernández (2026-11-20 13:00)',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        });

      const log = await service.sendAppointmentNotificationToClinic(CLINIC_ID, {
        bookingCode: 'CIT-2026-8888',
        patientName: 'Luis Fernández',
        patientDocType: 'DNI',
        patientDocNumber: '08520322',
        patientPhone: '+51923110309',
        patientEmail: 'paciente@gmail.com',
        serviceName: 'Fisioterapia',
        professionalName: 'Dr. Carlos Mendoza',
        appointmentDate: '2026-11-20',
        startTime: '13:00',
        amount: '120.00',
      });

      expect(log).not.toBeNull();
      expect(mockProvider.sentMessages).toHaveLength(1);
      const sent = mockProvider.sentMessages[0];
      expect(sent.html).toContain('CIT-2026-8888');
      expect(sent.html).toContain('08520322');
    });

    it('should send password reset email with secure URL', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-3',
              clinic_id: CLINIC_ID,
              to_email: 'user@clinica.pe',
              subject: 'Recuperación de contraseña — Clínica VitalSalud',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        });

      const log = await service.sendPasswordResetEmail(
        CLINIC_ID,
        'user@clinica.pe',
        'http://localhost:5300/?view=reset-password&token=secret123',
        'Juan',
      );

      expect(log.status).toBe('sent');
      expect(mockProvider.sentMessages).toHaveLength(1);
      const sent = mockProvider.sentMessages[0];
      expect(sent.to).toBe('user@clinica.pe');
      expect(sent.html).toContain('token=secret123');
    });
  });
});
