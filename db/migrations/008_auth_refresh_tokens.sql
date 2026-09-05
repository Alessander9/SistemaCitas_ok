-- =============================================================================
-- Migration 008: Auth Refresh Tokens (Token Rotation & Revocation)
-- CitasSistema — Auth & Security Foundation
-- =============================================================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  replaced_by_token UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE is_revoked = false;
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_clinic ON refresh_tokens(clinic_id);
