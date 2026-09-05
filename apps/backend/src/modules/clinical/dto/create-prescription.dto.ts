import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsString({ message: 'El nombre del medicamento es obligatorio.' })
  @IsNotEmpty()
  medicationName!: string;

  @IsString({ message: 'La dosis es obligatoria.' })
  @IsNotEmpty()
  dose!: string;

  @IsString({ message: 'La vía de administración es obligatoria (ej. Oral, Tópica).' })
  @IsNotEmpty()
  route!: string;

  @IsString({ message: 'La frecuencia es obligatoria (ej. Cada 8 horas).' })
  @IsNotEmpty()
  frequency!: string;

  @IsString({ message: 'La duración es obligatoria (ej. Por 5 días).' })
  @IsNotEmpty()
  duration!: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsUUID('4', { message: 'El patientId debe ser un UUID válido.' })
  @IsNotEmpty()
  patientId!: string;

  @IsUUID('4', { message: 'El professionalId debe ser un UUID válido.' })
  @IsNotEmpty()
  professionalId!: string;

  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;

  @IsArray({ message: 'medications debe ser un arreglo de medicamentos.' })
  @IsNotEmpty({ message: 'La receta debe contener al menos un medicamento.' })
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  medications!: PrescriptionItemDto[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
