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
import { SavePainMapDto } from './dto/save-pain-map.dto';
import {
  MedicalRecord,
  Treatment,
  TreatmentSession,
  Prescription,
  PrescriptionItem,
  PainPoint,
  PainEvolutionSeries,
  Laterality,
  PainView,
  TriggerPointStatus,
  PainDepth,
  getNode,
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

  // ---------------------------------------------------------------------------
  // 4. MAPAS ANATÓMICOS DE DOLOR (PAIN MAP POINTS)
  // ---------------------------------------------------------------------------

  private mapPainPointRow(r: PainMapPointDbRow): PainPoint {
    const node = getNode(r.structure_code);
    const regionNode = getNode(r.region_code);
    return {
      id: r.id,
      clinicId: r.clinic_id,
      patientId: r.patient_id,
      professionalId: r.professional_id,
      medicalRecordId: r.medical_record_id,
      treatmentSessionId: r.treatment_session_id,
      structureCode: r.structure_code,
      structureLabel: node ? node.label : r.structure_code,
      regionCode: r.region_code,
      regionLabel: regionNode ? regionNode.label : r.region_code,
      laterality: r.laterality,
      view: r.view,
      coordX: Number(r.coord_x),
      coordY: Number(r.coord_y),
      eva: Number(r.eva),
      painTypes: r.pain_types || [],
      triggerPoint: r.trigger_point,
      depth: r.depth,
      aggravatingFactors: r.aggravating_factors || [],
      referredArea: r.referred_area,
      notes: r.notes || undefined,
      recordedAt: r.recorded_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async savePainMap(
    clinicId: string,
    userId: string,
    dto: SavePainMapDto,
  ): Promise<PainPoint[]> {
    if (!dto.medicalRecordId && !dto.treatmentSessionId) {
      throw new BadRequestException(
        'Se requiere medicalRecordId o treatmentSessionId para asociar los puntos de dolor.',
      );
    }

    // Resolver professional_id
    let professionalId = dto.professionalId;
    if (!professionalId) {
      const { rows: profRows } = await this.db.query<{ id: string }>(
        `SELECT id FROM professionals WHERE user_id = $1 AND clinic_id = $2 AND is_active = true LIMIT 1`,
        [userId, clinicId],
      );
      if (profRows.length > 0) {
        professionalId = profRows[0].id;
      } else {
        const { rows: anyProf } = await this.db.query<{ id: string }>(
          `SELECT id FROM professionals WHERE clinic_id = $1 AND is_active = true ORDER BY created_at ASC LIMIT 1`,
          [clinicId],
        );
        if (anyProf.length > 0) {
          professionalId = anyProf[0].id;
        } else {
          throw new BadRequestException(
            'No se encontró un profesional activo asignado a esta clínica.',
          );
        }
      }
    }

    // Verificar existencia del paciente
    const { rows: patRows } = await this.db.query(
      `SELECT id FROM patients WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [dto.patientId, clinicId],
    );
    if (patRows.length === 0) {
      throw new NotFoundException(`Paciente ${dto.patientId} no encontrado.`);
    }

    // Validar R-PAIN-01, R-PAIN-02, R-PAIN-03 en cada punto
    for (const p of dto.points) {
      const node = getNode(p.structureCode);
      if (!node) {
        throw new BadRequestException(
          `El código de estructura anatómica '${p.structureCode}' no es válido en el catálogo.`,
        );
      }
      if (!node.lateral && p.laterality !== 'central') {
        p.laterality = 'central';
      } else if (node.lateral && p.laterality === 'central') {
        throw new BadRequestException(
          `La estructura '${node.label}' es lateral y requiere especificar lateralidad (D, I o bilateral).`,
        );
      }
      if (!node.views.includes(p.view)) {
        throw new BadRequestException(
          `La vista '${p.view}' no es válida para la estructura '${node.label}'. Vistas permitidas: ${node.views.join(', ')}.`,
        );
      }
    }

    // Ejecutar reemplazo transaccional
    return this.db.transaction(async (client) => {
      if (dto.medicalRecordId) {
        await client.query(
          `DELETE FROM pain_map_points WHERE clinic_id = $1 AND medical_record_id = $2`,
          [clinicId, dto.medicalRecordId],
        );
      }
      if (dto.treatmentSessionId) {
        await client.query(
          `DELETE FROM pain_map_points WHERE clinic_id = $1 AND treatment_session_id = $2`,
          [clinicId, dto.treatmentSessionId],
        );
      }

      const insertedRows: PainMapPointDbRow[] = [];

      for (const p of dto.points) {
        const { rows } = await client.query<PainMapPointDbRow>(
          `INSERT INTO pain_map_points (
            clinic_id, patient_id, professional_id, medical_record_id, treatment_session_id,
            structure_code, region_code, laterality, view, coord_x, coord_y, eva,
            pain_types, trigger_point, depth, aggravating_factors, referred_area, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            clinicId,
            dto.patientId,
            professionalId,
            dto.medicalRecordId || null,
            dto.treatmentSessionId || null,
            p.structureCode,
            p.regionCode,
            p.laterality,
            p.view,
            p.coordX,
            p.coordY,
            p.eva,
            p.painTypes || [],
            p.triggerPoint || null,
            p.depth || null,
            p.aggravatingFactors || [],
            p.referredArea ? JSON.stringify(p.referredArea) : null,
            p.notes || null,
          ],
        );
        insertedRows.push(rows[0]);
      }

      // Sincronizar pain_scale con el máximo EVA si aplica
      if (dto.points.length > 0) {
        const maxEva = Math.max(...dto.points.map((p) => p.eva));
        if (dto.medicalRecordId) {
          await client.query(
            `UPDATE medical_records SET pain_scale = $1, updated_at = NOW() WHERE id = $2 AND clinic_id = $3`,
            [maxEva, dto.medicalRecordId, clinicId],
          );
        }
        if (dto.treatmentSessionId) {
          await client.query(
            `UPDATE treatment_sessions SET pain_scale_after = $1, updated_at = NOW() WHERE id = $2 AND clinic_id = $3`,
            [maxEva, dto.treatmentSessionId, clinicId],
          );
        }
      }

      return insertedRows.map((r) => this.mapPainPointRow(r));
    });
  }

  async getPainMap(
    clinicId: string,
    patientId: string,
    query: { recordId?: string; sessionId?: string },
  ): Promise<PainPoint[]> {
    let whereClause = `clinic_id = $1 AND patient_id = $2 AND deleted_at IS NULL`;
    const params: unknown[] = [clinicId, patientId];

    if (query.recordId) {
      params.push(query.recordId);
      whereClause += ` AND medical_record_id = $${params.length}`;
    }
    if (query.sessionId) {
      params.push(query.sessionId);
      whereClause += ` AND treatment_session_id = $${params.length}`;
    }

    const { rows } = await this.db.query<PainMapPointDbRow>(
      `SELECT * FROM pain_map_points
       WHERE ${whereClause}
       ORDER BY recorded_at ASC, created_at ASC`,
      params,
    );

    return rows.map((r) => this.mapPainPointRow(r));
  }

  async getPainEvolution(
    clinicId: string,
    patientId: string,
    structureCode?: string,
  ): Promise<PainEvolutionSeries[]> {
    let query = `
      SELECT p.*, s.session_number
      FROM pain_map_points p
      LEFT JOIN treatment_sessions s ON s.id = p.treatment_session_id
      WHERE p.clinic_id = $1 AND p.patient_id = $2 AND p.deleted_at IS NULL
    `;
    const params: unknown[] = [clinicId, patientId];

    if (structureCode) {
      params.push(structureCode);
      query += ` AND p.structure_code = $${params.length}`;
    }

    query += ` ORDER BY p.recorded_at ASC, p.created_at ASC`;

    interface EvolutionRow extends PainMapPointDbRow {
      session_number?: number;
    }

    const { rows } = await this.db.query<EvolutionRow>(query, params);

    const seriesMap = new Map<string, PainEvolutionSeries>();

    for (const r of rows) {
      const key = `${r.structure_code}__${r.laterality}`;
      const node = getNode(r.structure_code);
      const regionNode = getNode(r.region_code);

      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          structureCode: r.structure_code,
          structureLabel: node ? node.label : r.structure_code,
          regionCode: r.region_code,
          regionLabel: regionNode ? regionNode.label : r.region_code,
          laterality: r.laterality,
          history: [],
          initialEva: Number(r.eva),
          currentEva: Number(r.eva),
          delta: 0,
        });
      }

      const series = seriesMap.get(key)!;
      const eva = Number(r.eva);
      series.history.push({
        id: r.id,
        recordedAt: r.recorded_at,
        eva,
        laterality: r.laterality,
        triggerPoint: r.trigger_point,
        source: r.medical_record_id ? 'medical_record' : 'treatment_session',
        referenceId: r.medical_record_id || r.treatment_session_id || '',
        sessionNumber: r.session_number ? Number(r.session_number) : undefined,
        notes: r.notes || undefined,
      });
      series.currentEva = eva;
      series.delta = series.currentEva - series.initialEva;
    }

    return Array.from(seriesMap.values());
  }
}

interface PainMapPointDbRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  medical_record_id?: string;
  treatment_session_id?: string;
  structure_code: string;
  region_code: string;
  laterality: Laterality;
  view: PainView;
  coord_x: number | string;
  coord_y: number | string;
  eva: number | string;
  pain_types?: string[];
  trigger_point?: TriggerPointStatus;
  depth?: PainDepth;
  aggravating_factors?: string[];
  referred_area?: Record<string, unknown>;
  notes?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}
