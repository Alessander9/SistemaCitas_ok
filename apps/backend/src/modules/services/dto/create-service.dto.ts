import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsOptional()
  @IsUUID('4', { message: 'El specialtyId debe ser un UUID válido.' })
  specialtyId?: string;

  @IsString({ message: 'El nombre del servicio debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio.' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres.' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt({ message: 'La duración debe ser un número entero de minutos.' })
  @Min(5, { message: 'La duración mínima es de 5 minutos.' })
  @Max(480, { message: 'La duración máxima es de 480 minutos (8 horas).' })
  durationMinutes!: number;

  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
