import { ForbiddenException } from '@nestjs/common';
import { AuthenticatedUser, UserRole } from '@citassistema/shared-types';
import { DatabaseService } from '../../database/database.service';

const STAFF_ROLES: string[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN_CLINIC,
  UserRole.PROFESIONAL,
  UserRole.RECEPCION,
];

export function isPatientOnlyUser(user?: AuthenticatedUser): boolean {
  if (!user || !Array.isArray(user.roles)) return false;
  return !user.roles.some((r) => STAFF_ROLES.includes(r));
}

/**
 * Resuelve el patient_id perteneciente al usuario autenticado (por email dentro de su clínica).
 */
export async function resolveOwnPatientId(
  db: DatabaseService,
  clinicId: string,
  user: AuthenticatedUser,
): Promise<string | null> {
  if (!user?.email) return null;
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM patients
     WHERE clinic_id = $1 AND LOWER(email) = LOWER($2) AND deleted_at IS NULL
     LIMIT 1`,
    [clinicId, user.email],
  );
  return rows[0]?.id ?? null;
}

/**
 * Bloqueo Anti-IDOR horizontal: si el usuario es solo PACIENTE, solo puede acceder a su propio patientId.
 */
export async function assertPatientOwnership(
  db: DatabaseService,
  clinicId: string,
  user: AuthenticatedUser | undefined,
  targetPatientId: string | undefined,
): Promise<void> {
  if (!user || !isPatientOnlyUser(user)) {
    return;
  }

  const ownPatientId = await resolveOwnPatientId(db, clinicId, user);
  if (!ownPatientId || !targetPatientId || ownPatientId !== targetPatientId) {
    throw new ForbiddenException('No tienes permiso para acceder o modificar datos de otro paciente.');
  }
}
