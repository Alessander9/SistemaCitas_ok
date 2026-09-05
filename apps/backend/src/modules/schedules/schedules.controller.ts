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
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SetWeeklyScheduleDto } from './dto/create-schedule.dto';
import { CreateScheduleBlockDto } from './dto/create-block.dto';
import { Public, CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { ProfessionalSchedule, ScheduleBlock, UserRole } from '@citassistema/shared-types';

@Controller('schedules')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Public()
  @Get('professionals/:professionalId')
  async getProfessionalSchedules(
    @CurrentTenant() clinicId: string,
    @Param('professionalId') professionalId: string,
  ): Promise<ProfessionalSchedule[]> {
    return this.schedulesService.getProfessionalSchedules(clinicId, professionalId);
  }

  @Put('professionals/:professionalId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL)
  async setWeeklySchedule(
    @CurrentTenant() clinicId: string,
    @Param('professionalId') professionalId: string,
    @Body() dto: SetWeeklyScheduleDto,
  ): Promise<ProfessionalSchedule[]> {
    return this.schedulesService.setWeeklySchedule(
      clinicId,
      professionalId,
      dto.schedules,
    );
  }

  @Public()
  @Get('professionals/:professionalId/blocks')
  async getBlocks(
    @CurrentTenant() clinicId: string,
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ScheduleBlock[]> {
    return this.schedulesService.getBlocks(clinicId, professionalId, startDate, endDate);
  }

  @Post('blocks')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async createBlock(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateScheduleBlockDto,
  ): Promise<ScheduleBlock> {
    return this.schedulesService.createBlock(clinicId, dto);
  }

  @Delete('blocks/:blockId')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlock(
    @CurrentTenant() clinicId: string,
    @Param('blockId') blockId: string,
  ): Promise<void> {
    return this.schedulesService.deleteBlock(clinicId, blockId);
  }
}
