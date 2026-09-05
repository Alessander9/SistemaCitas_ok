import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashRegisterDto {
  @IsNumber()
  @Min(0)
  openingAmount: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
