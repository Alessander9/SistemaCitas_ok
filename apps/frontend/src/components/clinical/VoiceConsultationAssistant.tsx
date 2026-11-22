import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import './VoiceConsultationAssistant.css';
import {
  processVoiceDictation,
  saveVoiceConsultation,
  ParsedClinicalVoiceData,
  MissingFieldInfo,
} from '../../services/api';

export type { ParsedClinicalVoiceData };

interface VoiceConsultationAssistantProps {
  onApplyVoiceData: (data: ParsedClinicalVoiceData) => void;
  onConsultationSaved?: (result: { recordId: string; prescriptionId?: string }) => void;
  isOpenInitial?: boolean;
  activeContext?: 'consultation' | 'quick-note';
  patientId?: string;
  professionalId?: string;
  appointmentId?: string;
  currentData?: Partial<ParsedClinicalVoiceData>;
}

const AVAILABLE_TECHNIQUES = [
  'Terapia Manual Ortopédica',
  'Terapia Manual',
  'Electroterapia (TENS / EMS)',
  'Electroterapia TENS',
  'Ultrasonido Terapéutico',
  'Ultrasonido',
  'Punción Seca',
  'Termoterapia / Crioterapia',
  'Termoterapia',
  'Crioterapia',
  'Ejercicio Terapéutico Funcional',
  'Ejercicios Terapéuticos',
  'Liberación Miofascial',
  'Magnetoterapia',
  'Kinesiotape',
];

const PRESET_SAMPLE_DICTATIONS = [
  {
    title: 'Consulta Completa: Lumbalgia Mecánica',
    text: 'Motivo de consulta: Dolor lumbar agudo irradiado a glúteo derecho tras levantar peso. Anamnesis: Paciente refiere inicio hace 4 días con molestia punzante al sentarse. Examen físico: Maniobra de Lasègue negativa, contractura paravertebral L4-L5. Escala de dolor EVA 7 sobre 10. Diagnóstico: Lumbalgia mecánica aguda con contractura muscular. Plan de tratamiento: 10 sesiones de fisioterapia y kinesiología. Técnicas aplicadas: Terapia Manual, Ultrasonido y Electroterapia TENS. Recetar: Celecoxib 200mg, una cápsula cada 12 horas por 5 días. Recomendaciones: Aplicar compresas tibias y reposo de cargas.',
  },
  {
    title: 'Sesión de Terapia: Hombro Doloroso',
    text: 'Motivo: Tendinitis de manguito rotador hombro derecho. Examen: Dolor a la abducción mayor a 90 grados. Dolor al ingresar EVA 8, dolor al salir EVA 3. Técnicas: Ultrasonido, Punción Seca y Ejercicio Terapéutico Funcional. Observaciones: Gran mejoría en rango de movilidad articular. Recetar: Paracetamol 500mg cada 8 horas por 3 días.',
  },
  {
    title: 'Readaptación Deportiva: Esguince Tobillo',
    text: 'Motivo: Esguince grado 2 ligamento peroneoastragalino. Escala de dolor EVA 4. Diagnóstico: Esguince de tobillo en fase de readaptación. Plan: 6 sesiones de propiocepción. Técnicas: Crioterapia, Kinesiotape y Liberación Miofascial. Recomendaciones: Ejercicios de apoyo monopodal 10 minutos al día.',
  },
  {
    title: 'Consulta Incompleta (Prueba de Alerta Verbal)',
    text: 'Motivo de consulta: Paciente presenta dolor cervical intenso tras accidente leve. Dolor EVA 9 sobre 10.',
  },
];

