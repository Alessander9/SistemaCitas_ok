import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '@citassistema/shared-types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción.');
    }

    // Super Admin bypasses individual permission checks
    if (user.roles && user.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Acceso denegado. Se requieren los permisos: ${requiredPermissions.join(', ')}.`,
      );
    }

    return true;
  }
}
