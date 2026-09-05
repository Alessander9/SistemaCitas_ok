import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CashMovementType } from '@citassistema/shared-types';

export class CreateCashMovementDto {
  @IsEnum(['sale', 'purchase', 'adjustment', 'return', 'waste'])
  type: CashMovementType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
