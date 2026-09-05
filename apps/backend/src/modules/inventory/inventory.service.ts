import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateInventoryProductDto } from './dto/create-inventory-product.dto';
import { UpdateInventoryProductDto } from './dto/update-inventory-product.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import {
  InventoryProduct,
  InventoryMovement,
  StockAlert,
} from '@citassistema/shared-types';

// ---------------------------------------------------------------------------
// DB row interfaces
// ---------------------------------------------------------------------------

interface ProductDbRow {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_price: string;
  sell_price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MovementDbRow {
  id: string;
  clinic_id: string;
  product_id: string;
  product_name?: string;
  type: string;
  quantity: number;
  unit_cost?: string;
  reference?: string;
  notes?: string;
  treatment_session_id?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  // =========================================================================
  // Mappers
  // =========================================================================

  private mapProductRow(r: ProductDbRow): InventoryProduct {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      name: r.name,
      description: r.description ?? undefined,
      sku: r.sku ?? undefined,
      category: r.category ?? undefined,
      unit: r.unit,
      currentStock: Number(r.current_stock),
      minStock: Number(r.min_stock),
      costPrice: parseFloat(r.cost_price),
      sellPrice: parseFloat(r.sell_price),
      isActive: r.is_active,
      isLowStock: Number(r.current_stock) <= Number(r.min_stock),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  private mapMovementRow(r: MovementDbRow): InventoryMovement {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      productId: r.product_id,
      productName: r.product_name ?? undefined,
      type: r.type as InventoryMovement['type'],
      quantity: Number(r.quantity),
      unitCost: r.unit_cost != null ? parseFloat(r.unit_cost) : undefined,
      reference: r.reference ?? undefined,
      notes: r.notes ?? undefined,
      treatmentSessionId: r.treatment_session_id ?? undefined,
      createdBy: r.created_by,
      createdByName: r.created_by_name ?? undefined,
      createdAt: r.created_at,
    };
  }

  // =========================================================================
  // 9.2.1 — CRUD de Productos
  // =========================================================================

  async findAll(
    clinicId: string,
    filters: { category?: string; isActive?: boolean; lowStockOnly?: boolean } = {},
  ): Promise<InventoryProduct[]> {
    const conditions = ['p.clinic_id = $1', 'p.deleted_at IS NULL'];
    const params: unknown[] = [clinicId];
    let idx = 2;

    if (filters.category) {
      conditions.push(`p.category = $${idx++}`);
      params.push(filters.category);
    }
    if (filters.isActive !== undefined) {
      conditions.push(`p.is_active = $${idx++}`);
      params.push(filters.isActive);
    }
    if (filters.lowStockOnly) {
      conditions.push(`p.current_stock <= p.min_stock`);
    }

    const { rows } = await this.db.query<ProductDbRow>(
      `SELECT * FROM inventory_products p
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.name ASC`,
      params,
    );

    return rows.map((r) => this.mapProductRow(r));
  }

  async findOne(clinicId: string, id: string): Promise<InventoryProduct> {
    const { rows } = await this.db.query<ProductDbRow>(
      `SELECT * FROM inventory_products WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.mapProductRow(rows[0]);
  }

  async create(clinicId: string, dto: CreateInventoryProductDto): Promise<InventoryProduct> {
    // Check SKU uniqueness within clinic
    if (dto.sku) {
      const { rows: existing } = await this.db.query<{ id: string }>(
        `SELECT id FROM inventory_products WHERE clinic_id = $1 AND sku = $2 AND deleted_at IS NULL`,
        [clinicId, dto.sku.trim()],
      );
      if (existing.length > 0) {
        throw new ConflictException(`Ya existe un producto con el SKU "${dto.sku}" en esta clínica.`);
      }
    }

    const { rows } = await this.db.query<ProductDbRow>(
      `INSERT INTO inventory_products (
         clinic_id, name, description, sku, category, unit,
         current_stock, min_stock, cost_price, sell_price
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        clinicId,
        dto.name,
        dto.description ?? null,
        dto.sku?.trim() ?? null,
        dto.category ?? null,
        dto.unit,
        dto.currentStock,
        dto.minStock,
        dto.costPrice,
        dto.sellPrice,
      ],
    );

    return this.mapProductRow(rows[0]);
  }

  async update(clinicId: string, id: string, dto: UpdateInventoryProductDto): Promise<InventoryProduct> {
    await this.findOne(clinicId, id); // verify exists

    const setClauses: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.name !== undefined) { setClauses.push(`name = $${idx++}`); params.push(dto.name); }
    if (dto.description !== undefined) { setClauses.push(`description = $${idx++}`); params.push(dto.description); }
    if (dto.sku !== undefined) { setClauses.push(`sku = $${idx++}`); params.push(dto.sku); }
    if (dto.category !== undefined) { setClauses.push(`category = $${idx++}`); params.push(dto.category); }
    if (dto.unit !== undefined) { setClauses.push(`unit = $${idx++}`); params.push(dto.unit); }
    if (dto.minStock !== undefined) { setClauses.push(`min_stock = $${idx++}`); params.push(dto.minStock); }
    if (dto.costPrice !== undefined) { setClauses.push(`cost_price = $${idx++}`); params.push(dto.costPrice); }
    if (dto.sellPrice !== undefined) { setClauses.push(`sell_price = $${idx++}`); params.push(dto.sellPrice); }
    if (dto.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); params.push(dto.isActive); }

