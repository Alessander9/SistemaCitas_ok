-- =============================================================================
-- Migration 004: Patients and Appointments
-- CitasSistema — Core Booking Tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PATIENTS
-- ---------------------------------------------------------------------------
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  national_id VARCHAR(50),
  insurance_provider VARCHAR(200),
  insurance_number VARCHAR(100),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(30),
  allergies TEXT,
  medical_notes TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_email ON patients(clinic_id, email) WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_patients_phone ON patients(clinic_id, phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_patients_national_id ON patients(clinic_id, national_id) WHERE national_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_patients_name ON patients(clinic_id, last_name, first_name) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- APPOINTMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_appointments_clinic ON appointments(clinic_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_professional ON appointments(professional_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_patient ON appointments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status ON appointments(clinic_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_date_range ON appointments(clinic_id, appointment_date, start_time, end_time) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- APPOINTMENT_STATUS_HISTORY
-- ---------------------------------------------------------------------------
CREATE TABLE appointment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  from_status appointment_status,
  to_status appointment_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_history ON appointment_status_history(appointment_id, changed_at);
