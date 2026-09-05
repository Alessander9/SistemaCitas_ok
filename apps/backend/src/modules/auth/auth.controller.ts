import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public, CurrentUser, CurrentTenant } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { AuthenticatedUser, UserProfileResponse } from '@citassistema/shared-types';

@Controller('auth')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: { refreshToken?: string },
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id, body?.refreshToken);
    return { message: 'Sesión cerrada correctamente.' };
  }

  @Get('me')
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() clinicId: string,
  ): Promise<UserProfileResponse> {
    return this.authService.getProfile(user.id, clinicId || user.clinicId);
  }
}
