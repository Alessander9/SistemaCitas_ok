import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { GenerateLinkCodeDto } from './dto/generate-link-code.dto';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { UseGuards } from '@nestjs/common';

@Controller('telegram')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  // POST /telegram/webhook — Endpoint público para webhooks de Telegram Bot API
  @Post('webhook')
  @Public()
  handleWebhook(@Body() update: TelegramWebhookDto) {
    return this.telegramService.processWebhook(update);
  }

  // POST /telegram/link-code — Generar código de vinculación para el usuario actual
  @Post('link-code')
  @Roles('PROFESIONAL', 'ADMIN_CLINIC', 'RECEPCION')
  generateLinkCode(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateLinkCodeDto,
  ) {
    return this.telegramService.generateLinkingCode(
      clinicId,
      user.id,
      dto.professionalId,
      dto.role,
    );
  }

  // GET /telegram/account — Consultar estado de vinculación del usuario actual
  @Get('account')
  @Roles('PROFESIONAL', 'ADMIN_CLINIC', 'RECEPCION')
  getAccount(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.telegramService.getAccount(clinicId, user.id);
  }

  // POST /telegram/daily-summary/trigger — Disparar resumen diario 9 PM manualmente (Admin / Cron)
  @Post('daily-summary/trigger')
  @Roles('ADMIN_CLINIC')
  triggerDailySummary(@CurrentTenant() clinicId: string) {
    return this.telegramService.sendDailySummary9PM(clinicId);
  }
}
