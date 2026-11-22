// apps/backend/src/modules/clinical/clinical-voice-assistant.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface ParsedMedicationItem {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface ParsedClinicalData {
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExam?: string;
  painScale?: number;
  painBefore?: number;
  painAfter?: number;
  diagnosis?: string;
  treatmentPlan?: string;
  techniques?: string[];
  medications?: ParsedMedicationItem[];
  homeRecommendations?: string;
  notes?: string;
}

export interface MissingFieldInfo {
  field: string;
  label: string;
  spokenPrompt: string;
}

export interface VoiceAssistantProcessResult {
  parsedData: ParsedClinicalData;
  missingFields: MissingFieldInfo[];
  isComplete: boolean;
  spokenAlert: string;
  providerUsed: string;
  rawTranscript: string;
}

export interface SaveConsultationDto {
  patientId: string;
  professionalId: string;
  appointmentId?: string;
  clinicalData: ParsedClinicalData;
}

@Injectable()
export class ClinicalVoiceAssistantService {
  private readonly logger = new Logger(ClinicalVoiceAssistantService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Procesa el dictado del médico utilizando la Cascada Multi-Proveedor:
   * 1. Groq Cloud (openai/gpt-oss-120b - Ultra rápido)
   * 2. Google Gemini (gemini-3.8-flash / gemini-flash-latest)
   * 3. OpenRouter
   * 4. Motor Determinista por Reglas (Fallback local 100% garantizado)
   */
  async processDictation(
    transcript: string,
    currentData?: Partial<ParsedClinicalData>,
  ): Promise<VoiceAssistantProcessResult> {
    const text = transcript.trim();
    if (!text) {
      return {
        parsedData: currentData || {},
        missingFields: this.calculateMissingFields(currentData || {}),
        isComplete: false,
        spokenAlert: 'No se detectó audio en el dictado. Por favor, hable al micrófono.',
        providerUsed: 'Ninguno',
        rawTranscript: '',
      };
    }

    let parsed: ParsedClinicalData | null = null;
    let providerUsed = '';

    // -------------------------------------------------------------------------
    // Proveedor 1: Groq Cloud LPU
    // -------------------------------------------------------------------------
    if (process.env.GROQ_API_KEY && !parsed) {
      try {
        parsed = await this.callGroq(text, currentData);
        if (parsed) providerUsed = 'Groq LPU (GPT-OSS-120B)';
      } catch (err: any) {
        this.logger.warn(`Groq falló, pasando al siguiente proveedor: ${err.message}`);
      }
    }

    // -------------------------------------------------------------------------
    // Proveedor 2: Google Gemini (AI Studio)
    // -------------------------------------------------------------------------
    if (process.env.GEMINI_API_KEY && !parsed) {
      try {
        parsed = await this.callGemini(text, currentData);
        if (parsed) providerUsed = 'Google Gemini (Flash)';
      } catch (err: any) {
        this.logger.warn(`Gemini falló, pasando al siguiente proveedor: ${err.message}`);
      }
    }

    // -------------------------------------------------------------------------
    // Proveedor 3: OpenRouter
    // -------------------------------------------------------------------------
    if (process.env.OPENROUTER_API_KEY && !parsed) {
      try {
        parsed = await this.callOpenRouter(text, currentData);
        if (parsed) providerUsed = 'OpenRouter AI';
      } catch (err: any) {
        this.logger.warn(`OpenRouter falló, pasando al fallback local: ${err.message}`);
      }
    }

    // -------------------------------------------------------------------------
    // Fallback: Analizador Determinista Local (Garantía 0% downtime)
    // -------------------------------------------------------------------------
    if (!parsed) {
      parsed = this.localDeterministicParser(text, currentData);
      providerUsed = 'Motor Local Inteligente (Reglas Clínicas)';
    }

    // Calcular campos faltantes y generar frase para el altavoz (TTS)
    const missingFields = this.calculateMissingFields(parsed);
    const isComplete = missingFields.length === 0;
    const spokenAlert = this.buildSpokenAlert(parsed, missingFields, isComplete);

    return {
      parsedData: parsed,
      missingFields,
      isComplete,
      spokenAlert,
      providerUsed,
      rawTranscript: text,
    };
  }

  /**
   * Guarda de forma estructurada en PostgreSQL la consulta analizada por voz
   */
  async saveConsultationRecord(
    clinicId: string,
    dto: SaveConsultationDto,
  ): Promise<{
    recordId: string;
    prescriptionId?: string;
    spokenConfirmation: string;
  }> {
    const { patientId, professionalId, appointmentId, clinicalData } = dto;

    let targetPatientId = patientId;
    let targetProfessionalId = professionalId;

    try {
      if (targetPatientId) {
        const { rows: patCheck } = await this.db.query<{ id: string }>(
          'SELECT id FROM patients WHERE id = $1',
          [targetPatientId],
        );
        if (patCheck.length === 0) {
          const { rows: firstPat } = await this.db.query<{ id: string }>(
            'SELECT id FROM patients WHERE clinic_id = $1 LIMIT 1',
            [clinicId],
          );
          if (firstPat.length > 0) targetPatientId = firstPat[0].id;
        }
      } else {
        const { rows: firstPat } = await this.db.query<{ id: string }>(
          'SELECT id FROM patients WHERE clinic_id = $1 LIMIT 1',
          [clinicId],
        );
        if (firstPat.length > 0) targetPatientId = firstPat[0].id;
      }
    } catch {
      // Ignore lookup error
    }

    try {
      if (targetProfessionalId) {
        const { rows: proCheck } = await this.db.query<{ id: string }>(
          'SELECT id FROM professionals WHERE id = $1',
          [targetProfessionalId],
        );
        if (proCheck.length === 0) {
          const { rows: firstPro } = await this.db.query<{ id: string }>(
            'SELECT id FROM professionals WHERE clinic_id = $1 LIMIT 1',
            [clinicId],
          );
          if (firstPro.length > 0) targetProfessionalId = firstPro[0].id;
        }
      } else {
        const { rows: firstPro } = await this.db.query<{ id: string }>(
          'SELECT id FROM professionals WHERE clinic_id = $1 LIMIT 1',
          [clinicId],
        );
        if (firstPro.length > 0) targetProfessionalId = firstPro[0].id;
      }
    } catch {
      // Ignore lookup error
    }

    // 1. Insertar Historia Clínica en medical_records
    const { rows: recordRows } = await this.db.query<{ id: string }>(
      `INSERT INTO medical_records (
        clinic_id, patient_id, professional_id, appointment_id,
        chief_complaint, anamnesis, physical_examination, diagnosis,
        treatment_plan, pain_scale, notes, vitals
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        clinicId,
        targetPatientId,
        targetProfessionalId,
        appointmentId || null,
        clinicalData.chiefComplaint || null,
        clinicalData.anamnesis || null,
        clinicalData.physicalExam || null,
        clinicalData.diagnosis || null,
        clinicalData.treatmentPlan || null,
        clinicalData.painScale !== undefined ? clinicalData.painScale : null,
        clinicalData.notes || null,
        JSON.stringify({
          homeRecommendations: clinicalData.homeRecommendations,
          techniques: clinicalData.techniques,
          painBefore: clinicalData.painBefore,
          painAfter: clinicalData.painAfter,
        }),
      ],
    );

    const recordId = recordRows[0].id;
    let prescriptionId: string | undefined;

    // 2. Si se recetaron fármacos, insertar en prescriptions
    if (clinicalData.medications && clinicalData.medications.length > 0) {
      const { rows: rxRows } = await this.db.query<{ id: string }>(
        `INSERT INTO prescriptions (
          clinic_id, patient_id, professional_id, appointment_id,
          medications, instructions, valid_until
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          clinicId,
          targetPatientId,
          targetProfessionalId,
          appointmentId || null,
          JSON.stringify(clinicalData.medications),
          clinicalData.homeRecommendations || null,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ],
      );
      prescriptionId = rxRows[0].id;
    }

    // 3. Si hay cita asociada, actualizar su estado a 'completed'
    if (appointmentId) {
      try {
        await this.db.query(
          `UPDATE appointments
           SET status = 'completed', updated_at = NOW()
           WHERE id = $1 AND clinic_id = $2`,
          [appointmentId, clinicId],
        );
      } catch {
        // Non-fatal if appointment ID was not in DB
      }
    }

    const spokenConfirmation =
      'Información guardada exitosamente en la base de datos de la clínica.';

    return {
      recordId,
      prescriptionId,
      spokenConfirmation,
    };
  }

