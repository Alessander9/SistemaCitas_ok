// =============================================================================
// CitasSistema — Shared Types: Emails & Transaccionales
// =============================================================================

export type EmailLogStatus = 'queued' | 'sent' | 'failed';

export interface EmailTemplate {
  id: string;
  clinicId: string;
  name: string;
  subject: string;
  htmlBody: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  clinicId: string;
  templateId?: string;
  templateName?: string;
  toEmail: string;
  subject: string;
  status: EmailLogStatus;
  errorMessage?: string;
  sentAt?: string;
  openedAt?: string;
  createdAt: string;
}

export interface SendEmailPayload {
  to: string;
  subject?: string;
  templateName?: string;
  html?: string;
  variables?: Record<string, string | number>;
}

export interface ReminderSweepResult {
  scannedAppointments: number;
  sentCount: number;
  failedCount: number;
  errors: string[];
}
