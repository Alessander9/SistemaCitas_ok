import { Controller, Get, Post, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService, AdminClinicResponse } from './admin.service';
import { CreateAdminClinicDto } from './dto/create-clinic.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('clinics')
  async listClinics(): Promise<AdminClinicResponse[]> {
    return this.adminService.listClinics();
  }

  @Post('clinics')
  @HttpCode(HttpStatus.CREATED)
  async createClinic(@Body() dto: CreateAdminClinicDto): Promise<AdminClinicResponse> {
    return this.adminService.createClinic(dto);
  }

  @Put('clinics/:id')
  async updateClinic(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdminClinicDto>,
  ): Promise<AdminClinicResponse> {
    return this.adminService.updateClinic(id, dto);
  }
}