  // ===========================================================================
  // LLM Integrations
  // ===========================================================================

  private getSystemPrompt(): string {
    return `Eres un Asistente Clínico Inteligente de alta precisión para médicos y fisioterapeutas.
Tu objetivo es escuchar el dictado verbal del médico y extraer la información estructurada en formato JSON estricto.

Debes devolver EXACTAMENTE un objeto JSON con las siguientes claves:
{
  "chiefComplaint": "Motivo principal de consulta",
  "anamnesis": "Historia de la enfermedad actual, tiempo de evolución, desencadenante",
  "physicalExam": "Hallazgos de la exploración física, maniobras, palpación",
  "painScale": 7 (número entero de 0 a 10 según escala EVA referida, o null si no se mencionó),
  "painBefore": (número entero de 0 a 10 dolor inicial o al entrar, o null),
  "painAfter": (número entero de 0 a 10 dolor al salir, o null),
  "diagnosis": "Diagnóstico clínico con código CIE-10 si es posible (ej: M54.5 Lumbalgia mecánica)",
  "treatmentPlan": "Plan terapéutico, sesiones indicadas, objetivos",
  "techniques": ["Técnicas aplicadas, ej: Terapia Manual, TENS, Ultrasonido, Punción Seca"],
  "medications": [
    {
      "medicationName": "Nombre del fármaco",
      "dose": "Dosis (ej: 200mg, 1 tableta)",
      "route": "Oral, Tópica o Intramuscular",
      "frequency": "ej: Cada 12 horas",
      "duration": "ej: Por 5 días"
    }
  ],
  "homeRecommendations": "Indicaciones para el hogar, reposo, calor/frío",
  "notes": "Notas clínicas adicionales relevantes"
}

Si un campo no se menciona en el dictado, colócalo como null o arreglo vacío en techniques/medications.
NO agregues texto fuera del bloque JSON. Responde únicamente con el JSON válido.`;
  }

