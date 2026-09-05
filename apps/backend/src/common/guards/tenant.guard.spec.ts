import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { UserRole } from '@citassistema/shared-types';

describe('TenantGuard (Multi-Tenancy Isolation Security Tests)', () => {
  let guard: TenantGuard;

  const clinicA = '11111111-1111-1111-1111-111111111111';
  const clinicB = '99999999-9999-9999-9999-999999999999';

  beforeEach(() => {
    guard = new TenantGuard();
  });

  function createMockContext(request: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should allow user of Clinic A to access Clinic A resources and bind clinicId', () => {
    const request = {
      headers: { 'x-clinic-id': clinicA },
      params: {},
      clinicId: undefined as string | undefined,
      user: {
        id: 'user-1',
        clinicId: clinicA,
        roles: [UserRole.ADMIN_CLINIC],
      },
    };

    const context = createMockContext(request);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.clinicId).toBe(clinicA);
  });

  it('CRITICAL SECURITY: should throw ForbiddenException when user of Clinic A attempts cross-tenant access to Clinic B via header', () => {
    const request = {
      headers: { 'x-clinic-id': clinicB },
      params: {},
      user: {
        id: 'user-1',
        clinicId: clinicA,
        roles: [UserRole.ADMIN_CLINIC],
      },
    };

    const context = createMockContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('CRITICAL SECURITY: should throw ForbiddenException when user of Clinic A attempts cross-tenant access to Clinic B via route param', () => {
    const request = {
      headers: {},
      params: { clinicId: clinicB },
      user: {
        id: 'user-1',
        clinicId: clinicA,
        roles: [UserRole.RECEPCION],
      },
    };

    const context = createMockContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN to access target Clinic B', () => {
    const request = {
      headers: { 'x-clinic-id': clinicB },
      params: {},
      clinicId: undefined as string | undefined,
      user: {
        id: 'superadmin-1',
        clinicId: clinicA,
        roles: [UserRole.SUPER_ADMIN],
      },
    };

    const context = createMockContext(request);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.clinicId).toBe(clinicB);
  });

  it('should allow unauthenticated public requests to bind target clinic header', () => {
    const request = {
      headers: { 'x-clinic-id': clinicA },
      params: {},
      clinicId: undefined as string | undefined,
      user: undefined,
    };

    const context = createMockContext(request);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.clinicId).toBe(clinicA);
  });
});
