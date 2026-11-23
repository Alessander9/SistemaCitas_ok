import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ClinicalKnowledgeService,
  ClinicalProtocolDto,
  VademecumItemDto,
  VoiceMacroDto,
  ClinicVoiceSettingsDto,
} from './clinical-knowledge.service';
import { CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { UserRole } from '@citassistema/shared-types';

@Controller('clinical/knowledge')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ClinicalKnowledgeController {
  constructor(private readonly knowledgeService: ClinicalKnowledgeService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN, UserRole.PROFESIONAL)
  async getOverview(@CurrentTenant() clinicId: string) {
    const [protocols, vademecum, macros, voiceSettings, alertsAudit] = await Promise.all([
      this.knowledgeService.listProtocols(clinicId),
      this.knowledgeService.listVademecum(clinicId),
      this.knowledgeService.listMacros(clinicId),
      this.knowledgeService.getVoiceSettings(clinicId),
      this.knowledgeService.listAlertAudit(clinicId, 50),
    ]);

    return {
      protocols,
      vademecum,
      macros,
      voiceSettings,
      alertsAudit,
    };
  }

  // ---------------------------------------------------------------------------
  // Tab 1: Protocolos Clínicos (Editor Estructurado)
  // ---------------------------------------------------------------------------

  @Post('protocols')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createProtocol(@CurrentTenant() clinicId: string, @Body() dto: ClinicalProtocolDto) {
    return this.knowledgeService.createProtocol(clinicId, dto);
  }

  @Put('protocols/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  async updateProtocol(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: Partial<ClinicalProtocolDto>,
  ) {
    return this.knowledgeService.updateProtocol(clinicId, id, dto);
  }

  @Delete('protocols/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProtocol(@CurrentTenant() clinicId: string, @Param('id') id: string) {
    await this.knowledgeService.deleteProtocol(clinicId, id);
  }

  // ---------------------------------------------------------------------------
  // Tab 2: Vademécum y Reglas de Alergias
  // ---------------------------------------------------------------------------

  @Post('vademecum')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createVademecum(@CurrentTenant() clinicId: string, @Body() dto: VademecumItemDto) {
    return this.knowledgeService.createVademecumItem(clinicId, dto);
  }

  @Put('vademecum/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  async updateVademecum(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: Partial<VademecumItemDto>,
  ) {
    return this.knowledgeService.updateVademecumItem(clinicId, id, dto);
  }

  @Delete('vademecum/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVademecum(@CurrentTenant() clinicId: string, @Param('id') id: string) {
    await this.knowledgeService.deleteVademecumItem(clinicId, id);
  }

  // ---------------------------------------------------------------------------
  // Tab 3: Macros de Voz y Nombre de Invocación ("Chanfainita")
  // ---------------------------------------------------------------------------

  @Post('macros')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createMacro(@CurrentTenant() clinicId: string, @Body() dto: VoiceMacroDto) {
    return this.knowledgeService.createVoiceMacro(clinicId, dto);
  }

  @Put('macros/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  async updateMacro(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: Partial<VoiceMacroDto>,
  ) {
    return this.knowledgeService.updateVoiceMacro(clinicId, id, dto);
  }

  @Delete('macros/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMacro(@CurrentTenant() clinicId: string, @Param('id') id: string) {
    await this.knowledgeService.deleteVoiceMacro(clinicId, id);
  }

  @Put('voice-settings')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  async updateVoiceSettings(
    @CurrentTenant() clinicId: string,
    @Body() dto: Partial<ClinicVoiceSettingsDto>,
  ) {
    return this.knowledgeService.saveVoiceSettings(clinicId, dto);
  }

  // ---------------------------------------------------------------------------
  // Tab 4: Auditoría de Alertas Clínicas
  // ---------------------------------------------------------------------------

  @Get('alerts-audit')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.SUPER_ADMIN)
  async listAlertsAudit(@CurrentTenant() clinicId: string) {
    return this.knowledgeService.listAlertAudit(clinicId, 100);
  }
}
