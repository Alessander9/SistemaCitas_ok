import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ParsedClinicalData, ParsedMedicationItem } from './clinical-voice-assistant.service';

export interface ClinicalAlertItem {
  type: 'allergy' | 'red_flag';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  detail: string;
  spokenWarning: string;
}

export interface PatientClinicalContext {
  patientId?: string;
  ageLabel?: string;
  allergies: string;
  bloodType?: string;
  recentDiagnosis?: string;
  lastEva?: number;
  previousEva?: number;
  sessionSummary?: string;
  activeMedications: string[];
}

export interface Cie10Match {
  code: string;
  displayName: string;
}

export interface ProtocolMatch {
  pathology: string;
  phase: string;
  recommendedTechniques: string[];
  homeExercises: string;
  durationSessions: number;
  notes?: string;
}

export interface SuggestedSupplyItem {
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  currentStock?: number;
}

export interface ClinicalProtocolDto {
  id?: string;
  pathology: string;
  phase: string;
  specialty?: string;
  recommendedTechniques: string[];
  homeExercises: string;
  durationSessions?: number;
  notes?: string;
}

export interface VademecumItemDto {
  id?: string;
  medicationName: string;
  activeIngredient: string;
  drugClass: string;
  defaultDose: string;
  defaultRoute?: string;
  defaultFrequency: string;
  defaultDuration: string;
  contraindications?: string;
  allergyKeywords: string[];
}

export interface VoiceMacroDto {
  id?: string;
  triggerPhrase: string;
  title: string;
  templateData: Partial<ParsedClinicalData>;
}

export interface ClinicVoiceSettingsDto {
  wakeWord: string;
  wakeAliases: string[];
  defaultMode: 'ambient' | 'active';
  privacyModeDefault: boolean;
}

export interface ClinicalAlertAuditRecord {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  detail: string;
  transcriptExcerpt?: string;
  createdAt: string;
}

const FALLBACK_CIE10: Array<{ code: string; displayName: string; synonyms: string[] }> = [
  { code: 'M54.4', displayName: 'Lumbago con ciática', synonyms: ['ciatica', 'ciática', 'irradiacion ciatica', 'irradiación ciática', 'irradiado a gluteo', 'irradiado a pierna'] },
  { code: 'M54.5', displayName: 'Lumbalgia mecánica aguda', synonyms: ['lumbalgia', 'dolor lumbar', 'espalda baja', 'lumbago'] },
  { code: 'M54.2', displayName: 'Cervicalgia mecánica', synonyms: ['cervicalgia', 'dolor cervical', 'dolor de cuello', 'torticolis', 'tortícolis'] },
  { code: 'M75.1', displayName: 'Síndrome del manguito rotador', synonyms: ['manguito rotador', 'tendinitis de hombro', 'hombro doloroso', 'supraespinoso'] },
  { code: 'S76.3', displayName: 'Desgarro muscular de isquiotibiales', synonyms: ['isquiotibiales', 'desgarro posterior', 'biceps femoral', 'desgarro muscular'] },
  { code: 'S93.4', displayName: 'Esguince de tobillo', synonyms: ['esguince', 'tobillo', 'peroneoastragalino'] },
  { code: 'M62.6', displayName: 'Distensión y sobrecarga muscular', synonyms: ['sobrecarga', 'gemelos', 'soleo', 'sóleo', 'pantorrilla', 'descarga muscular'] },
];

const FALLBACK_ALLERGY_FAMILIES: Array<{ drug: string; drugClass: string; keywords: string[]; alternative: string }> = [
  { drug: 'ibuprofeno', drugClass: 'AINE', keywords: ['ibuprofeno', 'aine', 'aines', 'antiinflamatorio', 'aspirina'], alternative: 'Paracetamol de quinientos miligramos' },
  { drug: 'celecoxib', drugClass: 'AINE', keywords: ['celecoxib', 'aine', 'aines', 'sulfa', 'sulfonamida'], alternative: 'Paracetamol de quinientos miligramos' },
  { drug: 'meloxicam', drugClass: 'AINE', keywords: ['meloxicam', 'aine', 'aines'], alternative: 'Paracetamol de quinientos miligramos' },
  { drug: 'naproxeno', drugClass: 'AINE', keywords: ['naproxeno', 'aine', 'aines'], alternative: 'Paracetamol de quinientos miligramos' },
  { drug: 'paracetamol', drugClass: 'Analgésico', keywords: ['paracetamol', 'acetaminofen', 'acetaminofén'], alternative: 'una alternativa indicada por el médico' },
];

