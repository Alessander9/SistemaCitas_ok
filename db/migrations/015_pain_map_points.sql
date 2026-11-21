-- Migration 015: Puntos de dolor anatómicos con zoom y evolución clínica
-- Permite persistir mapas de dolor por consulta médica (medical_records) y por sesión (treatment_sessions)

CREATE TABLE IF NOT EXISTS pain_map_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  treatment_session_id UUID REFERENCES treatment_sessions(id) ON DELETE CASCADE,
  structure_code VARCHAR(120) NOT NULL,
  region_code VARCHAR(60) NOT NULL,
  laterality VARCHAR(10) NOT NULL CHECK (laterality IN ('D','I','bilateral','central')),
  view VARCHAR(10) NOT NULL CHECK (view IN ('anterior','posterior','lateral')),
  coord_x NUMERIC(5,2) NOT NULL CHECK (coord_x BETWEEN 0 AND 100),
  coord_y NUMERIC(5,2) NOT NULL CHECK (coord_y BETWEEN 0 AND 100),
  eva INT NOT NULL CHECK (eva BETWEEN 0 AND 10),
  pain_types TEXT[] DEFAULT '{}',
  trigger_point VARCHAR(10) CHECK (trigger_point IN ('activo','latente')),
  depth VARCHAR(12) CHECK (depth IN ('superficial','profundo')),
  aggravating_factors TEXT[] DEFAULT '{}',
  referred_area JSONB,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CHECK (medical_record_id IS NOT NULL OR treatment_session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_pain_points_patient_structure
  ON pain_map_points (clinic_id, patient_id, structure_code, recorded_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pain_points_record
  ON pain_map_points (medical_record_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pain_points_session
  ON pain_map_points (treatment_session_id) WHERE deleted_at IS NULL;
