import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { DatabaseService } from '../../database/database.service';

describe('ProfessionalsService (Unit & Multi-Tenancy Tests)', () => {
  let service: ProfessionalsService;
  let db: { query: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockProfessionalId = '55555555-5555-5555-5555-555555555555';

  beforeEach(async () => {
    db = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalsService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<ProfessionalsService>(ProfessionalsService);
  });

  describe('findAll()', () => {
    it('should return all professionals with assigned services', async () => {
      // 1. Professionals query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockProfessionalId,
            clinic_id: mockClinicId,
            first_name: 'Dra. Ana',
            last_name: 'Torres',
            license_number: 'CMP-12345',
            email: 'ana.torres@clinica.pe',
            phone: '+51987654321',
            is_active: true,
            consultation_fee: '120.00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // 2. Services query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'serv-1',
            name: 'Terapia Física',
            duration_minutes: 45,
            price: '80.00',
            currency: 'PEN',
            requires_deposit: false,
            deposit_amount: '0.00',
            is_active: true,
          },
        ],
      });

      const result = await service.findAll(mockClinicId);
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('Dra. Ana');
      expect(result[0].lastName).toBe('Torres');
      expect(result[0].consultationFee).toBe(120);
      expect(result[0].services).toHaveLength(1);
    });
  });

  describe('create()', () => {
    it('should create professional and assign initial services', async () => {
      // 1. Insert professional
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockProfessionalId,
            clinic_id: mockClinicId,
            first_name: 'Dr. Carlos',
            last_name: 'Mendoza',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // findOne queries for assignServices:
      // 2. Verify professional in findOne
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockProfessionalId,
            clinic_id: mockClinicId,
            first_name: 'Dr. Carlos',
            last_name: 'Mendoza',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
      // 3. Get services in findOne
      db.query.mockResolvedValueOnce({ rows: [] });

      // 4. Delete old services
      db.query.mockResolvedValueOnce({ rows: [] });
      // 5. Insert new service
      db.query.mockResolvedValueOnce({ rows: [] });

      // Final findOne after create:
      // 6. Professional row
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockProfessionalId,
            clinic_id: mockClinicId,
            first_name: 'Dr. Carlos',
            last_name: 'Mendoza',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
      // 7. Assigned services
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'serv-1',
            name: 'Terapia Física',
            duration_minutes: 45,
            price: '80.00',
            currency: 'PEN',
            requires_deposit: false,
            deposit_amount: '0.00',
            is_active: true,
          },
        ],
      });

      const result = await service.create(mockClinicId, {
        firstName: 'Dr. Carlos',
        lastName: 'Mendoza',
        serviceIds: ['serv-1'],
      });

      expect(result.id).toBe(mockProfessionalId);
      expect(result.firstName).toBe('Dr. Carlos');
      expect(result.services).toHaveLength(1);
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if professional does not exist in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne(mockClinicId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