const FALLBACK_RED_FLAGS: Array<{ keywords: string[]; title: string; spoken: string; severity: 'critical' | 'high' }> = [
  {
    keywords: ['silla de montar', 'incontinencia urinaria', 'retencion urinaria', 'retención urinaria', 'perdida de esfinteres', 'pérdida de esfínteres'],
    title: 'Sospecha de Síndrome de Cauda Equina',
    spoken: 'Atención doctora: se mencionaron signos de compromiso neurológico severo. Se recomienda evaluación de urgencia.',
    severity: 'critical',
  },
  {
    keywords: ['perdida de fuerza progresiva', 'pérdida de fuerza progresiva', 'pie caido', 'pie caído', 'paralisis', 'parálisis'],
    title: 'Déficit Motor Progresivo',
    spoken: 'Atención doctora: hay signos de pérdida de fuerza motora progresiva que requieren descartar compresión radicular.',
    severity: 'high',
  },
  {
    keywords: ['fiebre alta', 'escalofrios', 'escalofríos', 'perdida de peso inexplicable', 'pérdida de peso inexplicable'],
    title: 'Signos Sistémicos de Alarma',
    spoken: 'Atención doctora: la fiebre o pérdida de peso asociada al dolor requiere descartar causa infecciosa o inflamatoria.',
    severity: 'high',
  },
];

@Injectable()
export class ClinicalKnowledgeService {
  private readonly logger = new Logger(ClinicalKnowledgeService.name);

  constructor(private readonly db: DatabaseService) {}

