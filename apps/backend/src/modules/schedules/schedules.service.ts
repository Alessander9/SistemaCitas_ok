import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { DayScheduleDto } from './dto/create-schedule.dto';
import { CreateScheduleBlockDto } from './dto/create-block.dto';
import { ProfessionalSchedule, ScheduleBlock } from '@citassistema/shared-types';

interface ScheduleDbRow {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BlockDbRow {
  id: string;
  professional_id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  created_at: string;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly db: DatabaseService) {}

  private mapScheduleRow(row: ScheduleDbRow): ProfessionalSchedule {
    return {
      id: row.id,
      professionalId: row.professional_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapBlockRow(row: BlockDbRow): ScheduleBlock {
    return {
      id: row.id,
      professionalId: row.professional_id,
      blockDate: row.block_date,
      startTime: row.start_time,
      endTime: row.end_time,
      reason: row.reason,
      isRecurring: row.is_recurring,
      recurrenceRule: row.recurrence_rule,
      createdAt: row.created_at,
    };
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException(
        `La hora de inicio (${startTime}) debe ser anterior a la hora de fin (${endTime}).`,
      );
    }
  }

  private async verifyProfessionalClinic(clinicId: string, professionalId: string): Promise<void> {
    const { rows } = await this.db.query<{ id: string }>(
      `SELECT id FROM professionals WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [professionalId, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Profesional con ID ${professionalId} no encontrado en esta clínica.`);
    }
  }

  async getProfessionalSchedules(
    clinicId: string,
    professionalId: string,
  ): Promise<ProfessionalSchedule[]> {
    await this.verifyProfessionalClinic(clinicId, professionalId);

    const { rows } = await this.db.query<ScheduleDbRow>(
      `SELECT id, professional_id, day_of_week, start_time, end_time, is_active, created_at, updated_at
       FROM professional_schedules
       WHERE professional_id = $1 AND deleted_at IS NULL
       ORDER BY day_of_week ASC, start_time ASC`,
      [professionalId],
    );

    return rows.map((r) => this.mapScheduleRow(r));
  }

  async setWeeklySchedule(
    clinicId: string,
    professionalId: string,
    schedules: DayScheduleDto[],
  ): Promise<ProfessionalSchedule[]> {
    await this.verifyProfessionalClinic(clinicId, professionalId);

    // Validate time ranges
    for (const item of schedules) {
      this.validateTimeRange(item.startTime, item.endTime);
    }

    return this.db.transaction(async (client) => {
      // 1. Soft-delete or clear previous active schedules for this professional
      await client.query(
        `DELETE FROM professional_schedules WHERE professional_id = $1`,
        [professionalId],
      );

      // 2. Insert new weekly schedules
      const insertedRows: ScheduleDbRow[] = [];
      for (const item of schedules) {
        const { rows } = await client.query<ScheduleDbRow>(
          `INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, professional_id, day_of_week, start_time, end_time, is_active, created_at, updated_at`,
          [
            professionalId,
            item.dayOfWeek,
            item.startTime,
            item.endTime,
            item.isActive ?? true,
          ],
        );
        insertedRows.push(rows[0]);
      }

      return insertedRows.map((r) => this.mapScheduleRow(r));
    });
  }

  async getBlocks(
    clinicId: string,
    professionalId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ScheduleBlock[]> {
    await this.verifyProfessionalClinic(clinicId, professionalId);

    let query = `
      SELECT id, professional_id, block_date, start_time, end_time, reason, is_recurring, recurrence_rule, created_at
      FROM schedule_blocks
      WHERE professional_id = $1 AND deleted_at IS NULL
    `;
    const params: unknown[] = [professionalId];
    let idx = 2;

    if (startDate) {
      query += ` AND block_date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND block_date <= $${idx++}`;
      params.push(endDate);
    }

    query += ` ORDER BY block_date ASC, start_time ASC`;

    const { rows } = await this.db.query<BlockDbRow>(query, params);
    return rows.map((r) => this.mapBlockRow(r));
  }

  async createBlock(clinicId: string, dto: CreateScheduleBlockDto): Promise<ScheduleBlock> {
    await this.verifyProfessionalClinic(clinicId, dto.professionalId);
    this.validateTimeRange(dto.startTime, dto.endTime);

    const { rows } = await this.db.query<BlockDbRow>(
      `INSERT INTO schedule_blocks (
        professional_id, block_date, start_time, end_time, reason, is_recurring, recurrence_rule
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, professional_id, block_date, start_time, end_time, reason, is_recurring, recurrence_rule, created_at`,
      [
        dto.professionalId,
        dto.blockDate,
        dto.startTime,
        dto.endTime,
        dto.reason || null,
        dto.isRecurring ?? false,
        dto.recurrenceRule || null,
      ],
    );

    return this.mapBlockRow(rows[0]);
  }

  async deleteBlock(clinicId: string, blockId: string): Promise<void> {
    const { rows } = await this.db.query<{ id: string }>(
      `SELECT sb.id 
       FROM schedule_blocks sb
       JOIN professionals p ON p.id = sb.professional_id
       WHERE sb.id = $1 AND p.clinic_id = $2 AND sb.deleted_at IS NULL`,
      [blockId, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Bloqueo de horario con ID ${blockId} no encontrado.`);
    }

    await this.db.query(
      `UPDATE schedule_blocks SET deleted_at = NOW() WHERE id = $1`,
      [blockId],
    );
  }
}
