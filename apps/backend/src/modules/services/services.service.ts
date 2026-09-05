import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { MedicalService } from '@citassistema/shared-types';

interface ServiceDbRow {
  id: string;
  clinic_id: string;
  specialty_id?: string;
  specialty_name?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: string | number;
  currency: string;
  requires_deposit: boolean;
  deposit_amount: string | number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ServicesService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: ServiceDbRow): MedicalService {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      specialtyId: row.specialty_id,
      specialtyName: row.specialty_name,
      name: row.name,
      description: row.description,
      durationMinutes: Number(row.duration_minutes),
      price: Number(row.price),
      currency: row.currency,
      requiresDeposit: row.requires_deposit,
      depositAmount: Number(row.deposit_amount),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(
    clinicId: string,
    specialtyId?: string,
    onlyActive = false,
  ): Promise<MedicalService[]> {
    let query = `
      SELECT 
        s.id, s.clinic_id, s.specialty_id, s.name, s.description,
        s.duration_minutes, s.price, s.currency, s.requires_deposit,
        s.deposit_amount, s.is_active, s.created_at, s.updated_at,
        sp.name AS specialty_name
      FROM services s
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      WHERE s.clinic_id = $1 AND s.deleted_at IS NULL
    `;
    const params: unknown[] = [clinicId];
    let idx = 2;

    if (specialtyId) {
      query += ` AND s.specialty_id = $${idx++}`;
      params.push(specialtyId);
    }

    if (onlyActive) {
      query += ` AND s.is_active = true`;
    }

    query += ` ORDER BY s.name ASC`;

    const { rows } = await this.db.query<ServiceDbRow>(query, params);
    return rows.map((r) => this.mapRow(r));
  }

  async findOne(clinicId: string, id: string): Promise<MedicalService> {
    const { rows } = await this.db.query<ServiceDbRow>(
      `SELECT 
        s.id, s.clinic_id, s.specialty_id, s.name, s.description,
        s.duration_minutes, s.price, s.currency, s.requires_deposit,
        s.deposit_amount, s.is_active, s.created_at, s.updated_at,
        sp.name AS specialty_name
       FROM services s
       LEFT JOIN specialties sp ON sp.id = s.specialty_id
       WHERE s.id = $1 AND s.clinic_id = $2 AND s.deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado.`);
    }

    return this.mapRow(rows[0]);
  }

  async create(clinicId: string, dto: CreateServiceDto): Promise<MedicalService> {
    // Check duplicate service name in same clinic
    const { rows: existing } = await this.db.query<{ id: string }>(
      `SELECT id FROM services WHERE clinic_id = $1 AND LOWER(name) = LOWER($2) AND deleted_at IS NULL`,
      [clinicId, dto.name.trim()],
    );

    if (existing.length > 0) {
      throw new ConflictException(`Ya existe un servicio con el nombre '${dto.name}'.`);
    }

    const { rows } = await this.db.query<ServiceDbRow>(
      `INSERT INTO services (
        clinic_id, specialty_id, name, description, duration_minutes,
        price, currency, requires_deposit, deposit_amount, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, clinic_id, specialty_id, name, description, duration_minutes,
                 price, currency, requires_deposit, deposit_amount, is_active, created_at, updated_at`,
      [
        clinicId,
        dto.specialtyId || null,
        dto.name.trim(),
        dto.description || null,
        dto.durationMinutes,
        dto.price,
        dto.currency || 'PEN',
        dto.requiresDeposit ?? false,
        dto.depositAmount ?? 0,
        dto.isActive ?? true,
      ],
    );

    return this.findOne(clinicId, rows[0].id);
  }

  async update(clinicId: string, id: string, dto: UpdateServiceDto): Promise<MedicalService> {
    await this.findOne(clinicId, id);

    if (dto.name) {
      const { rows: duplicate } = await this.db.query<{ id: string }>(
        `SELECT id FROM services WHERE clinic_id = $1 AND LOWER(name) = LOWER($2) AND id != $3 AND deleted_at IS NULL`,
        [clinicId, dto.name.trim(), id],
      );
      if (duplicate.length > 0) {
        throw new ConflictException(`Ya existe otro servicio con el nombre '${dto.name}'.`);
      }
    }

    const fields: string[] = [];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.specialtyId !== undefined) {
      fields.push(`specialty_id = $${idx++}`);
      params.push(dto.specialtyId);
    }
    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(dto.name.trim());
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(dto.description);
    }
    if (dto.durationMinutes !== undefined) {
      fields.push(`duration_minutes = $${idx++}`);
      params.push(dto.durationMinutes);
    }
    if (dto.price !== undefined) {
      fields.push(`price = $${idx++}`);
      params.push(dto.price);
    }
    if (dto.currency !== undefined) {
      fields.push(`currency = $${idx++}`);
      params.push(dto.currency);
    }
    if (dto.requiresDeposit !== undefined) {
      fields.push(`requires_deposit = $${idx++}`);
      params.push(dto.requiresDeposit);
    }
    if (dto.depositAmount !== undefined) {
      fields.push(`deposit_amount = $${idx++}`);
      params.push(dto.depositAmount);
    }
    if (dto.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(dto.isActive);
    }

    if (fields.length > 0) {
      await this.db.query(
        `UPDATE services 
         SET ${fields.join(', ')}
         WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findOne(clinicId, id);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    await this.findOne(clinicId, id);
    await this.db.query(
      `UPDATE services SET deleted_at = NOW() WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId],
    );
  }
}
