-- =============================================================================
-- Migration 007: Operational Tables
-- CitasSistema — Inventory, Email, Notifications, Telegram, Audit Logs
-- =============================================================================

-- ---------------------------------------------------------------------------
-- INVENTORY_PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE inventory_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  category VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'unit',
  current_stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  sell_price NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_inventory_products_clinic ON inventory_products(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_products_sku ON inventory_products(clinic_id, sku) WHERE sku IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_inventory_products_low_stock ON inventory_products(clinic_id)
  WHERE current_stock <= min_stock AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- INVENTORY_MOVEMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  type movement_type NOT NULL,
  quantity INT NOT NULL,
  unit_cost NUMERIC(10, 2),
  reference VARCHAR(100),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id, created_at);
CREATE INDEX idx_inventory_movements_clinic ON inventory_movements(clinic_id, created_at);

-- ---------------------------------------------------------------------------
-- EMAIL_TEMPLATES
-- ---------------------------------------------------------------------------
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_email_templates_name ON email_templates(clinic_id, name) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- EMAIL_LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_logs_clinic ON email_logs(clinic_id, created_at);
CREATE INDEX idx_email_logs_status ON email_logs(status) WHERE status IN ('queued', 'sent');

-- ---------------------------------------------------------------------------
-- NOTIFICATION_LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_clinic ON notification_logs(clinic_id, created_at);
CREATE INDEX idx_notification_logs_patient ON notification_logs(patient_id) WHERE patient_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- TELEGRAM_ACCOUNTS
-- ---------------------------------------------------------------------------
CREATE TABLE telegram_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  telegram_user_id BIGINT NOT NULL,
  username VARCHAR(100),
  first_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_telegram_user ON telegram_accounts(telegram_user_id);
CREATE INDEX idx_telegram_clinic ON telegram_accounts(clinic_id) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- AUDIT_LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_clinic ON audit_logs(clinic_id, created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(clinic_id, action, created_at);

-- ---------------------------------------------------------------------------
-- TRIGGER: Auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT LIKE '_%'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;
