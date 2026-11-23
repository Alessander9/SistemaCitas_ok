import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import './VoiceConsultationAssistant.css';
import { parseClinicalSpeechShared } from '@citassistema/shared-types';
import {
  processVoiceDictation,
  saveVoiceConsultation,
  transcribeVoiceAudio,
  ParsedClinicalVoiceData,
  MissingFieldInfo,
  ClinicalAlertItem,
  SuggestedSupplyItem,
} from '../../services/api';
import { soundEffects } from '../../utils/soundEffects';

interface BrowserSpeechRecognitionEvent {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

export type { ParsedClinicalVoiceData };

interface VoiceConsultationAssistantProps {
  onApplyVoiceData: (data: ParsedClinicalVoiceData) => void;
  onSuggestedSupplies?: (supplies: SuggestedSupplyItem[]) => void;
  onConsultationSaved?: (result: { recordId: string; prescriptionId?: string }) => void;
  isOpenInitial?: boolean;
  activeContext?: 'consultation' | 'quick-note';
  patientId?: string;
  patientAllergies?: string;
  professionalId?: string;
  appointmentId?: string;
  currentData?: Partial<ParsedClinicalVoiceData>;
}

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
    title: 'Invocación Bilateral: "Chanfainita, ¿qué alergias tiene?"',
    text: 'Chanfainita, ¿qué alergias tiene este paciente y cómo estuvo en su última sesión?',
  },
  {
    title: 'Consulta Incompleta (Prueba de Alerta Verbal)',
    text: 'Chanfainita, apunta motivo de consulta: Paciente presenta dolor cervical intenso tras accidente leve. Dolor EVA 9 sobre 10.',
  },
];

export const parseClinicalSpeech = (rawText: string): ParsedClinicalVoiceData => {
  return parseClinicalSpeechShared(rawText);
};

