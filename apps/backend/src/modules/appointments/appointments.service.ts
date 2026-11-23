import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Optional,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../database/database.service';
import { EmailsService } from '../emails/emails.service';
import { AppointmentConfirmedEvent, AppointmentCancelledEvent } from './events/appointment.events';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_TRANSITIONS,
  AvailabilitySlot,
} from '@citassistema/shared-types';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

// ---------------------------------------------------------------------------
// DB row interfaces
// ---------------------------------------------------------------------------

interface AppointmentDbRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_first_name: string;
  patient_last_name: string;
  professional_id: string;
  professional_first_name: string;
  professional_last_name: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  internal_notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  checked_in_at?: string;
  completed_at?: string;
  reminder_sent: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ScheduleDbRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BlockDbRow {
  id: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

interface DurationDbRow {
  duration_minutes: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.getUTCDay();
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function isInRange(start: number, end: number, rangeStart: number, rangeEnd: number): boolean {
  return start >= rangeStart && end <= rangeEnd;
}

function parseTimeString(timeStr: string): string {
  const trimmed = timeStr.trim().toUpperCase();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    return `${String(match24[1]).padStart(2, '0')}:${match24[2]}`;
  }
  return timeStr;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() private readonly emailsService?: EmailsService,
    @Optional() private readonly eventEmitter?: EventEmitter2,
  ) { }

  // =========================================================================
  // 4.1 — AVAILABILITY ENGINE
  // =========================================================================

  async getAvailableSlots(
    clinicId: string,
    professionalId: string | undefined,
    serviceId: string,
    date: string,
  ): Promise<AvailabilitySlot[]> {
    const dayOfWeek = getDayOfWeek(date);

    // 1. Service duration
    const { rows: durationRows } = await this.db.query<DurationDbRow>(
      `SELECT duration_minutes FROM services WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [serviceId, clinicId],
    );
    if (durationRows.length === 0) {
      throw new NotFoundException('Servicio no encontrado');
    }
    const durationMinutes = durationRows[0].duration_minutes;

    // Resolve professionalId when automatic assignment ("Primero disponible") is selected
    let targetProfId = professionalId;
    if (!targetProfId) {
      const { rows: profRows } = await this.db.query<{ id: string }>(
        `SELECT p.id
         FROM professionals p
         LEFT JOIN professional_services ps ON ps.professional_id = p.id AND ps.service_id = $2
         WHERE p.clinic_id = $1 AND p.is_active = true AND p.deleted_at IS NULL
         ORDER BY (ps.service_id IS NOT NULL) DESC, p.created_at ASC
         LIMIT 1`,
        [clinicId, serviceId],
      );
      if (profRows.length === 0) {
        return [];
      }
      targetProfId = profRows[0].id;
    }

    // 2. Professional schedule for this day
    const { rows: scheduleRows } = await this.db.query<ScheduleDbRow>(
      `SELECT day_of_week, start_time, end_time
       FROM professional_schedules
       WHERE professional_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
      [targetProfId, dayOfWeek],
    );
    if (scheduleRows.length === 0) {
      return []; // No schedule for this day
    }

    // 3. Blocks for this professional on this date
    const { rows: blockRows } = await this.db.query<BlockDbRow>(
      `SELECT id, start_time, end_time, reason
       FROM schedule_blocks
       WHERE professional_id = $1 AND block_date = $2 AND deleted_at IS NULL`,
      [targetProfId, date],
    );

    // 4. Existing appointments for this professional on this date (non-cancelled, non-no_show)
    const { rows: appointmentRows } = await this.db.query<{ start_time: string; end_time: string }>(
      `SELECT start_time, end_time
       FROM appointments
       WHERE professional_id = $1
         AND appointment_date = $2
         AND status NOT IN ('cancelled', 'no_show')
         AND deleted_at IS NULL`,
      [targetProfId, date],
    );

    // 5. Generate all possible slots
    const slots: AvailabilitySlot[] = [];

    for (const schedule of scheduleRows) {
      const schedStart = timeToMinutes(schedule.start_time);
      const schedEnd = timeToMinutes(schedule.end_time);

      for (let cursor = schedStart; cursor + durationMinutes <= schedEnd; cursor += durationMinutes) {
        const slotStart = cursor;
        const slotEnd = cursor + durationMinutes;

        // Check schedule blocks
        const blocked = blockRows.some((b) =>
          rangesOverlap(slotStart, slotEnd, timeToMinutes(b.start_time), timeToMinutes(b.end_time)),
        );
        if (blocked) continue;

        // Check existing appointments
        const booked = appointmentRows.some((a) =>
          rangesOverlap(slotStart, slotEnd, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
        );
        if (booked) continue;

        slots.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
          professionalId: targetProfId,
          serviceId,
          date,
          available: true,
          state: 'available',
        });
      }
    }

    return slots;
  }

  // =========================================================================
  // 4.2 — ANTI-COLLISION ENGINE
  // =========================================================================

  /**
   * Creates an appointment inside a transaction with SELECT FOR UPDATE to prevent
   * double-booking. Returns the created appointment or throws ConflictException.
   */
  async create(
    clinicId: string,
    dto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    // Validate service exists and belongs to clinic
    const { rows: svcRows } = await this.db.query<DurationDbRow>(
      `SELECT duration_minutes FROM services WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [dto.serviceId, clinicId],
    );
    if (svcRows.length === 0) {
      throw new NotFoundException('Servicio no encontrado');
    }
    const durationMinutes = svcRows[0].duration_minutes;

    // Validate patient exists
    const { rows: patientRows } = await this.db.query(
      `SELECT id FROM patients WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [dto.patientId, clinicId],
    );
    if (patientRows.length === 0) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validate professional exists and is active
    const { rows: profRows } = await this.db.query(
      `SELECT id FROM professionals WHERE id = $1 AND clinic_id = $2 AND is_active = true AND deleted_at IS NULL`,
      [dto.professionalId, clinicId],
    );
    if (profRows.length === 0) {
      throw new NotFoundException('Profesional no encontrado o inactivo');
    }

    // Compute end_time
    const startMinutes = timeToMinutes(dto.startTime);
    const endMinutes = startMinutes + durationMinutes;
    const endTime = minutesToTime(endMinutes);

    // Validate schedule exists for this day/time
    const dayOfWeek = getDayOfWeek(dto.appointmentDate);
    const { rows: schedRows } = await this.db.query<ScheduleDbRow>(
      `SELECT day_of_week, start_time, end_time
       FROM professional_schedules
       WHERE professional_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
      [dto.professionalId, dayOfWeek],
    );
    if (schedRows.length === 0) {
      throw new BadRequestException('El profesional no tiene horario configurado para este día');
    }

    const schedule = schedRows[0];
    if (!isInRange(startMinutes, endMinutes, timeToMinutes(schedule.start_time), timeToMinutes(schedule.end_time))) {
      throw new BadRequestException(
        `El horario solicitado está fuera de la agenda del profesional (${schedule.start_time} - ${schedule.end_time})`,
      );
    }

    // ANTI-COLLISION: Lock the relevant rows and check for conflicts
    return this.db.transaction(async (client) => {
      // 1. Transactional advisory lock to strictly serialize concurrent bookings for this professional & date
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1 || '_' || $2))`, [
        dto.professionalId,
        dto.appointmentDate,
      ]);

      // Lock existing non-cancelled appointments for this professional on this date
      const { rows: lockedAppointments } = await client.query<{ start_time: string; end_time: string }>(
        `SELECT start_time, end_time
         FROM appointments
         WHERE professional_id = $1
           AND appointment_date = $2
           AND status NOT IN ('cancelled', 'no_show')
           AND deleted_at IS NULL
         FOR UPDATE`,
        [dto.professionalId, dto.appointmentDate],
      );

      // Check for time overlap
      const hasConflict = lockedAppointments.some((a) =>
        rangesOverlap(startMinutes, endMinutes, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
      );
      if (hasConflict) {
        throw new ConflictException(
          'El horario solicitado entra en conflicto con otra cita existente para este profesional',
        );
      }

      // Check schedule blocks
      const { rows: blocks } = await client.query<{ start_time: string; end_time: string }>(
        `SELECT start_time, end_time
         FROM schedule_blocks
         WHERE professional_id = $1 AND block_date = $2 AND deleted_at IS NULL
         FOR UPDATE`,
        [dto.professionalId, dto.appointmentDate],
      );
      const blockConflict = blocks.some((b) =>
        rangesOverlap(startMinutes, endMinutes, timeToMinutes(b.start_time), timeToMinutes(b.end_time)),
      );
      if (blockConflict) {
        throw new ConflictException(
          'El horario solicitado entra en conflicto con un bloqueo de agenda',
        );
      }

      // Insert appointment
      const { rows } = await client.query<AppointmentDbRow>(
        `INSERT INTO appointments (
          clinic_id, patient_id, professional_id, service_id,
          appointment_date, start_time, end_time, status,
          notes, internal_notes, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *`,
        [
          clinicId, dto.patientId, dto.professionalId, dto.serviceId,
          dto.appointmentDate, dto.startTime, endTime, AppointmentStatus.PENDING,
          dto.notes ?? null, dto.internalNotes ?? null, userId,
        ],
      );

      const appointment = rows[0];

      // Record status history
      await client.query(
        `INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by)
         VALUES ($1, NULL, $2, $3)`,
        [appointment.id, AppointmentStatus.PENDING, userId],
      );

      return this.mapRow(appointment);
    });
  }

  // =========================================================================
  // 4.3 — CRUD + STATE MACHINE
  // =========================================================================

  async findAll(
    clinicId: string,
    filters: {
      professionalId?: string;
      patientId?: string;
      status?: AppointmentStatus;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Appointment[]> {
    const conditions = ['a.clinic_id = $1', 'a.deleted_at IS NULL'];
    const params: unknown[] = [clinicId];
    let paramIndex = 2;

    if (filters.professionalId) {
      conditions.push(`a.professional_id = $${paramIndex++}`);
      params.push(filters.professionalId);
    }
    if (filters.patientId) {
      conditions.push(`a.patient_id = $${paramIndex++}`);
      params.push(filters.patientId);
    }
    if (filters.status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.dateFrom) {
      conditions.push(`a.appointment_date >= $${paramIndex++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`a.appointment_date <= $${paramIndex++}`);
      params.push(filters.dateTo);
    }

    let query = `SELECT a.*,
              p.first_name AS patient_first_name, p.last_name AS patient_last_name,
              pr.first_name AS professional_first_name, pr.last_name AS professional_last_name,
              s.name AS service_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN professionals pr ON pr.id = a.professional_id
       JOIN services s ON s.id = a.service_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date ASC, a.start_time ASC`;

    if (filters.limit !== undefined) {
      const limit = Math.min(Math.max(Number(filters.limit), 1), 1000);
      const offset = filters.offset ? Math.max(Number(filters.offset), 0) : 0;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);
    }

    const { rows } = await this.db.query<AppointmentDbRow>(query, params);

    return rows.map((r) => this.mapRow(r));
  }

  async findOne(clinicId: string, id: string): Promise<Appointment> {
    const { rows } = await this.db.query<AppointmentDbRow>(
      `SELECT a.*,
              p.first_name AS patient_first_name, p.last_name AS patient_last_name,
              pr.first_name AS professional_first_name, pr.last_name AS professional_last_name,
              s.name AS service_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN professionals pr ON pr.id = a.professional_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = $1 AND a.clinic_id = $2 AND a.deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Cita no encontrada');
    }

    return this.mapRow(rows[0]);
  }

  /**
   * Transition appointment status with validation.
   */
  async updateStatus(
    clinicId: string,
    id: string,
    newStatus: AppointmentStatus,
    userId: string,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(clinicId, id);

    const allowed = APPOINTMENT_TRANSITIONS[appointment.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede transicionar de "${appointment.status}" a "${newStatus}". Transiciones permitidas: ${allowed.join(', ') || 'ninguna (estado terminal)'}`,
      );
    }

    const updateFields: string[] = ['status = $3'];
    const params: unknown[] = [id, clinicId, newStatus];
    let paramIndex = 4;

    if (newStatus === AppointmentStatus.CANCELLED) {
      updateFields.push(`cancellation_reason = $${paramIndex++}`, `cancelled_at = NOW()`);
      params.push(reason ?? null);
    } else if (newStatus === AppointmentStatus.CHECKED_IN) {
      updateFields.push(`checked_in_at = NOW()`);
    } else if (newStatus === AppointmentStatus.COMPLETED) {
      updateFields.push(`completed_at = NOW()`);
    }

    await this.db.transaction(async (client) => {
      await client.query(
        `UPDATE appointments
         SET ${updateFields.join(', ')}
         WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
        params,
      );

      await client.query(
        `INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, appointment.status, newStatus, userId, reason ?? null],
      );
    });

    if (newStatus === AppointmentStatus.CONFIRMED) {
      if (this.eventEmitter) {
        this.eventEmitter.emit('appointment.confirmed', new AppointmentConfirmedEvent(clinicId, id));
      } else if (this.emailsService) {
        this.dispatchAppointmentConfirmationEmails(clinicId, id).catch((err) => {
          this.logger.warn(`[AppointmentsService] Error al enviar correos de confirmación: ${err}`);
        });
      }
    } else if (newStatus === AppointmentStatus.CANCELLED) {
      this.eventEmitter?.emit('appointment.cancelled', new AppointmentCancelledEvent(clinicId, id, reason));
    }

    return this.findOne(clinicId, id);
  }

  async cancel(clinicId: string, id: string, dto: CancelAppointmentDto, userId: string): Promise<Appointment> {
    return this.updateStatus(clinicId, id, AppointmentStatus.CANCELLED, userId, dto.reason);
  }

  async reschedule(
    clinicId: string,
    id: string,
    dto: RescheduleAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(clinicId, id);

    // Verify service duration
    const { rows: svcRows } = await this.db.query<DurationDbRow>(
      `SELECT duration_minutes FROM services WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [appointment.serviceId, clinicId],
    );
    const durationMinutes = svcRows.length > 0 ? svcRows[0].duration_minutes : 60;
    const startMinutes = timeToMinutes(dto.startTime);
    const endMinutes = startMinutes + durationMinutes;

    // Verify schedule for new date/time
    const dayOfWeek = getDayOfWeek(dto.appointmentDate);
    const { rows: schedRows } = await this.db.query<ScheduleDbRow>(
      `SELECT day_of_week, start_time, end_time
       FROM professional_schedules
       WHERE professional_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
      [appointment.professionalId, dayOfWeek],
    );
    if (schedRows.length === 0) {
      throw new BadRequestException('El profesional no tiene horario configurado para este día');
    }
    const schedule = schedRows[0];
    if (!isInRange(startMinutes, endMinutes, timeToMinutes(schedule.start_time), timeToMinutes(schedule.end_time))) {
      throw new BadRequestException(
        `El horario solicitado está fuera de la agenda del profesional (${schedule.start_time} - ${schedule.end_time})`,
      );
    }

    // Check conflict on new slot (excluding current appointment if on same day)
    const { rows: existingAppointments } = await this.db.query<{ id: string; start_time: string; end_time: string }>(
      `SELECT id, start_time, end_time
       FROM appointments
       WHERE professional_id = $1
         AND appointment_date = $2
         AND status NOT IN ('cancelled', 'no_show')
         AND deleted_at IS NULL`,
      [appointment.professionalId, dto.appointmentDate],
    );
    const hasConflict = existingAppointments.some(
      (a) => a.id !== id && rangesOverlap(startMinutes, endMinutes, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
    );
    if (hasConflict) {
      throw new ConflictException(
        'El nuevo horario solicitado entra en conflicto con otra cita existente para este profesional',
      );
    }

    // Cancel old appointment
    await this.updateStatus(clinicId, id, AppointmentStatus.CANCELLED, userId, dto.reason);

    // Create new appointment with same details
    const createDto: CreateAppointmentDto = {
      patientId: appointment.patientId,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      appointmentDate: dto.appointmentDate,
      startTime: dto.startTime,
      notes: appointment.notes,
    };

    return this.create(clinicId, createDto, userId);
  }

  async getHistory(clinicId: string, appointmentId: string): Promise<{ fromStatus: string | null; toStatus: string; changedBy?: string; reason?: string; changedAt: string }[]> {
    // Verify appointment belongs to this clinic
    await this.findOne(clinicId, appointmentId);

    const { rows } = await this.db.query<{
      from_status: string | null;
      to_status: string;
      changed_by?: string;
      reason?: string;
      changed_at: string;
    }>(
      `SELECT from_status, to_status, changed_by, reason, changed_at
       FROM appointment_status_history
       WHERE appointment_id = $1
       ORDER BY changed_at ASC`,
      [appointmentId],
    );

    return rows.map((r) => ({
      fromStatus: r.from_status,
      toStatus: r.to_status,
      changedBy: r.changed_by,
      reason: r.reason,
      changedAt: r.changed_at,
    }));
  }

  /**
   * Despacha correos electrónicos de confirmación al paciente y al centro de salud vía Resend.
   */
  async dispatchAppointmentConfirmationEmails(clinicId: string, appointmentId: string): Promise<void> {
    if (!this.emailsService) return;

    try {
      const { rows } = await this.db.query<{
        id: string;
        appointment_date: string;
        start_time: string;
        end_time: string;
        notes?: string;
        patient_first_name: string;
        patient_last_name: string;
        patient_email?: string;
        patient_phone?: string;
        patient_national_id?: string;
        professional_first_name: string;
        professional_last_name: string;
        service_name: string;
        service_price?: number | string;
        clinic_name: string;
        clinic_address?: string;
        clinic_phone?: string;
      }>(
        `SELECT a.id, a.appointment_date, a.start_time, a.end_time, a.notes,
                p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                p.email AS patient_email, p.phone AS patient_phone,
                p.national_id AS patient_national_id,
                pr.first_name AS professional_first_name, pr.last_name AS professional_last_name,
                s.name AS service_name, s.price AS service_price,
                c.name AS clinic_name, c.address AS clinic_address, c.phone AS clinic_phone
         FROM appointments a
         JOIN clinics c ON c.id = a.clinic_id
         JOIN patients p ON p.id = a.patient_id
         JOIN professionals pr ON pr.id = a.professional_id
         JOIN services s ON s.id = a.service_id
         WHERE a.id = $1 AND a.clinic_id = $2`,
        [appointmentId, clinicId],
      );

      if (rows.length === 0) return;
      const row = rows[0];

      const formattedDate = typeof row.appointment_date === 'string'
        ? row.appointment_date.split('T')[0]
        : String(row.appointment_date).split('T')[0];

      const bookingCode = `CIT-${new Date().getFullYear()}-${row.id.substring(0, 4).toUpperCase()}`;

      const details = {
        bookingCode,
        patientName: `${row.patient_first_name} ${row.patient_last_name}`.trim(),
        patientDocType: 'DNI',
        patientDocNumber: row.patient_national_id || undefined,
        patientPhone: row.patient_phone || undefined,
        patientEmail: row.patient_email || undefined,
        serviceName: row.service_name,
        professionalName: `${row.professional_first_name} ${row.professional_last_name}`.trim(),
        appointmentDate: formattedDate,
        startTime: row.start_time,
        endTime: row.end_time,
        clinicName: row.clinic_name || 'Clínica VitalSalud',
        clinicAddress: row.clinic_address || 'Sede San Isidro — Av. Javier Prado Este 1234, Lima',
        clinicPhone: row.clinic_phone || '+51 (01) 710-8000',
        amount: row.service_price ? Number(row.service_price).toFixed(2) : '120.00',
        paymentMethod: 'En clínica / En línea',
        notes: row.notes || undefined,
      };

      await Promise.allSettled([
        this.emailsService.sendAppointmentConfirmationToPatient(clinicId, details),
        this.emailsService.sendAppointmentNotificationToClinic(clinicId, details),
      ]);
    } catch (error) {
      this.logger.warn(`[AppointmentsService] No se pudieron enviar los correos de confirmación: ${error}`);
    }
  }

  /**
   * Registra una cita médica desde el flujo público de reservas con verificación estricta anti-colisión
   * y envía confirmaciones por correo vía Resend.
   */
  async createPublicBooking(
    tenantClinicId: string | undefined,
    dto: CreatePublicBookingDto,
  ): Promise<{ id: string; bookingCode: string; status: string; appointment: Appointment }> {
    let clinicId = tenantClinicId;
    if (!clinicId) {
      const { rows: cRows } = await this.db.query<{ id: string }>(
        `SELECT id FROM clinics WHERE id = 'a0000000-0000-4000-a000-000000000001' AND deleted_at IS NULL`,
      );
      if (cRows.length > 0) {
        clinicId = cRows[0].id;
      } else {
        const { rows: fallbackRows } = await this.db.query<{ id: string }>(
          `SELECT id FROM clinics WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`,
        );
        clinicId = fallbackRows[0]?.id || 'a0000000-0000-4000-a000-000000000001';
      }
    }

    // 1. Validar servicio y calcular duración
    const { rows: durationRows } = await this.db.query<{ duration_minutes: number }>(
      `SELECT duration_minutes FROM services WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [dto.serviceId, clinicId],
    );
    if (durationRows.length === 0) {
      throw new NotFoundException('Servicio no encontrado');
    }
    const durationMinutes = durationRows[0].duration_minutes;

    // 2. Validar profesional activo
    const { rows: profRows } = await this.db.query(
      `SELECT id FROM professionals WHERE id = $1 AND clinic_id = $2 AND is_active = true AND deleted_at IS NULL`,
      [dto.professionalId, clinicId],
    );
    if (profRows.length === 0) {
      throw new NotFoundException('Profesional no encontrado o inactivo');
    }

    const startTime24 = parseTimeString(dto.startTime);
    const startMinutes = timeToMinutes(startTime24);
    const endMinutes = startMinutes + durationMinutes;
    const endTime24 = minutesToTime(endMinutes);

    // 3. Validar agenda y horario del profesional
    const dayOfWeek = getDayOfWeek(dto.appointmentDate);
    const { rows: schedRows } = await this.db.query<ScheduleDbRow>(
      `SELECT day_of_week, start_time, end_time
       FROM professional_schedules
       WHERE professional_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
      [dto.professionalId, dayOfWeek],
    );
    if (schedRows.length === 0) {
      throw new BadRequestException('El profesional no tiene horario configurado para este día');
    }

    const schedule = schedRows[0];
    if (!isInRange(startMinutes, endMinutes, timeToMinutes(schedule.start_time), timeToMinutes(schedule.end_time))) {
      throw new BadRequestException(
        `El horario solicitado está fuera de la agenda del profesional (${schedule.start_time} - ${schedule.end_time})`,
      );
    }

    // 4. MOTOR ANTI-COLISIÓN TRANSACCIONAL (Evita doble agendamiento a la misma hora)
    const result = await this.db.transaction(async (client) => {
      // Bloqueo consultivo para serializar reservas concurrentes
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1 || '_' || $2))`, [
        dto.professionalId,
        dto.appointmentDate,
      ]);

      // Verificar conflictos con citas existentes activas
      const { rows: lockedAppointments } = await client.query<{ start_time: string; end_time: string }>(
        `SELECT start_time, end_time
         FROM appointments
         WHERE professional_id = $1
           AND appointment_date = $2
           AND status NOT IN ('cancelled', 'no_show')
           AND deleted_at IS NULL
         FOR UPDATE`,
        [dto.professionalId, dto.appointmentDate],
      );

      const hasConflict = lockedAppointments.some((a) =>
        rangesOverlap(startMinutes, endMinutes, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
      );
      if (hasConflict) {
        throw new ConflictException(
          'El horario seleccionado ya no está disponible con este profesional. Por favor seleccione otro horario.',
        );
      }

      // Verificar bloqueos de agenda
      const { rows: blocks } = await client.query<{ start_time: string; end_time: string }>(
        `SELECT start_time, end_time
         FROM schedule_blocks
         WHERE professional_id = $1 AND block_date = $2 AND deleted_at IS NULL
         FOR UPDATE`,
        [dto.professionalId, dto.appointmentDate],
      );
      const blockConflict = blocks.some((b) =>
        rangesOverlap(startMinutes, endMinutes, timeToMinutes(b.start_time), timeToMinutes(b.end_time)),
      );
      if (blockConflict) {
        throw new ConflictException(
          'El horario solicitado entra en conflicto con un bloqueo de agenda del profesional',
        );
      }

      // 5. Vincular o crear paciente
      let patientId: string;
      const docNumber = dto.patientDocNumber?.trim() || null;
      const email = dto.patientEmail?.trim() || null;

      let existingPatient = null;
      if (docNumber) {
        const { rows } = await client.query<{ id: string }>(
          `SELECT id FROM patients WHERE clinic_id = $1 AND national_id = $2 AND deleted_at IS NULL LIMIT 1`,
          [clinicId, docNumber],
        );
        if (rows.length > 0) existingPatient = rows[0];
      }
      if (!existingPatient && email) {
        const { rows } = await client.query<{ id: string }>(
          `SELECT id FROM patients WHERE clinic_id = $1 AND email = $2 AND deleted_at IS NULL LIMIT 1`,
          [clinicId, email],
        );
        if (rows.length > 0) existingPatient = rows[0];
      }

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { rows } = await client.query<{ id: string }>(
          `INSERT INTO patients (
            clinic_id, first_name, last_name, email, phone, national_id, address
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id`,
          [
            clinicId,
            dto.patientFirstName,
            dto.patientLastName,
            email,
            dto.patientPhone || null,
            docNumber,
            'Sede San Isidro — Lima',
          ],
        );
        patientId = rows[0].id;
      }

      // 6. Insertar la cita confirmada
      const { rows: apptRows } = await client.query<AppointmentDbRow>(
        `INSERT INTO appointments (
          clinic_id, patient_id, professional_id, service_id,
          appointment_date, start_time, end_time, status,
          notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)
        RETURNING *`,
        [
          clinicId,
          patientId,
          dto.professionalId,
          dto.serviceId,
          dto.appointmentDate,
          startTime24,
          endTime24,
          AppointmentStatus.CONFIRMED,
          dto.notes ?? null,
        ],
      );

      const appointment = apptRows[0];

      await client.query(
        `INSERT INTO appointment_status_history (appointment_id, from_status, to_status, reason)
         VALUES ($1, NULL, $2, 'Reserva pública confirmada en línea')`,
        [appointment.id, AppointmentStatus.CONFIRMED],
      );

      const bookingCode = `CIT-${new Date().getFullYear()}-${appointment.id.substring(0, 4).toUpperCase()}`;

      // Obtener detalles mapeados dentro de la misma transacción
      const { rows: fullApptRows } = await client.query<AppointmentDbRow>(
        `SELECT a.*,
                p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                pr.first_name AS professional_first_name, pr.last_name AS professional_last_name,
                s.name AS service_name
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN professionals pr ON pr.id = a.professional_id
         JOIN services s ON s.id = a.service_id
         WHERE a.id = $1 AND a.clinic_id = $2`,
        [appointment.id, clinicId],
      );

      const mapped = this.mapRow(fullApptRows[0] || appointment);

      return {
        id: appointment.id,
        bookingCode,
        status: AppointmentStatus.CONFIRMED,
        appointment: mapped,
      };
    });

    if (this.eventEmitter) {
      this.eventEmitter.emit('appointment.confirmed', new AppointmentConfirmedEvent(clinicId, result.id));
    } else if (this.emailsService) {
      this.dispatchAppointmentConfirmationEmails(clinicId, result.id).catch((err) => {
        this.logger.warn(`[AppointmentsService] Error al despachar correos de cita: ${err}`);
      });
    }

    return result;
  }

  async softDelete(clinicId: string, id: string): Promise<void> {
    const { rowCount } = await this.db.query(
      `UPDATE appointments SET deleted_at = NOW() WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );
    if (rowCount === 0) throw new NotFoundException('Cita no encontrada');
  }

  // -------------------------------------------------------------------------
  // Mapper
  // -------------------------------------------------------------------------

  private mapRow(row: AppointmentDbRow): Appointment {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      patientId: row.patient_id,
      patientName: `${row.patient_first_name} ${row.patient_last_name}`,
      professionalId: row.professional_id,
      professionalName: `${row.professional_first_name} ${row.professional_last_name}`,
      serviceId: row.service_id,
      serviceName: row.service_name,
      appointmentDate: row.appointment_date
        ? (typeof row.appointment_date === 'string'
          ? row.appointment_date.split('T')[0]
          : String(row.appointment_date).split('T')[0])
        : '',
      startTime: row.start_time
        ? (typeof row.start_time === 'string' ? row.start_time.substring(0, 5) : String(row.start_time).substring(0, 5))
        : '',
      endTime: row.end_time
        ? (typeof row.end_time === 'string' ? row.end_time.substring(0, 5) : String(row.end_time).substring(0, 5))
        : '',
      status: row.status,
      notes: row.notes ?? undefined,
      internalNotes: row.internal_notes ?? undefined,
      cancellationReason: row.cancellation_reason ?? undefined,
      cancelledAt: row.cancelled_at ?? undefined,
      checkedInAt: row.checked_in_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      reminderSent: row.reminder_sent,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
