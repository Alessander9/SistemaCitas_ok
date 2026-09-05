import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { MockEmailProvider } from './providers/mock-email-provider';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import {
  EmailLog,
  EmailTemplate,
  ReminderSweepResult,
  SendEmailPayload,
} from '@citassistema/shared-types';

interface EmailTemplateDbRow {
  id: string;
  clinic_id: string;
  name: string;
  subject: string;
  html_body: string;
  variables: string[] | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailLogDbRow {
  id: string;
  clinic_id: string;
  template_id?: string;
  template_name?: string;
  to_email: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  opened_at?: string;
  created_at: string;
}

interface AppointmentReminderRow {
  appointment_id: string;
  clinic_id: string;
  clinic_name: string;
  clinic_phone?: string;
  appointment_date: string;
  start_time: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_email?: string;
  professional_first_name: string;
  professional_last_name: string;
  service_name: string;
}

const DEFAULT_TEMPLATES = [
  {
    name: 'appointment_confirmation',
    subject: 'Confirmación de tu cita — {{clinic_name}}',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0d9488;">¡Hola {{patient_name}}!</h2>
        <p>Tu cita médica ha sido confirmada exitosamente con los siguientes detalles:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Servicio:</strong> {{service_name}}</p>
          <p><strong>Especialista:</strong> Dr(a). {{professional_name}}</p>
          <p><strong>Fecha:</strong> {{appointment_date}}</p>
          <p><strong>Hora:</strong> {{start_time}}</p>
          <p><strong>Lugar:</strong> {{clinic_name}}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">Si necesitas reprogramar o cancelar, por favor contáctanos al {{clinic_phone}}.</p>
      </div>
    `,
    variables: ['patient_name', 'service_name', 'professional_name', 'appointment_date', 'start_time', 'clinic_name', 'clinic_phone'],
  },
  {
    name: 'appointment_reminder_24h',
    subject: 'Recordatorio de tu cita mañana — {{clinic_name}}',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb;">Recordatorio de tu cita médica</h2>
        <p>Estimado(a) {{patient_name}}, te recordamos que tienes una cita programada para mañana:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Servicio:</strong> {{service_name}}</p>
          <p><strong>Especialista:</strong> Dr(a). {{professional_name}}</p>
          <p><strong>Fecha y Hora:</strong> {{appointment_date}} a las {{start_time}}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">Te esperamos puntualmente en {{clinic_name}}.</p>
      </div>
    `,
    variables: ['patient_name', 'service_name', 'professional_name', 'appointment_date', 'start_time', 'clinic_name'],
  },
  {
    name: 'appointment_cancelled',
    subject: 'Cita cancelada — {{clinic_name}}',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #ef4444;">Notificación de cancelación</h2>
        <p>Hola {{patient_name}}, tu cita para el <strong>{{appointment_date}}</strong> ha sido cancelada.</p>
        <p>Motivo: {{cancellation_reason}}</p>
        <p style="color: #64748b; font-size: 14px;">Puedes agendar una nueva fecha en nuestro portal en línea o al {{clinic_phone}}.</p>
      </div>
    `,
    variables: ['patient_name', 'appointment_date', 'cancellation_reason', 'clinic_name', 'clinic_phone'],
  },
  {
    name: 'post_care_followup',
    subject: '¿Cómo fue tu atención en {{clinic_name}}?',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0d9488;">Gracias por confiar en nosotros</h2>
        <p>Hola {{patient_name}}, esperamos que tu consulta de <strong>{{service_name}}</strong> haya sido excelente.</p>
        <p>Recuerda seguir las indicaciones brindadas en tu receta médica.</p>
      </div>
    `,
    variables: ['patient_name', 'service_name', 'clinic_name'],
  },
];

@Injectable()
export class EmailsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly emailProvider: MockEmailProvider,
  ) {}

  // ---------------------------------------------------------------------------
  // Template Compiler
  // ---------------------------------------------------------------------------
  compileTemplate(template: string, variables: Record<string, string | number> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return variables[key] !== undefined ? String(variables[key]) : '';
    });
  }

  // ---------------------------------------------------------------------------
  // Mappers
  // ---------------------------------------------------------------------------
  private mapTemplateRow(r: EmailTemplateDbRow): EmailTemplate {
    let vars: string[] = [];
    if (Array.isArray(r.variables)) {
      vars = r.variables;
    } else if (typeof r.variables === 'string') {
      try {
        vars = JSON.parse(r.variables);
      } catch {
        vars = [];
      }
    }

    return {
      id: r.id,
      clinicId: r.clinic_id,
      name: r.name,
      subject: r.subject,
      htmlBody: r.html_body,
      variables: vars,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  private mapLogRow(r: EmailLogDbRow): EmailLog {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      templateId: r.template_id,
      templateName: r.template_name,
      toEmail: r.to_email,
      subject: r.subject,
      status: r.status,
      errorMessage: r.error_message,
      sentAt: r.sent_at,
      openedAt: r.opened_at,
      createdAt: r.created_at,
    };
  }

  // ---------------------------------------------------------------------------
  // Templates Management & Seeding
  // ---------------------------------------------------------------------------
  async getTemplates(clinicId: string): Promise<EmailTemplate[]> {
    const { rows } = await this.db.query<EmailTemplateDbRow>(
      `SELECT * FROM email_templates WHERE clinic_id = $1 AND deleted_at IS NULL ORDER BY name ASC`,
      [clinicId],
    );

    if (rows.length === 0) {
      // Seed default templates for this clinic
      for (const tpl of DEFAULT_TEMPLATES) {
        await this.db.query(
          `INSERT INTO email_templates (clinic_id, name, subject, html_body, variables, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT DO NOTHING`,
          [clinicId, tpl.name, tpl.subject, tpl.htmlBody, JSON.stringify(tpl.variables)],
        );
      }

      const { rows: seededRows } = await this.db.query<EmailTemplateDbRow>(
        `SELECT * FROM email_templates WHERE clinic_id = $1 AND deleted_at IS NULL ORDER BY name ASC`,
        [clinicId],
      );
      return seededRows.map((r) => this.mapTemplateRow(r));
    }

    return rows.map((r) => this.mapTemplateRow(r));
  }

  async getTemplateByName(clinicId: string, name: string): Promise<EmailTemplate | null> {
    const { rows } = await this.db.query<EmailTemplateDbRow>(
      `SELECT * FROM email_templates WHERE clinic_id = $1 AND name = $2 AND deleted_at IS NULL`,
      [clinicId, name],
    );
    if (rows.length === 0) return null;
    return this.mapTemplateRow(rows[0]);
  }

  async createTemplate(clinicId: string, dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const existing = await this.getTemplateByName(clinicId, dto.name);
    if (existing) {
      throw new BadRequestException(`Ya existe una plantilla con el nombre "${dto.name}"`);
    }

    const { rows } = await this.db.query<EmailTemplateDbRow>(
      `INSERT INTO email_templates (clinic_id, name, subject, html_body, variables, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        clinicId,
        dto.name,
        dto.subject,
        dto.htmlBody,
        JSON.stringify(dto.variables ?? []),
        dto.isActive ?? true,
      ],
    );

    return this.mapTemplateRow(rows[0]);
  }

  async updateTemplate(clinicId: string, id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const { rows: check } = await this.db.query(
      `SELECT id FROM email_templates WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );
    if (check.length === 0) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.subject !== undefined) {
      updates.push(`subject = $${idx++}`);
      params.push(dto.subject);
    }
    if (dto.htmlBody !== undefined) {
      updates.push(`html_body = $${idx++}`);
      params.push(dto.htmlBody);
    }
    if (dto.variables !== undefined) {
      updates.push(`variables = $${idx++}`);
      params.push(JSON.stringify(dto.variables));
    }
    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      params.push(dto.isActive);
    }

    const { rows } = await this.db.query<EmailTemplateDbRow>(
      `UPDATE email_templates SET ${updates.join(', ')} WHERE id = $1 AND clinic_id = $2 RETURNING *`,
      params,
    );

    return this.mapTemplateRow(rows[0]);
  }

  // ---------------------------------------------------------------------------
  // Sending & Logging
  // ---------------------------------------------------------------------------
  async sendEmail(clinicId: string, payload: SendEmailPayload): Promise<EmailLog> {
    let subject = payload.subject ?? 'Notificación médica';
    let html = payload.html ?? '';
    let templateId: string | undefined;

    if (payload.templateName) {
      let tpl = await this.getTemplateByName(clinicId, payload.templateName);
      if (!tpl) {
        // Try fallback to templates
        await this.getTemplates(clinicId);
        tpl = await this.getTemplateByName(clinicId, payload.templateName);
      }

      if (tpl) {
        templateId = tpl.id;
        subject = this.compileTemplate(tpl.subject, payload.variables);
        html = this.compileTemplate(tpl.htmlBody, payload.variables);
      }
    } else {
      subject = this.compileTemplate(subject, payload.variables);
      html = this.compileTemplate(html, payload.variables);
    }

    const result = await this.emailProvider.sendMail({
      to: payload.to,
      subject,
      html,
    });

    const status = result.success ? 'sent' : 'failed';
    const errorMessage = result.error ?? null;
    const sentAt = result.success ? new Date().toISOString() : null;

    const { rows } = await this.db.query<EmailLogDbRow>(
      `INSERT INTO email_logs (clinic_id, template_id, to_email, subject, status, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [clinicId, templateId ?? null, payload.to, subject, status, errorMessage, sentAt],
    );

    return this.mapLogRow(rows[0]);
  }

  async getLogs(clinicId: string, limit: number = 50): Promise<EmailLog[]> {
    const { rows } = await this.db.query<EmailLogDbRow>(
      `SELECT l.*, t.name AS template_name
       FROM email_logs l
       LEFT JOIN email_templates t ON t.id = l.template_id
       WHERE l.clinic_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2`,
      [clinicId, limit],
    );

    return rows.map((r) => this.mapLogRow(r));
  }

  // ---------------------------------------------------------------------------
  // Reminder Engine (Scheduled Cron & Manual Sweep)
  // ---------------------------------------------------------------------------
  async triggerReminderSweep(clinicId?: string): Promise<ReminderSweepResult> {
    // Find confirmed appointments in the next 24-48 hours where reminder_sent = false
    const conditions = [
      "a.status = 'confirmed'",
      'a.reminder_sent = false',
      'a.deleted_at IS NULL',
      "a.appointment_date >= CURRENT_DATE AND a.appointment_date <= CURRENT_DATE + INTERVAL '2 days'",
    ];
    const params: unknown[] = [];

    if (clinicId) {
      conditions.push('a.clinic_id = $1');
      params.push(clinicId);
    }

    const { rows } = await this.db.query<AppointmentReminderRow>(
      `SELECT
         a.id AS appointment_id,
         a.clinic_id,
         a.appointment_date,
         a.start_time,
         c.name AS clinic_name,
         c.phone AS clinic_phone,
         p.first_name AS patient_first_name,
         p.last_name AS patient_last_name,
         p.email AS patient_email,
         pr.first_name AS professional_first_name,
         pr.last_name AS professional_last_name,
         s.name AS service_name
       FROM appointments a
       JOIN clinics c ON c.id = a.clinic_id
       JOIN patients p ON p.id = a.patient_id
       JOIN professionals pr ON pr.id = a.professional_id
       JOIN services s ON s.id = a.service_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date ASC, a.start_time ASC`,
      params,
    );

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const appt of rows) {
      if (!appt.patient_email) {
        continue;
      }

      const formattedDate = typeof appt.appointment_date === 'string'
        ? appt.appointment_date.split('T')[0]
        : String(appt.appointment_date).split('T')[0];

      try {
        const log = await this.sendEmail(appt.clinic_id, {
          to: appt.patient_email,
          templateName: 'appointment_reminder_24h',
          variables: {
            patient_name: `${appt.patient_first_name} ${appt.patient_last_name}`.trim(),
            service_name: appt.service_name,
            professional_name: `${appt.professional_first_name} ${appt.professional_last_name}`.trim(),
            appointment_date: formattedDate,
            start_time: appt.start_time,
            clinic_name: appt.clinic_name,
            clinic_phone: appt.clinic_phone ?? 'la clínica',
          },
        });

        if (log.status === 'sent') {
          sentCount++;
          // Mark appointment reminder as sent (idempotency guarantee)
          await this.db.query(
            `UPDATE appointments SET reminder_sent = true, updated_at = NOW() WHERE id = $1`,
            [appt.appointment_id],
          );
        } else {
          failedCount++;
          if (log.errorMessage) errors.push(log.errorMessage);
        }
      } catch (err: unknown) {
        failedCount++;
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    return {
      scannedAppointments: rows.length,
      sentCount,
      failedCount,
      errors,
    };
  }
}
