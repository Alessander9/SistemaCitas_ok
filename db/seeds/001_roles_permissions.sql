-- =============================================================================
-- Seed 001: Default Roles and Permissions
-- CitasSistema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Default Clinic (Demo)
-- ---------------------------------------------------------------------------
INSERT INTO clinics (id, name, slug, phone, email, address, timezone, currency, is_active)
VALUES (
  'a0000000-0000-4000-a000-000000000001',
  'Clínica Sanitas San Isidro',
  'clinica-demo',
  '+51 1 710-8000',
  'contacto@clinica.pe',
  'Av. Javier Prado Este 1450, San Isidro, Lima, Perú',
  'America/Lima',
  'PEN',
  true
);

-- ---------------------------------------------------------------------------
-- Default Roles
-- ---------------------------------------------------------------------------
INSERT INTO roles (id, clinic_id, name, description, is_system) VALUES
  ('b0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'SUPER_ADMIN', 'Administrador global del sistema', true),
  ('b0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'ADMIN_CLINIC', 'Administrador de la clínica', true),
  ('b0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000001', 'RECEPCION', 'Personal de recepción', true),
  ('b0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000001', 'PROFESIONAL', 'Profesional de salud', true),
  ('b0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000001', 'PACIENTE', 'Paciente', true);

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
INSERT INTO permissions (name, resource, action) VALUES
  -- Clinics
  ('clinics.read', 'clinics', 'read'),
  ('clinics.create', 'clinics', 'create'),
  ('clinics.update', 'clinics', 'update'),
  ('clinics.delete', 'clinics', 'delete'),
  -- Users
  ('users.read', 'users', 'read'),
  ('users.create', 'users', 'create'),
  ('users.update', 'users', 'update'),
  ('users.delete', 'users', 'delete'),
  -- Patients
  ('patients.read', 'patients', 'read'),
  ('patients.create', 'patients', 'create'),
  ('patients.update', 'patients', 'update'),
  ('patients.delete', 'patients', 'delete'),
  -- Appointments
  ('appointments.read', 'appointments', 'read'),
  ('appointments.create', 'appointments', 'create'),
  ('appointments.update', 'appointments', 'update'),
  ('appointments.cancel', 'appointments', 'cancel'),
  -- Services & Specialties
  ('services.read', 'services', 'read'),
  ('services.create', 'services', 'create'),
  ('services.update', 'services', 'update'),
  ('services.delete', 'services', 'delete'),
  ('specialties.read', 'specialties', 'read'),
  ('specialties.create', 'specialties', 'create'),
  ('specialties.update', 'specialties', 'update'),
  ('specialties.delete', 'specialties', 'delete'),
  -- Professionals
  ('professionals.read', 'professionals', 'read'),
  ('professionals.create', 'professionals', 'create'),
  ('professionals.update', 'professionals', 'update'),
  ('professionals.delete', 'professionals', 'delete'),
  -- Medical Records
  ('medical_records.read', 'medical_records', 'read'),
  ('medical_records.create', 'medical_records', 'create'),
  ('medical_records.update', 'medical_records', 'update'),
  -- Treatments
  ('treatments.read', 'treatments', 'read'),
  ('treatments.create', 'treatments', 'create'),
  ('treatments.update', 'treatments', 'update'),
  -- Payments
  ('payments.read', 'payments', 'read'),
  ('payments.create', 'payments', 'create'),
  ('payments.refund', 'payments', 'refund'),
  -- Cash Register
  ('cash_registers.read', 'cash_registers', 'read'),
  ('cash_registers.open', 'cash_registers', 'open'),
  ('cash_registers.close', 'cash_registers', 'close'),
  -- Inventory
  ('inventory.read', 'inventory', 'read'),
  ('inventory.create', 'inventory', 'create'),
  ('inventory.update', 'inventory', 'update'),
  -- Reports
  ('reports.read', 'reports', 'read'),
  -- Config
  ('config.read', 'config', 'read'),
  ('config.update', 'config', 'update'),
  -- Audit
  ('audit.read', 'audit', 'read');

-- ---------------------------------------------------------------------------
-- Role-Permission Mapping (ADMIN_CLINIC gets all)
-- ---------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  'b0000000-0000-4000-a000-000000000002'::uuid,
  id
FROM permissions;

-- RECEPCION gets patient/appointment/payment/cash perms
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  'b0000000-0000-4000-a000-000000000003'::uuid,
  id
FROM permissions
WHERE name LIKE 'patients.%'
   OR name LIKE 'appointments.%'
   OR name LIKE 'payments.%'
   OR name LIKE 'cash_registers.%'
   OR name LIKE 'services.read'
   OR name LIKE 'specialties.read'
   OR name LIKE 'professionals.read'
   OR name LIKE 'medical_records.read'
   OR name LIKE 'treatments.read';

-- PROFESIONAL gets schedule/clinical reads
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  'b0000000-0000-4000-a000-000000000004'::uuid,
  id
FROM permissions
WHERE name LIKE 'appointments.read'
   OR name LIKE 'patients.read'
   OR name LIKE 'medical_records.%'
   OR name LIKE 'treatments.%'
   OR name LIKE 'services.read'
   OR name LIKE 'specialties.read';

-- PACIENTE gets limited read
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  'b0000000-0000-4000-a000-000000000005'::uuid,
  id
FROM permissions
WHERE name LIKE 'appointments.read'
   OR name LIKE 'appointments.create';