  private normalize(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Carga el contexto clínico vivo del paciente desde PostgreSQL (anonimizado para LLMs).
   */
  async getPatientClinicalContext(
    clinicId?: string,
    patientId?: string,
    inlineAllergies?: string,
  ): Promise<PatientClinicalContext> {
    const base: PatientClinicalContext = {
      patientId,
      allergies: inlineAllergies || 'Ninguna conocida',
      activeMedications: [],
    };

    const isUuid = patientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId);
    if (!isUuid || !clinicId) {
      return base;
    }

    try {
      const { rows: pRows } = await this.db.query<{
        allergies: string | null;
        date_of_birth: string | null;
      }>(
        `SELECT allergies, date_of_birth FROM patients WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL LIMIT 1`,
        [patientId, clinicId],
      );

      if (pRows.length > 0) {
        if (pRows[0].allergies && pRows[0].allergies.trim()) {
          base.allergies = pRows[0].allergies.trim();
        }
        if (pRows[0].date_of_birth) {
          const years = Math.floor(
            (Date.now() - new Date(pRows[0].date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          );
          if (years > 0 && years < 120) {
            base.ageLabel = `${years} años`;
          }
        }
      }

      const { rows: recRows } = await this.db.query<{
        diagnosis: string | null;
        pain_scale: number | null;
      }>(
        `SELECT diagnosis, pain_scale FROM medical_records
         WHERE patient_id = $1 AND clinic_id = $2
         ORDER BY created_at DESC LIMIT 2`,
        [patientId, clinicId],
      );

      if (recRows.length > 0) {
        base.recentDiagnosis = recRows[0].diagnosis || undefined;
        base.lastEva = recRows[0].pain_scale ?? undefined;
        if (recRows.length > 1 && recRows[1].pain_scale !== null) {
          base.previousEva = recRows[1].pain_scale;
        }
      }

      const { rows: rxRows } = await this.db.query<{ medications: unknown }>(
        `SELECT medications FROM prescriptions
         WHERE patient_id = $1 AND clinic_id = $2
         ORDER BY created_at DESC LIMIT 2`,
        [patientId, clinicId],
      );

      const meds: string[] = [];
      for (const row of rxRows) {
        const list = Array.isArray(row.medications) ? row.medications : [];
        for (const m of list) {
          if (m && typeof m === 'object' && 'medicationName' in m) {
            meds.push(String((m as { medicationName: string }).medicationName));
          }
        }
      }
      base.activeMedications = Array.from(new Set(meds));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`No se pudo cargar contexto completo del paciente: ${msg}`);
    }

    return base;
  }

  /**
   * Busca silenciosamente el código CIE-10 oficial para el diagnóstico (nunca se lee por voz).
   */
  async matchCie10(text: string): Promise<Cie10Match | null> {
    const norm = this.normalize(text);
    if (!norm) return null;

    try {
      const { rows } = await this.db.query<{
        code: string;
        display_name: string;
        synonyms: string[];
      }>(`SELECT code, display_name, synonyms FROM cie10_catalog WHERE is_active = true`);

      // Priorizar coincidencias más específicas (ej. ciática antes que lumbalgia simple)
      const sorted = [...rows].sort((a, b) => (b.code === 'M54.4' ? 1 : 0) - (a.code === 'M54.4' ? 1 : 0));
      for (const row of sorted) {
        if (norm.includes(this.normalize(row.display_name))) {
          return { code: row.code, displayName: row.display_name };
        }
        if (Array.isArray(row.synonyms)) {
          for (const syn of row.synonyms) {
            if (norm.includes(this.normalize(syn))) {
              return { code: row.code, displayName: row.display_name };
            }
          }
        }
      }
    } catch {
      // Fallback en memoria para entornos de test sin DB
      for (const item of FALLBACK_CIE10) {
        if (norm.includes(this.normalize(item.displayName))) {
          return { code: item.code, displayName: item.displayName };
        }
        if (item.synonyms.some((syn) => norm.includes(this.normalize(syn)))) {
          return { code: item.code, displayName: item.displayName };
        }
      }
    }

    return null;
  }

  /**
   * Validador determinista de cruces de alergias contra vademécum.
   */
  async checkAllergyConflicts(
    allergiesText: string,
    medications: ParsedMedicationItem[] = [],
    rawTranscript = '',
  ): Promise<ClinicalAlertItem[]> {
    const normAllergies = this.normalize(allergiesText);
    if (
      !normAllergies ||
      normAllergies.includes('ninguna') ||
      normAllergies.includes('no refiere') ||
      normAllergies.includes('sin alergias')
    ) {
      return [];
    }

    const alerts: ClinicalAlertItem[] = [];
    const medNames = medications.map((m) => m.medicationName);
    const searchPool = [...medNames, rawTranscript].filter(Boolean);

    try {
      const { rows } = await this.db.query<{
        medication_name: string;
        active_ingredient: string;
        drug_class: string;
        allergy_keywords: string[];
      }>(`SELECT medication_name, active_ingredient, drug_class, allergy_keywords FROM vademecum_items WHERE is_active = true`);

      for (const item of rows) {
        const normMed = this.normalize(item.active_ingredient);
        const mentioned = searchPool.some((s) => this.normalize(s).includes(normMed));
        if (!mentioned) continue;

        const allergyHit = (item.allergy_keywords || []).some((kw) =>
          normAllergies.includes(this.normalize(kw)),
        );
        if (allergyHit) {
          const alt = item.drug_class === 'AINE' ? 'Paracetamol de quinientos miligramos' : 'otra alternativa segura';
          alerts.push({
            type: 'allergy',
            severity: 'critical',
            title: `Conflicto de Alergia: ${item.medication_name}`,
            detail: `El paciente registra alergia (${allergiesText}), incompatible con ${item.medication_name} (${item.drug_class}).`,
            spokenWarning: `Cuidado doctora, este paciente registra alergia incompatible con ${item.active_ingredient}. ¿Prefiere cambiarlo por ${alt}?`,
          });
        }
      }
      if (alerts.length > 0) return alerts;
    } catch {
      // Fallback determinista local
    }

    for (const fam of FALLBACK_ALLERGY_FAMILIES) {
      const mentioned = searchPool.some((s) => this.normalize(s).includes(fam.drug));
      if (!mentioned) continue;
      if (fam.keywords.some((kw) => normAllergies.includes(this.normalize(kw)))) {
        alerts.push({
          type: 'allergy',
          severity: 'critical',
          title: `Conflicto de Alergia: ${fam.drug}`,
          detail: `El paciente registra alergia (${allergiesText}), incompatible con ${fam.drug} (${fam.drugClass}).`,
          spokenWarning: `Cuidado doctora, este paciente es alérgico y no debe recibir ${fam.drug}. ¿Prefiere cambiarlo por ${fam.alternative}?`,
        });
      }
    }

    return alerts;
  }

  /**
   * Detector determinista de banderas rojas (Red Flags) en el diálogo clínico.
   */
  async detectRedFlags(text: string): Promise<ClinicalAlertItem[]> {
    const norm = this.normalize(text);
    if (!norm) return [];

    const alerts: ClinicalAlertItem[] = [];
    try {
      const { rows } = await this.db.query<{
        trigger_keywords: string[];
        alert_title: string;
        spoken_alert_human: string;
        severity: 'critical' | 'high' | 'medium';
      }>(`SELECT trigger_keywords, alert_title, spoken_alert_human, severity FROM clinical_red_flags WHERE is_active = true`);

      for (const rf of rows) {
        if ((rf.trigger_keywords || []).some((kw) => norm.includes(this.normalize(kw)))) {
          alerts.push({
            type: 'red_flag',
            severity: rf.severity || 'high',
            title: rf.alert_title,
            detail: rf.spoken_alert_human,
            spokenWarning: rf.spoken_alert_human,
          });
        }
      }
      if (alerts.length > 0) return alerts;
    } catch {
      // Fallback local
    }

    for (const rf of FALLBACK_RED_FLAGS) {
      if (rf.keywords.some((kw) => norm.includes(this.normalize(kw)))) {
        alerts.push({
          type: 'red_flag',
          severity: rf.severity,
          title: rf.title,
          detail: rf.spoken,
          spokenWarning: rf.spoken,
        });
      }
    }

    return alerts;
  }

  /**
   * Consulta protocolos clínicos estructurados de la sede.
   */
  async findProtocol(query: string, clinicId?: string): Promise<ProtocolMatch | null> {
    const norm = this.normalize(query);
    if (!norm) return null;

    try {
      const { rows } = await this.db.query<{
        pathology: string;
        phase: string;
        recommended_techniques: string[];
        home_exercises: string;
        duration_sessions: number;
        notes: string | null;
      }>(
        `SELECT pathology, phase, recommended_techniques, home_exercises, duration_sessions, notes
         FROM clinical_protocols
         WHERE is_active = true AND (clinic_id IS NULL OR clinic_id = $1)`,
        [clinicId || null],
      );

      for (const row of rows) {
        const keywords = this.normalize(row.pathology).split(/\s+/).filter((w) => w.length >= 4);
        if (keywords.some((kw) => norm.includes(kw))) {
          return {
            pathology: row.pathology,
            phase: row.phase,
            recommendedTechniques: row.recommended_techniques || [],
            homeExercises: row.home_exercises,
            durationSessions: row.duration_sessions || 10,
            notes: row.notes || undefined,
          };
        }
      }
    } catch {
      // Fallback básico
      if (norm.includes('hombro') || norm.includes('manguito')) {
        return {
          pathology: 'Síndrome del manguito rotador',
          phase: 'Fase 1 · Control Inflamatorio',
          recommendedTechniques: ['Ultrasonido Terapéutico', 'Crioterapia', 'Terapia Manual Ortopédica'],
          homeExercises: 'Crioterapia 15 minutos y ejercicios pendulares de Codman sin carga.',
          durationSessions: 10,
        };
      }
      if (norm.includes('lumbar') || norm.includes('lumbalgia') || norm.includes('espalda')) {
        return {
          pathology: 'Lumbalgia mecánica aguda',
          phase: 'Fase 1 · Control del Dolor',
          recommendedTechniques: ['Terapia Manual Ortopédica', 'Electroterapia (TENS / EMS)', 'Termoterapia'],
          homeExercises: 'Compresas tibias 15 minutos y pausas activas cada 2 horas.',
          durationSessions: 10,
        };
      }
    }

    return null;
  }

  /**
   * Busca una macro clínica de voz (plantilla rápida de control).
   */
  async findVoiceMacro(
    text: string,
    clinicId?: string,
  ): Promise<{ title: string; templateData: Partial<ParsedClinicalData> } | null> {
    const norm = this.normalize(text);
    if (!norm) return null;

    try {
      const { rows } = await this.db.query<{
        trigger_phrase: string;
        title: string;
        template_data: Partial<ParsedClinicalData>;
      }>(
        `SELECT trigger_phrase, title, template_data
         FROM clinical_voice_macros
         WHERE is_active = true AND (clinic_id IS NULL OR clinic_id = $1)`,
        [clinicId || null],
      );

      for (const row of rows) {
        if (norm.includes(this.normalize(row.trigger_phrase))) {
          return { title: row.title, templateData: row.template_data };
        }
      }
    } catch {
      if (norm.includes('control lumbar favorable')) {
        return {
          title: 'Control Lumbar Favorable',
          templateData: {
            anamnesis: 'Paciente refiere evolución favorable con menor rigidez matutina.',
            physicalExam: 'Disminución de contractura paravertebral lumbar. Rango de flexión mejorado.',
            techniques: ['Terapia Manual Ortopédica', 'Electroterapia (TENS / EMS)'],
            homeRecommendations: 'Continuar estiramientos suaves y pausas activas cada 2 horas.',
          },
        };
      }
    }

    return null;
  }

  // ===========================================================================
  // FASE 3 & 4: Insumos detectados por voz -> Kardex (Pre-selección segura)
  // ===========================================================================

  async detectMentionedSupplies(text: string, clinicId?: string): Promise<SuggestedSupplyItem[]> {
    const norm = this.normalize(text);
    if (!norm) return [];

    const extractQty = (keyword: string): number => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = norm.match(new RegExp(`(\\d{1,2})\\s+(?:unidades?\\s+de\\s+)?${escaped}|${escaped}\\s*(?:x|por)?\\s*(\\d{1,2})`));
      const qty = m ? parseInt(m[1] || m[2], 10) : 1;
      return qty > 0 && qty <= 50 ? qty : 1;
    };

    const results: SuggestedSupplyItem[] = [];
    const seen = new Set<string>();

    if (clinicId) {
      try {
        const { rows } = await this.db.query<{
          id: string;
          name: string;
          unit: string;
          current_stock: number;
        }>(
          `SELECT id, name, unit, current_stock
           FROM inventory_products
           WHERE clinic_id = $1 AND deleted_at IS NULL AND is_active = true`,
          [clinicId],
        );

        for (const p of rows) {
          const words = this.normalize(p.name)
            .split(/\s+/)
            .filter((w) => w.length >= 4 && !['para', 'caja', 'rollo', 'frasco'].includes(w));
          const matchedWord = words.find((w) => norm.includes(w));
          if (matchedWord && !seen.has(p.id)) {
            seen.add(p.id);
            results.push({
              productId: p.id,
              name: p.name,
              quantity: extractQty(matchedWord),
              unit: p.unit || 'unidad',
              currentStock: Number(p.current_stock),
            });
          }
        }
      } catch {
        // fallback below
      }
    }

    if (results.length === 0) {
      const fallbackSupplies: Array<{ name: string; unit: string; keywords: string[] }> = [
        { name: 'Agujas de punción seca', unit: 'unidad', keywords: ['aguja', 'agujas', 'puncion seca'] },
        { name: 'Cinta Kinesiotape', unit: 'tira', keywords: ['kinesiotape', 'vendaje neuromuscular', 'cinta kinesiologica'] },
        { name: 'Gel conductor ultrasonido', unit: 'dosis', keywords: ['gel conductor', 'gel de ultrasonido'] },
        { name: 'Electrodos autoadhesivos TENS', unit: 'par', keywords: ['electrodos', 'parches tens'] },
        { name: 'Guantes de nitrilo', unit: 'par', keywords: ['guantes'] },
      ];

      for (const item of fallbackSupplies) {
        const hit = item.keywords.find((kw) => norm.includes(kw));
        if (hit && !seen.has(item.name)) {
          seen.add(item.name);
          results.push({
            name: item.name,
            quantity: extractQty(hit),
            unit: item.unit,
          });
        }
      }
    }

    return results;
  }

