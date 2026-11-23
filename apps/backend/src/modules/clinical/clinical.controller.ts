import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { ClinicalKnowledgeService } from './clinical-knowledge.service';
import {
  ClinicalVoiceAssistantService,
  ParsedClinicalData,
  VoiceAssistantProcessResult,
  SaveConsultationDto,
} from './clinical-voice-assistant.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { SavePainMapDto } from './dto/save-pain-map.dto';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { DatabaseService } from '../../database/database.service';
import { assertPatientOwnership } from '../../common/security/patient-ownership.util';
import {
  MedicalRecord,
  Treatment,
  TreatmentSession,
  Prescription,
  PainPoint,
  PainEvolutionSeries,
  AuthenticatedUser,
  UserRole,
} from '@citassistema/shared-types';

@Controller('clinical')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ClinicalController {
  constructor(
    private readonly clinicalService: ClinicalService,
    private readonly voiceAssistantService: ClinicalVoiceAssistantService,
    private readonly knowledgeService: ClinicalKnowledgeService,
    private readonly db: DatabaseService,
  ) {}

  // ---------------------------------------------------------------------------
  // Medical Records
  // ---------------------------------------------------------------------------

  @Post('records')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.CREATED)
  async createRecord(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    return this.clinicalService.createMedicalRecord(clinicId, dto);
  }

  @Get('records/patient/:patientId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPatientRecords(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecord[]> {
    await assertPatientOwnership(this.db, clinicId, user, patientId);
    return this.clinicalService.getPatientMedicalRecords(clinicId, patientId);
  }

  @Get('records/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getRecordById(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MedicalRecord> {
    const rec = await this.clinicalService.getMedicalRecordById(clinicId, id);
    await assertPatientOwnership(this.db, clinicId, user, rec.patientId);
    return rec;
  }

  // ---------------------------------------------------------------------------
  // Treatments
  // ---------------------------------------------------------------------------

  @Post('treatments')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.CREATED)
  async createTreatment(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateTreatmentDto,
  ): Promise<Treatment> {
    return this.clinicalService.createTreatment(clinicId, dto);
  }

  @Get('treatments/patient/:patientId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPatientTreatments(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('patientId') patientId: string,
  ): Promise<Treatment[]> {
    await assertPatientOwnership(this.db, clinicId, user, patientId);
    return this.clinicalService.getPatientTreatments(clinicId, patientId);
  }

  @Get('treatments/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getTreatmentById(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Treatment> {
    const tr = await this.clinicalService.getTreatmentById(clinicId, id);
    await assertPatientOwnership(this.db, clinicId, user, tr.patientId);
    return tr;
  }

  @Post('treatments/:treatmentId/sessions')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @CurrentTenant() clinicId: string,
    @Param('treatmentId') treatmentId: string,
    @Body() dto: Omit<CreateTreatmentSessionDto, 'treatmentId'>,
  ): Promise<TreatmentSession> {
    return this.clinicalService.createTreatmentSession(clinicId, {
      ...dto,
      treatmentId,
    });
  }

  @Get('treatments/:treatmentId/sessions')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getTreatmentSessions(
    @CurrentTenant() clinicId: string,
    @Param('treatmentId') treatmentId: string,
  ): Promise<TreatmentSession[]> {
    return this.clinicalService.getTreatmentSessions(clinicId, treatmentId);
  }

  // ---------------------------------------------------------------------------
  // Prescriptions
  // ---------------------------------------------------------------------------

  @Post('prescriptions')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.CREATED)
  async createPrescription(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    return this.clinicalService.createPrescription(clinicId, dto);
  }

  @Get('prescriptions/patient/:patientId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPatientPrescriptions(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('patientId') patientId: string,
  ): Promise<Prescription[]> {
    await assertPatientOwnership(this.db, clinicId, user, patientId);
    return this.clinicalService.getPatientPrescriptions(clinicId, patientId);
  }

  @Get('prescriptions/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPrescriptionById(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Prescription> {
    const rx = await this.clinicalService.getPrescriptionById(clinicId, id);
    await assertPatientOwnership(this.db, clinicId, user, rx.patientId);
    return rx;
  }

  // ---------------------------------------------------------------------------
  // Pain Map Points & Evolution
  // ---------------------------------------------------------------------------

  @Put('pain-map')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.OK)
  async savePainMap(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SavePainMapDto,
  ): Promise<PainPoint[]> {
    return this.clinicalService.savePainMap(clinicId, user?.id, dto);
  }

  @Get('patients/:patientId/pain-map')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPainMap(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('patientId') patientId: string,
    @Query('recordId') recordId?: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<PainPoint[]> {
    await assertPatientOwnership(this.db, clinicId, user, patientId);
    return this.clinicalService.getPainMap(clinicId, patientId, {
      recordId,
      sessionId,
    });
  }

  @Get('patients/:patientId/pain-map/evolution')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  async getPainEvolution(
    @CurrentTenant() clinicId: string,
    @Param('patientId') patientId: string,
    @Query('structureCode') structureCode?: string,
  ): Promise<PainEvolutionSeries[]> {
    return this.clinicalService.getPainEvolution(clinicId, patientId, structureCode);
  }

  // ---------------------------------------------------------------------------
  // Asistente Clínico de Voz Bidireccional (IA Multi-Proveedor & Altavoz)
  // ---------------------------------------------------------------------------

  @Post('voice-assistant/process')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.OK)
  async processVoiceDictation(
    @CurrentTenant() clinicId: string,
    @Body()
    body: {
      transcript: string;
      currentData?: Partial<ParsedClinicalData>;
      mode?: 'ambient' | 'active';
      patientId?: string;
      patientAllergies?: string;
      privacyMode?: boolean;
    },
  ): Promise<VoiceAssistantProcessResult> {
    return this.voiceAssistantService.processDictation(
      body.transcript || '',
      body.currentData,
      {
        mode: body.mode || 'ambient',
        clinicId,
        patientId: body.patientId,
        patientAllergies: body.patientAllergies,
        privacyMode: body.privacyMode,
      },
    );
  }

  @Post('voice-assistant/save')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.CREATED)
  async saveVoiceConsultation(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveConsultationDto,
  ): Promise<{ recordId: string; prescriptionId?: string; spokenConfirmation: string }> {
    const effectiveProfessionalId = dto.professionalId || user.id;

    return this.voiceAssistantService.saveConsultationRecord(clinicId, {
      ...dto,
      professionalId: effectiveProfessionalId,
    });
  }

  @Post('voice-assistant/transcribe')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.OK)
  async transcribeVoiceAudio(
    @Body() body: { audioBase64: string; mimeType?: string },
  ): Promise<{ transcript: string; provider: string }> {
    return this.voiceAssistantService.transcribeAudioWithGroq(body.audioBase64, body.mimeType);
  }

  @Post('voice-assistant/patient-summary')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.OK)
  async generatePatientSummary(
    @Body() body: { clinicalData: ParsedClinicalData; patientName?: string },
  ): Promise<{ whatsappMessage: string; portalSummary: string; provider: string }> {
    return this.voiceAssistantService.generatePatientSummary(body.clinicalData || {}, body.patientName);
  }

  @Get('voice-assistant/briefing/:patientId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  async getPatientBriefing(
    @CurrentTenant() clinicId: string,
    @Param('patientId') patientId: string,
    @Query('patientName') patientName?: string,
    @Query('allergies') allergies?: string,
    @Query('diagnosis') diagnosis?: string,
    @Query('evaLast') evaLast?: string,
    @Query('sessionLabel') sessionLabel?: string,
  ) {
    return this.voiceAssistantService.getPatientBriefing(clinicId, patientId, {
      patientName,
      allergies,
      diagnosis,
      evaLast: evaLast !== undefined ? Number(evaLast) : undefined,
      sessionLabel,
    });
  }

  @Post('voice-assistant/deduct-supplies')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  @HttpCode(HttpStatus.OK)
  async deductConfirmedSupplies(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      supplies: Array<{ productId?: string; name: string; quantity: number }>;
      reference?: string;
    },
  ): Promise<{ deductedCount: number; details: string[] }> {
    return this.knowledgeService.deductConfirmedSupplies(
      clinicId,
      user.id,
      body.supplies || [],
      body.reference,
    );
  }
}