export const parseClinicalSpeech = (rawText: string): ParsedClinicalVoiceData => {
  const data: ParsedClinicalVoiceData = {};
  const text = rawText.trim();
  if (!text) return data;

  // 1. Escala EVA / Dolor
  const evaMatch =
    text.match(/(?:dolor|escala|eva|nivel de dolor)\s*(?:eva)?\s*(?:de\s*)?(\d{1,2})(?:\s*(?:sobre|\/)\s*10)?/i) ||
    text.match(/(\d{1,2})\s*(?:sobre|\/)\s*10/i);
  if (evaMatch) {
    const score = parseInt(evaMatch[1], 10);
    if (score >= 0 && score <= 10) {
      data.painScale = score;
    }
  }

  const evaBeforeMatch = text.match(/(?:dolor|eva)\s*(?:al ingresar|antes|inicial)\s*(?:es\s*de\s*)?(\d{1,2})/i);
  if (evaBeforeMatch) {
    const s = parseInt(evaBeforeMatch[1], 10);
    if (s >= 0 && s <= 10) data.painBefore = s;
  }

  const evaAfterMatch = text.match(/(?:dolor|eva)\s*(?:al salir|despu[eé]s|final)\s*(?:es\s*de\s*)?(\d{1,2})/i);
  if (evaAfterMatch) {
    const s = parseInt(evaAfterMatch[1], 10);
    if (s >= 0 && s <= 10) data.painAfter = s;
  }

  // 2. Definición de secciones clínicas
  const sectionDefs: Array<{
    key: string;
    patterns: RegExp[];
  }> = [
    { key: 'chiefComplaint', patterns: [/\bmotivo(?: de consulta)?\s*[:\-]/i, /\bpaciente (?:viene por|refiere)\s*[:\-]?/i] },
    { key: 'painScaleText', patterns: [/\b(?:escala de dolor|dolor eva|escala eva)\s*[:\-]?/i] },
    { key: 'anamnesis', patterns: [/\banamnesis\s*[:\-]/i, /\benfermedad actual\s*[:\-]/i, /\bhistoria cl[ií]nica\s*[:\-]/i] },
    { key: 'physicalExam', patterns: [/\bexamen f[ií]sico\s*[:\-]/i, /\bevaluaci[oó]n f[ií]sica\s*[:\-]/i, /\ba la palpaci[oó]n\s*[:\-]?/i] },
    { key: 'diagnosis', patterns: [/\bdiagn[oó]stico\s*[:\-]/i, /\bcie-?10\s*[:\-]/i] },
    { key: 'treatmentPlan', patterns: [/\bplan(?: de tratamiento| terap[eé]utico| m[eé]dico)?\s*[:\-]/i] },
    { key: 'notes', patterns: [/\bobservaciones\s*[:\-]/i, /\bnotas(?: de evoluci[oó]n)?\s*[:\-]/i, /\bevoluci[oó]n\s*[:\-]/i] },
    { key: 'homeRecommendations', patterns: [/\brecomendaciones\s*[:\-]/i, /\bindicaciones(?: para la casa| para el hogar)?\s*[:\-]/i] },
    { key: 'techniques', patterns: [/\bt[eé]cnicas(?: aplicadas)?\s*[:\-]/i, /\bprocedimientos\s*[:\-]/i] },
    { key: 'medications', patterns: [/\brecetar\s*[:\-]/i, /\breceta(?: m[eé]dica)?\s*[:\-]/i, /\bmedicamentos?\s*[:\-]/i, /\bprescripci[oó]n\s*[:\-]/i] },
  ];

  interface HeaderOccurrence {
    key: string;
    startIndex: number;
    headerLength: number;
  }

  const occurrences: HeaderOccurrence[] = [];

  sectionDefs.forEach((def) => {
    def.patterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        occurrences.push({
          key: def.key,
          startIndex: match.index,
          headerLength: match[0].length,
        });
      }
    });
  });

  occurrences.sort((a, b) => a.startIndex - b.startIndex);

  for (let i = 0; i < occurrences.length; i++) {
    const current = occurrences[i];
    const contentStart = current.startIndex + current.headerLength;
    const contentEnd = i + 1 < occurrences.length ? occurrences[i + 1].startIndex : text.length;
    const content = text.slice(contentStart, contentEnd).trim().replace(/[.,;]+$/, '');

    if (content) {
      if (current.key === 'medications') {
        const meds: Array<{ medicationName: string; dose: string; route: string; frequency: string; duration: string }> = [];
        const items = content.split(/;|\ny|\. /);
        items.forEach((item) => {
          const cleanItem = item.trim();
          if (!cleanItem) return;

          const freqMatch = cleanItem.match(/(cada\s*\d+\s*(?:horas|h|d[ií]as)|en ayunas|antes de dormir|cada ma[nñ]ana)/i);
          const durMatch = cleanItem.match(/(por\s*\d+\s*(?:d[ií]as|semanas|meses))/i);
          const doseMatch = cleanItem.match(/(\b(?:1|2|3|\d+)\s*(?:c[aá]psulas?|tabletas?|comprimidos?|gotas?|ampollas?|sobres?)|(?:\d+\s*(?:mg|g|ml|mcg|ui)))/i);

          let drugName = cleanItem;
          if (freqMatch && freqMatch.index !== undefined) {
            drugName = drugName.slice(0, freqMatch.index);
          }
          if (durMatch && durMatch.index !== undefined && durMatch.index < drugName.length) {
            drugName = drugName.slice(0, durMatch.index);
          }
          drugName = drugName.replace(/[,;]+$/, '').trim();

          if (drugName.length > 2) {
            meds.push({
              medicationName: drugName,
              dose: doseMatch ? doseMatch[1].trim() : '1 cápsula',
              route: cleanItem.toLowerCase().includes('t[oó]pico') ? 'Tópica' : cleanItem.toLowerCase().includes('inyectable') ? 'Intramuscular' : 'Oral',
              frequency: freqMatch ? freqMatch[1].trim() : 'Cada 8 horas',
              duration: durMatch ? durMatch[1].trim() : 'Por 5 días',
            });
          }
        });
        if (meds.length > 0) {
          data.medications = meds;
        }
      } else if (current.key !== 'techniques' && current.key !== 'painScaleText') {
        (data as any)[current.key] = content;
      }
    }
  }

  // 3. Detección Inteligente de Técnicas Clínicas
  const matchedTechniques: string[] = [];
  AVAILABLE_TECHNIQUES.forEach((tech) => {
    const simpleTech = tech.toLowerCase().replace(/[()]/g, '');
    if (text.toLowerCase().includes(simpleTech) || (tech === 'Terapia Manual Ortopédica' && text.toLowerCase().includes('terapia manual'))) {
      const canonical = tech.includes('TENS')
        ? 'Electroterapia (TENS / EMS)'
        : tech.includes('Ultrasonido')
        ? 'Ultrasonido Terapéutico'
        : tech.includes('Ejercicio')
        ? 'Ejercicio Terapéutico Funcional'
        : tech.includes('Termoterapia') || tech.includes('Crioterapia')
        ? 'Termoterapia / Crioterapia'
        : tech === 'Terapia Manual'
        ? 'Terapia Manual Ortopédica'
        : tech;
      if (!matchedTechniques.includes(canonical)) {
        matchedTechniques.push(canonical);
      }
    }
  });
  if (matchedTechniques.length > 0) {
    data.techniques = matchedTechniques;
  }

  if (!data.chiefComplaint && !data.anamnesis && !data.diagnosis && text.length > 5) {
    data.chiefComplaint = text;
    data.notes = text;
  }

  return data;
};

