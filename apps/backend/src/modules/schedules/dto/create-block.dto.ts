import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateScheduleBlockDto {
  @IsUUID('4', { message: 'El professionalId debe ser un UUID válido.' })
  @IsNotEmpty()
  professionalId!: string;

  @IsDateString({}, { message: 'blockDate debe tener formato YYYY-MM-DD.' })
  @IsNotEmpty()
  blockDate!: string;

  @IsString({ message: 'startTime debe tener formato HH:MM.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime debe tener un formato de hora válido HH:MM o HH:MM:SS.',
  })
  startTime!: string;

  @IsString({ message: 'endTime debe tener formato HH:MM.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'endTime debe tener un formato de hora válido HH:MM o HH:MM:SS.',
  })
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recurrenceRule?: string;
}
