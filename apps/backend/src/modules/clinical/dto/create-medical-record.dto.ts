import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID('4', { message: 'El patientId debe ser un UUID válido.' })
  @IsNotEmpty()
  patientId!: string;

  @IsUUID('4', { message: 'El professionalId debe ser un UUID válido.' })
  @IsNotEmpty()
  professionalId!: string;

  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  anamnesis?: string;

  @IsOptional()
  @IsString()
  physicalExamination?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La escala de dolor EVA mínima es 0.' })
  @Max(10, { message: 'La escala de dolor EVA máxima es 10.' })
  painScale?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  vitals?: Record<string, unknown>;
}
