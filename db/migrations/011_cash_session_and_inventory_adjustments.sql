-- =============================================================================
-- Migration 011: Cash Session & Inventory Adjustments
-- CitasSistema — Fase 9: Caja Chica e Inventario Kardex
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CASH_REGISTERS: Enriquecer con datos de sesión diaria y montos de arqueo
-- ---------------------------------------------------------------------------
ALTER TABLE cash_registers
  ADD COLUMN IF NOT EXISTS opening_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS closing_amount  NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS difference      NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS session_date    DATE,
  ADD COLUMN IF NOT EXISTS notes           TEXT,
  ADD COLUMN IF NOT EXISTS status          VARCHAR(20) NOT NULL DEFAULT 'closed';

-- Índice para buscar la caja abierta del día en una clínica
CREATE INDEX IF NOT EXISTS idx_cash_registers_session
  ON cash_registers(clinic_id, session_date)
  WHERE status = 'open';

-- ---------------------------------------------------------------------------
-- CASH_MOVEMENTS: Agregar referencia a la sesión de caja diaria
-- ---------------------------------------------------------------------------
ALTER TABLE cash_movements
  ADD COLUMN IF NOT EXISTS cash_session_id UUID REFERENCES cash_registers(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_cash_movements_session
  ON cash_movements(cash_session_id, created_at);

-- ---------------------------------------------------------------------------
-- INVENTORY_MOVEMENTS: Trazabilidad hacia sesiones de tratamiento (Fase 8)
-- ---------------------------------------------------------------------------
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS treatment_session_id UUID REFERENCES treatment_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_treatment_session
  ON inventory_movements(treatment_session_id)
  WHERE treatment_session_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Constraint: stock no puede ser negativo
-- ---------------------------------------------------------------------------
ALTER TABLE inventory_products
  ADD CONSTRAINT chk_inventory_products_stock_non_negative
    CHECK (current_stock >= 0);
