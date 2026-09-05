import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Patient, PatientHistory, UserRole } from '@citassistema/shared-types';

@Controller('patients')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION, UserRole.PACIENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.create(clinicId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION)
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ data: Patient[]; total: number }> {
    return this.patientsService.findAll(
      clinicId,
      search,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION, UserRole.PACIENTE)
  async findOne(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Patient> {
    return this.patientsService.findOne(clinicId, id);
  }

  @Get(':id/history')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION, UserRole.PACIENTE)
  async getHistory(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<PatientHistory> {
    return this.patientsService.getHistory(clinicId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION, UserRole.PACIENTE)
  async update(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(clinicId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.patientsService.remove(clinicId, id);
  }
}
