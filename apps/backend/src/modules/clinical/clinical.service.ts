import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import {
  MedicalRecord,
  Treatment,
  TreatmentSession,
  Prescription,
  PrescriptionItem,
} from '@citassistema/shared-types';

interface MedicalRecordDbRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  professional_first_name?: string;
  professional_last_name?: string;
  appointment_id?: string;
  chief_complaint?: string;
  anamnesis?: string;
  physical_examination?: string;
  diagnosis?: string;
  treatment_plan?: string;
  pain_scale?: number;
  notes?: string;
  vitals?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TreatmentDbRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  professional_first_name?: string;
  professional_last_name?: string;
  name: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  total_sessions: number;
  completed_sessions: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface TreatmentSessionDbRow {
  id: string;
  clinic_id: string;
  treatment_id: string;
  appointment_id?: string;
  session_number: number;
  session_date: string;
  notes?: string;
  evolution?: string;
  next_session_notes?: string;
  duration_minutes?: number;
  pain_scale_before?: number;
  pain_scale_after?: number;
  techniques_applied?: string[];
  created_at: string;
  updated_at: string;
}

interface PrescriptionDbRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  professional_first_name?: string;
  professional_last_name?: string;
  appointment_id?: string;
  medications: PrescriptionItem[];
  instructions?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ClinicalService {
  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------------------
  // 1. HISTORIAS CLÍNICAS (MEDICAL RECORDS)
  // ---------------------------------------------------------------------------

  private mapRecordRow(r: MedicalRecordDbRow): MedicalRecord {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      patientId: r.patient_id,
      professionalId: r.professional_id,
      professionalName: r.professional_first_name
        ? `${r.professional_first_name} ${r.professional_last_name}`
        : undefined,
      appointmentId: r.appointment_id,
      chiefComplaint: r.chief_complaint,
      anamnesis: r.anamnesis,
      physicalExamination: r.physical_examination,
      diagnosis: r.diagnosis,
      treatmentPlan: r.treatment_plan,
      painScale: r.pain_scale,
      notes: r.notes,
      vitals: r.vitals,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createMedicalRecord(clinicId: string, dto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const { rows } = await this.db.query<MedicalRecordDbRow>(
      `INSERT INTO medical_records (
        clinic_id, patient_id, professional_id, appointment_id,
        chief_complaint, anamnesis, physical_examination, diagnosis,
        treatment_plan, pain_scale, notes, vitals
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        clinicId,
        dto.patientId,
        dto.professionalId,
        dto.appointmentId || null,
        dto.chiefComplaint || null,
        dto.anamnesis || null,
        dto.physicalExamination || null,
        dto.diagnosis || null,
        dto.treatmentPlan || null,
        dto.painScale ?? null,
        dto.notes || null,
        JSON.stringify(dto.vitals || {}),
      ],
    );

    return this.getMedicalRecordById(clinicId, rows[0].id);
  }

  async getMedicalRecordById(clinicId: string, id: string): Promise<MedicalRecord> {
    const { rows } = await this.db.query<MedicalRecordDbRow>(
      `SELECT mr.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM medical_records mr
       LEFT JOIN professionals p ON p.id = mr.professional_id
       WHERE mr.id = $1 AND mr.clinic_id = $2 AND mr.deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Registro médico con ID ${id} no encontrado.`);
    }

    return this.mapRecordRow(rows[0]);
  }

  async getPatientMedicalRecords(clinicId: string, patientId: string): Promise<MedicalRecord[]> {
    const { rows } = await this.db.query<MedicalRecordDbRow>(
      `SELECT mr.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM medical_records mr
       LEFT JOIN professionals p ON p.id = mr.professional_id
       WHERE mr.clinic_id = $1 AND mr.patient_id = $2 AND mr.deleted_at IS NULL
       ORDER BY mr.created_at DESC`,
      [clinicId, patientId],
    );

    return rows.map((r) => this.mapRecordRow(r));
  }

  // ---------------------------------------------------------------------------
  // 2. PLANES DE TRATAMIENTO Y SESIONES
  // ---------------------------------------------------------------------------

  private mapTreatmentRow(r: TreatmentDbRow): Treatment {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      patientId: r.patient_id,
      professionalId: r.professional_id,
      professionalName: r.professional_first_name
        ? `${r.professional_first_name} ${r.professional_last_name}`
        : undefined,
      name: r.name,
      description: r.description,
      diagnosis: r.diagnosis,
      goals: r.goals,
      totalSessions: r.total_sessions,
      completedSessions: r.completed_sessions || 0,
      status: r.status,
      startDate: r.start_date ? String(r.start_date).split('T')[0] : undefined,
      endDate: r.end_date ? String(r.end_date).split('T')[0] : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  private mapSessionRow(r: TreatmentSessionDbRow): TreatmentSession {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      treatmentId: r.treatment_id,
      appointmentId: r.appointment_id,
      sessionNumber: r.session_number,
      sessionDate: String(r.session_date).split('T')[0],
      notes: r.notes,
      evolution: r.evolution,
      nextSessionNotes: r.next_session_notes,
      durationMinutes: r.duration_minutes,
      painScaleBefore: r.pain_scale_before,
      painScaleAfter: r.pain_scale_after,
      techniquesApplied: r.techniques_applied || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createTreatment(clinicId: string, dto: CreateTreatmentDto): Promise<Treatment> {
    const { rows } = await this.db.query<TreatmentDbRow>(
      `INSERT INTO treatments (
        clinic_id, patient_id, professional_id, name, description,
        diagnosis, goals, total_sessions, completed_sessions, status, start_date, end_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'active', $9, $10)
       RETURNING *`,
      [
        clinicId,
        dto.patientId,
        dto.professionalId,
        dto.name.trim(),
        dto.description || null,
        dto.diagnosis || null,
        dto.goals || null,
        dto.totalSessions,
        dto.startDate || null,
        dto.endDate || null,
      ],
    );

    return this.getTreatmentById(clinicId, rows[0].id);
  }

  async getTreatmentById(clinicId: string, id: string): Promise<Treatment> {
    const { rows } = await this.db.query<TreatmentDbRow>(
      `SELECT t.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM treatments t
       LEFT JOIN professionals p ON p.id = t.professional_id
       WHERE t.id = $1 AND t.clinic_id = $2 AND t.deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Plan de tratamiento con ID ${id} no encontrado.`);
    }

    return this.mapTreatmentRow(rows[0]);
  }

  async getPatientTreatments(clinicId: string, patientId: string): Promise<Treatment[]> {
    const { rows } = await this.db.query<TreatmentDbRow>(
      `SELECT t.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM treatments t
       LEFT JOIN professionals p ON p.id = t.professional_id
       WHERE t.clinic_id = $1 AND t.patient_id = $2 AND t.deleted_at IS NULL
       ORDER BY t.created_at DESC`,
      [clinicId, patientId],
    );

    return rows.map((r) => this.mapTreatmentRow(r));
  }

  async createTreatmentSession(clinicId: string, dto: CreateTreatmentSessionDto): Promise<TreatmentSession> {
    const treatment = await this.getTreatmentById(clinicId, dto.treatmentId);

    if (treatment.status === 'completed') {
      throw new BadRequestException('El plan de tratamiento ya ha sido completado.');
    }

    return this.db.transaction(async (client) => {
      // 1. Calculate next session number
      const { rows: maxRows } = await client.query<{ next_num: string }>(
        `SELECT COALESCE(MAX(session_number), 0) + 1 AS next_num
         FROM treatment_sessions
         WHERE treatment_id = $1 AND deleted_at IS NULL`,
        [dto.treatmentId],
      );

      const sessionNumber = parseInt(maxRows[0].next_num, 10);

      // 2. Insert session
      const { rows: sessionRows } = await client.query<TreatmentSessionDbRow>(
        `INSERT INTO treatment_sessions (
          clinic_id, treatment_id, appointment_id, session_number, session_date,
          notes, evolution, next_session_notes, duration_minutes,
          pain_scale_before, pain_scale_after, techniques_applied
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          clinicId,
          dto.treatmentId,
          dto.appointmentId || null,
          sessionNumber,
          dto.sessionDate,
          dto.notes || null,
          dto.evolution || null,
          dto.nextSessionNotes || null,
          dto.durationMinutes || 45,
          dto.painScaleBefore ?? null,
          dto.painScaleAfter ?? null,
          JSON.stringify(dto.techniquesApplied || []),
        ],
      );

      // 3. Increment completed sessions and auto-complete if reached total
      const newCompleted = treatment.completedSessions + 1;
      const isFinished = newCompleted >= treatment.totalSessions;

      await client.query(
        `UPDATE treatments 
         SET completed_sessions = $1,
             status = CASE WHEN $2 = true THEN 'completed' ELSE status END,
             updated_at = NOW()
         WHERE id = $3`,
        [newCompleted, isFinished, dto.treatmentId],
      );

      return this.mapSessionRow(sessionRows[0]);
    });
  }

  async getTreatmentSessions(clinicId: string, treatmentId: string): Promise<TreatmentSession[]> {
    await this.getTreatmentById(clinicId, treatmentId);

    const { rows } = await this.db.query<TreatmentSessionDbRow>(
      `SELECT * FROM treatment_sessions
       WHERE treatment_id = $1 AND clinic_id = $2 AND deleted_at IS NULL
       ORDER BY session_number ASC`,
      [treatmentId, clinicId],
    );

    return rows.map((r) => this.mapSessionRow(r));
  }

  // ---------------------------------------------------------------------------
  // 3. RECETAS MÉDICAS DIGITALES (PRESCRIPTIONS)
  // ---------------------------------------------------------------------------

  private mapPrescriptionRow(r: PrescriptionDbRow): Prescription {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      patientId: r.patient_id,
      professionalId: r.professional_id,
      professionalName: r.professional_first_name
        ? `${r.professional_first_name} ${r.professional_last_name}`
        : undefined,
      appointmentId: r.appointment_id,
      medications: typeof r.medications === 'string' ? JSON.parse(r.medications) : r.medications,
      instructions: r.instructions,
      validUntil: r.valid_until ? String(r.valid_until).split('T')[0] : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createPrescription(clinicId: string, dto: CreatePrescriptionDto): Promise<Prescription> {
    const { rows } = await this.db.query<PrescriptionDbRow>(
      `INSERT INTO prescriptions (
        clinic_id, patient_id, professional_id, appointment_id,
        medications, instructions, valid_until
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        clinicId,
        dto.patientId,
        dto.professionalId,
        dto.appointmentId || null,
        JSON.stringify(dto.medications),
        dto.instructions || null,
        dto.validUntil || null,
      ],
    );

    return this.getPrescriptionById(clinicId, rows[0].id);
  }

  async getPrescriptionById(clinicId: string, id: string): Promise<Prescription> {
    const { rows } = await this.db.query<PrescriptionDbRow>(
      `SELECT pr.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM prescriptions pr
       LEFT JOIN professionals p ON p.id = pr.professional_id
       WHERE pr.id = $1 AND pr.clinic_id = $2 AND pr.deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada.`);
    }

    return this.mapPrescriptionRow(rows[0]);
  }

  async getPatientPrescriptions(clinicId: string, patientId: string): Promise<Prescription[]> {
    const { rows } = await this.db.query<PrescriptionDbRow>(
      `SELECT pr.*, p.first_name AS professional_first_name, p.last_name AS professional_last_name
       FROM prescriptions pr
       LEFT JOIN professionals p ON p.id = pr.professional_id
       WHERE pr.clinic_id = $1 AND pr.patient_id = $2 AND pr.deleted_at IS NULL
       ORDER BY pr.created_at DESC`,
      [clinicId, patientId],
    );

    return rows.map((r) => this.mapPrescriptionRow(r));
  }
}