    const { rows } = await this.db.query<ProductDbRow>(
      `UPDATE inventory_products SET ${setClauses.join(', ')}
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      params,
    );

    return this.mapProductRow(rows[0]);
  }

  async softDelete(clinicId: string, id: string): Promise<void> {
    const { rowCount } = await this.db.query(
      `UPDATE inventory_products SET deleted_at = NOW()
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );
    if (rowCount === 0) throw new NotFoundException('Producto no encontrado');
  }

  // =========================================================================
  // 9.2.2 — Kardex: Registro de movimientos de stock
  // =========================================================================

  async addMovement(
    clinicId: string,
    dto: CreateInventoryMovementDto,
    userId: string,
  ): Promise<InventoryMovement> {
    const product = await this.findOne(clinicId, dto.productId);

    // Determine stock delta: purchases/returns add stock, sales/waste/adjustments remove
    const isOutbound = dto.type === 'sale' || dto.type === 'waste';
    const isAdjustment = dto.type === 'adjustment';

    if (isOutbound && product.currentStock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${product.currentStock} ${product.unit}. Cantidad solicitada: ${dto.quantity}.`,
      );
    }

    return this.db.transaction(async (client) => {
      // Determine new stock
      let stockDelta = dto.quantity;
      if (isOutbound) {
        stockDelta = -dto.quantity;
      } else if (isAdjustment) {
        // Adjustment: quantity is the new absolute stock level
        stockDelta = dto.quantity - product.currentStock;
      }

      // Update product stock
      await client.query(
        `UPDATE inventory_products
         SET current_stock = current_stock + $1, updated_at = NOW()
         WHERE id = $2 AND clinic_id = $3`,
        [stockDelta, dto.productId, clinicId],
      );

      // Insert movement record
      const { rows } = await client.query<MovementDbRow>(
        `INSERT INTO inventory_movements (
           clinic_id, product_id, type, quantity, unit_cost,
           reference, notes, treatment_session_id, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          clinicId,
          dto.productId,
          dto.type,
          dto.quantity,
          dto.unitCost ?? null,
          dto.reference ?? null,
          dto.notes ?? null,
          dto.treatmentSessionId ?? null,
          userId,
        ],
      );

      const movement = rows[0];
      return {
        ...this.mapMovementRow(movement),
        productName: product.name,
      };
    });
  }

  // =========================================================================
  // 9.2.3 — Alertas de stock bajo
  // =========================================================================

  async getLowStockAlerts(clinicId: string): Promise<StockAlert[]> {
    const { rows } = await this.db.query<{
      id: string;
      name: string;
      current_stock: number;
      min_stock: number;
      unit: string;
    }>(
      `SELECT id, name, current_stock, min_stock, unit
       FROM inventory_products
       WHERE clinic_id = $1 AND current_stock <= min_stock AND is_active = true AND deleted_at IS NULL
       ORDER BY (current_stock::float / NULLIF(min_stock, 0)) ASC`,
      [clinicId],
    );

    return rows.map((r) => ({
      productId: r.id,
      productName: r.name,
      currentStock: Number(r.current_stock),
      minStock: Number(r.min_stock),
      unit: r.unit,
    }));
  }

  // =========================================================================
  // 9.2.4 — Kardex: Historial de movimientos
  // =========================================================================

  async getMovements(
    clinicId: string,
    filters: { productId?: string; dateFrom?: string; dateTo?: string } = {},
  ): Promise<InventoryMovement[]> {
    const conditions = ['im.clinic_id = $1'];
    const params: unknown[] = [clinicId];
    let idx = 2;

    if (filters.productId) {
      conditions.push(`im.product_id = $${idx++}`);
      params.push(filters.productId);
    }
    if (filters.dateFrom) {
      conditions.push(`im.created_at >= $${idx++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`im.created_at <= $${idx++}`);
      params.push(filters.dateTo);
    }

    const { rows } = await this.db.query<MovementDbRow>(
      `SELECT im.*, p.name AS product_name,
              u.first_name || ' ' || u.last_name AS created_by_name
       FROM inventory_movements im
       JOIN inventory_products p ON p.id = im.product_id
       LEFT JOIN users u ON u.id = im.created_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY im.created_at DESC`,
      params,
    );

    return rows.map((r) => this.mapMovementRow(r));
  }
}
