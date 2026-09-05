// =============================================================================
// CitasSistema — Shared Types: Telegram Integration
// =============================================================================

export interface TelegramAccount {
  id: string;
  clinicId: string;
  userId?: string;
  professionalId?: string;
  patientId?: string;
  telegramUserId: number;
  username?: string;
  firstName?: string;
  role?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramLinkingCode {
  code: string;
  expiresAt: string;
  botUsername: string;
  deepLink: string;
}

export interface TelegramInlineButton {
  text: string;
  callback_data: string;
}

export interface TelegramSendMessageOptions {
  chatId: number | string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  inlineKeyboard?: TelegramInlineButton[][];
}

export interface TelegramWebhookUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
      text?: string;
    };
    data: string;
  };
}

export interface TelegramDailySummaryItem {
  id: string;
  time: string;
  patientName: string;
  serviceName: string;
  status: string;
}

export interface TelegramDailySummary {
  professionalId: string;
  professionalName: string;
  date: string;
  appointments: TelegramDailySummaryItem[];
}
