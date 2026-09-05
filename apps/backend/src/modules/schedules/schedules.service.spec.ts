import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { DatabaseService } from '../../database/database.service';

describe('SchedulesService (Unit & Time Validation Tests)', () => {
  let service: SchedulesService;
  let db: { query: jest.Mock; transaction: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockProfessionalId = '55555555-5555-5555-5555-555555555555';

  beforeEach(async () => {
    db = {
      query: jest.fn(),
      transaction: jest.fn().mockImplementation((cb) =>
        cb({
          query: db.query,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  describe('setWeeklySchedule()', () => {
    it('should configure weekly schedules when time ranges are valid', async () => {
      // 1. Verify professional belongs to clinic
      db.query.mockResolvedValueOnce({ rows: [{ id: mockProfessionalId }] });
      // 2. Clear old schedules
      db.query.mockResolvedValueOnce({ rows: [] });
      // 3. Insert Monday
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'sched-1',
            professional_id: mockProfessionalId,
            day_of_week: 1,
            start_time: '08:00:00',
            end_time: '13:00:00',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
      // 4. Insert Wednesday
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'sched-2',
            professional_id: mockProfessionalId,
            day_of_week: 3,
            start_time: '14:00:00',
            end_time: '19:00:00',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const result = await service.setWeeklySchedule(mockClinicId, mockProfessionalId, [
        { dayOfWeek: 1, startTime: '08:00', endTime: '13:00', isActive: true },
        { dayOfWeek: 3, startTime: '14:00', endTime: '19:00', isActive: true },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].dayOfWeek).toBe(1);
      expect(result[1].dayOfWeek).toBe(3);
    });

    it('should throw BadRequestException if startTime >= endTime', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: mockProfessionalId }] });

      await expect(
        service.setWeeklySchedule(mockClinicId, mockProfessionalId, [
          { dayOfWeek: 1, startTime: '17:00', endTime: '09:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createBlock()', () => {
    it('should create a schedule block when professional exists and time is valid', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: mockProfessionalId }] }) // Verify professional
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'block-1',
              professional_id: mockProfessionalId,
              block_date: '2026-09-15',
              start_time: '10:00:00',
              end_time: '12:00:00',
              reason: 'Reunión médica',
              is_recurring: false,
              recurrence_rule: null,
              created_at: new Date().toISOString(),
            },
          ],
        });

      const result = await service.createBlock(mockClinicId, {
        professionalId: mockProfessionalId,
        blockDate: '2026-09-15',
        startTime: '10:00',
        endTime: '12:00',
        reason: 'Reunión médica',
      });

      expect(result.id).toBe('block-1');
      expect(result.reason).toBe('Reunión médica');
    });

    it('should throw NotFoundException if professional does not exist in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.createBlock(mockClinicId, {
          professionalId: 'non-existent',
          blockDate: '2026-09-15',
          startTime: '08:00',
          endTime: '10:00',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
