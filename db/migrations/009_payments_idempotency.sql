-- =============================================================================
-- Migration 009: Payments Idempotency & Webhooks
-- CitasSistema — Multi-Gateway, Idempotency & Signatures
-- =============================================================================

ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255),
  ADD COLUMN IF NOT EXISTS gateway_provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Unique idempotency key per clinic to prevent double charging
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_clinic_idempotency 
  ON payments(clinic_id, idempotency_key) 
  WHERE idempotency_key IS NOT NULL AND deleted_at IS NULL;

-- Webhook event logs for auditing and idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(512),
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_webhook_provider_event 
  ON webhook_events(provider, event_id);
