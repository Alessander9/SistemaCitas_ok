import { Pool } from 'pg';

// ---------------------------------------------------------------------------
// Base factory — wraps insert helper for each entity
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

async function insert(pool: Pool, table: string, data: Row): Promise<Row> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`);

  const { rows } = await pool.query(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values,
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// ClinicFactory
// ---------------------------------------------------------------------------

export interface ClinicData {
  name?: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  currency?: string;
  is_active?: boolean;
}

let clinicCounter = 0;

export async function createClinic(pool: Pool, overrides: ClinicData = {}): Promise<Row> {
  clinicCounter++;
  return insert(pool, 'clinics', {
    name: overrides.name ?? `Clínica Test ${clinicCounter}`,
    slug: overrides.slug ?? `clinica-test-${clinicCounter}`,
    phone: overrides.phone ?? '+54 11 0000-0000',
    email: overrides.email ?? `test${clinicCounter}@clinic.com`,
    address: overrides.address ?? 'Calle Falsa 123',
    timezone: overrides.timezone ?? 'America/Buenos_Aires',
    currency: overrides.currency ?? 'ARS',
    is_active: overrides.is_active ?? true,
  });
}

// ---------------------------------------------------------------------------
// UserFactory
// ---------------------------------------------------------------------------

export interface UserData {
  clinic_id: string;
  email?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

let userCounter = 0;

export async function createUser(pool: Pool, overrides: UserData): Promise<Row> {
  userCounter++;
  return insert(pool, 'users', {
    clinic_id: overrides.clinic_id,
    email: overrides.email ?? `user${userCounter}@test.com`,
    password_hash: overrides.password_hash ?? '$argon2id$v=19$m=65536,t=3,p=4$hash',
    first_name: overrides.first_name ?? `User${userCounter}`,
    last_name: overrides.last_name ?? `Last${userCounter}`,
    phone: overrides.phone ?? '+54 11 1111-0000',
    is_active: overrides.is_active ?? true,
  });
}

// ---------------------------------------------------------------------------
// PatientFactory
// ---------------------------------------------------------------------------

export interface PatientData {
  clinic_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: string;
}

let patientCounter = 0;

export async function createPatient(pool: Pool, overrides: PatientData): Promise<Row> {
  patientCounter++;
  return insert(pool, 'patients', {
    clinic_id: overrides.clinic_id,
    first_name: overrides.first_name ?? `Patient${patientCounter}`,
    last_name: overrides.last_name ?? `P LastName${patientCounter}`,
    email: overrides.email ?? `patient${patientCounter}@test.com`,
    phone: overrides.phone ?? '+54 11 2222-0000',
    date_of_birth: overrides.date_of_birth ?? '1990-01-15',
    gender: overrides.gender ?? 'other',
    national_id: overrides.national_id ?? `30-${patientCounter.toString().padStart(7, '0')}-0`,
  });
}

// ---------------------------------------------------------------------------
// SpecialtyFactory
// ---------------------------------------------------------------------------

export interface SpecialtyData {
  clinic_id: string;
  name?: string;
  description?: string;
}

let specialtyCounter = 0;

export async function createSpecialty(pool: Pool, overrides: SpecialtyData): Promise<Row> {
  specialtyCounter++;
  return insert(pool, 'specialties', {
    clinic_id: overrides.clinic_id,
    name: overrides.name ?? `Specialty ${specialtyCounter}`,
    description: overrides.description ?? `Description for specialty ${specialtyCounter}`,
    is_active: true,
    sort_order: specialtyCounter,
  });
}

// ---------------------------------------------------------------------------
// ServiceFactory
// ---------------------------------------------------------------------------

export interface ServiceData {
  clinic_id: string;
  specialty_id?: string;
  name?: string;
  duration_minutes?: number;
  price?: number;
}

let serviceCounter = 0;

export async function createService(pool: Pool, overrides: ServiceData): Promise<Row> {
  serviceCounter++;
  return insert(pool, 'services', {
    clinic_id: overrides.clinic_id,
    specialty_id: overrides.specialty_id ?? null,
    name: overrides.name ?? `Service ${serviceCounter}`,
    duration_minutes: overrides.duration_minutes ?? 30,
    price: overrides.price ?? 5000,
    is_active: true,
  });
}

// ---------------------------------------------------------------------------
// ProfessionalFactory
// ---------------------------------------------------------------------------

export interface ProfessionalData {
  clinic_id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  license_number?: string;
  is_active?: boolean;
}

let professionalCounter = 0;

export async function createProfessional(pool: Pool, overrides: ProfessionalData): Promise<Row> {
  professionalCounter++;
  return insert(pool, 'professionals', {
    clinic_id: overrides.clinic_id,
    user_id: overrides.user_id ?? null,
    first_name: overrides.first_name ?? `Dr. ${professionalCounter}`,
    last_name: overrides.last_name ?? `Prof ${professionalCounter}`,
    license_number: overrides.license_number ?? `MAT-${10000 + professionalCounter}`,
    is_active: overrides.is_active ?? true,
  });
}

// ---------------------------------------------------------------------------
// AppointmentFactory
// ---------------------------------------------------------------------------

export interface AppointmentData {
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  service_id: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  created_by?: string;
}

export async function createAppointment(pool: Pool, overrides: AppointmentData): Promise<Row> {
  return insert(pool, 'appointments', {
    clinic_id: overrides.clinic_id,
    patient_id: overrides.patient_id,
    professional_id: overrides.professional_id,
    service_id: overrides.service_id,
    appointment_date: overrides.appointment_date ?? new Date().toISOString().split('T')[0],
    start_time: overrides.start_time ?? '09:00',
    end_time: overrides.end_time ?? '09:30',
    status: overrides.status ?? 'pending',
    created_by: overrides.created_by ?? null,
  });
}

// ---------------------------------------------------------------------------
// RoleFactory
// ---------------------------------------------------------------------------

export interface RoleData {
  clinic_id: string;
  name?: string;
  description?: string;
  is_system?: boolean;
}

let roleCounter = 0;

export async function createRole(pool: Pool, overrides: RoleData): Promise<Row> {
  roleCounter++;
  return insert(pool, 'roles', {
    clinic_id: overrides.clinic_id,
    name: overrides.name ?? `Role ${roleCounter}`,
    description: overrides.description ?? `Role description ${roleCounter}`,
    is_system: overrides.is_system ?? false,
  });
}

// ---------------------------------------------------------------------------
// Reset counters (call between tests)
// ---------------------------------------------------------------------------

export function resetCounters() {
  clinicCounter = 0;
  userCounter = 0;
  patientCounter = 0;
  specialtyCounter = 0;
  serviceCounter = 0;
  professionalCounter = 0;
  roleCounter = 0;
}
