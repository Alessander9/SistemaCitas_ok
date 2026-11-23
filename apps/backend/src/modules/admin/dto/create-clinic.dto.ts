import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  ValidateNested,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitialAdminUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateAdminClinicDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  ruc?: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  renipressCode?: string;

  @IsString()
  @IsOptional()
  ipressCategory?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  consultingRooms?: number;

  // Marca Blanca & Branding Presets
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  specialtyPreset?: string;

  @IsString()
  @IsOptional()
  landingStyle?: string;

  @IsString()
  @IsOptional()
  brandColor?: string;

  @IsString()
  @IsOptional()
  heroTitle?: string;

  @IsString()
  @IsOptional()
  heroSubtitle?: string;

  @IsString()
  @IsOptional()
  heroImageUrl?: string;

  @IsString()
  @IsOptional()
  loginTagline?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  aiAssistantName?: string;

  @IsBoolean()
  @IsOptional()
  enableSelfBooking?: boolean;

  @ValidateNested()
  @Type(() => InitialAdminUserDto)
  @IsOptional()
  initialAdmin?: InitialAdminUserDto;
}
