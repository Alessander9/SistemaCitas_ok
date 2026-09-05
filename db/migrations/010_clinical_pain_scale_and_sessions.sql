-- =============================================================================
-- Migration 010: Clinical Pain Scale (EVA 0-10) & Enhanced Sessions
-- CitasSistema — Physical Therapy & Medical History
-- =============================================================================

ALTER TABLE medical_records
  ADD COLUMN IF NOT EXISTS pain_scale INT CHECK (pain_scale >= 0 AND pain_scale <= 10),
  ADD COLUMN IF NOT EXISTS anamnesis TEXT,
  ADD COLUMN IF NOT EXISTS physical_examination TEXT;

ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS completed_sessions INT DEFAULT 0;

ALTER TABLE treatment_sessions
  ADD COLUMN IF NOT EXISTS pain_scale_before INT CHECK (pain_scale_before >= 0 AND pain_scale_before <= 10),
  ADD COLUMN IF NOT EXISTS pain_scale_after INT CHECK (pain_scale_after >= 0 AND pain_scale_after <= 10),
  ADD COLUMN IF NOT EXISTS techniques_applied JSONB DEFAULT '[]'::jsonb;
