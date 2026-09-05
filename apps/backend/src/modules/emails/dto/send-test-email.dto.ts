import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class SendTestEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  templateName: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number>;
}
