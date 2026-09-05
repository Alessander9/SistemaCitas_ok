import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateLinkCodeDto {
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
