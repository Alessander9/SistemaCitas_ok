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
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Public, CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Specialty, UserRole } from '@citassistema/shared-types';

@Controller('specialties')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Public()
  @Get()
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('activeOnly') activeOnly?: string,
  ): Promise<Specialty[]> {
    return this.specialtiesService.findAll(clinicId, activeOnly === 'true');
  }

  @Public()
  @Get(':id')
  async findOne(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<Specialty> {
    return this.specialtiesService.findOne(clinicId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateSpecialtyDto,
  ): Promise<Specialty> {
    return this.specialtiesService.create(clinicId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async update(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    return this.specialtiesService.update(clinicId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_CLINIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() clinicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.specialtiesService.remove(clinicId, id);
  }
}
