-- =============================================================================
-- Migration 003: Medical Catalog Tables
-- CitasSistema — Specialties, Services, Professionals, Schedules
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SPECIALTIES
-- ---------------------------------------------------------------------------
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_specialties_clinic ON specialties(clinic_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------------
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'ARS',
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_services_clinic ON services(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_specialty ON services(specialty_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- PROFESSIONALS
-- ---------------------------------------------------------------------------
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(30),
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  consultation_fee NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_professionals_clinic ON professionals(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_professionals_user ON professionals(user_id) WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- PROFESSIONAL_SERVICES (junction)
-- ---------------------------------------------------------------------------
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price NUMERIC(10, 2),
  custom_duration_minutes INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_professional_services_unique ON professional_services(professional_id, service_id);

-- ---------------------------------------------------------------------------
-- PROFESSIONAL_SCHEDULES
-- ---------------------------------------------------------------------------
CREATE TABLE professional_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_professional_schedules_prof ON professional_schedules(professional_id)
  WHERE deleted_at IS NULL AND is_active = true;

-- ---------------------------------------------------------------------------
-- SCHEDULE_BLOCKS (lunch, breaks, absences)
-- ---------------------------------------------------------------------------
CREATE TABLE schedule_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason VARCHAR(200),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_schedule_blocks_prof_date ON schedule_blocks(professional_id, block_date)
  WHERE deleted_at IS NULL;
