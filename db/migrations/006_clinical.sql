-- =============================================================================
-- Migration 006: Clinical Tables
-- CitasSistema — Medical Records, Treatments, Sessions, Prescriptions, Documents
-- =============================================================================

-- ---------------------------------------------------------------------------
-- MEDICAL_RECORDS
-- ---------------------------------------------------------------------------
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  vitals JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_records_professional ON medical_records(professional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_records_clinic ON medical_records(clinic_id, created_at) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- TREATMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  diagnosis TEXT,
  goals TEXT,
  total_sessions INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_treatments_patient ON treatments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_treatments_clinic ON treatments(clinic_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- TREATMENT_SESSIONS
-- ---------------------------------------------------------------------------
CREATE TABLE treatment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INT NOT NULL,
  session_date DATE NOT NULL,
  notes TEXT,
  evolution TEXT,
  next_session_notes TEXT,
  duration_minutes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_treatment_sessions_treatment ON treatment_sessions(treatment_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- PRESCRIPTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medications JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_professional ON prescriptions(professional_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  document_type document_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_clinic ON documents(clinic_id, document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_patient ON documents(patient_id) WHERE patient_id IS NOT NULL AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- CONSENTS
-- ---------------------------------------------------------------------------
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  document_url TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consents_patient ON consents(patient_id);
CREATE INDEX idx_consents_clinic ON consents(clinic_id, consent_type);
