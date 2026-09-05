// =============================================================================
// CitasSistema — Shared Types: Inventario Kardex
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type InventoryMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';

// ---------------------------------------------------------------------------
// Inventory Product (Catálogo de insumos)
// ---------------------------------------------------------------------------
export interface InventoryProduct {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unit: string;             // 'unit', 'box', 'ml', 'mg', etc.
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
  isLowStock: boolean;      // computed: currentStock <= minStock
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Inventory Movement (Kardex — registro de cada movimiento de stock)
// ---------------------------------------------------------------------------
export interface InventoryMovement {
  id: string;
  clinicId: string;
  productId: string;
  productName?: string;
  type: InventoryMovementType;
  quantity: number;           // always positive; direction implied by type
  unitCost?: number;
  reference?: string;
  notes?: string;
  treatmentSessionId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Stock Alert (Productos bajo mínimo)
// ---------------------------------------------------------------------------
export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
}
