import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient, PatientHistory } from '@citassistema/shared-types';

interface PatientDbRow {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  national_id?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string;
  medical_notes?: string;
  avatar_url?: string;
  is_active: boolean;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PatientsService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: PatientDbRow): Patient {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth ? String(row.date_of_birth).split('T')[0] : undefined,
      gender: row.gender,
      address: row.address,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      nationalId: row.national_id,
      insuranceProvider: row.insurance_provider,
      insuranceNumber: row.insurance_number,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      allergies: row.allergies,
      medicalNotes: row.medical_notes,
      avatarUrl: row.avatar_url,
      isActive: row.is_active,
      registeredAt: row.registered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(clinicId: string, dto: CreatePatientDto): Promise<Patient> {
    // Check duplicate national_id within clinic
    if (dto.nationalId) {
      const { rows: existing } = await this.db.query<{ id: string }>(
        `SELECT id FROM patients 
         WHERE clinic_id = $1 AND national_id = $2 AND deleted_at IS NULL`,
        [clinicId, dto.nationalId.trim()],
      );

      if (existing.length > 0) {
        throw new ConflictException(`Ya existe un paciente registrado con el documento '${dto.nationalId}'.`);
      }
    }

    const { rows } = await this.db.query<PatientDbRow>(
      `INSERT INTO patients (
        clinic_id, first_name, last_name, email, phone, date_of_birth,
        gender, address, city, province, postal_code, national_id,
        insurance_provider, insurance_number, emergency_contact_name,
        emergency_contact_phone, allergies, medical_notes, avatar_url, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        clinicId,
        dto.firstName.trim(),
        dto.lastName.trim(),
        dto.email ? dto.email.toLowerCase().trim() : null,
        dto.phone || null,
        dto.dateOfBirth || null,
        dto.gender || null,
        dto.address || null,
        dto.city || null,
        dto.province || null,
        dto.postalCode || null,
        dto.nationalId ? dto.nationalId.trim() : null,
        dto.insuranceProvider || null,
        dto.insuranceNumber || null,
        dto.emergencyContactName || null,
        dto.emergencyContactPhone || null,
        dto.allergies || null,
        dto.medicalNotes || null,
        dto.avatarUrl || null,
        dto.isActive ?? true,
      ],
    );

    return this.mapRow(rows[0]);
  }

  async findOne(clinicId: string, id: string): Promise<Patient> {
    const { rows } = await this.db.query<PatientDbRow>(
      `SELECT * FROM patients WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado.`);
    }

    return this.mapRow(rows[0]);
  }

  async findByNationalId(clinicId: string, nationalId: string): Promise<Patient | null> {
    const { rows } = await this.db.query<PatientDbRow>(
      `SELECT * FROM patients WHERE clinic_id = $1 AND national_id = $2 AND deleted_at IS NULL`,
      [clinicId, nationalId.trim()],
    );

    return rows.length > 0 ? this.mapRow(rows[0]) : null;
  }

  async findAll(
    clinicId: string,
    search?: string,
    limit = 50,
    offset = 0,
  ): Promise<{ data: Patient[]; total: number }> {
    let query = `SELECT * FROM patients WHERE clinic_id = $1 AND deleted_at IS NULL`;
    let countQuery = `SELECT COUNT(*) as total FROM patients WHERE clinic_id = $1 AND deleted_at IS NULL`;
    const params: unknown[] = [clinicId];
    let idx = 2;

    if (search && search.trim()) {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      const searchClause = ` AND (
        LOWER(first_name) LIKE $${idx} OR
        LOWER(last_name) LIKE $${idx} OR
        LOWER(national_id) LIKE $${idx} OR
        LOWER(email) LIKE $${idx} OR
        phone LIKE $${idx}
      )`;
      query += searchClause;
      countQuery += searchClause;
      params.push(searchPattern);
      idx++;
    }

    query += ` ORDER BY last_name ASC, first_name ASC LIMIT $${idx++} OFFSET $${idx++}`;
    const queryParams = [...params, limit, offset];

    const [{ rows }, { rows: countRows }] = await Promise.all([
      this.db.query<PatientDbRow>(query, queryParams),
      this.db.query<{ total: string }>(countQuery, params),
    ]);

    return {
      data: rows.map((r) => this.mapRow(r)),
      total: parseInt(countRows[0]?.total || '0', 10),
    };
  }

  async getHistory(clinicId: string, patientId: string): Promise<PatientHistory> {
    const patient = await this.findOne(clinicId, patientId);

    // 1. Appointments history
    const { rows: apptRows } = await this.db.query<{
      id: string;
      service_name: string;
      professional_first_name: string;
      professional_last_name: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      status: string;
      notes?: string;
    }>(
      `SELECT a.id, a.appointment_date, a.start_time, a.end_time, a.status, a.notes,
              s.name AS service_name,
              p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM appointments a
       LEFT JOIN services s ON s.id = a.service_id
       LEFT JOIN professionals p ON p.id = a.professional_id
       WHERE a.clinic_id = $1 AND a.patient_id = $2 AND a.deleted_at IS NULL
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [clinicId, patientId],
    );

    // 2. Payments history
    const { rows: payRows } = await this.db.query<{
      id: string;
      amount: string | number;
      currency: string;
      status: string;
      method?: string;
      created_at: string;
    }>(
      `SELECT id, amount, currency, status, method, created_at
       FROM payments
       WHERE clinic_id = $1 AND patient_id = $2 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [clinicId, patientId],
    );

    return {
      patient,
      appointments: apptRows.map((a) => ({
        id: a.id,
        serviceName: a.service_name || 'Consulta Médica',
        professionalName: a.professional_first_name
          ? `${a.professional_first_name} ${a.professional_last_name}`
          : 'Profesional Asignado',
        appointmentDate: String(a.appointment_date).split('T')[0],
        startTime: a.start_time,
        endTime: a.end_time,
        status: a.status,
        notes: a.notes,
      })),
      prescriptions: [],
      payments: payRows.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        method: p.method,
        createdAt: p.created_at,
      })),
    };
  }

  async update(clinicId: string, id: string, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(clinicId, id);

    if (dto.nationalId) {
      const { rows: duplicate } = await this.db.query<{ id: string }>(
        `SELECT id FROM patients 
         WHERE clinic_id = $1 AND national_id = $2 AND id != $3 AND deleted_at IS NULL`,
        [clinicId, dto.nationalId.trim(), id],
      );
      if (duplicate.length > 0) {
        throw new ConflictException(`Ya existe otro paciente con el documento '${dto.nationalId}'.`);
      }
    }

    const fields: string[] = [];
    const params: unknown[] = [id, clinicId];
    let idx = 3;

    if (dto.firstName !== undefined) {
      fields.push(`first_name = $${idx++}`);
      params.push(dto.firstName.trim());
    }
    if (dto.lastName !== undefined) {
      fields.push(`last_name = $${idx++}`);
      params.push(dto.lastName.trim());
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${idx++}`);
      params.push(dto.email ? dto.email.toLowerCase().trim() : null);
    }
    if (dto.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      params.push(dto.phone);
    }
    if (dto.dateOfBirth !== undefined) {
      fields.push(`date_of_birth = $${idx++}`);
      params.push(dto.dateOfBirth);
    }
    if (dto.gender !== undefined) {
      fields.push(`gender = $${idx++}`);
      params.push(dto.gender);
    }
    if (dto.address !== undefined) {
      fields.push(`address = $${idx++}`);
      params.push(dto.address);
    }
    if (dto.city !== undefined) {
      fields.push(`city = $${idx++}`);
      params.push(dto.city);
    }
    if (dto.province !== undefined) {
      fields.push(`province = $${idx++}`);
      params.push(dto.province);
    }
    if (dto.postalCode !== undefined) {
      fields.push(`postal_code = $${idx++}`);
      params.push(dto.postalCode);
    }
    if (dto.nationalId !== undefined) {
      fields.push(`national_id = $${idx++}`);
      params.push(dto.nationalId);
    }
    if (dto.insuranceProvider !== undefined) {
      fields.push(`insurance_provider = $${idx++}`);
      params.push(dto.insuranceProvider);
    }
    if (dto.insuranceNumber !== undefined) {
      fields.push(`insurance_number = $${idx++}`);
      params.push(dto.insuranceNumber);
    }
    if (dto.emergencyContactName !== undefined) {
      fields.push(`emergency_contact_name = $${idx++}`);
      params.push(dto.emergencyContactName);
    }
    if (dto.emergencyContactPhone !== undefined) {
      fields.push(`emergency_contact_phone = $${idx++}`);
      params.push(dto.emergencyContactPhone);
    }
    if (dto.allergies !== undefined) {
      fields.push(`allergies = $${idx++}`);
      params.push(dto.allergies);
    }
    if (dto.medicalNotes !== undefined) {
      fields.push(`medical_notes = $${idx++}`);
      params.push(dto.medicalNotes);
    }
    if (dto.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      params.push(dto.avatarUrl);
    }
    if (dto.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(dto.isActive);
    }

    if (fields.length > 0) {
      fields.push(`updated_at = NOW()`);
      await this.db.query(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findOne(clinicId, id);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    await this.findOne(clinicId, id);
    await this.db.query(
      `UPDATE patients SET deleted_at = NOW() WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId],
    );
  }
}
