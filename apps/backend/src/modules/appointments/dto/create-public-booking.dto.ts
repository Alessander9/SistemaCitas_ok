import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePublicBookingDto {
  @IsUUID()
  professionalId!: string;

  @IsUUID()
  serviceId!: string;

  @IsDateString()
  appointmentDate!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  patientFirstName!: string;

  @IsString()
  @IsNotEmpty()
  patientLastName!: string;

  @IsString()
  @IsOptional()
  patientDocType?: string;

  @IsString()
  @IsOptional()
  patientDocNumber?: string;

  @IsString()
  @IsOptional()
  patientPhone?: string;

  @IsEmail()
  @IsOptional()
  patientEmail?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
