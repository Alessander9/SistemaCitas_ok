import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Laterality,
  PainDepth,
  PainView,
  TriggerPointStatus,
} from '@citassistema/shared-types';

export class CreatePainPointItemDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'El structureCode es obligatorio.' })
  structureCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'El regionCode es obligatorio.' })
  regionCode!: string;

  @IsIn(['D', 'I', 'bilateral', 'central'], {
    message: 'La lateralidad debe ser D, I, bilateral o central.',
  })
  laterality!: Laterality;

  @IsIn(['anterior', 'posterior', 'lateral'], {
    message: 'La vista debe ser anterior, posterior o lateral.',
  })
  view!: PainView;

  @IsNumber()
  @Min(0)
  @Max(100)
  coordX!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  coordY!: number;

  @IsInt()
  @Min(0, { message: 'La escala EVA mínima es 0.' })
  @Max(10, { message: 'La escala EVA máxima es 10.' })
  eva!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  painTypes?: string[];

  @IsOptional()
  @IsIn(['activo', 'latente'], {
    message: 'El punto gatillo debe ser activo o latente.',
  })
  triggerPoint?: TriggerPointStatus;

  @IsOptional()
  @IsIn(['superficial', 'profundo'], {
    message: 'La profundidad debe ser superficial o profundo.',
  })
  depth?: PainDepth;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aggravatingFactors?: string[];

  @IsOptional()
  @IsObject()
  referredArea?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SavePainMapDto {
  @IsUUID('all', { message: 'El patientId debe ser un UUID válido.' })
  @IsNotEmpty()
  patientId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'El professionalId debe ser un UUID válido.' })
  professionalId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El medicalRecordId debe ser un UUID válido.' })
  medicalRecordId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El treatmentSessionId debe ser un UUID válido.' })
  treatmentSessionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePainPointItemDto)
  points!: CreatePainPointItemDto[];
}
