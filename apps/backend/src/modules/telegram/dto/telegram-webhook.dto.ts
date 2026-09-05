import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class TelegramWebhookDto {
  @IsNumber()
  update_id: number;

  @IsOptional()
  @IsObject()
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

  @IsOptional()
  @IsObject()
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
