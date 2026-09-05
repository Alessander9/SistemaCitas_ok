import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@citassistema/shared-types';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Header or Query/Param clinic identifier
    const headerClinicId = request.headers?.['x-clinic-id'] as string;
    const paramClinicId = request.params?.clinicId as string;
    const targetClinicId = headerClinicId || paramClinicId;

    if (user) {
      const userClinicId = user.clinicId;
      const isSuperAdmin = user.roles && user.roles.includes(UserRole.SUPER_ADMIN);

      if (isSuperAdmin) {
        // Super Admin can access target clinic if specified, or default to their own
        request.clinicId = targetClinicId || userClinicId;
        return true;
      }

      // Non-SuperAdmin: Strict tenant isolation
      if (targetClinicId && targetClinicId !== userClinicId) {
        throw new ForbiddenException(
          'Acceso inter-clínica denegado. No tienes autorización para consultar ni modificar información de otra clínica.',
        );
      }

      // Always bind the authentic user's clinicId
      request.clinicId = userClinicId;
      return true;
    }

    // Unauthenticated public request (e.g. public booking)
    request.clinicId = targetClinicId || 'a0000000-0000-4000-a000-000000000001';

    return true;
  }
}
