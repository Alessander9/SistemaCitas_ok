-- =============================================================================
-- Migration 012: Telegram Professional Linking & Interactive Bot
-- CitasSistema — Fase 11: Integración con Telegram
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TELEGRAM_ACCOUNTS: Ampliación para profesionales y usuarios del staff
-- ---------------------------------------------------------------------------
ALTER TABLE telegram_accounts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS linking_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS linking_code_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Índices para búsqueda rápida durante /start <code> y resolución de mensajes
CREATE INDEX IF NOT EXISTS idx_telegram_linking_code
  ON telegram_accounts(linking_code)
  WHERE linking_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_telegram_professional
  ON telegram_accounts(clinic_id, professional_id)
  WHERE professional_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_telegram_user_account
  ON telegram_accounts(clinic_id, user_id)
  WHERE user_id IS NOT NULL;
