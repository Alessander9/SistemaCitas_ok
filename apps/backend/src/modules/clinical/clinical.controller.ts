import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import {
  MedicalRecord,
  Treatment,
  TreatmentSession,
  Prescription,
  UserRole,
} from '@citassistema/shared-types';

@Controller('clinical')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

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
}
