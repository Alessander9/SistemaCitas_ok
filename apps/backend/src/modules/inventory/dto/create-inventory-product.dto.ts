import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellPrice: number;
}