  async deductConfirmedSupplies(
    clinicId: string,
    userId: string,
    supplies: Array<{ productId?: string; name: string; quantity: number }>,
    reference?: string,
  ): Promise<{ deductedCount: number; details: string[] }> {
    const details: string[] = [];
    let deductedCount = 0;

    for (const item of supplies) {
      if (!item.quantity || item.quantity <= 0) continue;

      let targetId = item.productId;
      let targetName = item.name;

      if (!targetId) {
        const { rows } = await this.db.query<{ id: string; name: string }>(
          `SELECT id, name FROM inventory_products
           WHERE clinic_id = $1 AND deleted_at IS NULL AND is_active = true
             AND LOWER(name) LIKE LOWER($2)
           LIMIT 1`,
          [clinicId, `%${item.name.split(' ')[0]}%`],
        );
        if (rows.length > 0) {
          targetId = rows[0].id;
          targetName = rows[0].name;
        }
      }

      if (!targetId) {
        details.push(`${item.name} × ${item.quantity} (registrado en nota clínica, sin SKU en Kardex)`);
        continue;
      }

      await this.db.transaction(async (client) => {
        await client.query(
          `UPDATE inventory_products
           SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW()
           WHERE id = $2 AND clinic_id = $3`,
          [item.quantity, targetId, clinicId],
        );
        await client.query(
          `INSERT INTO inventory_movements (
             clinic_id, product_id, type, quantity, reference, notes, created_by
           ) VALUES ($1, $2, 'sale', $3, $4, $5, $6)`,
          [
            clinicId,
            targetId,
            item.quantity,
            reference || 'CONSULTA-VOZ',
            'Descuento confirmado desde consulta clínica (Chanfainita)',
            userId,
          ],
        );
      });

      deductedCount += 1;
      details.push(`${targetName} × ${item.quantity} descontado de Kardex`);
    }

    return { deductedCount, details };
  }

