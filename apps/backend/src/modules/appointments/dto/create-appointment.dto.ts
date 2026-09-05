import { IsUUID, IsDateString, IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  professionalId!: string;

  @IsUUID()
  serviceId!: string;

  @IsDateString()
  appointmentDate!: string; // 'YYYY-MM-DD'

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:MM format' })
  startTime!: string; // 'HH:MM'

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  internalNotes?: string;
}
