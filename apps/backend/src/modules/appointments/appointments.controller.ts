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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CurrentTenant, CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Appointment, AppointmentStatus, UserRole } from '@citassistema/shared-types';

@Controller('appointments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ---------------------------------------------------------------------------
  // Availability
  // ---------------------------------------------------------------------------

  @Public()
  @Get('availability')
  async getAvailability(
    @CurrentTenant() clinicId: string,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(clinicId, professionalId, serviceId, date);
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  @Get()
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('professionalId') professionalId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Appointment[]> {
    return this.appointmentsService.findAll(clinicId, {
      professionalId,
      patientId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.findOne(clinicId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION, UserRole.PACIENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.create(clinicId, dto, user?.id);
  }

  // ---------------------------------------------------------------------------
  // State Machine
  // ---------------------------------------------------------------------------

  @Patch(':id/confirm')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async confirm(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(clinicId, id, AppointmentStatus.CONFIRMED, user.id);
  }

  @Patch(':id/check-in')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async checkIn(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(clinicId, id, AppointmentStatus.CHECKED_IN, user.id);
  }

  @Patch(':id/start')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  async start(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(clinicId, id, AppointmentStatus.IN_PROGRESS, user.id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  async complete(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(clinicId, id, AppointmentStatus.COMPLETED, user.id);
  }

  @Patch(':id/no-show')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async noShow(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(clinicId, id, AppointmentStatus.NO_SHOW, user.id);
  }

  // ---------------------------------------------------------------------------
  // Cancel / Reschedule
  // ---------------------------------------------------------------------------

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION, UserRole.PACIENTE)
  async cancel(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.cancel(clinicId, id, dto, user?.id);
  }

  @Post(':id/reschedule')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION, UserRole.PACIENTE)
  @HttpCode(HttpStatus.CREATED)
  async reschedule(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.reschedule(clinicId, id, dto, user?.id);
  }

  // ---------------------------------------------------------------------------
  // Status History
  // ---------------------------------------------------------------------------

  @Get(':id/history')
  async getHistory(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.getHistory(clinicId, id);
  }

  // ---------------------------------------------------------------------------
  // Soft Delete
  // ---------------------------------------------------------------------------

  @Delete(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.appointmentsService.softDelete(clinicId, id);
  }
}
