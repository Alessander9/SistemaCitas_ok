import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsString({ message: 'El refresh token debe ser una cadena de texto.' })
  refreshToken?: string;
}
