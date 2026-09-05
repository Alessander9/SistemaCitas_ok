import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { SystemPermission, UserRole } from '@citassistema/shared-types';

describe('PermissionsGuard (RBAC Permission Security Tests)', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  function createMockContext(user: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should allow access if no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ roles: [UserRole.PACIENTE] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has all required permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([SystemPermission.APPOINTMENTS_READ, SystemPermission.APPOINTMENTS_CREATE]);

    const context = createMockContext({
      roles: [UserRole.RECEPCION],
      permissions: [
        SystemPermission.APPOINTMENTS_READ,
        SystemPermission.APPOINTMENTS_CREATE,
        SystemPermission.PATIENTS_READ,
      ],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([SystemPermission.MEDICAL_RECORDS_READ]);

    const context = createMockContext({
      roles: [UserRole.RECEPCION],
      permissions: [SystemPermission.APPOINTMENTS_READ],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN to bypass specific permission checks', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([SystemPermission.SETTINGS_MANAGE]);

    const context = createMockContext({
      roles: [UserRole.SUPER_ADMIN],
      permissions: [],
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
