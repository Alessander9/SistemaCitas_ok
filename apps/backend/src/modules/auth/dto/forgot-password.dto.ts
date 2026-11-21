import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico ingresado no es válido.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'El token de verificación Cloudflare Turnstile es requerido.' })
  turnstileToken!: string;

  @IsString()
  @IsOptional()
  clinicSlug?: string;
}
