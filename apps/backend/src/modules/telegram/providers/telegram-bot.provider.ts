import { Injectable } from '@nestjs/common';
import { TelegramSendMessageOptions } from '@citassistema/shared-types';

@Injectable()
export class TelegramBotProvider {
  public sentMessages: TelegramSendMessageOptions[] = [];
  public answeredCallbacks: Array<{ callbackQueryId: string; text?: string }> = [];

  async sendMessage(options: TelegramSendMessageOptions): Promise<{ message_id: number; ok: boolean }> {
    this.sentMessages.push(options);
    return {
      message_id: Date.now(),
      ok: true,
    };
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<{ ok: boolean }> {
    this.answeredCallbacks.push({ callbackQueryId, text });
    return { ok: true };
  }

  clear() {
    this.sentMessages = [];
    this.answeredCallbacks = [];
  }
}
