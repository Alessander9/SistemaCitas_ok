import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryProductDto } from './dto/create-inventory-product.dto';
import { UpdateInventoryProductDto } from './dto/update-inventory-product.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { UseGuards } from '@nestjs/common';

@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // GET /inventory — Listado de productos
  @Get()
  @Roles('ADMIN_CLINIC', 'RECEPCION', 'PROFESIONAL')
  findAll(
    @CurrentTenant() clinicId: string,
    @Query('category') category?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    return this.inventoryService.findAll(clinicId, {
      category,
      lowStockOnly: lowStockOnly === 'true',
    });
  }

  // GET /inventory/alerts — Alertas de stock bajo
  @Get('alerts')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  getAlerts(@CurrentTenant() clinicId: string) {
    return this.inventoryService.getLowStockAlerts(clinicId);
  }

  // GET /inventory/movements — Kardex (todos o por producto)
  @Get('movements')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  getMovements(
    @CurrentTenant() clinicId: string,
    @Query('productId') productId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.inventoryService.getMovements(clinicId, { productId, dateFrom, dateTo });
  }

  // POST /inventory — Crear producto
  @Post()
  @Roles('ADMIN_CLINIC')
  create(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateInventoryProductDto,
  ) {
    return this.inventoryService.create(clinicId, dto);
  }

  // POST /inventory/movements — Registrar movimiento de stock
  @Post('movements')
  @Roles('ADMIN_CLINIC', 'RECEPCION')
  addMovement(
    @CurrentTenant() clinicId: string,
    @Body() dto: CreateInventoryMovementDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.inventoryService.addMovement(clinicId, dto, user.id);
  }

  // GET /inventory/:id — Producto por ID
  @Get(':id')
  @Roles('ADMIN_CLINIC', 'RECEPCION', 'PROFESIONAL')
  findOne(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.inventoryService.findOne(clinicId, id);
  }

  // PUT /inventory/:id — Actualizar producto
  @Put(':id')
  @Roles('ADMIN_CLINIC')
  update(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryProductDto,
  ) {
    return this.inventoryService.update(clinicId, id, dto);
  }

  // DELETE /inventory/:id — Borrado lógico
  @Delete(':id')
  @Roles('ADMIN_CLINIC')
  remove(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.inventoryService.softDelete(clinicId, id);
  }
}
