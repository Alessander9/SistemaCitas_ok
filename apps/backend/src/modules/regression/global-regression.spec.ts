import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuthService } from '../auth/auth.service';
import { SpecialtiesService } from '../specialties/specialties.service';
import { ServicesService } from '../services/services.service';
import { ProfessionalsService } from '../professionals/professionals.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PaymentsService } from '../payments/payments.service';
import { PatientsService } from '../patients/patients.service';
import { ClinicalService } from '../clinical/clinical.service';
import { CashService } from '../cash/cash.service';
import { InventoryService } from '../inventory/inventory.service';
import { EmailsService } from '../emails/emails.service';
import { MockEmailProvider } from '../emails/providers/mock-email-provider';
import { TelegramService } from '../telegram/telegram.service';
import { TelegramBotProvider } from '../telegram/providers/telegram-bot.provider';
import { AiService } from '../ai/ai.service';
import { AiKnowledgeService } from '../ai/ai-knowledge.service';
import { ManualPaymentProvider } from '../payments/providers/manual-payment.provider';
import { GatewayPaymentProvider } from '../payments/providers/gateway-payment.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppointmentStatus } from '@citassistema/shared-types';

describe('Global Multi-Tenant Regression Suite (Fases 1–12)', () => {
  let db: { query: jest.Mock; transaction: jest.Mock };
  let appointmentsService: AppointmentsService;
  let clinicalService: ClinicalService;
  let cashService: CashService;
  let inventoryService: InventoryService;
  let emailsService: EmailsService;
  let telegramService: TelegramService;
  let aiService: AiService;
  let mockTelegramProvider: TelegramBotProvider;

  const CLINIC_A = 'a0000000-0000-0000-0000-000000000001';
  const DOCTOR_ID = 'd0000000-0000-0000-0000-000000000001';
  const PATIENT_ID = 'p0000000-0000-0000-0000-000000000001';
  const SERVICE_ID = 's0000000-0000-0000-0000-000000000001';
  const APPOINTMENT_ID = 'c0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      transaction: jest.fn(),
    };
    const mockEmailProvider = new MockEmailProvider();
    mockTelegramProvider = new TelegramBotProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        SpecialtiesService,
        ServicesService,
        ProfessionalsService,
        AppointmentsService,
        PaymentsService,
        ManualPaymentProvider,
        GatewayPaymentProvider,
        PatientsService,
        ClinicalService,
        CashService,
        InventoryService,
        EmailsService,
        TelegramService,
        AiService,
        AiKnowledgeService,
        { provide: DatabaseService, useValue: db },
        { provide: MockEmailProvider, useValue: mockEmailProvider },
        { provide: TelegramBotProvider, useValue: mockTelegramProvider },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
            verify: jest.fn().mockReturnValue({ userId: 'u-1', clinicId: CLINIC_A, role: 'ADMIN_CLINIC' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'supersecret';
              if (key === 'JWT_EXPIRES_IN') return '1d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    appointmentsService = module.get<AppointmentsService>(AppointmentsService);
    clinicalService = module.get<ClinicalService>(ClinicalService);
    cashService = module.get<CashService>(CashService);
    inventoryService = module.get<InventoryService>(InventoryService);
    emailsService = module.get<EmailsService>(EmailsService);
    telegramService = module.get<TelegramService>(TelegramService);
    aiService = module.get<AiService>(AiService);
  });

  // ===========================================================================
  // 1. END-TO-END PATIENT BOOKING & CLINICAL WORKFLOW
  // ===========================================================================
  it('should complete the entire multi-step workflow from booking to clinical discharge', async () => {
    // 1.1 Booking creation mocks
    const appointmentRow = {
      id: APPOINTMENT_ID,
      clinic_id: CLINIC_A,
      patient_id: PATIENT_ID,
      professional_id: DOCTOR_ID,
      service_id: SERVICE_ID,
      appointment_date: '2026-09-10',
      start_time: '10:00',
      end_time: '10:45',
      status: AppointmentStatus.CONFIRMED,
      total_price: '80.00',
      deposit_amount: '80.00',
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query
      .mockResolvedValueOnce({ rows: [{ duration_minutes: 45 }] }) // validate service
      .mockResolvedValueOnce({ rows: [{ id: PATIENT_ID }] }) // validate patient
      .mockResolvedValueOnce({ rows: [{ id: DOCTOR_ID }] }) // validate professional
      .mockResolvedValueOnce({ rows: [{ day_of_week: 4, start_time: '08:00', end_time: '18:00' }] }); // validate schedule

    db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
      const client = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // advisory lock
          .mockResolvedValueOnce({ rows: [] }) // check conflicting appointments
          .mockResolvedValueOnce({ rows: [] }) // check conflicting schedule blocks
          .mockResolvedValueOnce({ rows: [appointmentRow] }) // insert appointment
          .mockResolvedValueOnce({ rows: [] }), // insert status history
      };
      return cb(client);
    });

    const appt = await appointmentsService.create(
      CLINIC_A,
      {
        patientId: PATIENT_ID,
        professionalId: DOCTOR_ID,
        serviceId: SERVICE_ID,
        appointmentDate: '2026-09-10',
        startTime: '10:00',
      },
      'u-1',
    );

    expect(appt.id).toBe(APPOINTMENT_ID);
    expect(appt.status).toBe(AppointmentStatus.CONFIRMED);

    // 1.2 Clinical Consultation & Medical Record
    const recordRow = {
      id: 'mr-1',
      clinic_id: CLINIC_A,
      patient_id: PATIENT_ID,
      professional_id: DOCTOR_ID,
      appointment_id: APPOINTMENT_ID,
      chief_complaint: 'Lumbalgia mecánica aguda',
      anamnesis: 'Dolor lumbar tras esfuerzo físico',
      physical_examination: 'Contractura paravertebral L4-L5',
      diagnosis: 'M54.5 - Lumbago no especificado',
      treatment_plan: '5 sesiones de fisioterapia y analgesia',
      pain_scale: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query
      .mockResolvedValueOnce({ rows: [{ id: 'mr-1' }] })
      .mockResolvedValueOnce({ rows: [recordRow] });

    const medRecord = await clinicalService.createMedicalRecord(CLINIC_A, {
      patientId: PATIENT_ID,
      professionalId: DOCTOR_ID,
      appointmentId: APPOINTMENT_ID,
      chiefComplaint: 'Lumbalgia mecánica aguda',
      diagnosis: 'M54.5 - Lumbago no especificado',
      painScale: 7,
    });

    expect(medRecord.chiefComplaint).toBe('Lumbalgia mecánica aguda');
    expect(medRecord.diagnosis).toContain('M54.5');
    expect(medRecord.painScale).toBe(7);
  });

  // ===========================================================================
  // 2. FINANCIAL & INVENTORY OPERATIONS (Caja Chica & Kardex)
  // ===========================================================================
  it('should maintain financial balance and prevent stock depletion under zero', async () => {
    // 2.1 Open Cash Register
    const registerRow = {
      id: 'reg-1',
      clinic_id: CLINIC_A,
      name: 'Caja Mañana',
      status: 'open',
      opening_amount: '150.00',
      session_date: '2026-09-02',
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query
      .mockResolvedValueOnce({ rows: [] }) // no existing open register
      .mockResolvedValueOnce({ rows: [registerRow] });

    const cashReg = await cashService.openCashRegister(CLINIC_A, { openingAmount: 150 }, 'u-1');
    expect(cashReg.openingAmount).toBe(150);
    expect(cashReg.status).toBe('open');

    // 2.2 Inventory Underflow Protection
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 'prod-1',
          clinic_id: CLINIC_A,
          name: 'Compresas Frías',
          current_stock: 2,
          min_stock: 5,
          unit: 'unidad',
          cost_price: '10.00',
          sell_price: '15.00',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    // Trying to consume 10 units when only 2 are available
    await expect(
      inventoryService.addMovement(CLINIC_A, { productId: 'prod-1', type: 'sale', quantity: 10 }, 'u-1'),
    ).rejects.toThrow('Stock insuficiente');
  });

  // ===========================================================================
  // 3. OMNICHANNEL INTEGRATIONS (Email, Telegram, AI Assistant)
  // ===========================================================================
  it('should execute transactional email, telegram bot command, and AI assistant query seamlessly', async () => {
    // 3.1 Email Template Compilation
    const compiled = emailsService.compileTemplate(
      'Hola {{patient_name}}, tu cita de {{service_name}} cuesta {{price}}.',
      { patient_name: 'María López', service_name: 'Fisioterapia', price: 'S/ 80.00' },
    );
    expect(compiled).toBe('Hola María López, tu cita de Fisioterapia cuesta S/ 80.00.');

    // 3.2 Telegram Bot /hoy Command
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'acc-1',
            clinic_id: CLINIC_A,
            professional_id: DOCTOR_ID,
            telegram_user_id: 123456789,
            is_active: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: APPOINTMENT_ID,
            appointment_date: '2026-09-02',
            start_time: '10:00',
            end_time: '10:45',
            status: AppointmentStatus.CONFIRMED,
            patient_first_name: 'Carlos',
            patient_last_name: 'Gómez',
            service_name: 'Evaluación Fisioterapéutica',
          },
        ],
      });

    const tgResult = await telegramService.processWebhook({
      update_id: 1,
      message: {
        message_id: 1,
        from: { id: 123456789, is_bot: false, first_name: 'Dr. Alejandro' },
        chat: { id: 123456789, type: 'private' },
        text: '/hoy',
        date: Date.now(),
      },
    });

    expect(tgResult.action).toBe('appointments_list_sent');
    expect(mockTelegramProvider.sentMessages[0].text).toContain('Carlos Gómez');

    // 3.3 AI Assistant Medical Containment
    db.query
      .mockResolvedValueOnce({ rows: [] }) // specialties
      .mockResolvedValueOnce({ rows: [] }) // services
      .mockResolvedValueOnce({ rows: [] }); // professionals

    const aiResponse = await aiService.answerQuery({
      message: 'Me duele mucho el tobillo, ¿puedo tomar ibuprofeno?',
    });

    expect(aiResponse.intent).toBe('medical_inquiry');
    expect(aiResponse.reply).toContain('no puedo emitir diagnósticos clínicos ni recetar medicamentos');
  });
});
