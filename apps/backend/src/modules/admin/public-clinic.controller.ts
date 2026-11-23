import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AdminService, PublicClinicBrandingResponse } from './admin.service';

@Controller('public')
export class PublicClinicController {
  constructor(private readonly adminService: AdminService) {}

  @Get('clinic-branding')
  async getClinicBranding(
    @Query('slug') slug?: string,
  ): Promise<PublicClinicBrandingResponse> {
    if (!slug || !slug.trim()) {
      throw new BadRequestException('El parámetro "slug" es obligatorio para consultar el branding');
    }
    return this.adminService.getPublicClinicBranding(slug.trim());
  }
}