  // ===========================================================================
  // FASE 4: CRUD de Panel de Conocimiento Clínico (ADMIN_CLINIC)
  // ===========================================================================

  async getVoiceSettings(clinicId?: string): Promise<ClinicVoiceSettingsDto> {
    const defaults: ClinicVoiceSettingsDto = {
      wakeWord: 'Chanfainita',
      wakeAliases: ['chanfainita', 'chanfanita', 'chanfaina', 'chanfa'],
      defaultMode: 'ambient',
      privacyModeDefault: false,
    };
    if (!clinicId) return defaults;

    try {
      const { rows } = await this.db.query<{
        wake_word: string;
        wake_aliases: string[];
        default_mode: string;
        privacy_mode_default: boolean;
      }>(`SELECT wake_word, wake_aliases, default_mode, privacy_mode_default FROM clinic_voice_settings WHERE clinic_id = $1 LIMIT 1`, [
        clinicId,
      ]);
      if (rows.length > 0) {
        return {
          wakeWord: rows[0].wake_word || 'Chanfainita',
          wakeAliases: rows[0].wake_aliases?.length ? rows[0].wake_aliases : defaults.wakeAliases,
          defaultMode: rows[0].default_mode === 'active' ? 'active' : 'ambient',
          privacyModeDefault: Boolean(rows[0].privacy_mode_default),
        };
      }
    } catch {
      // fallback to defaults
    }
    return defaults;
  }