export const VoiceConsultationAssistant: React.FC<VoiceConsultationAssistantProps> = ({
  onApplyVoiceData,
  onConsultationSaved,
  isOpenInitial = false,
  activeContext = 'consultation',
  patientId,
  professionalId,
  appointmentId,
  currentData,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [detectedSlots, setDetectedSlots] = useState<string[]>([]);
  const [showSamples, setShowSamples] = useState(false);
  const [autoApplyRealTime, setAutoApplyRealTime] = useState(true);
  const [micSupported, setMicSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Estados del Asistente Bidireccional por Voz & Altavoz
  const [speakerEnabled, setSpeakerEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<MissingFieldInfo[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  // ---------------------------------------------------------------------------
  // ALTAVOZ / TEXT-TO-SPEECH (TTS) - Emisión de Voz Clara en Español
  // ---------------------------------------------------------------------------
  const speakAlert = useCallback(
    (text: string) => {
      setLastSpokenMessage(text);
      if (!speakerEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        utterance.rate = 1.05; // Ritmo clínico natural y comprensible
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const spanishVoice =
          voices.find((v) => v.lang.includes('es-PE')) ||
          voices.find((v) => v.lang.includes('es-ES')) ||
          voices.find((v) => v.lang.startsWith('es-')) ||
          voices.find((v) => v.lang.startsWith('es'));

        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
      }
    },
    [speakerEnabled],
  );

  // Cargar lista de voces del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // PROCESAMIENTO IA (Groq LPU -> Gemini -> OpenRouter -> Local)
  // ---------------------------------------------------------------------------
  const runAiAnalysis = useCallback(
    async (textToProcess: string) => {
      const clean = textToProcess.trim();
      if (!clean || clean.length < 5) return;
      setIsProcessingAi(true);

      try {
        const result = await processVoiceDictation(clean, currentData);
        setAiProvider(result.providerUsed);
        setMissingFields(result.missingFields || []);
        setIsComplete(result.isComplete);

        // Actualizar ficha médica
        onApplyVoiceData(result.parsedData);

        // Hablar por el altavoz (avisa faltantes o completitud)
        if (result.spokenAlert) {
          speakAlert(result.spokenAlert);
        }
      } catch (err: any) {
        console.warn('Fallo en API de IA, ejecutando analizador determinista local:', err);
        const localParsed = parseClinicalSpeech(clean);
        onApplyVoiceData(localParsed);
        setAiProvider('Motor Local Inteligente');

        // Auditoría clínica local
        const missing: MissingFieldInfo[] = [];
        if (!localParsed.chiefComplaint) {
          missing.push({ field: 'chiefComplaint', label: 'Motivo de consulta', spokenPrompt: 'el motivo de consulta' });
        }
        if (localParsed.painScale === undefined) {
          missing.push({ field: 'painScale', label: 'Escala EVA (0-10)', spokenPrompt: 'la escala de dolor EVA' });
        }
        if (!localParsed.diagnosis) {
          missing.push({ field: 'diagnosis', label: 'Diagnóstico', spokenPrompt: 'el diagnóstico clínico' });
        }
        if (!localParsed.treatmentPlan) {
          missing.push({ field: 'treatmentPlan', label: 'Plan de tratamiento', spokenPrompt: 'el plan de tratamiento' });
        }

        setMissingFields(missing);
        const complete = missing.length === 0;
        setIsComplete(complete);

        if (complete) {
          speakAlert('Doctor, todos los datos requeridos de la consulta están completos y listos para guardar.');
        } else {
          const prompts = missing.map((m) => m.spokenPrompt).join(', ');
          speakAlert(`Doctor, información registrada, pero falta esta información: ${prompts}.`);
        }
      } finally {
        setIsProcessingAi(false);
      }
    },
    [currentData, onApplyVoiceData, speakAlert],
  );

  // ---------------------------------------------------------------------------
  // GUARDAR EN BASE DE DATOS (PostgreSQL: medical_records & prescriptions)
  // ---------------------------------------------------------------------------
  const handleSaveConsultation = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const fullText = (latestTranscriptRef.current || transcript || '').trim();
      const localData = fullText ? parseClinicalSpeech(fullText) : {};
      const mergedData = { ...(currentData || {}), ...localData };

      const res = await saveVoiceConsultation({
        patientId: patientId || '20175da2-1cfe-4934-829b-9e32de9f06d9',
        professionalId,
        appointmentId,
        clinicalData: mergedData,
      });

      setSaveSuccess(true);
      const confirmationText =
        res.spokenConfirmation || 'Información guardada exitosamente en la base de datos de la clínica.';
      speakAlert(confirmationText);

      onConsultationSaved?.({
        recordId: res.recordId,
        prescriptionId: res.prescriptionId,
      });

      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error al guardar consulta:', err);
      setSaveError(err.message || 'Error al persistir en base de datos');
      speakAlert('Doctor, ocurrió un inconveniente al guardar la información en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    transcript,
    currentData,
    patientId,
    professionalId,
    appointmentId,
    speakAlert,
    onConsultationSaved,
  ]);

  // ---------------------------------------------------------------------------
  // Inicializar Web Speech API (Dictado por Micrófono)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-PE';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }

        const fullCurrentText = (finalStr + interimStr).trim();
        latestTranscriptRef.current = fullCurrentText;
        setTranscript(finalStr);
        setInterimTranscript(interimStr);

        // Comando de voz: si el médico dice "guardar consulta" o "guardar en base de datos"
        const lower = fullCurrentText.toLowerCase();
        if (
          lower.includes('guardar consulta') ||
          lower.includes('guardar en base de datos') ||
          lower.includes('guardar historia')
        ) {
          handleSaveConsultation();
          return;
        }

        // Extracción de slots en tiempo real para visualización inmediata
        if (fullCurrentText.length > 3) {
          const parsed = parseClinicalSpeech(fullCurrentText);
          const slots: string[] = [];
          if (parsed.chiefComplaint) slots.push('Motivo');
          if (parsed.anamnesis) slots.push('Anamnesis');
          if (parsed.physicalExam) slots.push('Examen Físico');
          if (parsed.painScale !== undefined) slots.push(`EVA ${parsed.painScale}/10`);
          if (parsed.diagnosis) slots.push('Diagnóstico');
          if (parsed.treatmentPlan) slots.push('Plan');
          if (parsed.techniques && parsed.techniques.length > 0) slots.push(`${parsed.techniques.length} Técnicas`);
          if (parsed.medications && parsed.medications.length > 0) slots.push(`${parsed.medications.length} Medicamento(s)`);
          if (parsed.homeRecommendations) slots.push('Indicaciones');

          setDetectedSlots(slots);

          if (autoApplyRealTime) {
            onApplyVoiceData(parsed);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permiso de micrófono denegado. Puedes usar los dictados clínicos de muestra.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Aviso de voz: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Cuando el médico termina de hablar, correr auditoría IA completa
        const full = latestTranscriptRef.current.trim();
        if (full.length > 10) {
          runAiAnalysis(full);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Error instantiating SpeechRecognition:', e);
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [autoApplyRealTime, handleSaveConsultation, onApplyVoiceData, runAiAnalysis]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setIsOpen(true);
      setShowSamples(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      setIsListening(false);
      const textToAnalyze = latestTranscriptRef.current.trim();
      if (textToAnalyze.length > 8) {
        runAiAnalysis(textToAnalyze);
      }
    } else {
      setIsOpen(true);
      try {
        recognitionRef.current.start();
        setSpeechError(null);
      } catch (err) {
        console.error('Could not start recognition:', err);
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        } catch {
          // ignore
        }
      }
    }
  }, [isListening, runAiAnalysis]);

  const handleApplyPreset = (text: string) => {
    setTranscript(text);
    setInterimTranscript('');
    latestTranscriptRef.current = text;
    runAiAnalysis(text);
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    setDetectedSlots([]);
    setMissingFields([]);
    setIsComplete(false);
    setLastSpokenMessage(null);
  };

  return (
    <>
      {/* Botón Flotante Principal de Voz (FAB Mobile / Desktop) */}
      <div className="voice-fab-container" role="region" aria-label="Asistente de Voz Médico">
        {!isOpen && !isListening && (
          <div
            className="voice-hint-bubble"
            onClick={() => setIsOpen(true)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MaterialIcon name="mic" size={18} />
            <span>Asistente Clínico por Voz</span>
          </div>
        )}

        <button
          type="button"
          className={`voice-fab-btn ${isListening ? 'is-listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Detener dictado y procesar' : 'Iniciar asistente clínico por voz'}
          aria-label="Botón de dictado por voz"
        >
          {isListening ? (
            <span style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcon name="stop" size={26} />
            </span>
          ) : (
            <span style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcon name="mic" size={26} />
            </span>
          )}

          {isListening && <span className="voice-fab-badge">REC</span>}
        </button>
      </div>

      {/* Panel Docked de Voz en Tiempo Real */}
      {isOpen && (
        <div className="voice-live-panel">
          {/* Header */}
          <div className="voice-panel-header">
            <div className="voice-panel-title">
              <MaterialIcon name="mic" size={20} color="#0284c7" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>{activeContext === 'quick-note' ? 'Notas Rápidas por Voz' : 'Asistente Clínico Inteligente'}</span>
                  <span className={`voice-status-pill ${isListening ? 'listening' : 'idle'}`}>
                    {isListening ? '● Escuchando...' : 'En Espera'}
                  </span>
                  {aiProvider && (
                    <span className="voice-provider-badge" title="Motor de IA activo">
                      <MaterialIcon name="psychology" size={12} color="#0284c7" />
                      {aiProvider}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Toggle de Altavoz */}
              <button
                type="button"
                className={`voice-speaker-btn ${!speakerEnabled ? 'muted' : ''}`}
                onClick={() => setSpeakerEnabled(!speakerEnabled)}
                title={speakerEnabled ? 'Altavoz activado (haga clic para silenciar)' : 'Altavoz silenciado (haga clic para activar)'}
              >
                <MaterialIcon name={speakerEnabled ? 'volume_up' : 'volume_off'} size={18} />
              </button>

              {isListening && (
                <div className="voice-wave-bars">
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Minimizar asistente"
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>
          </div>

          {/* Barra de Emisión Verbal del Altavoz (TTS Feedback) */}
          {lastSpokenMessage && (
            <div className="voice-tts-caption">
              <span className="voice-tts-wave">
                <span className="voice-tts-wave-bar" />
                <span className="voice-tts-wave-bar" />
                <span className="voice-tts-wave-bar" />
              </span>
              <MaterialIcon name={isSpeaking ? 'record_voice_over' : 'hearing'} size={16} color="#0284c7" />
              <span style={{ flex: 1 }}>{lastSpokenMessage}</span>
              {isSpeaking && (
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7' }}>HABLANDO</span>
              )}
            </div>
          )}

          {/* Banner de Auditoría: Campos Faltantes (Aviso Verbal) */}
          {missingFields.length > 0 && (
            <div className="voice-missing-banner">
              <div className="voice-missing-title">
                <MaterialIcon name="warning_amber" size={16} color="#d97706" />
                <span>Atención: Falta esta información para completar la ficha:</span>
              </div>
              <div className="voice-missing-chips">
                {missingFields.map((m, idx) => (
                  <span key={idx} className="voice-missing-chip">
                    <MaterialIcon name="info" size={13} color="#b45309" />
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Banner de Consulta Completa */}
          {isComplete && (
            <div className="voice-complete-banner">
              <MaterialIcon name="check_circle" size={18} color="#16a34a" />
              <span>Ficha clínica completa y auditada. Lista para persistir en la base de datos.</span>
            </div>
          )}

          {/* Fallback Notice for unsupported mic */}
          {!micSupported && (
            <div
              style={{
                padding: '8px 16px',
                background: '#fffbeb',
                color: '#92400e',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderBottom: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MaterialIcon name="info" size={16} color="#b45309" />
              <span>Micrófono no detectado en este navegador. Puedes usar los dictados clínicos de muestra (1-Click).</span>
            </div>
          )}

          {/* Error Message if any */}
          {speechError && (
            <div
              style={{
                padding: '8px 16px',
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderBottom: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MaterialIcon name="warning" size={16} color="#b91c1c" />
              <span>{speechError}</span>
            </div>
          )}

          {saveError && (
            <div
              style={{
                padding: '8px 16px',
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderBottom: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MaterialIcon name="error" size={16} color="#b91c1c" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div
              style={{
                padding: '8px 16px',
                background: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderBottom: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MaterialIcon name="verified" size={16} color="#059669" />
              <span>¡Historia clínica y receta guardadas exitosamente en PostgreSQL!</span>
            </div>
          )}

          {/* Transcript Box */}
          <div className="voice-transcript-box">
            {transcript || interimTranscript ? (
              <p style={{ margin: 0 }}>
                {transcript}
                <span className="interim-text">{interimTranscript}</span>
              </p>
            ) : (
              <div className="voice-transcript-placeholder">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <MaterialIcon name="chat" size={16} color="#64748b" />
                  <span>
                    Habla con naturalidad o dicta usando palabras clave como: <em>"Motivo de consulta..."</em>,{' '}
                    <em>"Dolor EVA 7"</em>, <em>"Diagnóstico..."</em>, <em>"Plan de tratamiento..."</em>,{' '}
                    <em>"Recetar..."</em>. Si dices <strong>"Guardar consulta"</strong>, se registrará directamente en BD.
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Detected Slots Real-Time Strip */}
          {detectedSlots.length > 0 && (
            <div className="voice-slots-strip">
              <span style={{ color: '#0369a1', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="bolt" size={16} color="#0284c7" />
                <span>Campos detectados:</span>
              </span>
              {detectedSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="voice-slot-chip"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <MaterialIcon name="check" size={14} color="#059669" /> {slot}
                </span>
              ))}
            </div>
          )}

          {/* Sample Dictations for fast testing & 1-click execution */}
          <div className="voice-samples-box">
            <div className="voice-samples-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MaterialIcon name="lightbulb" size={16} color="#0284c7" />
                <span>Ejemplos de Dictado Rápido</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSamples(!showSamples)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {showSamples ? 'Ocultar' : 'Ver Ejemplos (1-Click)'}
              </button>
            </div>

            {showSamples && (
              <div className="voice-samples-list">
                {PRESET_SAMPLE_DICTATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="voice-sample-btn"
                    onClick={() => handleApplyPreset(preset.text)}
                  >
                    <span>{preset.title}</span>
                    <span
                      style={{
                        color: '#0284c7',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      Procesar IA <MaterialIcon name="bolt" size={14} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="voice-panel-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={autoApplyRealTime}
                  onChange={(e) => setAutoApplyRealTime(e.target.checked)}
                />
                Llenar ficha en vivo
              </label>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(transcript || interimTranscript) && (
                <button
                  type="button"
                  className="voice-action-btn secondary"
                  onClick={handleClear}
                  title="Limpiar transcripción"
                >
                  Limpiar
                </button>
              )}

              {/* Botón de Analizar IA si hay texto */}
              {(transcript || interimTranscript) && !isListening && (
                <button
                  type="button"
                  className="voice-action-btn secondary"
                  onClick={() => runAiAnalysis((transcript + ' ' + interimTranscript).trim())}
                  disabled={isProcessingAi}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <MaterialIcon name="auto_awesome" size={16} color="#0284c7" />
                  <span>{isProcessingAi ? 'Analizando...' : 'Analizar IA'}</span>
                </button>
              )}

              {/* Botón de Hablar / Detener */}
              <button
                type="button"
                className={`voice-action-btn ${isListening ? 'danger' : 'primary'}`}
                onClick={toggleListening}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isListening ? (
                  <>
                    <MaterialIcon name="stop" size={18} />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <MaterialIcon name="mic" size={18} />
                    <span>Hablar</span>
                  </>
                )}
              </button>

              {/* Botón Directo para Guardar en Base de Datos */}
              <button
                type="button"
                className="voice-action-btn save-db"
                onClick={handleSaveConsultation}
                disabled={isSaving}
                title="Persistir historia clínica y receta directamente en PostgreSQL"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <MaterialIcon name="save" size={16} />
                <span>{isSaving ? 'Guardando...' : 'Guardar en BD'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceConsultationAssistant;
