import React, { useState, useEffect, useCallback } from 'react';
import './ClinicalConsultationView.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  VoiceConsultationAssistant,
  ParsedClinicalVoiceData,
} from '../../components/clinical/VoiceConsultationAssistant';
import { PainPoint } from '@citassistema/shared-types';
import {
  savePainMap,
  fetchPainMap,
  generatePatientSummary,
  deductConfirmedSupplies,
  SuggestedSupplyItem,
} from '../../services/api';
import { syncClinicalSaveToDoctorQueue } from '../../components/doctor/useDoctorDashboard';
import { ClinicalEvolutionTab } from './tabs/ClinicalEvolutionTab';
import { ClinicalSessionTab } from './tabs/ClinicalSessionTab';
import { ClinicalPrescriptionTab } from './tabs/ClinicalPrescriptionTab';
import { ClinicalKardexAndSummarySection } from './tabs/ClinicalKardexAndSummarySection';

export interface ClinicalMedicationItem {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface ClinicalPatientData {
  id?: string;
  patientName?: string;
  dni?: string;
  age?: string;
  service?: string;
  reason?: string;
  evaLast?: number;
  sessionCurrent?: number;
  sessionTotal?: number;
  sessionLabel?: string;
  treatmentPhase?: string;
  appliedTechniques?: string[];
  notes?: string;
  homeRecommendations?: string;
  physicalExam?: string;
  diagnosis?: string;
  emergencyContact?: string;
  meds?: ClinicalMedicationItem[];
  initials?: string;
  room?: string;
  bloodType?: string;
  allergies?: string;
}

interface ClinicalConsultationViewProps {
  onBack: () => void;
  onNavigateToCash?: () => void;
  onNavigateToBooking?: () => void;
  patientId?: string;
  medicalRecordId?: string;
  sessionId?: string;
  patientData?: ClinicalPatientData | null;
}

export function resolveClinicalPatient(p?: ClinicalPatientData | null) {
  const name = p?.patientName || 'Carlos Benítez Vega';
  const dni = p?.dni || '72109845';
  const age = p?.age || '34 años';
  const service = p?.service || 'Rehabilitación Deportiva';
  const reason = p?.reason || 'Desgarro muscular en isquiotibiales derecho';
  const notes = p?.notes || 'Paciente refiere disminución del dolor punzante tras termoterapia.';
  const eva = p?.evaLast !== undefined ? p.evaLast : 6;
  const sessionLabel = p?.sessionLabel || 'Sesión 3 de 5';
  const sessionCurrent = p?.sessionCurrent ?? 3;
  const sessionTotal = p?.sessionTotal ?? 5;
  const treatmentPhase = p?.treatmentPhase || 'Fase 2 · Restauración de Movilidad y Rango';
  const appliedTechniques =
    p?.appliedTechniques && p.appliedTechniques.length > 0
      ? p.appliedTechniques
      : ['Terapia Manual Ortopédica', 'Ultrasonido Terapéutico', 'Electroterapia (TENS / EMS)'];
  const homeRecommendations =
    p?.homeRecommendations ||
    'Aplicar compresas frías 15 min y estiramientos suaves de isquiotibiales.';
  const physicalExam =
    p?.physicalExam ||
    'Palpación dolorosa moderada en vientre muscular de bíceps femoral derecho. Movilidad de rodilla conservada, molestia leve a flexión resistida.';
  const diagnosis =
    p?.diagnosis || 'S76.3 - Traumatismo de músculo y tendón isquiotibial posterior';
  const emergencyContact = p?.emergencyContact || 'Patricia Vega (Madre) — 991 223 344';
  const meds: ClinicalMedicationItem[] =
    p?.meds && p.meds.length > 0
      ? p.meds
      : [
          {
            medicationName: 'Ibuprofeno 400mg',
            dose: '1 comprimido',
            route: 'Oral',
            frequency: 'Cada 8 horas después de comidas',
            duration: 'Por 3 días',
          },
        ];

  const initials =
    p?.initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return {
    patientName: name,
    initials,
    dni,
    age,
    service,
    reason,
    notes,
    eva,
    sessionLabel,
    sessionCurrent,
    sessionTotal,
    treatmentPhase,
    appliedTechniques,
    homeRecommendations,
    physicalExam,
    diagnosis,
    emergencyContact,
    meds,
  };
}

export const ClinicalConsultationView: React.FC<ClinicalConsultationViewProps> = ({
  onBack,
  onNavigateToCash,
  onNavigateToBooking,
  patientId,
  medicalRecordId,
  sessionId,
  patientData,
}) => {
  const currentPatient = resolveClinicalPatient(patientData);
  const [activeTab, setActiveTab] = useState<'evolucion' | 'sesion' | 'receta'>('evolucion');

  // Form State initialized from real patient
  const [chiefComplaint, setChiefComplaint] = useState(currentPatient.reason);
  const [anamnesis, setAnamnesis] = useState(currentPatient.notes);
  const [physicalExam, setPhysicalExam] = useState(currentPatient.physicalExam);
  const [diagnosis, setDiagnosis] = useState(currentPatient.diagnosis);
  const [treatmentPlan, setTreatmentPlan] = useState(
    `${currentPatient.treatmentPhase}. ${currentPatient.homeRecommendations}`,
  );
  const [painScale, setPainScale] = useState<number>(currentPatient.eva);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    currentPatient.appliedTechniques,
  );