  async saveVoiceSettings(
    clinicId: string,
    dto: Partial<ClinicVoiceSettingsDto>,
  ): Promise<ClinicVoiceSettingsDto> {
    const current = await this.getVoiceSettings(clinicId);
    const wakeWord = (dto.wakeWord || current.wakeWord).trim() || 'Chanfainita';
    const wakeAliases =
      dto.wakeAliases && dto.wakeAliases.length > 0
        ? Array.from(new Set([wakeWord.toLowerCase(), ...dto.wakeAliases.map((a) => a.trim().toLowerCase()).filter(Boolean)]))
        : Array.from(new Set([wakeWord.toLowerCase(), ...current.wakeAliases]));
    const defaultMode = dto.defaultMode || current.defaultMode;
    const privacyModeDefault = dto.privacyModeDefault ?? current.privacyModeDefault;

    await this.db.query(
      `INSERT INTO clinic_voice_settings (clinic_id, wake_word, wake_aliases, default_mode, privacy_mode_default, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (clinic_id)
       DO UPDATE SET wake_word = EXCLUDED.wake_word,
                     wake_aliases = EXCLUDED.wake_aliases,
                     default_mode = EXCLUDED.default_mode,
                     privacy_mode_default = EXCLUDED.privacy_mode_default,
                     updated_at = NOW()`,
      [clinicId, wakeWord, wakeAliases, defaultMode, privacyModeDefault],
    );

    return { wakeWord, wakeAliases, defaultMode, privacyModeDefault };
  }

  async listProtocols(clinicId?: string): Promise<ClinicalProtocolDto[]> {
    const { rows } = await this.db.query<{
      id: string;
      pathology: string;
      phase: string;
      specialty: string;
      recommended_techniques: string[];
      home_exercises: string;
      duration_sessions: number;
      notes: string | null;
    }>(
      `SELECT id, pathology, phase, specialty, recommended_techniques, home_exercises, duration_sessions, notes
       FROM clinical_protocols
       WHERE is_active = true AND (clinic_id IS NULL OR clinic_id = $1)
       ORDER BY created_at DESC`,
      [clinicId || null],
    );

    return rows.map((r) => ({
      id: r.id,
      pathology: r.pathology,
      phase: r.phase,
      specialty: r.specialty,
      recommendedTechniques: r.recommended_techniques || [],
      homeExercises: r.home_exercises,
      durationSessions: r.duration_sessions,
      notes: r.notes || undefined,
    }));
  }