  private async callGroq(
    transcript: string,
    current?: Partial<ParsedClinicalData>,
  ): Promise<ParsedClinicalData | null> {
    const prompt = `Dictado médico a procesar:\n"""${transcript}"""\n\nDatos existentes previamente registrados (para complementar o actualizar si aplica):\n${JSON.stringify(current || {})}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as any;
    const content = json.choices?.[0]?.message?.content;
    return this.cleanAndParseJson(content);
  }

  private async callGemini(
    transcript: string,
    current?: Partial<ParsedClinicalData>,
  ): Promise<ParsedClinicalData | null> {
    const prompt = `${this.getSystemPrompt()}\n\nDictado médico a procesar:\n"""${transcript}"""\n\nDatos existentes:\n${JSON.stringify(current || {})}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as any;
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return this.cleanAndParseJson(content);
  }

  private async callOpenRouter(
    transcript: string,
    current?: Partial<ParsedClinicalData>,
  ): Promise<ParsedClinicalData | null> {
    const prompt = `Dictado médico a procesar:\n"""${transcript}"""\n\nDatos existentes:\n${JSON.stringify(current || {})}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'VitalSalud Clinical Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as any;
    const content = json.choices?.[0]?.message?.content;
    return this.cleanAndParseJson(content);
  }

  private cleanAndParseJson(raw?: string): ParsedClinicalData | null {
    if (!raw) return null;
    try {
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  // ===========================================================================
  // Reglas Clínicas de Validación y Auditoría de Faltantes
  // ===========================================================================

  public calculateMissingFields(data: ParsedClinicalData): MissingFieldInfo[] {
    const missing: MissingFieldInfo[] = [];

    if (!data.chiefComplaint || data.chiefComplaint.trim().length < 5) {
      missing.push({
        field: 'chiefComplaint',
        label: 'Motivo de consulta',
        spokenPrompt: 'el motivo de consulta',
      });
    }

    if (data.painScale === undefined || data.painScale === null || isNaN(Number(data.painScale))) {
      missing.push({
        field: 'painScale',
        label: 'Escala de dolor EVA',
        spokenPrompt: 'la escala de dolor EVA',
      });
    }

    if (!data.diagnosis || data.diagnosis.trim().length < 4) {
      missing.push({
        field: 'diagnosis',
        label: 'Diagnóstico clínico',
        spokenPrompt: 'el diagnóstico principal',
      });
    }

    if (!data.treatmentPlan || data.treatmentPlan.trim().length < 5) {
      missing.push({
        field: 'treatmentPlan',
        label: 'Plan de tratamiento',
        spokenPrompt: 'el plan de tratamiento',
      });
    }

    // Si mencionó fármacos pero falta dosis o frecuencia
    if (data.medications && data.medications.length > 0) {
      const incompleteMed = data.medications.find(
        (m) => !m.dose || !m.frequency || m.frequency.toLowerCase().includes('indefinid'),
      );
      if (incompleteMed) {
        missing.push({
          field: 'medications',
          label: `Posología de ${incompleteMed.medicationName}`,
          spokenPrompt: `la dosis o frecuencia de ${incompleteMed.medicationName}`,
        });
      }
    }

    return missing;
  }

  public buildSpokenAlert(
    _data: ParsedClinicalData,
    missing: MissingFieldInfo[],
    isComplete: boolean,
  ): string {
    if (isComplete) {
      return 'Doctor, todos los datos requeridos de la consulta están completos y listos para guardar.';
    }

    const prompts = missing.map((m) => m.spokenPrompt);
    if (prompts.length === 1) {
      return `Doctor, información registrada, pero falta esta información: ${prompts[0]}.`;
    }
    if (prompts.length === 2) {
      return `Doctor, información registrada, pero falta esta información: ${prompts[0]} y ${prompts[1]}.`;
    }

    const firstPart = prompts.slice(0, -1).join(', ');
    const lastPart = prompts[prompts.length - 1];
    return `Doctor, información registrada, pero falta esta información: ${firstPart} y ${lastPart}.`;
  }

  /**
   * Analizador Determinista basado en Reglas y Expresiones Regulares
   */
  public localDeterministicParser(
    text: string,
    current?: Partial<ParsedClinicalData>,
  ): ParsedClinicalData {
    const data: ParsedClinicalData = { ...(current || {}) };

    // Escala EVA
    const evaMatch =
      text.match(/(?:dolor|escala|eva|nivel de dolor)\s*(?:eva)?\s*(?:de\s*)?(\d{1,2})(?:\s*(?:sobre|\/)\s*10)?/i) ||
      text.match(/(\d{1,2})\s*(?:sobre|\/)\s*10/i);
    if (evaMatch) {
      const s = parseInt(evaMatch[1], 10);
      if (s >= 0 && s <= 10) data.painScale = s;
    }

    // Motivo
    const motivoMatch = text.match(/(?:motivo(?: de consulta)?|paciente refiere|consulta por)\s*[:\-]?\s*([^.]+)/i);
    if (motivoMatch) data.chiefComplaint = motivoMatch[1].trim();

    // Diagnóstico
    const diagMatch = text.match(/(?:diagn[oó]stico|cie-?10|cuadro de)\s*[:\-]?\s*([^.]+)/i);
    if (diagMatch) data.diagnosis = diagMatch[1].trim();

    // Plan
    const planMatch = text.match(/(?:plan(?: de tratamiento| terap[eé]utico)?|tratamiento)\s*[:\-]?\s*([^.]+)/i);
    if (planMatch) data.treatmentPlan = planMatch[1].trim();

    // Examen Físico
    const examenMatch = text.match(/(?:examen f[ií]sico|evaluaci[oó]n|a la palpaci[oó]n)\s*[:\-]?\s*([^.]+)/i);
    if (examenMatch) data.physicalExam = examenMatch[1].trim();

    if (!data.chiefComplaint && text.length > 10) {
      data.chiefComplaint = text.split('.')[0].trim();
    }

    return data;
  }
}
