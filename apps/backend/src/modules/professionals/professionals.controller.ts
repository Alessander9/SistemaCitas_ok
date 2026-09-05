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
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { AssignServicesDto } from './dto/assign-services.dto';
import { Public, CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Professional, UserRole } from '@citassistema/shared-types';

@Controller('professionals')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Public()
  @Get()
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('serviceId') serviceId?: string,
    @Query('activeOnly') activeOnly?: string,
  ): Promise<Professional[]> {
    return this.professionalsService.findAll(clinicId, serviceId, activeOnly === 'true');
  }

  @Public()
  @Get(':id')
  async findOne(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Professional> {
    return this.professionalsService.findOne(clinicId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateProfessionalDto,
  ): Promise<Professional> {
    return this.professionalsService.create(clinicId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  async update(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalDto,
  ): Promise<Professional> {
    return this.professionalsService.update(clinicId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.professionalsService.remove(clinicId, id);
  }

  @Post(':id/services')
  @Roles(UserRole.ADMIN_CLINIC)
  async assignServices(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: AssignServicesDto,
  ): Promise<{ message: string }> {
    await this.professionalsService.assignServices(clinicId, id, dto.serviceIds);
    return { message: 'Servicios asignados correctamente al profesional.' };
  }
}
