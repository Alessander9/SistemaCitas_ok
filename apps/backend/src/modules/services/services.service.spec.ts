import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { DatabaseService } from '../../database/database.service';

describe('ServicesService (Unit & Multi-Tenancy Tests)', () => {
  let service: ServicesService;
  let db: { query: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockServiceId = '44444444-4444-4444-4444-444444444444';

  beforeEach(async () => {
    db = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  describe('findAll()', () => {
    it('should return services with specialty names', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockServiceId,
            clinic_id: mockClinicId,
            specialty_id: 'spec-1',
            specialty_name: 'Fisioterapia',
            name: 'Sesión Terapia Manual',
            description: 'Tratamiento muscular',
            duration_minutes: 45,
            price: '80.00',
            currency: 'PEN',
            requires_deposit: false,
            deposit_amount: '0.00',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const result = await service.findAll(mockClinicId);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sesión Terapia Manual');
      expect(result[0].durationMinutes).toBe(45);
      expect(result[0].price).toBe(80);
    });
  });

  describe('create()', () => {
    it('should create a service successfully and return mapped object', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // No duplicate
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockServiceId,
              clinic_id: mockClinicId,
              specialty_id: 'spec-1',
              name: 'Evaluación Inicial',
              description: 'Diagnóstico funcional',
              duration_minutes: 60,
              price: '100.00',
              currency: 'PEN',
              requires_deposit: true,
              deposit_amount: '30.00',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockServiceId,
              clinic_id: mockClinicId,
              specialty_id: 'spec-1',
              specialty_name: 'Fisioterapia',
              name: 'Evaluación Inicial',
              description: 'Diagnóstico funcional',
              duration_minutes: 60,
              price: '100.00',
              currency: 'PEN',
              requires_deposit: true,
              deposit_amount: '30.00',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const result = await service.create(mockClinicId, {
        name: 'Evaluación Inicial',
        durationMinutes: 60,
        price: 100,
        requiresDeposit: true,
        depositAmount: 30,
      });

      expect(result.id).toBe(mockServiceId);
      expect(result.durationMinutes).toBe(60);
      expect(result.requiresDeposit).toBe(true);
      expect(result.depositAmount).toBe(30);
    });

    it('should throw ConflictException on duplicate service name in same clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      await expect(
        service.create(mockClinicId, {
          name: 'Evaluación Inicial',
          durationMinutes: 30,
          price: 50,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if service does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne(mockClinicId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
