import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClinicKnowledgeSnapshot } from '@citassistema/shared-types';

@Injectable()
export class AiKnowledgeService {
  constructor(private readonly db: DatabaseService) {}

  async getClinicKnowledge(clinicId?: string): Promise<ClinicKnowledgeSnapshot> {
    // 1. Clinic profile
    let clinicName = 'CitasSistema Medical';
    let phone = '+51 987 654 321';
    let whatsapp = '+51 987 654 321';
    let address = 'Av. Javier Prado Este 1234, San Isidro, Lima';

    if (clinicId) {
      const { rows: clinicRows } = await this.db.query<{
        name: string;
        phone?: string;
        address?: string;
      }>(`SELECT name, phone, address FROM clinics WHERE id = $1`, [clinicId]);

      if (clinicRows.length > 0) {
        clinicName = clinicRows[0].name;
        phone = clinicRows[0].phone ?? phone;
        whatsapp = clinicRows[0].phone ?? whatsapp;
        address = clinicRows[0].address ?? address;
      }
    }

    // 2. Specialties
    const specCondition = clinicId ? 'clinic_id = $1 AND' : '';
    const specParams = clinicId ? [clinicId] : [];
    const { rows: specRows } = await this.db.query<{ id: string; name: string }>(
      `SELECT id, name FROM specialties WHERE ${specCondition} deleted_at IS NULL ORDER BY name ASC`,
      specParams,
    );

    // 3. Services with prices, duration, currency
    const svcCondition = clinicId ? 's.clinic_id = $1 AND' : '';
    const svcParams = clinicId ? [clinicId] : [];
    const { rows: svcRows } = await this.db.query<{
      id: string;
      specialty_id: string;
      specialty_name: string;
      name: string;
      duration_minutes: number;
      price: string | number;
      currency: string;
    }>(
      `SELECT s.id, s.specialty_id, sp.name AS specialty_name, s.name, s.duration_minutes, s.price, s.currency
       FROM services s
       JOIN specialties sp ON sp.id = s.specialty_id
       WHERE ${svcCondition} s.deleted_at IS NULL
       ORDER BY s.name ASC`,
      svcParams,
    );

    // 4. Professionals
    const profCondition = clinicId ? 'p.clinic_id = $1 AND' : '';
    const profParams = clinicId ? [clinicId] : [];
    const { rows: profRows } = await this.db.query<{
      id: string;
      first_name: string;
      last_name: string;
      specialty_name?: string;
    }>(
      `SELECT DISTINCT p.id, p.first_name, p.last_name, sp.name AS specialty_name
       FROM professionals p
       LEFT JOIN professional_services ps ON ps.professional_id = p.id
       LEFT JOIN services s ON s.id = ps.service_id
       LEFT JOIN specialties sp ON sp.id = s.specialty_id
       WHERE ${profCondition} p.deleted_at IS NULL AND p.is_active = true
       ORDER BY p.first_name ASC`,
      profParams,
    );

    return {
      clinicName,
      phone,
      whatsapp,
      address,
      specialties: specRows.map((s) => ({ id: s.id, name: s.name })),
      services: svcRows.map((s) => ({
        id: s.id,
        specialtyId: s.specialty_id,
        specialtyName: s.specialty_name,
        name: s.name,
        durationMinutes: Number(s.duration_minutes),
        price: parseFloat(String(s.price)),
        currency: s.currency,
      })),
      professionals: profRows.map((p) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`.trim(),
        specialtyName: p.specialty_name ?? 'Medicina General',
      })),
    };
  }
}
