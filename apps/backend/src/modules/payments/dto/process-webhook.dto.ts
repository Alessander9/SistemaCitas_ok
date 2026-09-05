import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ProcessWebhookDto {
  @IsString({ message: 'El eventId del webhook es obligatorio.' })
  @IsNotEmpty()
  eventId!: string;

  @IsString({ message: 'El eventType es obligatorio.' })
  @IsNotEmpty()
  eventType!: string;

  @IsObject({ message: 'El payload del webhook debe ser un objeto.' })
  @IsNotEmpty()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  signature?: string;
}
