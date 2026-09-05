import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProfessionalDto {
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido.' })
  userId?: string;

  @IsString({ message: 'El nombre es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString({ message: 'El apellido es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo debe tener un formato válido.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada serviceId debe ser un UUID válido.' })
  serviceIds?: string[];
}
