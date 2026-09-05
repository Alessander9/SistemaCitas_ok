import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTreatmentDto {
  @IsUUID('4', { message: 'El patientId debe ser un UUID válido.' })
  @IsNotEmpty()
  patientId!: string;

  @IsUUID('4', { message: 'El professionalId debe ser un UUID válido.' })
  @IsNotEmpty()
  professionalId!: string;

  @IsString({ message: 'El nombre del tratamiento es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsInt({ message: 'totalSessions debe ser un número entero.' })
  @Min(1, { message: 'El tratamiento debe tener al menos 1 sesión.' })
  totalSessions!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