  async createProtocol(clinicId: string, dto: ClinicalProtocolDto): Promise<ClinicalProtocolDto> {
    const { rows } = await this.db.query<{ id: string }>(
      `INSERT INTO clinical_protocols (clinic_id, pathology, phase, specialty, recommended_techniques, home_exercises, duration_sessions, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        clinicId,
        dto.pathology,
        dto.phase,
        dto.specialty || 'Fisioterapia y Rehabilitación',
        dto.recommendedTechniques || [],
        dto.homeExercises,
        dto.durationSessions || 10,
        dto.notes || null,
      ],
    );
    return { ...dto, id: rows[0].id };
  }

  async updateProtocol(clinicId: string, id: string, dto: Partial<ClinicalProtocolDto>): Promise<ClinicalProtocolDto> {
    const { rows } = await this.db.query<{
      id: string;
      pathology: string;
      phase: string;
      specialty: string;
      recommended_techniques: string[];
      home_exercises: string;
      duration_sessions: number;
      notes: string | null;
    }>(
      `UPDATE clinical_protocols
       SET pathology = COALESCE($1, pathology),
           phase = COALESCE($2, phase),
           specialty = COALESCE($3, specialty),
           recommended_techniques = COALESCE($4, recommended_techniques),
           home_exercises = COALESCE($5, home_exercises),
           duration_sessions = COALESCE($6, duration_sessions),
           notes = COALESCE($7, notes),
           updated_at = NOW()
       WHERE id = $8 AND (clinic_id IS NULL OR clinic_id = $9)
       RETURNING id, pathology, phase, specialty, recommended_techniques, home_exercises, duration_sessions, notes`,
      [
        dto.pathology ?? null,
        dto.phase ?? null,
        dto.specialty ?? null,
        dto.recommendedTechniques ?? null,
        dto.homeExercises ?? null,
        dto.durationSessions ?? null,
        dto.notes ?? null,
        id,
        clinicId,
      ],
    );
    const r = rows[0];
    return {
      id: r?.id || id,
      pathology: r?.pathology || dto.pathology || '',
      phase: r?.phase || dto.phase || '',
      specialty: r?.specialty || dto.specialty,
      recommendedTechniques: r?.recommended_techniques || dto.recommendedTechniques || [],
      homeExercises: r?.home_exercises || dto.homeExercises || '',
      durationSessions: r?.duration_sessions || dto.durationSessions || 10,
      notes: r?.notes || undefined,
    };
  }

  async deleteProtocol(clinicId: string, id: string): Promise<void> {
    await this.db.query(
      `UPDATE clinical_protocols SET is_active = false WHERE id = $1 AND (clinic_id IS NULL OR clinic_id = $2)`,
      [id, clinicId],
    );
  }

  async listVademecum(clinicId?: string): Promise<VademecumItemDto[]> {
    const { rows } = await this.db.query<{
      id: string;
      medication_name: string;
      active_ingredient: string;
      drug_class: string;
      default_dose: string;
      default_route: string;
      default_frequency: string;
      default_duration: string;
      contraindications: string | null;
      allergy_keywords: string[];
    }>(
      `SELECT id, medication_name, active_ingredient, drug_class, default_dose, default_route,
              default_frequency, default_duration, contraindications, allergy_keywords
       FROM vademecum_items
       WHERE is_active = true AND (clinic_id IS NULL OR clinic_id = $1)
       ORDER BY medication_name ASC`,
      [clinicId || null],
    );

    return rows.map((r) => ({
      id: r.id,
      medicationName: r.medication_name,
      activeIngredient: r.active_ingredient,
      drugClass: r.drug_class,
      defaultDose: r.default_dose,
      defaultRoute: r.default_route,
      defaultFrequency: r.default_frequency,
      defaultDuration: r.default_duration,
      contraindications: r.contraindications || undefined,
      allergyKeywords: r.allergy_keywords || [],
    }));
  }

  async createVademecumItem(clinicId: string, dto: VademecumItemDto): Promise<VademecumItemDto> {
    const { rows } = await this.db.query<{ id: string }>(
      `INSERT INTO vademecum_items (
         clinic_id, medication_name, active_ingredient, drug_class, default_dose, default_route,
         default_frequency, default_duration, contraindications, allergy_keywords
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        clinicId,
        dto.medicationName,
        dto.activeIngredient,
        dto.drugClass,
        dto.defaultDose,
        dto.defaultRoute || 'Oral',
        dto.defaultFrequency,
        dto.defaultDuration,
        dto.contraindications || null,
        dto.allergyKeywords || [],
      ],
    );
    return { ...dto, id: rows[0].id };
  }

  async updateVademecumItem(clinicId: string, id: string, dto: Partial<VademecumItemDto>): Promise<VademecumItemDto> {
    await this.db.query(
      `UPDATE vademecum_items
       SET medication_name = COALESCE($1, medication_name),
           active_ingredient = COALESCE($2, active_ingredient),
           drug_class = COALESCE($3, drug_class),
           default_dose = COALESCE($4, default_dose),
           default_frequency = COALESCE($5, default_frequency),
           default_duration = COALESCE($6, default_duration),
           contraindications = COALESCE($7, contraindications),
           allergy_keywords = COALESCE($8, allergy_keywords)
       WHERE id = $9 AND (clinic_id IS NULL OR clinic_id = $10)`,
      [
        dto.medicationName ?? null,
        dto.activeIngredient ?? null,
        dto.drugClass ?? null,
        dto.defaultDose ?? null,
        dto.defaultFrequency ?? null,
        dto.defaultDuration ?? null,
        dto.contraindications ?? null,
        dto.allergyKeywords ?? null,
        id,
        clinicId,
      ],
    );
    return {
      id,
      medicationName: dto.medicationName || '',
      activeIngredient: dto.activeIngredient || '',
      drugClass: dto.drugClass || '',
      defaultDose: dto.defaultDose || '',
      defaultFrequency: dto.defaultFrequency || '',
      defaultDuration: dto.defaultDuration || '',
      allergyKeywords: dto.allergyKeywords || [],
    };
  }

