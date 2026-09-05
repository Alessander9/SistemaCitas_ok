import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Specialty } from '@citassistema/shared-types';

interface SpecialtyDbRow {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SpecialtiesService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: SpecialtyDbRow): Specialty {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(clinicId: string, onlyActive = false): Promise<Specialty[]> {
    let query = `
      SELECT id, clinic_id, name, description, icon, is_active, sort_order, created_at, updated_at
      FROM specialties
      WHERE clinic_id = $1 AND deleted_at IS NULL
    `;
    const params: unknown[] = [clinicId];

    if (onlyActive) {
      query += ` AND is_active = true`;
    }

    query += ` ORDER BY sort_order ASC, name ASC`;

    const { rows } = await this.db.query<SpecialtyDbRow>(query, params);
    return rows.map((r) => this.mapRow(r));
  }

  async findOne(clinicId: string, id: string): Promise<Specialty> {
    const { rows } = await this.db.query<SpecialtyDbRow>(
      `SELECT id, clinic_id, name, description, icon, is_active, sort_order, created_at, updated_at
       FROM specialties
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada.`);
    }

    return this.mapRow(rows[0]);
  }

  async create(clinicId: string, dto: CreateSpecialtyDto): Promise<Specialty> {
    // Check duplicate name within clinic
    const { rows: existing } = await this.db.query<{ id: string }>(
      `SELECT id FROM specialties WHERE clinic_id = $1 AND LOWER(name) = LOWER($2) AND deleted_at IS NULL`,
      [clinicId, dto.name.trim()],
    );

    if (existing.length > 0) {
      throw new ConflictException(`Ya existe una especialidad con el nombre '${dto.name}'.`);
    }

    const { rows } = await this.db.query<SpecialtyDbRow>(
      `INSERT INTO specialties (clinic_id, name, description, icon, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, clinic_id, name, description, icon, is_active, sort_order, created_at, updated_at`,
      [
        clinicId,
        dto.name.trim(),
        dto.description || null,
        dto.icon || null,
        dto.isActive ?? true,
        dto.sortOrder ?? 0,
      ],
    );

    return this.mapRow(rows[0]);
  }

  async update(clinicId: string, id: string, dto: UpdateSpecialtyDto): Promise<Specialty> {
    await this.findOne(clinicId, id);

    if (dto.name) {
      const { rows: duplicate } = await this.db.query<{ id: string }>(
        `SELECT id FROM specialties WHERE clinic_id = $1 AND LOWER(name) = LOWER($2) AND id != $3 AND deleted_at IS NULL`,
        [clinicId, dto.name.trim(), id],
      );
      if (duplicate.length > 0) {
        throw new ConflictException(`Ya existe otra especialidad con el nombre '${dto.name}'.`);
      }
    }

    const fields: string[] = [];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(dto.name.trim());
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(dto.description);
    }
    if (dto.icon !== undefined) {
      fields.push(`icon = $${idx++}`);
      params.push(dto.icon);
    }
    if (dto.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(dto.isActive);
    }
    if (dto.sortOrder !== undefined) {
      fields.push(`sort_order = $${idx++}`);
      params.push(dto.sortOrder);
    }

    if (fields.length === 0) {
      return this.findOne(clinicId, id);
    }

    const { rows } = await this.db.query<SpecialtyDbRow>(
      `UPDATE specialties 
       SET ${fields.join(', ')}
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL
       RETURNING id, clinic_id, name, description, icon, is_active, sort_order, created_at, updated_at`,
      params,
    );

    return this.mapRow(rows[0]);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    await this.findOne(clinicId, id);
    await this.db.query(
      `UPDATE specialties SET deleted_at = NOW() WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId],
    );
  }
}