export const VoiceConsultationAssistant: React.FC<VoiceConsultationAssistantProps> = ({
  onApplyVoiceData,
  onSuggestedSupplies,
  onConsultationSaved,
  isOpenInitial = false,
  activeContext = 'consultation',
  patientId,
  patientAllergies,
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

  // Estados del Asistente Bilateral "Chanfainita" (Ambient Silencioso + Wake-Word)
  const [listenMode, setListenMode] = useState<'ambient' | 'active'>('ambient');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [speakerEnabled, setSpeakerEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<MissingFieldInfo[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlertItem[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<Partial<ParsedClinicalVoiceData> | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const wasListeningBeforeSpeakRef = useRef<boolean>(false);

  // ---------------------------------------------------------------------------
  // ALTAVOZ / TEXT-TO-SPEECH (TTS) con Pausa Anti-Eco Automática
  // ---------------------------------------------------------------------------
  const speakAlert = useCallback(
    (text: string) => {
      if (!text) return;
      setLastSpokenMessage(text);
      if (privacyMode || !speakerEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        utterance.rate = 1.05;
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

        utterance.onstart = () => {
          setIsSpeaking(true);
          // Anti-eco: pausar reconocimiento mientras Chanfainita habla
          if (recognitionRef.current && isListening) {
            wasListeningBeforeSpeakRef.current = true;
            try {
              recognitionRef.current.stop();
            } catch {
              // ignore
            }
          }
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          if (wasListeningBeforeSpeakRef.current && recognitionRef.current) {
            wasListeningBeforeSpeakRef.current = false;
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch {
                // ignore
              }
            }, 300);
          }
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
      }
    },
    [speakerEnabled, privacyMode, isListening],
  );

  const handleUndoLast = useCallback(() => {
    if (!previousSnapshot) return;
    onApplyVoiceData(previousSnapshot);
    setPreviousSnapshot(null);
    setLastSpokenMessage('Listo, deshice el último cambio en la ficha.');
  }, [previousSnapshot, onApplyVoiceData]);

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
  // PROCESAMIENTO IA BILATERAL ("Chanfainita" Wake-Word + Modo Ambiental)
  // ---------------------------------------------------------------------------
  const runAiAnalysis = useCallback(
    async (textToProcess: string) => {
      const clean = textToProcess.trim();
      if (!clean || clean.length < 5) return;
      setIsProcessingAi(true);

      try {
        const result = await processVoiceDictation(clean, currentData, {
          mode: listenMode,
          patientId,
          patientAllergies,
          privacyMode,
        });
        setAiProvider(result.providerUsed);
        setMissingFields(result.missingFields || []);
        setClinicalAlerts(result.clinicalAlerts || []);
        setIsComplete(result.isComplete);
        if (result.suggestedSupplies && result.suggestedSupplies.length > 0 && onSuggestedSupplies) {
          onSuggestedSupplies(result.suggestedSupplies);
        }

        if (result.intent === 'UNDO') {
          if (previousSnapshot) {
            onApplyVoiceData(previousSnapshot);
            setPreviousSnapshot(null);
          }
        } else if (
          result.intent !== 'ASK_PATIENT_HISTORY' &&
          result.intent !== 'ASK_CLINICAL_PROTOCOL' &&
          result.intent !== 'COMMAND_SAVE'
        ) {
          // Guardar snapshot previo para Undo de 1 paso
          if (currentData) {
            setPreviousSnapshot({ ...currentData });
          }
          onApplyVoiceData(result.parsedData);
        }

        // Alerta discreta en modo ambiental si hay alergia/bandera roja
        if (result.clinicalAlerts && result.clinicalAlerts.length > 0 && !result.shouldSpeak) {
          soundEffects.playChime();
        }

        // Solo hablar cuando Chanfainita fue invocada o está en modo activo (y no en privacidad)
        if (result.shouldSpeak && result.spokenAlert) {
          speakAlert(result.spokenAlert);
        } else if (result.spokenAlert && privacyMode) {
          setLastSpokenMessage(result.spokenAlert);
        }
      } catch (err: unknown) {
        console.warn('Fallo en API de IA, ejecutando analizador determinista local:', err);
        const wakeDetected = /\b(chanfainita|chanfanita|chanfaina|chanfa)\b/i.test(clean);
        if (currentData) {
          setPreviousSnapshot({ ...currentData });
        }
        const localParsed = parseClinicalSpeech(clean);
        onApplyVoiceData(localParsed);
        setAiProvider('Chanfainita · Motor Local');

        const missing: MissingFieldInfo[] = [];
        if (!localParsed.chiefComplaint) {
          missing.push({ field: 'chiefComplaint', label: 'Motivo de consulta', spokenPrompt: 'el motivo de consulta' });
        }
        if (localParsed.painScale === undefined) {
          missing.push({ field: 'painScale', label: 'Escala EVA (0-10)', spokenPrompt: 'la escala de dolor' });
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

        if (wakeDetected || listenMode === 'active') {
          if (complete) {
            speakAlert('Ficha completa y lista para guardar cuando confirmes.');
          } else {
            const prompts = missing.map((m) => m.spokenPrompt).join(', ');
            speakAlert(`Anotado. Solo falta ${prompts}.`);
          }
        }
      } finally {
        setIsProcessingAi(false);
      }
    },
    [currentData, listenMode, patientId, patientAllergies, privacyMode, previousSnapshot, onApplyVoiceData, speakAlert],
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
    } catch (err: unknown) {
      console.error('Error al guardar consulta:', err);
      setSaveError(err instanceof Error ? err.message : 'Error al persistir en base de datos');
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

  const [isRecordingWhisper, setIsRecordingWhisper] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleWhisperRecording = useCallback(async () => {
    if (isRecordingWhisper && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingWhisper(false);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setSpeechError('Grabación Whisper no disponible en este navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = typeof reader.result === 'string' ? reader.result : '';
          if (!base64) return;
          setIsProcessingAi(true);
          try {
            const res = await transcribeVoiceAudio(base64, blob.type || 'audio/webm');
            if (res.transcript) {
              setTranscript(res.transcript);
              latestTranscriptRef.current = res.transcript;
              setAiProvider(res.provider);
              await runAiAnalysis(res.transcript);
            }
          } catch (err: unknown) {
            setSpeechError(err instanceof Error ? err.message : 'No se pudo transcribir con Groq Whisper.');
          } finally {
            setIsProcessingAi(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingWhisper(true);
      setSpeechError(null);
    } catch {
      setSpeechError('Permiso de micrófono requerido para grabación Whisper.');
    }
  }, [isRecordingWhisper, runAiAnalysis]);

  const QUICK_VOICE_MACROS = [
    { label: 'Control Lumbar Favorable', command: 'Chanfainita, aplica control lumbar favorable' },
    { label: 'Control Hombro Favorable', command: 'Chanfainita, aplica control hombro favorable' },
    { label: 'Alta Fisioterapia', command: 'Chanfainita, aplica alta fisioterapia' },
  ];

  // ---------------------------------------------------------------------------
  // Inicializar Web Speech API (Dictado por Micrófono)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
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

      recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
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

      recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
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
          setTimeout(() => recognitionRef.current?.start(), 200);
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
                  <span>{activeContext === 'quick-note' ? 'Notas Rápidas por Voz' : 'Asistente Clínico Inteligente · Chanfainita'}</span>
                  <span className={`voice-status-pill ${isListening ? 'listening' : 'idle'}`}>
                    {isListening
                      ? listenMode === 'ambient'
                        ? '● Escucha ambiental (en silencio)'
                        : '● Chanfainita activa...'
                      : 'Di "Chanfainita"'}
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
              {/* Toggle Modo Ambiental vs Activo */}
              <button
                type="button"
                className="voice-speaker-btn"
                onClick={() => setListenMode((m) => (m === 'ambient' ? 'active' : 'ambient'))}
                title={
                  listenMode === 'ambient'
                    ? 'Modo Ambiental Silencioso: solo responde si dices "Chanfainita"'
                    : 'Modo Bilateral Directo: responde después de cada intervención'
                }
                style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', width: 'auto' }}
              >
                {listenMode === 'ambient' ? 'Ambiental' : 'Directo'}
              </button>

              {/* Toggle Modo Privacidad (Solo Visual) */}
              <button
                type="button"
                className={`voice-speaker-btn ${privacyMode ? 'muted' : ''}`}
                onClick={() => setPrivacyMode((p) => !p)}
                title={privacyMode ? 'Modo Discreto activo (solo alertas visuales)' : 'Activar Modo Discreto (silenciar voz frente al paciente)'}
              >
                <MaterialIcon name={privacyMode ? 'visibility_off' : 'visibility'} size={17} />
              </button>

              {/* Botón Deshacer 1 Paso */}
              {previousSnapshot && (
                <button
                  type="button"
                  className="voice-speaker-btn"
                  onClick={handleUndoLast}
                  title="Deshacer último cambio dictado"
                >
                  <MaterialIcon name="undo" size={17} />
                </button>
              )}

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

          {/* Barra de Macros Clínicas Rápidas & Grabación Whisper Pro (Fase 3) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Macros:
            </span>
            {QUICK_VOICE_MACROS.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  setTranscript(m.command);
                  latestTranscriptRef.current = m.command;
                  runAiAnalysis(m.command);
                }}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '999px',
                  padding: '0.18rem 0.55rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleToggleWhisperRecording}
              title="Transcripción médica de alta precisión con Groq Whisper"
              style={{
                marginLeft: 'auto',
                border: isRecordingWhisper ? '1px solid #ef4444' : '1px solid #bae6fd',
                background: isRecordingWhisper ? '#fef2f2' : '#f0f9ff',
                color: isRecordingWhisper ? '#dc2626' : '#0369a1',
                borderRadius: '999px',
                padding: '0.18rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <MaterialIcon name={isRecordingWhisper ? 'stop_circle' : 'graphic_eq'} size={13} />
              {isRecordingWhisper ? 'Detener Whisper' : 'Whisper IA'}
            </button>
          </div>

          {/* Alertas Clínicas Prioritarias (Alergias y Banderas Rojas) */}
          {clinicalAlerts.length > 0 && (
            <div
              role="alert"
              style={{
                margin: '0.5rem 0.85rem 0',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1.5px solid #fca5a5',
                color: '#991b1b',
                fontSize: '0.78rem',
              }}
            >
              {clinicalAlerts.map((alert, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <MaterialIcon name="gpp_maybe" size={18} color="#dc2626" />
                  <div>
                    <strong>{alert.title}</strong>
                    <div style={{ marginTop: '2px', fontSize: '0.74rem' }}>{alert.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
