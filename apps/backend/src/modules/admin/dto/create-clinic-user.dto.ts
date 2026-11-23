import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateClinicUserDto {
  @IsUUID()
  @IsNotEmpty()
  clinicId!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString()
  @IsOptional()
  @IsIn(['ADMIN_CLINIC', 'RECEPCION', 'SUPER_ADMIN'])
  role?: 'ADMIN_CLINIC' | 'RECEPCION' | 'SUPER_ADMIN';
}
