import {
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { TelegramBotProvider } from './providers/telegram-bot.provider';
import {
  AppointmentStatus,
  TelegramAccount,
  TelegramLinkingCode,
  TelegramWebhookUpdate,
} from '@citassistema/shared-types';

interface TelegramAccountDbRow {
  id: string;
  clinic_id: string;
  user_id?: string;
  professional_id?: string;
  patient_id?: string;
  telegram_user_id: string | number;
  username?: string;
  first_name?: string;
  role?: string;
  is_active: boolean;
  linking_code?: string;
  linking_code_expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface AppointmentTelegramRow {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  patient_first_name: string;
  patient_last_name: string;
  service_name: string;
  notes?: string;
}

@Injectable()
export class TelegramService {
  constructor(
    private readonly db: DatabaseService,
    private readonly botProvider: TelegramBotProvider,
  ) {}

  // ---------------------------------------------------------------------------
  // Account Linking
  // ---------------------------------------------------------------------------
  async generateLinkingCode(
    clinicId: string,
    userId: string,
    professionalId?: string,
    role?: string,
  ): Promise<TelegramLinkingCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const placeholderUserId = -Math.floor(100000000 + Math.random() * 900000000);

    // Remove or update existing linking codes for this user
    await this.db.query(
      `DELETE FROM telegram_accounts WHERE clinic_id = $1 AND user_id = $2 AND telegram_user_id <= 0`,
      [clinicId, userId],
    );

    await this.db.query(
      `INSERT INTO telegram_accounts (
         clinic_id, user_id, professional_id, role,
         telegram_user_id, linking_code, linking_code_expires_at, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [clinicId, userId, professionalId ?? null, role ?? 'PROFESIONAL', placeholderUserId, code, expiresAt],
    );

    return {
      code,
      expiresAt,
      botUsername: 'CitasSistemaBot',
      deepLink: `https://t.me/CitasSistemaBot?start=${code}`,
    };
  }

  async getAccount(clinicId: string, userId: string): Promise<TelegramAccount | null> {
    const { rows } = await this.db.query<TelegramAccountDbRow>(
      `SELECT * FROM telegram_accounts
       WHERE clinic_id = $1 AND user_id = $2 AND telegram_user_id > 0 AND is_active = true`,
      [clinicId, userId],
    );
    if (rows.length === 0) return null;
    return this.mapAccountRow(rows[0]);
  }

  private mapAccountRow(r: TelegramAccountDbRow): TelegramAccount {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      userId: r.user_id,
      professionalId: r.professional_id,
      patientId: r.patient_id,
      telegramUserId: Number(r.telegram_user_id),
      username: r.username,
      firstName: r.first_name,
      role: r.role,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  // ---------------------------------------------------------------------------
  // Webhook & Command Router
  // ---------------------------------------------------------------------------
  async processWebhook(update: TelegramWebhookUpdate): Promise<{ ok: boolean; action?: string }> {
    // 1. Handle Inline Keyboard Callbacks
    if (update.callback_query) {
      return this.handleCallbackQuery(update.callback_query);
    }

    // 2. Handle Text Messages
    if (!update.message || !update.message.text) {
      return { ok: true, action: 'ignored_non_text' };
    }

    const chatId = update.message.chat.id;
    const text = update.message.text.trim();
    const telegramUserId = update.message.from.id;

    // Command: /start or /start <code>
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const code = parts[1].trim();
        return this.redeemLinkingCode(chatId, telegramUserId, code, update.message.from);
      }
      await this.botProvider.sendMessage({
        chatId,
        text: '👋 ¡Bienvenido al Bot de CitasSistema!\n\nPara vincular tu cuenta médica, ingresa tu código de vinculación usando `/start <code>` generado desde el sistema web.',
        parseMode: 'Markdown',
      });
      return { ok: true, action: 'start_help_sent' };
    }

    // Lookup Linked Account
    const { rows } = await this.db.query<TelegramAccountDbRow>(
      `SELECT * FROM telegram_accounts WHERE telegram_user_id = $1 AND is_active = true`,
      [telegramUserId],
    );

    if (rows.length === 0) {
      await this.botProvider.sendMessage({
        chatId,
        text: '⚠️ Tu cuenta de Telegram aún no está vinculada.\n\nInicia sesión en CitasSistema y genera tu código de enlace en *Configuración > Integración Telegram*.',
        parseMode: 'Markdown',
      });
      return { ok: true, action: 'unlinked_warning_sent' };
    }

    const account = this.mapAccountRow(rows[0]);

    // Command Router
    if (text === '/hoy') {
      return this.sendAppointmentsList(chatId, account, 'today');
    }
    if (text === '/manana') {
      return this.sendAppointmentsList(chatId, account, 'tomorrow');
    }
    if (text === '/citas') {
      return this.sendAppointmentsList(chatId, account, 'upcoming');
    }
    if (text === '/pendientes') {
      return this.sendPendingAppointments(chatId, account);
    }
    if (text === '/ingresos') {
      return this.sendIncomeSummary(chatId, account);
    }

    // Default Help
    await this.botProvider.sendMessage({
      chatId,
      text: `🩺 *Comandos de CitasSistema*:\n\n• /hoy — Citas programadas para hoy\n• /manana — Citas para el día de mañana\n• /citas — Próximas citas agendadas\n• /pendientes — Citas pendientes por confirmar\n• /ingresos — Resumen financiero del día (Admin)`,
      parseMode: 'Markdown',
    });

    return { ok: true, action: 'help_menu_sent' };
  }

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  private async redeemLinkingCode(
    chatId: number,
    telegramUserId: number,
    code: string,
    from: { username?: string; first_name?: string },
  ): Promise<{ ok: boolean; action: string }> {
    const { rows } = await this.db.query<TelegramAccountDbRow>(
      `SELECT * FROM telegram_accounts
       WHERE linking_code = $1 AND linking_code_expires_at > NOW()`,
      [code],
    );

    if (rows.length === 0) {
      await this.botProvider.sendMessage({
        chatId,
        text: '❌ Código de vinculación inválido o expirado. Por favor genera uno nuevo desde la web.',
      });
      return { ok: true, action: 'invalid_linking_code' };
    }

    const targetAccount = rows[0];

    // Link Telegram User ID
    await this.db.query(
      `UPDATE telegram_accounts
       SET telegram_user_id = $1,
           username = $2,
           first_name = $3,
           linking_code = NULL,
           linking_code_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $4`,
      [telegramUserId, from.username ?? null, from.first_name ?? null, targetAccount.id],
    );

    await this.botProvider.sendMessage({
      chatId,
      text: `🎉 *¡Cuenta vinculada exitosamente!*\n\nHola ${from.first_name ?? 'Doctor(a)'}, a partir de ahora recibirás aquí notificaciones en tiempo real y el resumen diario de tus citas a las 9:00 PM.\n\nEscribe /hoy para consultar tu agenda.`,
      parseMode: 'Markdown',
    });

    return { ok: true, action: 'account_linked' };
  }

  private async sendAppointmentsList(
    chatId: number,
    account: TelegramAccount,
    timeframe: 'today' | 'tomorrow' | 'upcoming',
  ): Promise<{ ok: boolean; action: string }> {
    let dateFilter = "a.appointment_date = CURRENT_DATE";
    let title = "📅 *Citas de Hoy*";

    if (timeframe === 'tomorrow') {
      dateFilter = "a.appointment_date = CURRENT_DATE + INTERVAL '1 day'";
      title = "📅 *Citas para Mañana*";
    } else if (timeframe === 'upcoming') {
      dateFilter = "a.appointment_date >= CURRENT_DATE";
      title = "🗓️ *Próximas Citas*";
    }

    const conditions = ['a.clinic_id = $1', 'a.deleted_at IS NULL', "a.status NOT IN ('cancelled', 'no_show')", dateFilter];
    const params: unknown[] = [account.clinicId];

    if (account.professionalId) {
      conditions.push(`a.professional_id = $2`);
      params.push(account.professionalId);
    }

    const { rows } = await this.db.query<AppointmentTelegramRow>(
      `SELECT a.id, a.appointment_date, a.start_time, a.end_time, a.status,
              p.first_name AS patient_first_name, p.last_name AS patient_last_name,
              s.name AS service_name, a.notes
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN services s ON s.id = a.service_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date ASC, a.start_time ASC
       LIMIT 10`,
      params,
    );

    if (rows.length === 0) {
      await this.botProvider.sendMessage({
        chatId,
        text: `${title}:\n\n_No tienes citas programadas en este período._`,
        parseMode: 'Markdown',
      });
      return { ok: true, action: 'no_appointments_found' };
    }

    const lines = rows.map((r, idx) => {
      const statusIcon = r.status === 'confirmed' ? '✅' : r.status === 'in_progress' ? '🩺' : '⏳';
      const formattedDate = timeframe === 'upcoming' ? ` (${String(r.appointment_date).split('T')[0]})` : '';
      return `${idx + 1}. *${r.start_time}*${formattedDate} — ${r.patient_first_name} ${r.patient_last_name}\n   _${r.service_name}_ ${statusIcon}`;
    });

    await this.botProvider.sendMessage({
      chatId,
      text: `${title} (${rows.length}):\n\n${lines.join('\n\n')}`,
      parseMode: 'Markdown',
    });

    return { ok: true, action: 'appointments_list_sent' };
  }

  private async sendPendingAppointments(
    chatId: number,
    account: TelegramAccount,
  ): Promise<{ ok: boolean; action: string }> {
    const conditions = ["a.clinic_id = $1", "a.status = 'pending'", "a.deleted_at IS NULL", "a.appointment_date >= CURRENT_DATE"];
    const params: unknown[] = [account.clinicId];

    if (account.professionalId) {
      conditions.push(`a.professional_id = $2`);
      params.push(account.professionalId);
    }

    const { rows } = await this.db.query<AppointmentTelegramRow>(
      `SELECT a.id, a.appointment_date, a.start_time, a.end_time, a.status,
              p.first_name AS patient_first_name, p.last_name AS patient_last_name,
              s.name AS service_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN services s ON s.id = a.service_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date ASC, a.start_time ASC
       LIMIT 5`,
      params,
    );

    if (rows.length === 0) {
      await this.botProvider.sendMessage({
        chatId,
        text: '✅ No hay citas pendientes por confirmar.',
      });
      return { ok: true, action: 'no_pending_appointments' };
    }

    for (const appt of rows) {
      const dateStr = String(appt.appointment_date).split('T')[0];
      const text = `⏳ *Solicitud de Cita Pendiente*:\n\n👤 *Paciente:* ${appt.patient_first_name} ${appt.patient_last_name}\n🩺 *Servicio:* ${appt.service_name}\n📅 *Fecha:* ${dateStr} a las ${appt.start_time}`;

      await this.botProvider.sendMessage({
        chatId,
        text,
        parseMode: 'Markdown',
        inlineKeyboard: [
          [
            { text: '✅ Aceptar', callback_data: `accept_appt:${appt.id}` },
            { text: '❌ Rechazar', callback_data: `reject_appt:${appt.id}` },
          ],
        ],
      });
    }

    return { ok: true, action: 'pending_sent_with_buttons' };
  }

  private async handleCallbackQuery(callbackQuery: NonNullable<TelegramWebhookUpdate['callback_query']>): Promise<{ ok: boolean; action: string }> {
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;

    if (data.startsWith('accept_appt:')) {
      const apptId = data.replace('accept_appt:', '');
      await this.db.query(
        `UPDATE appointments SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [apptId],
      );
      await this.botProvider.answerCallbackQuery(callbackId, '✅ Cita Confirmada');
      if (callbackQuery.message) {
        await this.botProvider.sendMessage({
          chatId: callbackQuery.message.chat.id,
          text: `✅ *Cita Confirmada con éxito.* Se ha notificado al paciente.`,
          parseMode: 'Markdown',
        });
      }
      return { ok: true, action: 'appointment_confirmed_via_telegram' };
    }

    if (data.startsWith('reject_appt:')) {
      const apptId = data.replace('reject_appt:', '');
      await this.db.query(
        `UPDATE appointments SET status = 'cancelled', cancellation_reason = 'Rechazada desde Telegram', updated_at = NOW() WHERE id = $1`,
        [apptId],
      );
      await this.botProvider.answerCallbackQuery(callbackId, '❌ Cita Rechazada');
      if (callbackQuery.message) {
        await this.botProvider.sendMessage({
          chatId: callbackQuery.message.chat.id,
          text: `❌ *Cita cancelada.*`,
          parseMode: 'Markdown',
        });
      }
      return { ok: true, action: 'appointment_rejected_via_telegram' };
    }

    return { ok: true, action: 'unknown_callback' };
  }

  private async sendIncomeSummary(chatId: number, account: TelegramAccount): Promise<{ ok: boolean; action: string }> {
    const { rows } = await this.db.query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM payments
       WHERE clinic_id = $1 AND status = 'completed' AND processed_at::date = CURRENT_DATE AND deleted_at IS NULL`,
      [account.clinicId],
    );

    const total = parseFloat(rows[0]?.total ?? '0');
    const count = parseInt(rows[0]?.count ?? '0', 10);

    await this.botProvider.sendMessage({
      chatId,
      text: `💰 *Resumen Financiero del Día*:\n\n• *Ingresos Totales:* S/ ${total.toFixed(2)}\n• *Pagos Procesados:* ${count} transacciones`,
      parseMode: 'Markdown',
    });

    return { ok: true, action: 'income_summary_sent' };
  }

  // ---------------------------------------------------------------------------
  // Automated 9:00 PM Daily Summary Engine
  // ---------------------------------------------------------------------------
  async sendDailySummary9PM(clinicId?: string): Promise<{ professionalsNotified: number }> {
    const conditions = ['ta.telegram_user_id > 0', 'ta.is_active = true', 'ta.professional_id IS NOT NULL'];
    const params: unknown[] = [];

    if (clinicId) {
      conditions.push('ta.clinic_id = $1');
      params.push(clinicId);
    }

    const { rows: linkedDoctors } = await this.db.query<{
      telegram_user_id: string;
      professional_id: string;
      clinic_id: string;
      first_name?: string;
    }>(
      `SELECT ta.telegram_user_id, ta.professional_id, ta.clinic_id, pr.first_name
       FROM telegram_accounts ta
       JOIN professionals pr ON pr.id = ta.professional_id
       WHERE ${conditions.join(' AND ')}`,
      params,
    );

    let count = 0;

    for (const doc of linkedDoctors) {
      const { rows: appts } = await this.db.query<AppointmentTelegramRow>(
        `SELECT a.start_time, p.first_name AS patient_first_name, p.last_name AS patient_last_name, s.name AS service_name
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN services s ON s.id = a.service_id
         WHERE a.professional_id = $1
           AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
           AND a.status NOT IN ('cancelled', 'no_show')
           AND a.deleted_at IS NULL
         ORDER BY a.start_time ASC`,
        [doc.professional_id],
      );

      const header = `🌙 *Resumen de tu agenda para mañana*:\n`;
      let body = '_No tienes citas agendadas para mañana. ¡Que descanses!_';

      if (appts.length > 0) {
        body = appts.map((a, i) => `${i + 1}. *${a.start_time}* — ${a.patient_first_name} ${a.patient_last_name} (${a.service_name})`).join('\n');
      }

      await this.botProvider.sendMessage({
        chatId: Number(doc.telegram_user_id),
        text: `${header}\n${body}`,
        parseMode: 'Markdown',
      });
      count++;
    }

    return { professionalsNotified: count };
  }

  // ---------------------------------------------------------------------------
  // Real-time Event Push
  // ---------------------------------------------------------------------------
  async notifyAppointmentEvent(
    clinicId: string,
    appointmentId: string,
    event: 'created' | 'cancelled' | 'rescheduled',
  ): Promise<boolean> {
    const { rows } = await this.db.query<{
      telegram_user_id: string;
      patient_name: string;
      service_name: string;
      appointment_date: string;
      start_time: string;
    }>(
      `SELECT ta.telegram_user_id,
              p.first_name || ' ' || p.last_name AS patient_name,
              s.name AS service_name,
              a.appointment_date,
              a.start_time
       FROM appointments a
       JOIN telegram_accounts ta ON ta.professional_id = a.professional_id AND ta.is_active = true
       JOIN patients p ON p.id = a.patient_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = $1 AND a.clinic_id = $2`,
      [appointmentId, clinicId],
    );

    if (rows.length === 0 || !rows[0].telegram_user_id) return false;

    const data = rows[0];
    const eventText = event === 'created' ? '🆕 *Nueva Cita Agendada*' : event === 'cancelled' ? '🚫 *Cita Cancelada*' : '🔄 *Cita Reprogramada*';

    await this.botProvider.sendMessage({
      chatId: Number(data.telegram_user_id),
      text: `${eventText}\n\n👤 *Paciente:* ${data.patient_name}\n🩺 *Servicio:* ${data.service_name}\n📅 *Fecha:* ${String(data.appointment_date).split('T')[0]} a las ${data.start_time}`,
      parseMode: 'Markdown',
    });

    return true;
  }
}
