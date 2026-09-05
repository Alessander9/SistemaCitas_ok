import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString({ message: 'El nombre de la especialidad debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la especialidad es obligatorio.' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres.' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
