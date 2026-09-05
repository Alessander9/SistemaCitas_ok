export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN_CLINIC = "ADMIN_CLINIC",
    RECEPCION = "RECEPCION",
    PROFESIONAL = "PROFESIONAL",
    PACIENTE = "PACIENTE"
}
export declare enum SystemPermission {
    APPOINTMENTS_READ = "appointments.read",
    APPOINTMENTS_CREATE = "appointments.create",
    APPOINTMENTS_UPDATE = "appointments.update",
    APPOINTMENTS_CANCEL = "appointments.cancel",
    APPOINTMENTS_RESCHEDULE = "appointments.reschedule",
    PATIENTS_READ = "patients.read",
    PATIENTS_CREATE = "patients.create",
    PATIENTS_UPDATE = "patients.update",
    MEDICAL_RECORDS_READ = "medical_records.read",
    MEDICAL_RECORDS_CREATE = "medical_records.create",
    MEDICAL_RECORDS_UPDATE = "medical_records.update",
    TREATMENTS_MANAGE = "treatments.manage",
    SESSIONS_MANAGE = "sessions.manage",
    PRESCRIPTIONS_MANAGE = "prescriptions.manage",
    DOCUMENTS_MANAGE = "documents.manage",
    PAYMENTS_READ = "payments.read",
    PAYMENTS_CREATE = "payments.create",
    CASH_READ = "cash.read",
    CASH_CLOSE = "cash.close",
    INVENTORY_READ = "inventory.read",
    INVENTORY_MANAGE = "inventory.manage",
    REPORTS_READ = "reports.read",
    USERS_MANAGE = "users.manage",
    SETTINGS_MANAGE = "settings.manage",
    AUDIT_READ = "audit.read"
}
export interface JwtPayload {
    sub: string;
    email: string;
    clinicId: string;
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
