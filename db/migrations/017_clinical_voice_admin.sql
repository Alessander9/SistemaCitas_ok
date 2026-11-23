-- Migration 017: Clinical Voice Settings & Clinical Alerts Audit (Fase 3 & 4)
-- CitasSistema — Configurable Wake-Word ("Chanfainita") & Alert Traceability

CREATE TABLE IF NOT EXISTS clinic_voice_settings (
  clinic_id UUID PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE,
  wake_word VARCHAR(60) NOT NULL DEFAULT 'Chanfainita',
  wake_aliases TEXT[] NOT NULL DEFAULT ARRAY['chanfainita', 'chanfanita', 'chanfaina', 'chanfa'],
  default_mode VARCHAR(20) NOT NULL DEFAULT 'ambient',
  privacy_mode_default BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_alert_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID,
  professional_id UUID,
  alert_type VARCHAR(30) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'high',
  title VARCHAR(200) NOT NULL,
  detail TEXT NOT NULL,
  transcript_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_alert_audit_clinic ON clinical_alert_audit(clinic_id, created_at DESC);
