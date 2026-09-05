-- =============================================================================
-- Migration 013: Performance and Security Indexes for High-Concurrency Queries
-- Phase 13: QA, Performance, and Security Hardening
-- =============================================================================

-- 1. Appointments compound indexes for fast slot collision check and daily agenda lookups
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date_status
  ON appointments (clinic_id, appointment_date, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_prof_date
  ON appointments (clinic_id, professional_id, appointment_date, start_time)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_patient
  ON appointments (clinic_id, patient_id, appointment_date DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_pending
  ON appointments (clinic_id, appointment_date, reminder_sent, status)
  WHERE deleted_at IS NULL AND reminder_sent = false;

-- 2. Financial & Cash register compound indexes
CREATE INDEX IF NOT EXISTS idx_cash_sessions_clinic_date_status
  ON cash_registers (clinic_id, session_date, status);

CREATE INDEX IF NOT EXISTS idx_cash_movements_clinic_session
  ON cash_movements (clinic_id, cash_session_id, created_at);

-- 3. Inventory movements Kardex lookup
CREATE INDEX IF NOT EXISTS idx_inventory_movements_clinic_prod
  ON inventory_movements (clinic_id, product_id, created_at DESC);

-- 4. Audit & Communications
CREATE INDEX IF NOT EXISTS idx_email_logs_clinic_status
  ON email_logs (clinic_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_created
  ON audit_logs (clinic_id, created_at DESC);

-- 5. Telegram linking code verification
CREATE INDEX IF NOT EXISTS idx_telegram_linking_active
  ON telegram_accounts (linking_code, linking_code_expires_at)
  WHERE is_active = true AND linking_code IS NOT NULL;
