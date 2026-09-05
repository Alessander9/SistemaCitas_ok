-- =============================================================================
-- Migration 005: Financial Tables
-- CitasSistema — Payments, Cash Registers, Cash Movements
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method,
  description TEXT,
  reference_number VARCHAR(100),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payments_clinic ON payments(clinic_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_appointment ON payments(appointment_id) WHERE appointment_id IS NOT NULL;
CREATE INDEX idx_payments_patient ON payments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_status ON payments(clinic_id, status) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- PAYMENT_TRANSACTIONS (payment gateway records)
-- ---------------------------------------------------------------------------
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  gateway VARCHAR(50) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_external ON payment_transactions(external_id) WHERE external_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- CASH_REGISTERS
-- ---------------------------------------------------------------------------
CREATE TABLE cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  current_balance NUMERIC(10, 2) DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  opened_by UUID REFERENCES users(id),
  closed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cash_registers_clinic ON cash_registers(clinic_id, is_active);

-- ---------------------------------------------------------------------------
-- CASH_MOVEMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  type movement_type NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(100),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cash_movements_register ON cash_movements(cash_register_id, created_at);
CREATE INDEX idx_cash_movements_clinic ON cash_movements(clinic_id, created_at);