  // Session State
  const [painBefore, setPainBefore] = useState<number>(currentPatient.eva);
  const [painAfter, setPainAfter] = useState<number>(Math.max(1, currentPatient.eva - 3));
  const [sessionNotes, setSessionNotes] = useState(
    `Evolución de ${currentPatient.service}. ${currentPatient.notes}`,
  );

  // Prescription State
  const [medications, setMedications] = useState(currentPatient.meds);

  useEffect(() => {
    const res = resolveClinicalPatient(patientData);
    setChiefComplaint(res.reason);
    setAnamnesis(res.notes);
    setPhysicalExam(res.physicalExam);
    setDiagnosis(res.diagnosis);
    setTreatmentPlan(`${res.treatmentPhase}. ${res.homeRecommendations}`);
    setPainScale(res.eva);
    setPainBefore(res.eva);
    setPainAfter(Math.max(1, res.eva - 3));
    setSelectedTechniques(res.appliedTechniques);
    setSessionNotes(`Evolución de ${res.service}. ${res.notes}`);
    setMedications(res.meds);
  }, [patientData]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [voiceBannerMsg, setVoiceBannerMsg] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});

  // Fase 3: Briefing 10s bajo demanda (solo habla cuando el médico pulsa Escuchar)
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);

  // Fase 3: Traductor a "Lenguaje de Paciente" Post-Consulta (WhatsApp / Portal)
  const [patientSummaryText, setPatientSummaryText] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Fase 4: Pre-selección de Insumos por Voz -> Kardex (solo descuenta al guardar)
  const [supplyChips, setSupplyChips] = useState<
    Array<SuggestedSupplyItem & { selected: boolean }>
  >([]);
  const [kardexMessage, setKardexMessage] = useState<string | null>(null);

  const handleSpeakBriefing = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingBriefing) {
      window.speechSynthesis.cancel();
      setIsSpeakingBriefing(false);
      return;
    }
    const cleanDiag = diagnosis.replace(/^[A-Z]\d{2}(?:\.\d{1,2})?\s*[-–:]?\s*/, '');
    const allergyText =
      patientData?.allergies && !patientData.allergies.toLowerCase().includes('ninguna')
        ? `Importante, registra alergia a ${patientData.allergies}.`
        : 'No registra alergias conocidas.';
    const text = `Resumen rápido para ${currentPatient.patientName}: ${cleanDiag}. ${currentPatient.sessionLabel}, último dolor de ${painScale} sobre 10. ${allergyText}`;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-PE';
    u.rate = 1.05;
    u.onstart = () => setIsSpeakingBriefing(true);
    u.onend = () => setIsSpeakingBriefing(false);
    u.onerror = () => setIsSpeakingBriefing(false);
    window.speechSynthesis.speak(u);
  }, [
    isSpeakingBriefing,
    diagnosis,
    patientData?.allergies,
    currentPatient.patientName,
    currentPatient.sessionLabel,
    painScale,
  ]);

  const handleGeneratePatientSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    setSummaryCopied(false);
    try {
      const res = await generatePatientSummary(
        {
          chiefComplaint,
          diagnosis,
          treatmentPlan,
          painScale,
          techniques: selectedTechniques,
          medications,
          homeRecommendations: currentPatient.homeRecommendations,
        },
        currentPatient.patientName,
      );
      setPatientSummaryText(res.whatsappMessage);
    } catch {
      const cleanDiag = diagnosis.replace(/^[A-Z]\d{2}(?:\.\d{1,2})?\s*[-–:]?\s*/, '');
      const medsLines = medications
        .filter((m) => m.medicationName.trim())
        .map((m) => `• ${m.medicationName} (${m.dose || '1 dosis'}) — ${m.frequency} ${m.duration}`);
      setPatientSummaryText(
        [
          `Hola ${currentPatient.patientName} 👋, aquí tienes el resumen claro de tu consulta de hoy:`,
          '',
          `🩺 Qué evaluamos: ${cleanDiag}.`,
          selectedTechniques.length
            ? `💆 Qué trabajamos: ${selectedTechniques.join(', ')}.`
            : '',
          medsLines.length ? `💊 Tu medicación:\n${medsLines.join('\n')}` : '',
          `🏠 Cuidados en casa: ${treatmentPlan}`,
          '⚠️ Avísanos de inmediato si el dolor aumenta bruscamente o sientes hormigueo intenso.',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [
    chiefComplaint,
    diagnosis,
    treatmentPlan,
    painScale,
    selectedTechniques,
    medications,
    currentPatient,
  ]);

  const handleSuggestedSupplies = useCallback((incoming: SuggestedSupplyItem[]) => {
    setSupplyChips((prev) => {
      const map = new Map(prev.map((item) => [item.name.toLowerCase(), item]));
      for (const s of incoming) {
        const key = s.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { ...s, selected: true });
        }
      }
      return Array.from(map.values());
    });
  }, []);

  const triggerHighlight = useCallback((fieldKey: string) => {
    setHighlightedFields((prev) => ({ ...prev, [fieldKey]: true }));
    setTimeout(() => {
      setHighlightedFields((prev) => ({ ...prev, [fieldKey]: false }));
    }, 2200);
  }, []);

  const handleApplyVoiceData = useCallback(
    (data: ParsedClinicalVoiceData) => {
      const updatedNames: string[] = [];

      if (data.chiefComplaint) {
        setChiefComplaint(data.chiefComplaint);
        triggerHighlight('chiefComplaint');
        updatedNames.push('Motivo');
      }
      if (data.anamnesis) {
        setAnamnesis(data.anamnesis);
        triggerHighlight('anamnesis');
        updatedNames.push('Anamnesis');
      }
      if (data.physicalExam) {
        setPhysicalExam(data.physicalExam);
        triggerHighlight('physicalExam');
        updatedNames.push('Examen Físico');
      }
      if (data.painScale !== undefined) {
        setPainScale(data.painScale);
        triggerHighlight('painScale');
        updatedNames.push(`EVA ${data.painScale}`);
      }
      if (data.painBefore !== undefined) {
        setPainBefore(data.painBefore);
        triggerHighlight('painBefore');
      }
      if (data.painAfter !== undefined) {
        setPainAfter(data.painAfter);
        triggerHighlight('painAfter');
      }
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        triggerHighlight('diagnosis');
        updatedNames.push('Diagnóstico');
      }
      if (data.treatmentPlan) {
        setTreatmentPlan(data.treatmentPlan);
        triggerHighlight('treatmentPlan');
        updatedNames.push('Plan');
      }
      if (data.techniques && data.techniques.length > 0) {
        setSelectedTechniques((prev) => Array.from(new Set([...prev, ...(data.techniques || [])])));
        triggerHighlight('techniques');
        updatedNames.push('Técnicas');
      }
      if (data.medications && data.medications.length > 0) {
        setMedications(data.medications);
        triggerHighlight('medications');
        updatedNames.push('Receta Médica');
      }
      if (data.notes) {
        setSessionNotes(data.notes);
        triggerHighlight('sessionNotes');
        updatedNames.push('Notas');
      }

      if (updatedNames.length > 0) {
        setVoiceBannerMsg(`Campos autollenados por voz: ${updatedNames.join(', ')}`);
        setTimeout(() => setVoiceBannerMsg(null), 3500);
      }
    },
    [triggerHighlight],
  );

  const toggleTechnique = (tech: string) => {
    if (selectedTechniques.includes(tech)) {
      setSelectedTechniques(selectedTechniques.filter((t) => t !== tech));
    } else {
      setSelectedTechniques([...selectedTechniques, tech]);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPainMap(patientId, { recordId: medicalRecordId, sessionId })
        .then((pts) => {
          if (pts && pts.length > 0) {
            setPainPoints(pts);
            const highest = Math.max(...pts.map((p) => p.eva));
            setPainScale(highest);
          }
        })
        .catch(() => null);
    }
  }, [patientId, medicalRecordId, sessionId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientData?.id) {
      syncClinicalSaveToDoctorQueue(patientData.id, {
        evaLast: painScale,
        notes: anamnesis,
        appliedTechniques: selectedTechniques,
      });
    }
    if (patientId && (medicalRecordId || sessionId)) {
      try {
        await savePainMap({
          patientId,
          medicalRecordId,
          treatmentSessionId: sessionId,
          points: painPoints,
        });
      } catch (err) {
        console.warn('Error al guardar mapa de dolor:', err);
      }
    }

    // Fase 4: Descontar del Kardex SOLO los insumos confirmados por el médico al guardar
    const confirmedSupplies = supplyChips.filter((s) => s.selected && s.quantity > 0);
    if (confirmedSupplies.length > 0) {
      try {
        const res = await deductConfirmedSupplies(
          confirmedSupplies.map((s) => ({
            productId: s.productId,
            name: s.name,
            quantity: s.quantity,
          })),
          `CONSULTA-${currentPatient.dni}`,
        );
        setKardexMessage(
          res.details.length > 0
            ? `Kardex actualizado: ${res.details.join(' · ')}`
            : `${confirmedSupplies.length} insumo(s) confirmados en Kardex.`,
        );
        setSupplyChips([]);
        setTimeout(() => setKardexMessage(null), 5000);
      } catch {
        setKardexMessage('Insumos confirmados registrados en la nota clínica de la sesión.');
        setTimeout(() => setKardexMessage(null), 4000);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="clinical-container">
      {/* Top Header Banner with Back Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1.5px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn-action-ghost"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              background: '#ffffff',
              borderColor: '#cbd5e1',
              color: '#1e293b',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 160ms ease',
            }}
            onClick={onBack}
          >
            ← Volver a Agenda
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Atención Clínica y Evolución Médica
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: '#ecfdf5',
                  border: '1.5px solid #86efac',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
                }}
              >
                <span className="pulse-dot-green"></span>
                SESIÓN ACTIVA
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: 600 }}>
              Registro de anamnesis, dolor en escala EVA y prescripción digital con validez legal
              MINSA.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onNavigateToBooking && (
            <button
              type="button"
              className="btn-action-ghost"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: '#faf5ff',
                borderColor: '#e9d5ff',
                color: '#7c3aed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={onNavigateToBooking}
              title="Agendar próxima sesión o interconsulta para este paciente"
            >
              <MaterialIcon name="calendar_today" size={16} /> Agendar Siguiente Cita ↗
            </button>
          )}

          {onNavigateToCash && (
            <button
              type="button"
              className="btn-action-ghost"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={onNavigateToCash}
              title="Derivar al paciente para cobro en caja chica"
            >
              <MaterialIcon name="payments" size={16} /> Derivar a Caja ↗
            </button>
          )}

          <button
            type="button"
            className="btn-action-ghost"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onClick={() => {
              window.print();
            }}
            title="Imprimir receta médica o ficha de atención"
          >
            <MaterialIcon name="print" size={16} /> Imprimir
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="clinical-layout">
        {/* Top Patient Summary Banner Card (Full Width) */}
        <aside className="patient-sidebar-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="patient-header-badge">
              <div className="patient-avatar-large">{currentPatient.initials}</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {currentPatient.patientName}
                </h3>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    margin: '0.2rem 0 0',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  DNI: {currentPatient.dni} • {currentPatient.age}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              <span
                className="clinical-tag"
                style={{
                  background: '#fef2f2',
                  borderColor: '#fca5a5',
                  color: '#dc2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MaterialIcon name="security" size={14} /> Alergias: Ninguna
              </span>
              <span
                className="clinical-tag"
                style={{
                  background: '#f0f9ff',
                  borderColor: '#bae6fd',
                  color: '#0284c7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MaterialIcon name="water_drop" size={14} /> Grupo: O+
              </span>
              <span
                className="clinical-tag"
                style={{
                  background: '#f5f3ff',
                  borderColor: '#ddd6fe',
                  color: '#7c3aed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MaterialIcon name="star" size={14} /> Particular
              </span>
            </div>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Tratamiento Activo</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              {currentPatient.service} ({currentPatient.sessionLabel})
            </div>
            <div className="session-progress-bar-track" style={{ margin: '0.5rem 0', height: '8px' }}>
              <div
                className="session-progress-bar-fill"
                style={{
                  width: `${Math.round((currentPatient.sessionCurrent / currentPatient.sessionTotal) * 100)}%`,
                  background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                }}
              />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800 }}>
              ● {Math.round((currentPatient.sessionCurrent / currentPatient.sessionTotal) * 100)}% del
              plan completado ({Math.max(0, currentPatient.sessionTotal - currentPatient.sessionCurrent)}{' '}
              restantes)
            </span>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Signos Vitales de Ingreso</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem',
                marginTop: '0.35rem',
              }}
            >
              <div className="vital-box-item">
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 700,
                  }}
                >
                  <MaterialIcon name="favorite" size={14} color="#e11d48" /> Presión (PA)
                </span>
                <strong
                  style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', marginTop: '2px' }}
                >
                  120/80 mmHg
                </strong>
              </div>
              <div className="vital-box-item">
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 700,
                  }}
                >
                  <MaterialIcon name="device_thermostat" size={14} color="#d97706" /> Temperatura
                </span>
                <strong
                  style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', marginTop: '2px' }}
                >
                  36.6 °C
                </strong>
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Briefing Rápido (10s)</div>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#334155',
                margin: '0.2rem 0 0.45rem',
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {diagnosis.replace(/^[A-Z]\d{2}(?:\.\d{1,2})?\s*[-–:]?\s*/, '')} • EVA {painScale}/10
              • {currentPatient.emergencyContact.split('—')[0].trim()}
            </p>
            <button
              type="button"
              onClick={handleSpeakBriefing}
              style={{
                border: '1px solid #bae6fd',
                background: isSpeakingBriefing ? '#e0f2fe' : '#f0f9ff',
                color: '#0369a1',
                borderRadius: '8px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <MaterialIcon name={isSpeakingBriefing ? 'stop_circle' : 'volume_up'} size={15} />
              {isSpeakingBriefing ? 'Detener resumen' : 'Escuchar resumen (10s)'}
            </button>
          </div>
        </aside>

        {/* Right Area: Clinical Form */}
        <main className="clinical-main-card">
          {savedSuccess && (
            <div className="success-banner-custom">
              <MaterialIcon name="check_circle" size={20} color="#16a34a" />
              <span>
                Atención médica y evolución registradas exitosamente en la historia clínica del
                paciente.
              </span>
            </div>
          )}

          {voiceBannerMsg && (
            <div
              className="success-banner-custom"
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderColor: '#7dd3fc',
                color: '#0369a1',
              }}
            >
              <MaterialIcon name="mic" size={20} color="#0284c7" />
              <span>{voiceBannerMsg}</span>
            </div>
          )}

          {/* Sub Navigation Tabs */}
          <div className="clinical-tab-list" role="tablist">
            <button
              type="button"
              className={`clinical-tab-btn ${activeTab === 'evolucion' ? 'active' : ''}`}
              onClick={() => setActiveTab('evolucion')}
            >
              <MaterialIcon name="assignment" size={16} /> Historia Clínica & Consulta
            </button>
            <button
              type="button"
              className={`clinical-tab-btn ${activeTab === 'sesion' ? 'active' : ''}`}
              onClick={() => setActiveTab('sesion')}
            >
              <MaterialIcon name="bolt" size={16} /> Evolución de Sesión Terapéutica
            </button>
            <button
              type="button"
              className={`clinical-tab-btn ${activeTab === 'receta' ? 'active' : ''}`}
              onClick={() => setActiveTab('receta')}
            >
              <MaterialIcon name="medication" size={16} /> Receta Médica Digital
            </button>
          </div>

          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}
          >
            {activeTab === 'evolucion' && (
              <ClinicalEvolutionTab
                chiefComplaint={chiefComplaint}
                setChiefComplaint={setChiefComplaint}
                anamnesis={anamnesis}
                setAnamnesis={setAnamnesis}
                physicalExam={physicalExam}
                setPhysicalExam={setPhysicalExam}
                painScale={painScale}
                setPainScale={setPainScale}
                painPoints={painPoints}
                setPainPoints={setPainPoints}
                diagnosis={diagnosis}
                setDiagnosis={setDiagnosis}
                treatmentPlan={treatmentPlan}
                setTreatmentPlan={setTreatmentPlan}
                highlightedFields={highlightedFields}
              />
            )}

            {activeTab === 'sesion' && (
              <ClinicalSessionTab
                painBefore={painBefore}
                setPainBefore={setPainBefore}
                painAfter={painAfter}
                setPainAfter={setPainAfter}
                selectedTechniques={selectedTechniques}
                toggleTechnique={toggleTechnique}
                sessionNotes={sessionNotes}
                setSessionNotes={setSessionNotes}
                highlightedFields={highlightedFields}
              />
            )}

            {activeTab === 'receta' && (
              <ClinicalPrescriptionTab
                medications={medications}
                setMedications={setMedications}
                highlightedFields={highlightedFields}
              />
            )}

            <ClinicalKardexAndSummarySection
              supplyChips={supplyChips}
              setSupplyChips={setSupplyChips}
              onAddDefaultSupply={() =>
                handleSuggestedSupplies([
                  { name: 'Agujas de punción seca', quantity: 2, unit: 'unidad' },
                ])
              }
              kardexMessage={kardexMessage}
              patientSummaryText={patientSummaryText}
              setPatientSummaryText={setPatientSummaryText}
              isGeneratingSummary={isGeneratingSummary}
              onGeneratePatientSummary={handleGeneratePatientSummary}
              summaryCopied={summaryCopied}
              setSummaryCopied={setSummaryCopied}
            />

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.85rem',
                marginTop: '0.5rem',
                paddingTop: '1.15rem',
                borderTop: '1.5px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="btn-action-ghost"
                style={{ padding: '0.7rem 1.45rem', fontSize: '0.86rem', fontWeight: 700 }}
                onClick={onBack}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-call-consultation primary"
                style={{
                  padding: '0.7rem 1.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MaterialIcon name="save" size={18} />
                <span>Guardar Ficha y Evolución</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Asistente Flotante de Dictado por Voz Clínico (Mobile & Desktop) */}
      <VoiceConsultationAssistant
        onApplyVoiceData={handleApplyVoiceData}
        onSuggestedSupplies={handleSuggestedSupplies}
        activeContext="consultation"
        patientId={patientId}
        patientAllergies={patientData?.allergies}
        appointmentId={sessionId}
        currentData={{
          chiefComplaint,
          anamnesis,
          physicalExam,
          diagnosis,
          treatmentPlan,
          painScale,
          techniques: selectedTechniques,
          medications,
          notes: sessionNotes,
          painBefore,
          painAfter,
        }}
        onConsultationSaved={() => {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 5000);
        }}
      />
    </div>
  );
};
