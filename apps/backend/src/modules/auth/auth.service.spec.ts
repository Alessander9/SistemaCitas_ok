import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { UserRole, SystemPermission } from '@citassistema/shared-types';

describe('AuthService (Unit & Security Tests)', () => {
  let service: AuthService;
  let db: { query: jest.Mock };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockUserId = '22222222-2222-2222-2222-222222222222';
  const rawPassword = 'Password123!';

  beforeEach(async () => {
    db = {
      query: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockImplementation((payload) => {
        if (payload.type === 'refresh') {
          return Promise.resolve('mock.refresh.token');
        }
        return Promise.resolve('mock.access.token');
      }),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: db },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Password Hashing & Verification', () => {
    it('should hash password and verify match', async () => {
      const hash = await service.hashPassword('Secret123');
      expect(hash).not.toEqual('Secret123');
      expect(await service.comparePassword('Secret123', hash)).toBe(true);
      expect(await service.comparePassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('login()', () => {
    it('should login successfully with valid credentials and return tokens with roles & permissions', async () => {
      const passwordHash = await bcrypt.hash(rawPassword, 10);

      // 1. User lookup
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            clinic_id: mockClinicId,
            email: 'admin@clinica.pe',
            password_hash: passwordHash,
            first_name: 'Admin',
            last_name: 'User',
            is_active: true,
            deleted_at: null,
            clinic_name: 'Clínica Demo',
            clinic_slug: 'clinica-demo',
            clinic_is_active: true,
            clinic_deleted_at: null,
          },
        ],
      });

      // 2. Roles lookup
      db.query.mockResolvedValueOnce({
        rows: [{ name: UserRole.ADMIN_CLINIC }],
      });

      // 3. Permissions lookup
      db.query.mockResolvedValueOnce({
        rows: [
          { name: SystemPermission.APPOINTMENTS_READ },
          { name: SystemPermission.APPOINTMENTS_CREATE },
        ],
      });

      // 4. Refresh token insert
      db.query.mockResolvedValueOnce({ rows: [] });

      // 5. Update last_login_at
      db.query.mockResolvedValueOnce({ rows: [] });

      // 6. Audit log insert
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.login({
        email: 'admin@clinica.pe',
        password: rawPassword,
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock.access.token');
      expect(result.refreshToken).toBe('mock.refresh.token');
      expect(result.user.id).toBe(mockUserId);
      expect(result.user.clinicId).toBe(mockClinicId);
      expect(result.user.roles).toContain(UserRole.ADMIN_CLINIC);
      expect(result.user.permissions).toContain(SystemPermission.APPOINTMENTS_READ);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.login({ email: 'unknown@clinica.pe', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword', 10);
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            clinic_id: mockClinicId,
            email: 'user@clinica.pe',
            password_hash: passwordHash,
            is_active: true,
            clinic_is_active: true,
          },
        ],
      });

      await expect(
        service.login({ email: 'user@clinica.pe', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if clinic is inactive', async () => {
      const passwordHash = await bcrypt.hash(rawPassword, 10);
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            clinic_id: mockClinicId,
            email: 'user@clinica.pe',
            password_hash: passwordHash,
            is_active: true,
            clinic_is_active: false,
          },
        ],
      });

      await expect(
        service.login({ email: 'user@clinica.pe', password: rawPassword }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const passwordHash = await bcrypt.hash(rawPassword, 10);
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            clinic_id: mockClinicId,
            email: 'user@clinica.pe',
            password_hash: passwordHash,
            is_active: false,
            clinic_is_active: true,
          },
        ],
      });

      await expect(
        service.login({ email: 'user@clinica.pe', password: rawPassword }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens()', () => {
    it('should rotate tokens successfully on valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValueOnce({
        sub: mockUserId,
        clinicId: mockClinicId,
        type: 'refresh',
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      // 1. Query token record
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'token-uuid-1',
            user_id: mockUserId,
            clinic_id: mockClinicId,
            is_revoked: false,
            expires_at: futureDate.toISOString(),
          },
        ],
      });

      // 2. Query fresh user data
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            clinic_id: mockClinicId,
            email: 'user@clinica.pe',
            first_name: 'John',
            last_name: 'Doe',
            is_active: true,
            clinic_is_active: true,
          },
        ],
      });

      // 3. Roles
      db.query.mockResolvedValueOnce({ rows: [{ name: UserRole.RECEPCION }] });

      // 4. Permissions
      db.query.mockResolvedValueOnce({
        rows: [{ name: SystemPermission.APPOINTMENTS_READ }],
      });

      // 5. Insert new token
      db.query.mockResolvedValueOnce({ rows: [] });

      // 6. Revoke old token
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.refreshTokens({
        refreshToken: 'valid.refresh.token',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock.access.token');
      expect(result.refreshToken).toBe('mock.refresh.token');
    });

    it('should detect token reuse and revoke all tokens if a revoked token is presented', async () => {
      jwtService.verifyAsync.mockResolvedValueOnce({
        sub: mockUserId,
        clinicId: mockClinicId,
        type: 'refresh',
      });

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'revoked-token-id',
            user_id: mockUserId,
            clinic_id: mockClinicId,
            is_revoked: true,
            expires_at: new Date().toISOString(),
          },
        ],
      });

      // Expect revocation query for entire user session
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.refreshTokens({ refreshToken: 'reused.refresh.token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile()', () => {
    it('should return user profile with clinic name and permissions', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockUserId,
            email: 'doctor@clinica.pe',
            first_name: 'Dra. María',
            last_name: 'González',
            clinic_id: mockClinicId,
            clinic_name: 'Centro Fisioterapia Norte',
            phone: '+51999888777',
            avatar_url: 'https://avatar.url',
          },
        ],
      });

      db.query.mockResolvedValueOnce({ rows: [{ name: UserRole.PROFESIONAL }] });
      db.query.mockResolvedValueOnce({
        rows: [
          { name: SystemPermission.MEDICAL_RECORDS_READ },
          { name: SystemPermission.MEDICAL_RECORDS_CREATE },
        ],
      });

      const profile = await service.getProfile(mockUserId, mockClinicId);

      expect(profile.id).toBe(mockUserId);
      expect(profile.email).toBe('doctor@clinica.pe');
      expect(profile.clinicName).toBe('Centro Fisioterapia Norte');
      expect(profile.roles).toContain(UserRole.PROFESIONAL);
      expect(profile.permissions).toContain(SystemPermission.MEDICAL_RECORDS_READ);
    });

    it('should throw NotFoundException if user profile not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getProfile('non-existent', mockClinicId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
