import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CashService } from './cash.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';

@Controller('cash')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CashController {
  constructor(private readonly cashService: CashService) {}

  // POST /cash/open — Apertura de caja
  @Post('open')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  open(
    @CurrentTenant() clinicId: string,
    @Body() dto: OpenCashRegisterDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cashService.openCashRegister(clinicId, dto, user.id);
  }

  // POST /cash/:id/close — Cierre con arqueo
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  close(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) registerId: string,
    @Body() dto: CloseCashRegisterDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cashService.closeCashRegister(clinicId, registerId, dto, user.id);
  }

  // POST /cash/:id/movements — Registrar movimiento
  @Post(':id/movements')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  addMovement(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) registerId: string,
    @Body() dto: CreateCashMovementDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cashService.addMovement(clinicId, registerId, dto, user.id);
  }

  // GET /cash/today — Resumen del día
  @Get('today')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  today(@CurrentTenant() clinicId: string) {
    return this.cashService.getTodaySummary(clinicId);
  }

  // GET /cash/history — Historial de sesiones
  @Get('history')
  @Roles('ADMIN_CLINIC')
  history(
    @CurrentTenant() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.cashService.getHistory(clinicId, dateFrom, dateTo);
  }
}
