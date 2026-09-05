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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public, CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { MedicalService, UserRole } from '@citassistema/shared-types';

@Controller('services')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('specialtyId') specialtyId?: string,
    @Query('activeOnly') activeOnly?: string,
  ): Promise<MedicalService[]> {
    return this.servicesService.findAll(clinicId, specialtyId, activeOnly === 'true');
  }

  @Public()
  @Get(':id')
  async findOne(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<MedicalService> {
    return this.servicesService.findOne(clinicId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateServiceDto,
  ): Promise<MedicalService> {
    return this.servicesService.create(clinicId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async update(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<MedicalService> {
    return this.servicesService.update(clinicId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.servicesService.remove(clinicId, id);
  }
}
