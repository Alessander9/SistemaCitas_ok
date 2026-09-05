import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { DatabaseService } from '../../database/database.service';

describe('SpecialtiesService (Unit & Multi-Tenancy Tests)', () => {
  let service: SpecialtiesService;
  let db: { query: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockSpecialtyId = '33333333-3333-3333-3333-333333333333';

  beforeEach(async () => {
    db = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialtiesService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<SpecialtiesService>(SpecialtiesService);
  });

  describe('findAll()', () => {
    it('should return all active specialties for the clinic', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockSpecialtyId,
            clinic_id: mockClinicId,
            name: 'Fisioterapia y Rehabilitación',
            description: 'Terapia física integral',
            icon: 'activity',
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const result = await service.findAll(mockClinicId, true);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fisioterapia y Rehabilitación');
      expect(result[0].clinicId).toBe(mockClinicId);
    });
  });

  describe('create()', () => {
    it('should create a new specialty successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // No duplicate
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockSpecialtyId,
              clinic_id: mockClinicId,
              name: 'Traumatología',
              description: 'Atención de lesiones osteomusculares',
              icon: 'bone',
              is_active: true,
              sort_order: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const result = await service.create(mockClinicId, {
        name: 'Traumatología',
        description: 'Atención de lesiones osteomusculares',
        icon: 'bone',
      });

      expect(result.id).toBe(mockSpecialtyId);
      expect(result.name).toBe('Traumatología');
    });

    it('should throw ConflictException on duplicate name in same clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      await expect(
        service.create(mockClinicId, { name: 'Traumatología' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if specialty does not exist in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne(mockClinicId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
