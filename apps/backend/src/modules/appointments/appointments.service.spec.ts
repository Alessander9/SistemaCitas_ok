import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { DatabaseService } from '../../database/database.service';
import { AppointmentStatus } from '@citassistema/shared-types';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let db: {
    query: jest.Mock;
    transaction: jest.Mock;
  };

  const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';
  const USER_ID = 'f0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    db = { query: jest.fn(), transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  // ===========================================================================
  // AVAILABILITY ENGINE
  // ===========================================================================

  describe('getAvailableSlots', () => {
    const DATE = '2026-09-07'; // Monday (day 1)
    const SERVICE_ID = 'd0000000-0000-0000-0000-000000000001';
    const PROFESSIONAL_ID = 'e0000000-0000-0000-0000-000000000001';

    it('should throw NotFoundException when service does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when professional has no schedule for that day', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] }) // service
        .mockResolvedValueOnce({ rows: [] }); // no schedule

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      expect(result).toEqual([]);
    });

    it('should generate slots within schedule range respecting service duration', async () => {
      // Monday 08:00-10:00, 30-min service → slots: 08:00, 08:30, 09:00, 09:30
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }] })
        .mockResolvedValueOnce({ rows: [] }) // no blocks
        .mockResolvedValueOnce({ rows: [] }); // no appointments

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      expect(result).toHaveLength(4);
      expect(result[0].startTime).toBe('08:00');
      expect(result[0].endTime).toBe('08:30');
      expect(result[3].startTime).toBe('09:30');
      expect(result[3].endTime).toBe('10:00');
    });

    it('should exclude slots overlapping a schedule block', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'b1', start_time: '08:30:00', end_time: '09:00:00', reason: 'reunion' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      const startTimes = result.map((s) => s.startTime);
      expect(startTimes).not.toContain('08:30');
      // 09:00 still free because block ends exactly when slot starts
      expect(startTimes).toContain('09:00');
      expect(result).toHaveLength(3);
    });

    it('should exclude slots overlapping an existing appointment', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ start_time: '08:00:00', end_time: '08:30:00' }] });

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      const startTimes = result.map((s) => s.startTime);
      expect(startTimes).not.toContain('08:00');
      expect(result).toHaveLength(3);
    });

    it('should exclude partially overlapping appointments', async () => {
      // Appointment 08:15-08:45 overlaps slots 08:00 (overlap 08:15-08:30) and 08:30 (overlap 08:30-08:45)
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ start_time: '08:15:00', end_time: '08:45:00' }] });

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      const startTimes = result.map((s) => s.startTime);
      expect(startTimes).not.toContain('08:00');
      expect(startTimes).not.toContain('08:30');
      expect(startTimes).toContain('09:00');
    });

    it('should ignore cancelled and no_show appointments', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] }); // service filters out cancelled via SQL

      const result = await service.getAvailableSlots(CLINIC_ID, PROFESSIONAL_ID, SERVICE_ID, DATE);

      expect(result).toHaveLength(4);
    });
  });

  // ===========================================================================
  // ANTI-COLLISION ENGINE
  // ===========================================================================

  describe('create (anti-collision)', () => {
    const createDto = {
      patientId: 'p1',
      professionalId: 'e0000000-0000-0000-0000-000000000001',
      serviceId: 'd0000000-0000-0000-0000-000000000001',
      appointmentDate: '2026-09-07', // Monday
      startTime: '09:00',
    };

    it('should throw NotFoundException when service not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        new NotFoundException('Servicio no encontrado'),
      );
    });

    it('should throw NotFoundException when patient not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [] }); // no patient

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when professional not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [] }); // no professional

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when professional has no schedule for that day', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'e1' }] })
        .mockResolvedValueOnce({ rows: [] }); // no schedule

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when requested time is outside schedule', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'e1' }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '09:00:00' }] });

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when overlapping appointment exists', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'e1' }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '12:00:00' }] });

      db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
        const client = {
          query: jest
            .fn()
            .mockResolvedValueOnce({ rows: [] }) // advisory lock
            .mockResolvedValueOnce({ rows: [{ start_time: '09:15:00', end_time: '09:45:00' }] }), // overlapping appt
        };
        return cb(client);
      });

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when overlapping schedule block exists', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'e1' }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '12:00:00' }] });

      db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
        const client = {
          query: jest
            .fn()
            .mockResolvedValueOnce({ rows: [] }) // advisory lock
            .mockResolvedValueOnce({ rows: [] }) // no conflicting appointments
            .mockResolvedValueOnce({ rows: [{ start_time: '09:00:00', end_time: '10:00:00' }] }), // block
        };
        return cb(client);
      });

      await expect(service.create(CLINIC_ID, createDto, USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create appointment and record history when no conflicts', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ duration_minutes: 30 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'p1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'e1' }] })
        .mockResolvedValueOnce({ rows: [{ day_of_week: 1, start_time: '08:00:00', end_time: '12:00:00' }] });

      const appointmentRow = {
        id: 'new-id',
        clinic_id: CLINIC_ID,
        patient_id: 'p1',
        patient_first_name: 'Juan',
        patient_last_name: 'Pérez',
        professional_id: 'e1',
        professional_first_name: 'María',
        professional_last_name: 'González',
        service_id: 's1',
        service_name: 'Consulta',
        appointment_date: '2026-09-07',
        start_time: '09:00:00',
        end_time: '09:30:00',
        status: 'pending',
        reminder_sent: false,
        created_by: USER_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
        const client = {
          query: jest
            .fn()
            .mockResolvedValueOnce({ rows: [] }) // advisory lock
            .mockResolvedValueOnce({ rows: [] }) // no conflicting appointments
            .mockResolvedValueOnce({ rows: [] }) // no blocks
            .mockResolvedValueOnce({ rows: [appointmentRow] }) // insert
            .mockResolvedValueOnce({ rows: [] }), // history insert
        };
        return cb(client);
      });

      const result = await service.create(CLINIC_ID, createDto, USER_ID);

      expect(result.id).toBe('new-id');
      expect(result.status).toBe(AppointmentStatus.PENDING);
      expect(result.endTime).toMatch(/^09:30/);
      expect(result.patientName).toBe('Juan Pérez');
    });
  });

  // ===========================================================================
  // STATE MACHINE
  // ===========================================================================

  describe('updateStatus (state machine)', () => {
    const APPOINTMENT_ID = 'appt-1';

    const existingAppointmentRow = (status: string) => ({
      id: APPOINTMENT_ID,
      clinic_id: CLINIC_ID,
      patient_id: 'p1',
      patient_first_name: 'Juan',
      patient_last_name: 'Pérez',
      professional_id: 'e1',
      professional_first_name: 'María',
      professional_last_name: 'González',
      service_id: 's1',
      service_name: 'Consulta',
      appointment_date: '2026-09-07',
      start_time: '09:00:00',
      end_time: '09:30:00',
      status,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.updateStatus(CLINIC_ID, APPOINTMENT_ID, AppointmentStatus.CONFIRMED, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow pending → confirmed', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('pending')] }) // findOne
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('confirmed')] }); // findOne after update

      db.transaction.mockResolvedValue(undefined);

      const result = await service.updateStatus(
        CLINIC_ID,
        APPOINTMENT_ID,
        AppointmentStatus.CONFIRMED,
        USER_ID,
      );

      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should reject completed → confirmed (invalid transition)', async () => {
      db.query.mockResolvedValueOnce({ rows: [existingAppointmentRow('completed')] });

      await expect(
        service.updateStatus(CLINIC_ID, APPOINTMENT_ID, AppointmentStatus.CONFIRMED, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelled → any (terminal state)', async () => {
      db.query.mockResolvedValueOnce({ rows: [existingAppointmentRow('cancelled')] });

      await expect(
        service.updateStatus(CLINIC_ID, APPOINTMENT_ID, AppointmentStatus.CONFIRMED, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record cancellation reason and timestamp on cancel', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('pending')] })
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('cancelled')] });

      db.transaction.mockResolvedValue(undefined);

      const result = await service.cancel(
        CLINIC_ID,
        APPOINTMENT_ID,
        { reason: 'paciente canceló' },
        USER_ID,
      );

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(db.transaction).toHaveBeenCalled();
    });

    it('should record status history entry on each transition', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('pending')] })
        .mockResolvedValueOnce({ rows: [existingAppointmentRow('confirmed')] });

      db.transaction.mockResolvedValue(undefined);

      await service.updateStatus(CLINIC_ID, APPOINTMENT_ID, AppointmentStatus.CONFIRMED, USER_ID);

      expect(db.transaction).toHaveBeenCalledTimes(1);
    });

    it('should enforce full lifecycle pending → confirmed → checked_in → in_progress → completed', async () => {
      const statuses = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed'];

      for (let i = 0; i < statuses.length - 1; i++) {
        db.query
          .mockResolvedValueOnce({ rows: [existingAppointmentRow(statuses[i])] })
          .mockResolvedValueOnce({ rows: [existingAppointmentRow(statuses[i + 1])] });
        db.transaction.mockResolvedValue(undefined);

        const nextStatus = statuses[i + 1] as AppointmentStatus;
        const result = await service.updateStatus(CLINIC_ID, APPOINTMENT_ID, nextStatus, USER_ID);
        expect(result.status).toBe(nextStatus);
      }
    });
  });

  // ===========================================================================
  // CRUD
  // ===========================================================================

  describe('findAll', () => {
    it('should return all appointments for clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.findAll(CLINIC_ID);

      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('a.clinic_id = $1'),
        [CLINIC_ID],
      );
    });

    it('should apply professionalId and status filters', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await service.findAll(CLINIC_ID, {
        professionalId: 'e1',
        status: AppointmentStatus.CONFIRMED,
      });

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain('a.professional_id = $2');
      expect(query).toContain('a.status = $3');
      expect(params).toEqual([CLINIC_ID, 'e1', 'confirmed']);
    });

    it('should apply date range filters', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await service.findAll(CLINIC_ID, {
        dateFrom: '2026-09-01',
        dateTo: '2026-09-30',
      });

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain('a.appointment_date >= $2');
      expect(query).toContain('a.appointment_date <= $3');
      expect(params).toEqual([CLINIC_ID, '2026-09-01', '2026-09-30']);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when appointment not found in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne(CLINIC_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should throw NotFoundException when appointment does not exist', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.softDelete(CLINIC_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should succeed when appointment exists', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await expect(service.softDelete(CLINIC_ID, 'appt-1')).resolves.toBeUndefined();
    });
  });

  describe('getHistory', () => {
    it('should throw NotFoundException when appointment does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getHistory(CLINIC_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return history entries ordered by changed_at', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 'appt-1' }] }) // findOne check
        .mockResolvedValueOnce({
          rows: [
            { from_status: null, to_status: 'pending', changed_at: '2026-09-01T10:00:00Z' },
            { from_status: 'pending', to_status: 'confirmed', changed_at: '2026-09-02T10:00:00Z' },
          ],
        });

      const result = await service.getHistory(CLINIC_ID, 'appt-1');

      expect(result).toHaveLength(2);
      expect(result[0].toStatus).toBe('pending');
      expect(result[1].fromStatus).toBe('pending');
    });
  });
});
