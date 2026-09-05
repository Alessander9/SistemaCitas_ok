import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  appointmentDate!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:MM format' })
  startTime!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}