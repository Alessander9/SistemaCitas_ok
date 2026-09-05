import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { DatabaseService } from '../../database/database.service';

describe('PatientsService (Unit & History Consolidation Tests)', () => {
  let service: PatientsService;
  let db: { query: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockPatientId = '22222222-2222-2222-2222-222222222222';

  beforeEach(async () => {
    db = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  describe('create()', () => {
    it('should create a new patient successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // duplicate check
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockPatientId,
              clinic_id: mockClinicId,
              first_name: 'Juan',
              last_name: 'Pérez',
              email: 'juan.perez@email.com',
              phone: '+51 987 654 321',
              national_id: '73829104',
              is_active: true,
              registered_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const result = await service.create(mockClinicId, {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+51 987 654 321',
        nationalId: '73829104',
      });

      expect(result.id).toBe(mockPatientId);
      expect(result.firstName).toBe('Juan');
      expect(result.nationalId).toBe('73829104');
    });

    it('should throw ConflictException on duplicate nationalId in same clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      await expect(
        service.create(mockClinicId, {
          firstName: 'Juan',
          lastName: 'Pérez',
          nationalId: '73829104',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if patient does not exist in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne(mockClinicId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHistory()', () => {
    it('should return consolidated patient history with appointments and payments', async () => {
      // 1. findOne query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockPatientId,
            clinic_id: mockClinicId,
            first_name: 'Juan',
            last_name: 'Pérez',
            national_id: '73829104',
            is_active: true,
            registered_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // 2. appointments query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'appt-1',
            service_name: 'Fisioterapia Lumbar',
            professional_first_name: 'Dra. María',
            professional_last_name: 'González',
            appointment_date: '2026-09-10',
            start_time: '10:00:00',
            end_time: '10:45:00',
            status: 'confirmed',
          },
        ],
      });

      // 3. payments query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'pay-1',
            amount: '90.00',
            currency: 'PEN',
            status: 'completed',
            method: 'cash',
            created_at: new Date().toISOString(),
          },
        ],
      });

      const history = await service.getHistory(mockClinicId, mockPatientId);

      expect(history.patient.id).toBe(mockPatientId);
      expect(history.appointments).toHaveLength(1);
      expect(history.appointments[0].serviceName).toBe('Fisioterapia Lumbar');
      expect(history.payments).toHaveLength(1);
      expect(history.payments[0].amount).toBe(90);
    });
  });
});
