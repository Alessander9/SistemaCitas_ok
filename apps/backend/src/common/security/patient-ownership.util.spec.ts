import { ForbiddenException } from '@nestjs/common';
import { AuthenticatedUser, UserRole } from '@citassistema/shared-types';
import { DatabaseService } from '../../database/database.service';
import { assertPatientOwnership, isPatientOnlyUser } from './patient-ownership.util';

describe('patient-ownership.util (Anti-IDOR Unit Tests)', () => {
  let db: { query: jest.Mock };

  beforeEach(() => {
    db = { query: jest.fn() };
  });

  const makeUser = (roles: UserRole[], email = 'paciente@clinica.pe'): AuthenticatedUser => ({
    id: 'user-1',
    clinicId: 'clinic-1',
    email,
    roles,
    permissions: [],
  });

  it('permite acceso inmediato a roles de staff sin consultar la base de datos', async () => {
    for (const role of [UserRole.SUPER_ADMIN, UserRole.ADMIN_CLINIC, UserRole.PROFESIONAL, UserRole.RECEPCION]) {
      expect(isPatientOnlyUser(makeUser([role]))).toBe(false);
      await expect(
        assertPatientOwnership(db as unknown as DatabaseService, 'clinic-1', makeUser([role]), 'other-patient-id'),
      ).resolves.toBeUndefined();
    }
    expect(db.query).not.toHaveBeenCalled();
  });

  it('permite a un PACIENTE acceder a su propio patientId', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 'pat-own-1' }] });

    await expect(
      assertPatientOwnership(db as unknown as DatabaseService, 'clinic-1', makeUser([UserRole.PACIENTE]), 'pat-own-1'),
    ).resolves.toBeUndefined();
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('bloquea con ForbiddenException cuando un PACIENTE intenta acceder a otro patientId', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 'pat-own-1' }] });

    await expect(
      assertPatientOwnership(
        db as unknown as DatabaseService,
        'clinic-1',
        makeUser([UserRole.PACIENTE]),
        'pat-other-999',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloquea con ForbiddenException cuando el PACIENTE no existe en tabla patients o no tiene email', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await expect(
      assertPatientOwnership(db as unknown as DatabaseService, 'clinic-1', makeUser([UserRole.PACIENTE]), 'pat-1'),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      assertPatientOwnership(db as unknown as DatabaseService, 'clinic-1', makeUser([UserRole.PACIENTE], ''), 'pat-1'),
    ).rejects.toThrow(ForbiddenException);
  });
});
