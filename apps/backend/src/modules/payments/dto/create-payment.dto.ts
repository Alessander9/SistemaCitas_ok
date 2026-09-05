import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@citassistema/shared-types';

export class CreatePaymentDto {
  @IsOptional()
  @IsUUID('4', { message: 'El appointmentId debe ser un UUID válido.' })
  appointmentId?: string;

  @IsUUID('4', { message: 'El patientId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El patientId es obligatorio.' })
  patientId!: string;

  @IsNumber({}, { message: 'El monto debe ser un número válido.' })
  @Min(0.01, { message: 'El monto mínimo de pago es 0.01.' })
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum(['cash', 'credit_card', 'debit_card', 'transfer', 'insurance', 'yape', 'plin', 'other'], {
    message: 'Método de pago no válido.',
  })
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gatewayProvider?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
