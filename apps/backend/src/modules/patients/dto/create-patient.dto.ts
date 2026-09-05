import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePatientDto {
  @IsString({ message: 'El nombre es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString({ message: 'El apellido es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo no es válido.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateOfBirth debe ser YYYY-MM-DD.' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  insuranceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
