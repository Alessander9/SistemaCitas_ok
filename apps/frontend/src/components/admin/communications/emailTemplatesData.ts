export interface EmailTemplateItem {
  id: string;
  name: string;
  displayName: string;
  category: 'Citas' | 'Recordatorios' | 'Cancelaciones' | 'Post-Atención';
  subject: string;
  description: string;
  htmlBody: string;
  isActive: boolean;
}

export interface EmailLogItem {
  id: string;
  templateName: string;
  toEmail: string;
  subject: string;
  status: 'sent' | 'queued' | 'failed';
  errorMessage?: string;
  sentAt?: string;
}

export interface ReminderRuleItem {
  id: string;
  timing: string;
  title: string;
  description: string;
  channel: string;
  enabled: boolean;
}

export const INITIAL_REMINDER_RULES: ReminderRuleItem[] = [
  {
    id: 'rule-24h',
    timing: '24 horas antes',
    title: 'Recordatorio preventivo de cita',
    description: 'Avisa al paciente un día antes con botón de confirmación para reducir inasistencias.',
    channel: 'Correo electrónico',
    enabled: true,
  },
  {
    id: 'rule-2h',
    timing: '2 horas antes',
    title: 'Recordatorio el mismo día',
    description: 'Recuerda la hora exacta, sede y consultorio asignado antes de salir de casa.',
    channel: 'Correo / WhatsApp',
    enabled: true,
  },
  {
    id: 'rule-post',
    timing: '4 horas después',
    title: 'Encuesta breve de satisfacción',
    description: 'Solicita calificación de la atención recibida tras finalizar la consulta.',
    channel: 'Correo electrónico',
    enabled: true,
  },
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  {
    id: 't1',
    name: 'appointment_confirmation',
    displayName: 'Confirmación de cita',
    category: 'Citas',
    subject: 'Confirmación de tu cita — {{clinic_name}}',
    description: 'Se envía automáticamente al confirmar una reserva en recepción o web.',
    isActive: true,
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: #0284c7; padding: 20px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px;">{{clinic_name}}</h2>
    <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Comprobante de reserva</p>
  </div>
  <div style="padding: 20px; color: #1e293b; font-size: 14px; line-height: 1.55;">
    <p style="margin-top: 0;">Hola <strong>{{patient_name}}</strong>, tu cita ha sido confirmada:</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin: 14px 0;">
      <div><strong>Servicio:</strong> {{service_name}}</div>
      <div><strong>Especialista:</strong> {{professional_name}}</div>
      <div><strong>Fecha y hora:</strong> {{appointment_date}} · {{start_time}}</div>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Te recomendamos llegar 10 minutos antes con tu documento de identidad.</p>
  </div>
</div>`,
  },
  {
    id: 't2',
    name: 'appointment_reminder_24h',
    displayName: 'Recordatorio 24 horas antes',
    category: 'Recordatorios',
    subject: 'Recordatorio: Tu cita es mañana — {{clinic_name}}',
    description: 'Envío automático un día antes para confirmar asistencia.',
    isActive: true,
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: #0d9488; padding: 20px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px;">Tu cita es mañana</h2>
    <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">{{clinic_name}}</p>
  </div>
  <div style="padding: 20px; color: #1e293b; font-size: 14px; line-height: 1.55;">
    <p style="margin-top: 0;">Hola <strong>{{patient_name}}</strong>, te recordamos tu cita para el <strong>{{appointment_date}}</strong> a las <strong>{{start_time}}</strong>.</p>
    <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 12px 14px; margin: 14px 0;">
      <div><strong>Servicio:</strong> {{service_name}}</div>
      <div><strong>Especialista:</strong> {{professional_name}}</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 't3',
    name: 'appointment_cancelled',
    displayName: 'Aviso de cancelación',
    category: 'Cancelaciones',
    subject: 'Cita cancelada — {{clinic_name}}',
    description: 'Informa al paciente cuando una cita ha sido anulada.',
    isActive: true,
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #fee2e2;">
  <div style="background: #dc2626; padding: 18px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px;">Aviso de cancelación</h2>
  </div>
  <div style="padding: 20px; color: #1e293b; font-size: 14px; line-height: 1.55;">
    <p style="margin-top: 0;">Hola <strong>{{patient_name}}</strong>, tu cita del <strong>{{appointment_date}}</strong> ha sido cancelada.</p>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Puedes reagendar en cualquier momento desde tu Portal del Paciente.</p>
  </div>
</div>`,
  },
  {
    id: 't4',
    name: 'post_care_followup',
    displayName: 'Encuesta post-consulta',
    category: 'Post-Atención',
    subject: '¿Cómo te sentiste hoy en {{clinic_name}}?',
    description: 'Recoge la calificación del paciente tras su atención.',
    isActive: true,
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: #7c3aed; padding: 18px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px;">Tu opinión nos importa</h2>
  </div>
  <div style="padding: 20px; color: #1e293b; font-size: 14px; line-height: 1.55;">
    <p style="margin-top: 0;">Hola <strong>{{patient_name}}</strong>, esperamos que te sientas mejor tras tu atención en <strong>{{service_name}}</strong>.</p>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">¿Cómo calificarías la atención recibida hoy?</p>
  </div>
</div>`,
  },
];

export const INITIAL_EMAIL_LOGS: EmailLogItem[] = [
  {
    id: 'l1',
    templateName: 'Confirmación de cita',
    toEmail: 'elena.gomez@example.com',
    subject: 'Confirmación de tu cita — Clínica Sanitas',
    status: 'sent',
    sentAt: '2026-09-02T10:15:00Z',
  },
  {
    id: 'l2',
    templateName: 'Recordatorio 24 horas antes',
    toEmail: 'roberto.v@example.com',
    subject: 'Recordatorio: Tu cita es mañana — Clínica Sanitas',
    status: 'sent',
    sentAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'l3',
    templateName: 'Aviso de cancelación',
    toEmail: 'fail.test@domain.invalid',
    subject: 'Cita cancelada — Clínica Sanitas',
    status: 'failed',
    errorMessage: 'Correo del paciente no existe o buzón lleno',
  },
  {
    id: 'l4',
    templateName: 'Recordatorio 24 horas antes',
    toEmail: 'carlos.mendoza@clinica.pe',
    subject: 'Recordatorio: Tu cita es mañana — Clínica Sanitas',
    status: 'sent',
    sentAt: '2026-09-02T08:15:00Z',
  },
  {
    id: 'l5',
    templateName: 'Encuesta post-consulta',
    toEmail: 'maria.reyes@gmail.com',
    subject: '¿Cómo te sentiste hoy en Clínica Sanitas?',
    status: 'queued',
  },
];