  async deleteVademecumItem(clinicId: string, id: string): Promise<void> {
    await this.db.query(
      `UPDATE vademecum_items SET is_active = false WHERE id = $1 AND (clinic_id IS NULL OR clinic_id = $2)`,
      [id, clinicId],
    );
  }

  async listMacros(clinicId?: string): Promise<VoiceMacroDto[]> {
    const { rows } = await this.db.query<{
      id: string;
      trigger_phrase: string;
      title: string;
      template_data: Partial<ParsedClinicalData>;
    }>(
      `SELECT id, trigger_phrase, title, template_data
       FROM clinical_voice_macros
       WHERE is_active = true AND (clinic_id IS NULL OR clinic_id = $1)
       ORDER BY created_at DESC`,
      [clinicId || null],
    );

    return rows.map((r) => ({
      id: r.id,
      triggerPhrase: r.trigger_phrase,
      title: r.title,
      templateData: r.template_data || {},
    }));
  }

  async createVoiceMacro(clinicId: string, dto: VoiceMacroDto): Promise<VoiceMacroDto> {
    const { rows } = await this.db.query<{ id: string }>(
      `INSERT INTO clinical_voice_macros (clinic_id, trigger_phrase, title, template_data)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id`,
      [clinicId, dto.triggerPhrase.toLowerCase().trim(), dto.title, JSON.stringify(dto.templateData || {})],
    );
    return { ...dto, id: rows[0].id };
  }

  async updateVoiceMacro(clinicId: string, id: string, dto: Partial<VoiceMacroDto>): Promise<VoiceMacroDto> {
    await this.db.query(
      `UPDATE clinical_voice_macros
       SET trigger_phrase = COALESCE($1, trigger_phrase),
           title = COALESCE($2, title),
           template_data = COALESCE($3::jsonb, template_data)
       WHERE id = $4 AND (clinic_id IS NULL OR clinic_id = $5)`,
      [
        dto.triggerPhrase ? dto.triggerPhrase.toLowerCase().trim() : null,
        dto.title ?? null,
        dto.templateData ? JSON.stringify(dto.templateData) : null,
        id,
        clinicId,
      ],
    );
    return {
      id,
      triggerPhrase: dto.triggerPhrase || '',
      title: dto.title || '',
      templateData: dto.templateData || {},
    };
  }

  async deleteVoiceMacro(clinicId: string, id: string): Promise<void> {
    await this.db.query(
      `UPDATE clinical_voice_macros SET is_active = false WHERE id = $1 AND (clinic_id IS NULL OR clinic_id = $2)`,
      [id, clinicId],
    );
  }

  async logClinicalAlerts(
    clinicId: string | undefined,
    patientId: string | undefined,
    alerts: ClinicalAlertItem[],
    transcriptExcerpt?: string,
  ): Promise<void> {
    if (!alerts.length) return;
    const safePatientId =
      patientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId)
        ? patientId
        : null;

    for (const a of alerts) {
      try {
        await this.db.query(
          `INSERT INTO clinical_alert_audit (clinic_id, patient_id, alert_type, severity, title, detail, transcript_excerpt)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            clinicId || null,
            safePatientId,
            a.type,
            a.severity,
            a.title,
            a.detail,
            (transcriptExcerpt || '').slice(0, 280),
          ],
        );
      } catch {
        // Non-blocking audit logging
      }
    }
  }

  async listAlertAudit(clinicId?: string, limit = 50): Promise<ClinicalAlertAuditRecord[]> {
    try {
      const { rows } = await this.db.query<{
        id: string;
        alert_type: string;
        severity: string;
        title: string;
        detail: string;
        transcript_excerpt: string | null;
        created_at: string;
      }>(
        `SELECT id, alert_type, severity, title, detail, transcript_excerpt, created_at
         FROM clinical_alert_audit
         WHERE ($1::uuid IS NULL OR clinic_id = $1 OR clinic_id IS NULL)
         ORDER BY created_at DESC
         LIMIT $2`,
        [clinicId || null, limit],
      );
      return rows.map((r) => ({
        id: r.id,
        alertType: r.alert_type,
        severity: r.severity,
        title: r.title,
        detail: r.detail,
        transcriptExcerpt: r.transcript_excerpt || undefined,
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }
}
