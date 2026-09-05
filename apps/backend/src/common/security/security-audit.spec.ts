import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantGuard } from '../guards/tenant.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { UserRole } from '@citassistema/shared-types';
import * as bcrypt from 'bcrypt';

describe('Security & Compliance Audit Suite (Ley N° 29733 / OWASP Top 10)', () => {
  let reflector: Reflector;
  let tenantGuard: TenantGuard;
  let rolesGuard: RolesGuard;
  let permissionsGuard: PermissionsGuard;

  beforeEach(() => {
    reflector = new Reflector();
    tenantGuard = new TenantGuard();
    rolesGuard = new RolesGuard(reflector);
    permissionsGuard = new PermissionsGuard(reflector);
  });

  const createMockContext = (headers: Record<string, string>, user?: Record<string, unknown>): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          tenantId: headers['x-clinic-id'] || headers['x-tenant-id'],
          user,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  // ===========================================================================
  // 1. TENANT ISOLATION (BOLA / IDOR Cross-Tenant Prevention)
  // ===========================================================================
  describe('Multi-Tenant Data Isolation', () => {
    it('should block cross-tenant requests with ForbiddenException when user attempts to access another clinic', () => {
      const context = createMockContext(
        { 'x-clinic-id': 'b0000000-0000-0000-0000-000000000002' },
        { id: 'u-1', clinicId: 'a0000000-0000-0000-0000-000000000001', roles: [UserRole.RECEPCION] },
      );
      expect(() => tenantGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow requests within matching clinic tenant boundary', () => {
      const context = createMockContext(
        { 'x-clinic-id': 'a0000000-0000-0000-0000-000000000001' },
        { id: 'u-1', clinicId: 'a0000000-0000-0000-0000-000000000001', roles: [UserRole.RECEPCION] },
      );
      expect(tenantGuard.canActivate(context)).toBe(true);
    });
  });

  // ===========================================================================
  // 2. ROLE-BASED ACCESS CONTROL (RBAC Escalation Prevention)
  // ===========================================================================
  describe('RBAC Privilege Escalation Prevention', () => {
    it('should deny non-admin users from accessing admin-only routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN_CLINIC]);

      const context = createMockContext(
        { 'x-clinic-id': 'a0000000-0000-0000-0000-000000000001' },
        { id: 'u-1', roles: [UserRole.PACIENTE] },
      );

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should grant access when user holds required authorized role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN_CLINIC, UserRole.RECEPCION]);

      const context = createMockContext(
        { 'x-clinic-id': 'a0000000-0000-0000-0000-000000000001' },
        { id: 'u-2', roles: [UserRole.RECEPCION] },
      );

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should verify permissions guard functionality', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['appointments.create']);

      const context = createMockContext(
        { 'x-clinic-id': 'a0000000-0000-0000-0000-000000000001' },
        { id: 'u-3', roles: [UserRole.PROFESIONAL], permissions: ['appointments.create'] },
      );

      expect(permissionsGuard.canActivate(context)).toBe(true);
    });
  });

  // ===========================================================================
  // 3. CRYPTOGRAPHIC INTEGRITY & PASSWORD HASHING (OWASP A02: Cryptographic Failures)
  // ===========================================================================
  describe('Cryptographic Storage & Password Hashing', () => {
    it('should properly hash passwords with bcrypt salt rounds and verify matches', async () => {
      const rawPassword = 'SecurePassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith('$2b$10$')).toBe(true);

      const isValid = await bcrypt.compare(rawPassword, hash);
      const isInvalid = await bcrypt.compare('WrongPassword', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });
});
