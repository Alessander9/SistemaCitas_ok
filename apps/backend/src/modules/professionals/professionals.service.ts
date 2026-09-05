import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { Professional, MedicalService } from '@citassistema/shared-types';

interface ProfessionalDbRow {
  id: string;
  clinic_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  license_number?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  consultation_fee?: string | number;
  created_at: string;
  updated_at: string;
}

interface AssignedServiceDbRow {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: string | number;
  currency: string;
  requires_deposit: boolean;
  deposit_amount: string | number;
  is_active: boolean;
  specialty_id?: string;
}

@Injectable()
export class ProfessionalsService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: ProfessionalDbRow, services: MedicalService[] = []): Professional {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      licenseNumber: row.license_number,
      email: row.email,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      isActive: row.is_active,
      consultationFee: row.consultation_fee ? Number(row.consultation_fee) : undefined,
      services,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(
    clinicId: string,
    serviceId?: string,
    onlyActive = false,
  ): Promise<Professional[]> {
    let query = `
      SELECT DISTINCT
        p.id, p.clinic_id, p.user_id, p.first_name, p.last_name,
        p.license_number, p.email, p.phone, p.avatar_url, p.bio,
        p.is_active, p.consultation_fee, p.created_at, p.updated_at
      FROM professionals p
    `;

    const params: unknown[] = [clinicId];
    let idx = 2;

    if (serviceId) {
      query += ` JOIN professional_services ps ON ps.professional_id = p.id AND ps.service_id = $${idx++} AND ps.is_active = true`;
      params.push(serviceId);
    }

    query += ` WHERE p.clinic_id = $1 AND p.deleted_at IS NULL`;

    if (onlyActive) {
      query += ` AND p.is_active = true`;
    }

    query += ` ORDER BY p.last_name ASC, p.first_name ASC`;

    const { rows } = await this.db.query<ProfessionalDbRow>(query, params);

    // Fetch assigned services for each professional
    const professionals: Professional[] = [];
    for (const row of rows) {
      const services = await this.getAssignedServices(row.id);
      professionals.push(this.mapRow(row, services));
    }

    return professionals;
  }

  async findOne(clinicId: string, id: string): Promise<Professional> {
    const { rows } = await this.db.query<ProfessionalDbRow>(
      `SELECT id, clinic_id, user_id, first_name, last_name, license_number,
              email, phone, avatar_url, bio, is_active, consultation_fee,
              created_at, updated_at
       FROM professionals
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado.`);
    }

    const services = await this.getAssignedServices(id);
    return this.mapRow(rows[0], services);
  }

  async create(clinicId: string, dto: CreateProfessionalDto): Promise<Professional> {
    const { rows } = await this.db.query<ProfessionalDbRow>(
      `INSERT INTO professionals (
        clinic_id, user_id, first_name, last_name, license_number,
        email, phone, avatar_url, bio, is_active, consultation_fee
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, clinic_id, user_id, first_name, last_name, license_number,
                 email, phone, avatar_url, bio, is_active, consultation_fee,
                 created_at, updated_at`,
      [
        clinicId,
        dto.userId || null,
        dto.firstName.trim(),
        dto.lastName.trim(),
        dto.licenseNumber || null,
        dto.email ? dto.email.toLowerCase().trim() : null,
        dto.phone || null,
        dto.avatarUrl || null,
        dto.bio || null,
        dto.isActive ?? true,
        dto.consultationFee || null,
      ],
    );

    const professionalId = rows[0].id;

    if (dto.serviceIds && dto.serviceIds.length > 0) {
      await this.assignServices(clinicId, professionalId, dto.serviceIds);
    }

    return this.findOne(clinicId, professionalId);
  }

  async update(clinicId: string, id: string, dto: UpdateProfessionalDto): Promise<Professional> {
    await this.findOne(clinicId, id);

    const fields: string[] = [];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.userId !== undefined) {
      fields.push(`user_id = $${idx++}`);
      params.push(dto.userId);
    }
    if (dto.firstName !== undefined) {
      fields.push(`first_name = $${idx++}`);
      params.push(dto.firstName.trim());
    }
    if (dto.lastName !== undefined) {
      fields.push(`last_name = $${idx++}`);
      params.push(dto.lastName.trim());
    }
    if (dto.licenseNumber !== undefined) {
      fields.push(`license_number = $${idx++}`);
      params.push(dto.licenseNumber);
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${idx++}`);
      params.push(dto.email ? dto.email.toLowerCase().trim() : null);
    }
    if (dto.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      params.push(dto.phone);
    }
    if (dto.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      params.push(dto.avatarUrl);
    }
    if (dto.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      params.push(dto.bio);
    }
    if (dto.consultationFee !== undefined) {
      fields.push(`consultation_fee = $${idx++}`);
      params.push(dto.consultationFee);
    }
    if (dto.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(dto.isActive);
    }

    if (fields.length > 0) {
      await this.db.query(
        `UPDATE professionals
         SET ${fields.join(', ')}
         WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
        params,
      );
    }

    if (dto.serviceIds !== undefined) {
      await this.assignServices(clinicId, id, dto.serviceIds);
    }

    return this.findOne(clinicId, id);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    await this.findOne(clinicId, id);
    await this.db.query(
      `UPDATE professionals SET deleted_at = NOW() WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId],
    );
  }

  async assignServices(clinicId: string, professionalId: string, serviceIds: string[]): Promise<void> {
    // Verify professional belongs to clinic
    await this.findOne(clinicId, professionalId);

    // Delete existing assignments
    await this.db.query(
      `DELETE FROM professional_services WHERE professional_id = $1`,
      [professionalId],
    );

    // Insert new assignments
    for (const serviceId of serviceIds) {
      await this.db.query(
        `INSERT INTO professional_services (professional_id, service_id, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (professional_id, service_id) DO UPDATE SET is_active = true`,
        [professionalId, serviceId],
      );
    }
  }

  private async getAssignedServices(professionalId: string): Promise<MedicalService[]> {
    const { rows } = await this.db.query<AssignedServiceDbRow>(
      `SELECT s.id, s.name, s.description, s.duration_minutes, s.price,
              s.currency, s.requires_deposit, s.deposit_amount, s.is_active,
              s.specialty_id
       FROM professional_services ps
       JOIN services s ON s.id = ps.service_id
       WHERE ps.professional_id = $1 AND ps.is_active = true AND s.deleted_at IS NULL`,
      [professionalId],
    );

    return rows.map((r) => ({
      id: r.id,
      clinicId: '',
      specialtyId: r.specialty_id,
      name: r.name,
      description: r.description,
      durationMinutes: Number(r.duration_minutes),
      price: Number(r.price),
      currency: r.currency,
      requiresDeposit: r.requires_deposit,
      depositAmount: Number(r.deposit_amount),
      isActive: r.is_active,
      createdAt: '',
      updatedAt: '',
    }));
  }
}
