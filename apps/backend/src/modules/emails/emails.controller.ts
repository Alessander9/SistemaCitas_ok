import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';

@Controller('emails')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  // GET /emails/templates — Listar plantillas de la clínica
  @Get('templates')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  getTemplates(@CurrentTenant() clinicId: string) {
    return this.emailsService.getTemplates(clinicId);
  }

  // POST /emails/templates — Crear plantilla personalizada
  @Post('templates')
  @Roles('ADMIN_CLINIC')
  createTemplate(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateEmailTemplateDto,
  ) {
    return this.emailsService.createTemplate(clinicId, dto);
  }

  // PUT /emails/templates/:id — Actualizar plantilla
  @Put('templates/:id')
  @Roles('ADMIN_CLINIC')
  updateTemplate(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return this.emailsService.updateTemplate(clinicId, id, dto);
  }

  // POST /emails/send-test — Enviar correo de prueba
  @Post('send-test')
  @Roles('ADMIN_CLINIC')
  sendTest(
    @CurrentTenant() clinicId: string,
    @Body() dto: SendTestEmailDto,
  ) {
    return this.emailsService.sendEmail(clinicId, {
      to: dto.to,
      templateName: dto.templateName,
      variables: dto.variables,
    });
  }

  // GET /emails/logs — Auditoría de correos enviados
  @Get('logs')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  getLogs(
    @CurrentTenant() clinicId: string,
    @Query('limit') limit?: string,
  ) {
    return this.emailsService.getLogs(clinicId, limit ? parseInt(limit, 10) : 50);
  }

  // POST /emails/reminders/sweep — Disparar barrido de recordatorios (Cron / Manual)
  @Post('reminders/sweep')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  triggerReminders(@CurrentTenant() clinicId: string) {
    return this.emailsService.triggerReminderSweep(clinicId);
  }
}
