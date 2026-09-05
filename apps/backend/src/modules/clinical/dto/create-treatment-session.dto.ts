import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateTreatmentSessionDto {
  @IsUUID('4', { message: 'El treatmentId debe ser un UUID válido.' })
  @IsNotEmpty()
  treatmentId!: string;

  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;

  @IsDateString({}, { message: 'sessionDate debe ser YYYY-MM-DD.' })
  @IsNotEmpty()
  sessionDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  evolution?: string;

  @IsOptional()
  @IsString()
  nextSessionNotes?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painScaleBefore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painScaleAfter?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techniquesApplied?: string[];
}
