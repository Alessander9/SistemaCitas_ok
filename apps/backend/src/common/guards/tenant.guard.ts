import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Optional,
} from '@nestjs/common';
import { UserRole } from '@citassistema/shared-types';
import { DatabaseService } from '../../database/database.service';

const DEFAULT_DEMO_CLINIC_UUID = 'a0000000-0000-4000-a000-000000000001';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeTenantId(rawId?: string): string | undefined {
  if (!rawId) return undefined;
  const trimmed = rawId.trim();
  if (trimmed === 'clinica-demo' || trimmed === 'global') {
    return DEFAULT_DEMO_CLINIC_UUID;
  }
  return UUID_REGEX.test(trimmed) ? trimmed : DEFAULT_DEMO_CLINIC_UUID;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(@Optional() private readonly db?: DatabaseService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Header or Query/Param clinic identifier
    const headerClinicId = request.headers?.['x-clinic-id'] as string;
    const paramClinicId = request.params?.clinicId as string;
    const rawTarget = headerClinicId || paramClinicId;
    const targetClinicId = rawTarget && UUID_REGEX.test(rawTarget) ? rawTarget : normalizeTenantId(rawTarget);

    if (user) {
      const userClinicId = user.clinicId;
      const isSuperAdmin = user.roles && user.roles.includes(UserRole.SUPER_ADMIN);

      if (isSuperAdmin) {
        // Super Admin always retains global access even if a clinic is suspended
        request.clinicId = targetClinicId || userClinicId;
        return true;
      }

      // Non-SuperAdmin: Strict tenant isolation
      if (
        rawTarget &&
        rawTarget !== 'clinica-demo' &&
        rawTarget !== userClinicId &&
        targetClinicId !== userClinicId
      ) {
        throw new ForbiddenException(
          'Acceso inter-clínica denegado. No tienes autorización para consultar ni modificar información de otra clínica.',
        );
      }

      // Block active sessions immediately if the clinic has been suspended by SuperAdmin
      if (this.db && userClinicId && UUID_REGEX.test(userClinicId)) {
        return this.verifyActiveClinic(userClinicId, request);
      }

      // Always bind the authentic user's clinicId
      request.clinicId = userClinicId;
      return true;
    }

    // Unauthenticated public request (e.g. public booking)
    request.clinicId = targetClinicId || DEFAULT_DEMO_CLINIC_UUID;

    return true;
  }

  private async verifyActiveClinic(
    userClinicId: string,
    request: Record<string, unknown>,
  ): Promise<boolean> {
    const { rows } = await this.db!.query<{ is_active: boolean }>(
      'SELECT is_active FROM clinics WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [userClinicId],
    );
    if (rows.length > 0 && !rows[0].is_active) {
      throw new ForbiddenException({
        code: 'CLINIC_SUSPENDED',
        message:
          'El servicio ha sido suspendido por falta de pago. Envía un mensaje para regularizar tu pago y reactivar el acceso.',
      });
    }

    request.clinicId = userClinicId;
    return true;
  }
}
