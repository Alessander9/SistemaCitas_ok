import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DayScheduleDto {
  @IsInt({ message: 'dayOfWeek debe ser un número entero entre 0 (Domingo) y 6 (Sábado).' })
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString({ message: 'startTime debe tener formato HH:MM (ej. 08:00).' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime debe tener un formato de hora válido HH:MM o HH:MM:SS.',
  })
  startTime!: string;

  @IsString({ message: 'endTime debe tener formato HH:MM (ej. 17:00).' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'endTime debe tener un formato de hora válido HH:MM o HH:MM:SS.',
  })
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetWeeklyScheduleDto {
  @IsArray()
  @IsNotEmpty({ message: 'Debes proporcionar al menos un horario para la semana.' })
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedules!: DayScheduleDto[];
}

export class CreateScheduleDto extends DayScheduleDto {
  @IsUUID('4', { message: 'El professionalId debe ser un UUID válido.' })
  @IsNotEmpty()
  professionalId!: string;
}
