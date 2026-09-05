// =============================================================================
// CitasSistema — Shared Types (Auth, RBAC, Multi-Tenancy)
// =============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_CLINIC = 'ADMIN_CLINIC',
  RECEPCION = 'RECEPCION',
  PROFESIONAL = 'PROFESIONAL',
  PACIENTE = 'PACIENTE',
}

export enum SystemPermission {
  // Appointments
  APPOINTMENTS_READ = 'appointments.read',
  APPOINTMENTS_CREATE = 'appointments.create',
  APPOINTMENTS_UPDATE = 'appointments.update',
  APPOINTMENTS_CANCEL = 'appointments.cancel',
  APPOINTMENTS_RESCHEDULE = 'appointments.reschedule',

  // Patients
  PATIENTS_READ = 'patients.read',
  PATIENTS_CREATE = 'patients.create',
  PATIENTS_UPDATE = 'patients.update',

  // Medical Records
  MEDICAL_RECORDS_READ = 'medical_records.read',
  MEDICAL_RECORDS_CREATE = 'medical_records.create',
  MEDICAL_RECORDS_UPDATE = 'medical_records.update',

  // Treatments & Sessions
  TREATMENTS_MANAGE = 'treatments.manage',
  SESSIONS_MANAGE = 'sessions.manage',

  // Prescriptions & Documents
  PRESCRIPTIONS_MANAGE = 'prescriptions.manage',
  DOCUMENTS_MANAGE = 'documents.manage',

  // Payments & Cash
  PAYMENTS_READ = 'payments.read',
  PAYMENTS_CREATE = 'payments.create',
  CASH_READ = 'cash.read',
  CASH_CLOSE = 'cash.close',

  // Inventory
  INVENTORY_READ = 'inventory.read',
  INVENTORY_MANAGE = 'inventory.manage',

  // Reports, Settings & Audit
  REPORTS_READ = 'reports.read',
  USERS_MANAGE = 'users.manage',
  SETTINGS_MANAGE = 'settings.manage',
  AUDIT_READ = 'audit.read',
}

export interface JwtPayload {
  sub: string; // user id (UUID)
  email: string;
  clinicId: string; // tenant id (UUID)
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  clinicId: string;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clinicId: string;
  clinicName?: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
}
