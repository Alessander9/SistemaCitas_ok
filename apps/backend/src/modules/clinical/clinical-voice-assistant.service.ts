// apps/backend/src/modules/clinical/clinical-voice-assistant.service.ts
import { Injectable, Logger, Optional } from '@nestjs/common';
import { parseClinicalSpeechShared } from '@citassistema/shared-types';
import { DatabaseService } from '../../database/database.service';
import {
  ClinicalKnowledgeService,
  ClinicalAlertItem,
  Cie10Match,
  SuggestedSupplyItem,
} from './clinical-knowledge.service';

export type VoiceAssistantIntent =
  | 'AMBIENT_EXTRACT'
  | 'DICTATE_OR_CORRECT'
  | 'ASK_PATIENT_HISTORY'
  | 'ASK_CLINICAL_PROTOCOL'
  | 'APPLY_MACRO'
  | 'UNDO'
  | 'COMMAND_SAVE';

export interface VoiceProcessOptions {
  mode?: 'ambient' | 'active';
  clinicId?: string;
  patientId?: string;
  patientAllergies?: string;
  privacyMode?: boolean;
}

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
  mode: 'ambient' | 'active';
  wakeWordDetected: boolean;
  intent: VoiceAssistantIntent;
  shouldSpeak: boolean;
  clinicalAlerts: ClinicalAlertItem[];
  silentCie10?: Cie10Match | null;
  suggestedSupplies?: SuggestedSupplyItem[];
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

  constructor(
    private readonly db: DatabaseService,
    @Optional() private readonly knowledge?: ClinicalKnowledgeService,
  ) {}

  /**
   * Detecta la invocación por nombre configurado (por defecto "Chanfainita") con tolerancia fonética en español peruano.
   */
  public detectChanfainitaWakeWord(
    transcript: string,
    customAliases?: string[],
  ): { invoked: boolean; commandText: string } {
    const aliases =
      customAliases && customAliases.length > 0
        ? customAliases
        : ['chanfainita', 'chanfanita', 'chanfaina', 'chanfa'];
    const escaped = aliases
      .map((a) => a.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(Boolean)
      .join('|');
    const regex = new RegExp(`(?:^|[\\s,.;:!?])(?:(?:oye|hola|ey)\\s+)?(?:${escaped})\\b[\\s,.;:!?-]*`, 'i');
    const match = transcript.match(regex);
    if (!match) {
      return { invoked: false, commandText: transcript.trim() };
    }
    const afterWake = transcript.slice((match.index || 0) + match[0].length).trim();
    return { invoked: true, commandText: afterWake || transcript.trim() };
  }

  /**
   * Regla de Doble Canal: garantiza que el canal de voz NUNCA recite códigos CIE-10 ni siglas técnicas.
   */
  public stripTechnicalCodesForSpeech(text: string): string {
    return (text || '')
      .replace(/\b(?:CIE-?10\s*:?\s*)?[A-Z]\d{2}(?:\.\d{1,2})?\s*[-–:]?\s*/g, '')
      .replace(/\b(?:CMP|RNE|UUID|ID)\s*[:#]?\s*[\w-]+/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Procesa el audio del consultorio en modo Ambiental Silencioso o Bilateral Activo ("Chanfainita").
   * Cascada Multi-Proveedor: Groq -> Gemini -> OpenRouter -> Motor Determinista Local.
   */
  async processDictation(
    transcript: string,
    currentData?: Partial<ParsedClinicalData>,
    options?: VoiceProcessOptions,
  ): Promise<VoiceAssistantProcessResult> {
    const text = transcript.trim();
    const requestedMode = options?.mode || 'ambient';

    if (!text) {
      return {
        parsedData: currentData || {},
        missingFields: this.calculateMissingFields(currentData || {}),
        isComplete: false,
        spokenAlert: requestedMode === 'active' ? 'No escuché audio. ¿En qué te ayudo?' : '',
        providerUsed: 'Ninguno',
        rawTranscript: '',
        mode: requestedMode,
        wakeWordDetected: false,
        intent: 'AMBIENT_EXTRACT',
        shouldSpeak: false,
        clinicalAlerts: [],
      };
    }

    const voiceSettings = this.knowledge
      ? await this.knowledge.getVoiceSettings(options?.clinicId)
      : null;
    const wake = this.detectChanfainitaWakeWord(text, voiceSettings?.wakeAliases);
    const effectiveMode: 'ambient' | 'active' = wake.invoked || requestedMode === 'active' ? 'active' : 'ambient';
    const commandText = wake.invoked ? wake.commandText : text;
    const normCmd = commandText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const patientCtx = this.knowledge
      ? await this.knowledge.getPatientClinicalContext(
          options?.clinicId,
          options?.patientId,
          options?.patientAllergies,
        )
      : { allergies: options?.patientAllergies || 'Ninguna conocida', activeMedications: [] };

    // -------------------------------------------------------------------------
    // 1. Intenciones Bilaterales Directas (solo cuando Chanfainita fue invocada o modo activo)
    // -------------------------------------------------------------------------
    if (effectiveMode === 'active') {
      // 1A. Deshacer último cambio (Undo 1-paso)
      if (/\b(deshaz|deshacer|borra lo ultimo|revertir)\b/.test(normCmd)) {
        return {
          parsedData: currentData || {},
          missingFields: this.calculateMissingFields(currentData || {}),
          isComplete: this.calculateMissingFields(currentData || {}).length === 0,
          spokenAlert: 'Listo, deshice el último cambio en la ficha.',
          providerUsed: 'Chanfainita · Comando Rápido',
          rawTranscript: text,
          mode: 'active',
          wakeWordDetected: wake.invoked,
          intent: 'UNDO',
          shouldSpeak: !options?.privacyMode,
          clinicalAlerts: [],
        };
      }

      // 1B. Pregunta sobre historial / alergias / resumen del paciente (NO modifica la ficha)
      if (
        /\b(alergia|alergias|resumeme|resumen|sesion pasada|ultima sesion|como estuvo|como vino|historial|que toma|medicacion actual)\b/.test(
          normCmd,
        )
      ) {
        const parts: string[] = [];
        if (normCmd.includes('alergia')) {
          parts.push(
            patientCtx.allergies.toLowerCase().includes('ninguna')
              ? 'No registra alergias conocidas.'
              : `Registra alergia a ${patientCtx.allergies}.`,
          );
        } else {
          if (patientCtx.ageLabel) parts.push(`Paciente de ${patientCtx.ageLabel}.`);
          if (patientCtx.recentDiagnosis) {
            parts.push(`Último cuadro: ${this.stripTechnicalCodesForSpeech(patientCtx.recentDiagnosis)}.`);
          }
          if (patientCtx.lastEva !== undefined) {
            parts.push(
              patientCtx.previousEva !== undefined
                ? `Su dolor pasó de ${patientCtx.previousEva} a ${patientCtx.lastEva} sobre diez.`
                : `Su último dolor registrado fue de ${patientCtx.lastEva} sobre diez.`,
            );
          }
          parts.push(
            patientCtx.allergies.toLowerCase().includes('ninguna')
              ? 'Sin alergias registradas.'
              : `Atención: alergia a ${patientCtx.allergies}.`,
          );
        }

        const spoken = this.stripTechnicalCodesForSpeech(parts.join(' '));
        return {
          parsedData: currentData || {},
          missingFields: this.calculateMissingFields(currentData || {}),
          isComplete: this.calculateMissingFields(currentData || {}).length === 0,
          spokenAlert: spoken,
          providerUsed: 'Chanfainita · Contexto Vivo del Paciente',
          rawTranscript: text,
          mode: 'active',
          wakeWordDetected: wake.invoked,
          intent: 'ASK_PATIENT_HISTORY',
          shouldSpeak: !options?.privacyMode,
          clinicalAlerts: [],
        };
      }

      // 1C. Consulta de Protocolo Clínico de la sede (NO modifica la ficha)
      if (/\b(protocolo|que ejercicios|que indicamos|que recomendamos|guia clinica)\b/.test(normCmd)) {
        const proto = this.knowledge ? await this.knowledge.findProtocol(commandText, options?.clinicId) : null;
        const spoken = proto
          ? `Para ${proto.pathology.toLowerCase()} recomendamos ${proto.recommendedTechniques.slice(0, 2).join(' y ')}. Para casa: ${proto.homeExercises}`
          : 'No encontré un protocolo específico para esa consulta en la base de la clínica.';
        return {
          parsedData: currentData || {},
          missingFields: this.calculateMissingFields(currentData || {}),
          isComplete: this.calculateMissingFields(currentData || {}).length === 0,
          spokenAlert: this.stripTechnicalCodesForSpeech(spoken),
          providerUsed: 'Chanfainita · Protocolos Clínicos',
          rawTranscript: text,
          mode: 'active',
          wakeWordDetected: wake.invoked,
          intent: 'ASK_CLINICAL_PROTOCOL',
          shouldSpeak: !options?.privacyMode,
          clinicalAlerts: [],
        };
      }

      // 1D. Macro Clínica por Voz (Plantillas de Control Rápido)
      if (this.knowledge) {
        const macro = await this.knowledge.findVoiceMacro(commandText, options?.clinicId);
        if (macro) {
          const merged: ParsedClinicalData = { ...(currentData || {}), ...macro.templateData };
          const missing = this.calculateMissingFields(merged);
          return {
            parsedData: merged,
            missingFields: missing,
            isComplete: missing.length === 0,
            spokenAlert: `Apliqué la plantilla de ${macro.title.toLowerCase()}. ¿Deseas ajustar el nivel de dolor o algún dato de hoy?`,
            providerUsed: 'Chanfainita · Macro Clínica',
            rawTranscript: text,
            mode: 'active',
            wakeWordDetected: wake.invoked,
            intent: 'APPLY_MACRO',
            shouldSpeak: !options?.privacyMode,
            clinicalAlerts: [],
          };
        }
      }

      // 1E. Comando de Cierre / Revisión de Faltantes
      if (/\b(que falta|falta algo|cerrar ficha|guarda la ficha|guardar ficha|esta completa)\b/.test(normCmd)) {
        const missing = this.calculateMissingFields(currentData || {});
        const isComplete = missing.length === 0;
        const spoken = isComplete
          ? 'La ficha está completa y lista. Cuando gustes confirma para guardarla.'
          : this.buildSpokenAlert(currentData || {}, missing, false);
        return {
          parsedData: currentData || {},
          missingFields: missing,
          isComplete,
          spokenAlert: this.stripTechnicalCodesForSpeech(spoken),
          providerUsed: 'Chanfainita · Verificador de Ficha',
          rawTranscript: text,
          mode: 'active',
          wakeWordDetected: wake.invoked,
          intent: 'COMMAND_SAVE',
          shouldSpeak: !options?.privacyMode,
          clinicalAlerts: [],
        };
      }
    }

    // -------------------------------------------------------------------------
    // 2. Extracción Clínica (Cascada Multi-Proveedor -> Fallback Local)
    // -------------------------------------------------------------------------
    let parsed: ParsedClinicalData | null = null;
    let providerUsed = '';

    if (process.env.GROQ_API_KEY && !parsed) {
      try {
        parsed = await this.callGroq(commandText, currentData);
        if (parsed) providerUsed = 'Groq LPU (GPT-OSS-120B)';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Groq falló, pasando al siguiente proveedor: ${msg}`);
      }
    }

    if (process.env.GEMINI_API_KEY && !parsed) {
      try {
        parsed = await this.callGemini(commandText, currentData);
        if (parsed) providerUsed = 'Google Gemini (Flash)';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Gemini falló, pasando al siguiente proveedor: ${msg}`);
      }
    }

    if (process.env.OPENROUTER_API_KEY && !parsed) {
      try {
        parsed = await this.callOpenRouter(commandText, currentData);
        if (parsed) providerUsed = 'OpenRouter AI';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`OpenRouter falló, pasando al fallback local: ${msg}`);
      }
    }

    if (!parsed) {
      parsed = this.localDeterministicParser(commandText, currentData);
      providerUsed = 'Chanfainita · Motor Clínico Local';
    }

    // -------------------------------------------------------------------------
    // 3. Codificación CIE-10 Silenciosa (Solo en pantalla/BD, NUNCA por voz)
    // -------------------------------------------------------------------------
    let silentCie10: Cie10Match | null = null;
    if (this.knowledge) {
      const diagSource = [parsed.diagnosis, parsed.chiefComplaint, commandText].filter(Boolean).join(' ');
      silentCie10 = await this.knowledge.matchCie10(diagSource);
      if (silentCie10 && (!parsed.diagnosis || !/^[A-Z]\d{2}/.test(parsed.diagnosis))) {
        parsed.diagnosis = `${silentCie10.code} - ${silentCie10.displayName}`;
      }
    }

    // -------------------------------------------------------------------------
    // 4. Guardrails Deterministas: Alergias, Banderas Rojas e Insumos Kardex
    // -------------------------------------------------------------------------
    const clinicalAlerts: ClinicalAlertItem[] = [];
    let suggestedSupplies: SuggestedSupplyItem[] = [];
    if (this.knowledge) {
      const allergyAlerts = await this.knowledge.checkAllergyConflicts(
        patientCtx.allergies,
        parsed.medications || [],
        commandText,
      );
      const redFlagAlerts = await this.knowledge.detectRedFlags(commandText);
      clinicalAlerts.push(...allergyAlerts, ...redFlagAlerts);

      if (clinicalAlerts.length > 0) {
        this.knowledge
          .logClinicalAlerts(options?.clinicId, options?.patientId, clinicalAlerts, text)
          .catch(() => null);
      }

      suggestedSupplies = await this.knowledge.detectMentionedSupplies(text, options?.clinicId);
    }

    // -------------------------------------------------------------------------
    // 5. Salida Dual (Silencio total en modo ambiental; Voz Humana si invocada)
    // -------------------------------------------------------------------------
    const missingFields = this.calculateMissingFields(parsed);
    const isComplete = missingFields.length === 0;

    let spokenAlert = '';
    const shouldSpeak = effectiveMode === 'active' && !options?.privacyMode;

    if (effectiveMode === 'active') {
      if (clinicalAlerts.length > 0) {
        spokenAlert = this.stripTechnicalCodesForSpeech(clinicalAlerts[0].spokenWarning);
      } else if (/\b(apunta|anota|corrige|cambia)\b/.test(normCmd)) {
        const cleanDiag = silentCie10
          ? silentCie10.displayName.toLowerCase()
          : parsed.diagnosis
            ? this.stripTechnicalCodesForSpeech(parsed.diagnosis).toLowerCase()
            : '';
        const painPart = parsed.painScale !== undefined ? ` con dolor de ${parsed.painScale}` : '';
        spokenAlert = cleanDiag
          ? `Anotado como ${cleanDiag}${painPart}.`
          : `Anotado${painPart}.`;
      } else {
        spokenAlert = this.stripTechnicalCodesForSpeech(
          this.buildSpokenAlert(parsed, missingFields, isComplete),
        );
      }
    }

    return {
      parsedData: parsed,
      missingFields,
      isComplete,
      spokenAlert,
      providerUsed,
      rawTranscript: text,
      mode: effectiveMode,
      wakeWordDetected: wake.invoked,
      intent: effectiveMode === 'active' ? 'DICTATE_OR_CORRECT' : 'AMBIENT_EXTRACT',
      shouldSpeak,
      clinicalAlerts,
      silentCie10,
      suggestedSupplies,
    };
  }

  /**
   * FASE 3: Transcripción de audio médico de alta precisión con Groq Whisper (español peruano).
   */
  async transcribeAudioWithGroq(
    audioBase64: string,
    mimeType = 'audio/webm',
  ): Promise<{ transcript: string; provider: string }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no configurada en el servidor. Use el dictado nativo del navegador.');
    }

    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('wav') ? 'wav' : 'webm';

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: mimeType }), `consulta.${ext}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');
    formData.append(
      'prompt',
      'Consulta médica y de fisioterapia en Perú. Términos frecuentes: Chanfainita, lumbalgia, ciática, EVA, paravertebrales, Lasègue, punción seca, kinesiotape, ultrasonido, TENS, Ibuprofeno, Paracetamol, Celecoxib.',
    );

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Groq Whisper HTTP ${response.status}: ${errText.slice(0, 120)}`);
    }

    const data = (await response.json()) as { text?: string };
    return {
      transcript: (data.text || '').trim(),
      provider: 'Groq Whisper Large v3 Turbo',
    };
  }

  /**
   * FASE 3: Briefing Rápido Bajo Demanda (visual 3 líneas + audio de 10s solo cuando el médico lo pide).
   */
  async getPatientBriefing(
    clinicId: string,
    patientId: string,
    fallback?: { patientName?: string; allergies?: string; diagnosis?: string; evaLast?: number; sessionLabel?: string },
  ): Promise<{
    lines: string[];
    spokenBriefing: string;
    allergies: string;
  }> {
    const ctx = this.knowledge
      ? await this.knowledge.getPatientClinicalContext(clinicId, patientId, fallback?.allergies)
      : { allergies: fallback?.allergies || 'Ninguna conocida', activeMedications: [] };

    const cleanDiag = this.stripTechnicalCodesForSpeech(
      ctx.recentDiagnosis || fallback?.diagnosis || 'Evaluación de rehabilitación activa',
    );
    const evaText =
      ctx.lastEva !== undefined && ctx.previousEva !== undefined
        ? `Dolor bajó de ${ctx.previousEva} a ${ctx.lastEva} sobre 10`
        : ctx.lastEva !== undefined
          ? `Último dolor EVA registrado: ${ctx.lastEva}/10`
          : fallback?.evaLast !== undefined
            ? `Último dolor EVA registrado: ${fallback.evaLast}/10`
            : 'Sin registro previo de dolor EVA';

    const allergyLine =
      ctx.allergies && !ctx.allergies.toLowerCase().includes('ninguna')
        ? `⚠️ Alergias: ${ctx.allergies}`
        : 'Alergias: Ninguna registrada';

    const lines = [
      `Cuadro activo: ${cleanDiag}${fallback?.sessionLabel ? ` (${fallback.sessionLabel})` : ''}`,
      evaText,
      allergyLine,
    ];

    const namePart = fallback?.patientName ? `para ${fallback.patientName}` : 'del paciente';
    const spokenBriefing = this.stripTechnicalCodesForSpeech(
      `Resumen rápido ${namePart}: ${cleanDiag}. ${evaText}. ${
        ctx.allergies && !ctx.allergies.toLowerCase().includes('ninguna')
          ? `Importante, registra alergia a ${ctx.allergies}.`
          : 'No registra alergias conocidas.'
      }`,
    );

    return {
      lines,
      spokenBriefing,
      allergies: ctx.allergies,
    };
  }

  /**
   * FASE 3: Traductor a "Lenguaje de Paciente" Post-Consulta (listo para WhatsApp y Portal del Paciente).
   */
  async generatePatientSummary(
    clinicalData: ParsedClinicalData,
    patientName = 'estimado paciente',
  ): Promise<{ whatsappMessage: string; portalSummary: string; provider: string }> {
    const cleanDiag = this.stripTechnicalCodesForSpeech(
      clinicalData.diagnosis || clinicalData.chiefComplaint || 'su evaluación clínica de hoy',
    );
    const medsList = (clinicalData.medications || [])
      .filter((m) => m.medicationName?.trim())
      .map(
        (m) =>
          `• ${m.medicationName}: tomar ${m.dose || 'la dosis indicada'} ${m.frequency || ''} ${m.duration || ''}`.trim(),
      );
    const techniquesList = (clinicalData.techniques || []).filter(Boolean);
    const homeCare =
      clinicalData.homeRecommendations ||
      clinicalData.treatmentPlan ||
      'Mantener reposo relativo, hidratación y seguir los ejercicios suaves indicados en consulta.';

    // Intento con LLM (anonimizado) si hay Groq API key; fallback determinista ultra claro
    if (process.env.GROQ_API_KEY) {
      try {
        const prompt = `Redacta un mensaje breve, cálido y 100% entendible para un paciente en Perú (para enviar por WhatsApp) resumiendo su consulta de hoy.
REGLAS ESTRICTAS:
- NO incluyas códigos CIE-10 ni jerga médica difícil.
- Usa viñetas cortas: Qué encontramos, Qué hicimos hoy, Medicación (si hay), Cuidados en casa y Señales para avisarnos.
- Máximo 120 palabras.

DATOS ANONIMIZADOS:
Diagnóstico limpio: ${cleanDiag}
Dolor reportado: ${clinicalData.painScale ?? 'no registrado'}/10
Técnicas aplicadas: ${techniquesList.join(', ') || 'Evaluación clínica'}
Medicamentos: ${medsList.join(' | ') || 'Sin medicamentos'}
Indicaciones: ${homeCare}`;

        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 320,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (resp.ok) {
          const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const text = json.choices?.[0]?.message?.content?.trim();
          if (text) {
            const personalized = `Hola ${patientName} 👋\n\n${this.stripTechnicalCodesForSpeech(text)}`;
            return {
              whatsappMessage: personalized,
              portalSummary: this.stripTechnicalCodesForSpeech(text),
              provider: 'Chanfainita · Traductor Clínico IA',
            };
          }
        }
      } catch {
        // Fallback determinista
      }
    }

    const lines: string[] = [
      `Hola ${patientName} 👋, aquí tienes el resumen claro de tu consulta de hoy:`,
      '',
      `🩺 *Qué evaluamos:* ${cleanDiag}.`,
    ];

    if (techniquesList.length > 0) {
      lines.push(`💆 *Qué trabajamos en sesión:* ${techniquesList.join(', ')}.`);
    }
    if (medsList.length > 0) {
      lines.push(`💊 *Tu medicación:*`);
      lines.push(...medsList);
    }
    lines.push(`🏠 *Cuidados en casa:* ${this.stripTechnicalCodesForSpeech(homeCare)}`);
    lines.push(
      `⚠️ *Avísanos de inmediato* si el dolor empeora bruscamente, sientes hormigueo intenso o pérdida de fuerza.`,
    );
    lines.push('', '¡Seguimos acompañando tu recuperación! 💙');

    const whatsappMessage = lines.join('\n');
    return {
      whatsappMessage,
      portalSummary: whatsappMessage.replace(/\*/g, ''),
      provider: 'Chanfainita · Traductor Clínico Local',
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

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
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

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
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

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
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
   * Analizador Determinista compartido (fuente única de verdad en @citassistema/shared-types)
   */
  public localDeterministicParser(
    text: string,
    current?: Partial<ParsedClinicalData>,
  ): ParsedClinicalData {
    return parseClinicalSpeechShared(text, current);
  }
}
