import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole, JwtPayload } from '@citassistema/shared-types';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AdminService,
  AdminClinicResponse,
  AdminOverviewResponse,
  AdminUserRecord,
  AdminClinicFinanceRow,
  AdminAuditEventResponse,
} from './admin.service';
import { CreateAdminClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicStatusDto } from './dto/update-clinic-status.dto';
import { CreateClinicUserDto } from './dto/create-clinic-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview(): Promise<AdminOverviewResponse> {
    return this.adminService.getOverview();
  }

  @Get('clinics')
  async listClinics(): Promise<AdminClinicResponse[]> {
    return this.adminService.listClinics();
  }

  @Post('clinics')
  @HttpCode(HttpStatus.CREATED)
  async createClinic(
    @Body() dto: CreateAdminClinicDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<AdminClinicResponse> {
    return this.adminService.createClinic(dto, user?.sub);
  }

  @Put('clinics/:id')
  async updateClinic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAdminClinicDto>,
    @CurrentUser() user?: JwtPayload,
  ): Promise<AdminClinicResponse> {
    return this.adminService.updateClinic(id, dto, user?.sub);
  }

  @Patch('clinics/:id/status')
  async toggleClinicStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicStatusDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<AdminClinicResponse> {
    return this.adminService.toggleClinicStatus(id, dto.isActive, user?.sub);
  }

  @Get('finance')
  async getNetworkFinance(): Promise<AdminClinicFinanceRow[]> {
    return this.adminService.getNetworkFinance();
  }

  @Get('users')
  async listAdminUsers(): Promise<AdminUserRecord[]> {
    return this.adminService.listAdminUsers();
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createClinicUser(
    @Body() dto: CreateClinicUserDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<AdminUserRecord> {
    return this.adminService.createClinicUser(dto, user?.sub);
  }

  @Patch('users/:id/status')
  async toggleUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<{ id: string; isActive: boolean }> {
    return this.adminService.toggleUserStatus(id, dto.isActive, user?.sub);
  }

  @Get('audit')
  async getAuditFeed(@Query('limit') limit?: string): Promise<AdminAuditEventResponse[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 40;
    return this.adminService.getAuditFeed(Number.isNaN(parsedLimit) ? 40 : parsedLimit);
  }
}
