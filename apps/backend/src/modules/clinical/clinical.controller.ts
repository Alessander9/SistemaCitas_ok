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
import { CurrentTenant, CurrentUser, Roles, Public } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
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
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecord[]> {
    return this.clinicalService.getPatientMedicalRecords(clinicId, patientId);
  }

  @Get('records/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getRecordById(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<MedicalRecord> {
    return this.clinicalService.getMedicalRecordById(clinicId, id);
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
    @Param('patientId') patientId: string,
  ): Promise<Treatment[]> {
    return this.clinicalService.getPatientTreatments(clinicId, patientId);
  }

  @Get('treatments/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getTreatmentById(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Treatment> {
    return this.clinicalService.getTreatmentById(clinicId, id);
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
    @Param('patientId') patientId: string,
  ): Promise<Prescription[]> {
    return this.clinicalService.getPatientPrescriptions(clinicId, patientId);
  }

  @Get('prescriptions/:id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.PACIENTE)
  async getPrescriptionById(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Prescription> {
    return this.clinicalService.getPrescriptionById(clinicId, id);
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
    @Param('patientId') patientId: string,
    @Query('recordId') recordId?: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<PainPoint[]> {
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
  @Public()
  @HttpCode(HttpStatus.OK)
  async processVoiceDictation(
    @Body() body: { transcript: string; currentData?: Partial<ParsedClinicalData> },
  ): Promise<VoiceAssistantProcessResult> {
    return this.voiceAssistantService.processDictation(
      body.transcript || '',
      body.currentData,
    );
  }

  @Post('voice-assistant/save')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async saveVoiceConsultation(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveConsultationDto,
  ): Promise<{ recordId: string; prescriptionId?: string; spokenConfirmation: string }> {
    const effectiveClinicId = clinicId || 'a0000000-0000-4000-a000-000000000001';
    const effectiveProfessionalId = dto.professionalId || user?.id || 'e0000000-0000-4000-a000-000000000001';
    const effectivePatientId = dto.patientId || '20175da2-1cfe-4934-829b-9e32de9f06d9';

    return this.voiceAssistantService.saveConsultationRecord(effectiveClinicId, {
      ...dto,
      patientId: effectivePatientId,
      professionalId: effectiveProfessionalId,
    });
  }
}
