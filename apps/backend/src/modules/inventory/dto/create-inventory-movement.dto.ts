import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { InventoryMovementType } from '@citassistema/shared-types';

export class CreateInventoryMovementDto {
  @IsUUID()
  productId: string;

  @IsEnum(['sale', 'purchase', 'adjustment', 'return', 'waste'])
  type: InventoryMovementType;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  treatmentSessionId?: string;
}
