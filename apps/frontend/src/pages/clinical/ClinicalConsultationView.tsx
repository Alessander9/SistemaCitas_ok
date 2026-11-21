import React, { useState, useEffect, useCallback } from 'react';
import './ClinicalConsultationView.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  VoiceConsultationAssistant,
  ParsedClinicalVoiceData,
} from '../../components/clinical/VoiceConsultationAssistant';
import { PainMapPicker } from '../../components/clinical/pain-map';
import { PainPoint } from '@citassistema/shared-types';
import { savePainMap, fetchPainMap } from '../../services/api';

interface ClinicalConsultationViewProps {
  onBack: () => void;
  onNavigateToCash?: () => void;
  onNavigateToBooking?: () => void;
  patientId?: string;
  medicalRecordId?: string;
  sessionId?: string;
}

const THERAPY_TECHNIQUES = [
  'Terapia Manual Ortopédica',
  'Electroterapia (TENS / EMS)',
  'Ultrasonido Terapéutico',
  'Punción Seca',
  'Termoterapia / Crioterapia',
  'Ejercicio Terapéutico Funcional',
  'Liberación Miofascial',
  'Magnetoterapia',
];

export const ClinicalConsultationView: React.FC<ClinicalConsultationViewProps> = ({
  onBack,
  onNavigateToCash,
  onNavigateToBooking,
  patientId,
  medicalRecordId,
  sessionId,
}) => {
  const [activeTab, setActiveTab] = useState<'evolucion' | 'sesion' | 'receta'>('evolucion');

  // Form State
  const [chiefComplaint, setChiefComplaint] = useState('Dolor agudo en zona lumbar irradiado a glúteo derecho');
  const [anamnesis, setAnamnesis] = useState('Paciente refiere inicio tras levantamiento de carga hace 5 días. Empeora al estar sentado.');
  const [physicalExam, setPhysicalExam] = useState('Prueba de Lasègue negativa. Contractura moderada en paravertebrales L4-L5.');
  const [diagnosis, setDiagnosis] = useState('M54.5 - Lumbalgia mecánica aguda');
  const [treatmentPlan, setTreatmentPlan] = useState('Plan de 10 sesiones de kinesiología y fortalecimiento de core.');
  const [painScale, setPainScale] = useState<number>(7);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([
    'Terapia Manual Ortopédica',
    'Electroterapia (TENS / EMS)',
  ]);

  // Session State
  const [painBefore, setPainBefore] = useState<number>(7);
  const [painAfter, setPainAfter] = useState<number>(3);
  const [sessionNotes, setSessionNotes] = useState('Excelente respuesta a la terapia manual con liberación miofascial.');

  // Prescription State
  const [medications, setMedications] = useState([
    {
      medicationName: 'Celecoxib 200mg',
      dose: '1 cápsula',
      route: 'Oral',
      frequency: 'Cada 12 horas',
      duration: 'Por 5 días',
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [voiceBannerMsg, setVoiceBannerMsg] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});

  const triggerHighlight = useCallback((fieldKey: string) => {
    setHighlightedFields((prev) => ({ ...prev, [fieldKey]: true }));
    setTimeout(() => {
      setHighlightedFields((prev) => ({ ...prev, [fieldKey]: false }));
    }, 2200);
  }, []);

  const handleApplyVoiceData = useCallback((data: ParsedClinicalVoiceData) => {
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
  }, [triggerHighlight]);

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
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="clinical-container">
      {/* Top Header Banner with Back Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1.5px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
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
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
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
              Registro de anamnesis, dolor en escala EVA y prescripción digital con validez legal MINSA.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onNavigateToBooking && (
            <button
              type="button"
              className="btn-action-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 800, background: '#faf5ff', borderColor: '#e9d5ff', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 800, background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={onNavigateToCash}
              title="Derivar al paciente para cobro en caja chica"
            >
              <MaterialIcon name="payments" size={16} /> Derivar a Caja ↗
            </button>
          )}

          <button
            type="button"
            className="btn-action-ghost"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
              <div className="patient-avatar-large">JP</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Juan Pérez Gómez
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0', fontWeight: 700, fontFamily: 'monospace' }}>
                  DNI: 73829104 • 34 años
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              <span className="clinical-tag" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="security" size={14} /> Alergias: Ninguna
              </span>
              <span className="clinical-tag" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="water_drop" size={14} /> Grupo: O+
              </span>
              <span className="clinical-tag" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="star" size={14} /> Particular
              </span>
            </div>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Tratamiento Activo</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              Rehabilitación Lumbar (Sesión 7 de 10)
            </div>
            <div className="session-progress-bar-track" style={{ margin: '0.5rem 0', height: '8px' }}>
              <div className="session-progress-bar-fill" style={{ width: '70%', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' }} />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800 }}>
              ● 70% del plan completado (3 sesiones restantes)
            </span>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Signos Vitales de Ingreso</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.35rem' }}>
              <div className="vital-box-item">
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                  <MaterialIcon name="favorite" size={14} color="#e11d48" /> Presión (PA)
                </span>
                <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>120/80 mmHg</strong>
              </div>
              <div className="vital-box-item">
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                  <MaterialIcon name="device_thermostat" size={14} color="#d97706" /> Temperatura
                </span>
                <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>36.6 °C</strong>
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '1.5px solid #f1f5f9', paddingLeft: '1.1rem' }}>
            <div className="profile-field-label">Contacto de Emergencia</div>
            <p style={{ fontSize: '0.84rem', color: '#334155', margin: '0.2rem 0 0', fontWeight: 600 }}>
              María Gómez (Madre) — <strong style={{ color: '#0284c7' }}>991 223 344</strong>
            </p>
          </div>
        </aside>

        {/* Right Area: Clinical Form */}
        <main className="clinical-main-card">
          {savedSuccess && (
            <div className="success-banner-custom">
              <MaterialIcon name="check_circle" size={20} color="#16a34a" />
              <span>Atención médica y evolución registradas exitosamente en la historia clínica del paciente.</span>
            </div>
          )}

          {voiceBannerMsg && (
            <div className="success-banner-custom" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderColor: '#7dd3fc', color: '#0369a1' }}>
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

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {/* TAB 1: Evolución General */}
            {activeTab === 'evolucion' && (
              <>
                {/* Tarjeta 1: Motivo y Anamnesis */}
                <div className="clinical-section-card">
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="my_location" size={18} color="#0284c7" />
                      Motivo de Consulta & Anamnesis
                    </h4>
                    <span className="clinical-tag" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
                      DATOS CLÍNICOS
                    </span>
                  </div>

                  <div className="form-field-group">
                    <label className="clinical-form-label" htmlFor="chiefComplaint">
                      Motivo de Consulta
                    </label>
                    <input
                      id="chiefComplaint"
                      type="text"
                      className={`clinical-form-input ${highlightedFields.chiefComplaint ? 'voice-filled-highlight' : ''}`}
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                    <div className="form-field-group">
                      <label className="clinical-form-label" htmlFor="anamnesis">
                        Anamnesis y Enfermedad Actual
                      </label>
                      <textarea
                        id="anamnesis"
                        className={`clinical-form-input ${highlightedFields.anamnesis ? 'voice-filled-highlight' : ''}`}
                        rows={3}
                        style={{ height: 'auto', padding: '0.75rem' }}
                        value={anamnesis}
                        onChange={(e) => setAnamnesis(e.target.value)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="clinical-form-label" htmlFor="physicalExam">
                        Examen Físico / Evaluación Postural
                      </label>
                      <textarea
                        id="physicalExam"
                        className={`clinical-form-input ${highlightedFields.physicalExam ? 'voice-filled-highlight' : ''}`}
                        rows={3}
                        style={{ height: 'auto', padding: '0.75rem' }}
                        value={physicalExam}
                        onChange={(e) => setPhysicalExam(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Escala EVA */}
                <div className="eva-scale-box">
                  <div className="eva-scale-header">
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '1.02rem', display: 'block' }}>
                        Escala Analógica Visual de Dolor (EVA)
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                        0 = Sin Dolor | 10 = Máximo Dolor Insoportable
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        background: painScale >= 7 ? '#fee2e2' : painScale >= 4 ? '#fef3c7' : '#dcfce7',
                        color: painScale >= 7 ? '#dc2626' : painScale >= 4 ? '#b45309' : '#15803d',
                        border: `1.5px solid ${painScale >= 7 ? '#fca5a5' : painScale >= 4 ? '#fde68a' : '#86efac'}`,
                        boxShadow: painScale >= 7 ? '0 0 12px rgba(220, 38, 38, 0.25)' : 'none',
                        transition: 'all 180ms ease'
                      }}
                    >
                      Nivel Seleccionado: {painScale}/10
                    </span>
                  </div>

                  <div className="eva-scale-buttons">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`eva-btn ${painScale === val ? 'active' : ''} ${val >= 7 && painScale === val ? 'high-pain' : ''}`}
                        onClick={() => setPainScale(val)}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mapa Anatómico de Dolor & Puntos Gatillo con Zoom (Opción C) */}
                <PainMapPicker
                  initialPoints={painPoints}
                  onChange={(pts) => {
                    setPainPoints(pts);
                    if (pts.length > 0) {
                      const highestEva = Math.max(...pts.map((p) => p.eva));
                      setPainScale(highestEva);
                    }
                  }}
                />

                {/* Tarjeta 3: Diagnóstico y Plan */}
                <div className="clinical-section-card">
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="assignment" size={18} color="#7c3aed" />
                      Diagnóstico Clínico (CIE-10) & Plan de Tratamiento
                    </h4>
                    <span className="clinical-tag" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}>
                      PLAN MÉDICO
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field-group">
                      <label className="clinical-form-label" htmlFor="diagnosis">
                        Diagnóstico Clínico (CIE-10)
                      </label>
                      <input
                        id="diagnosis"
                        type="text"
                        className={`clinical-form-input ${highlightedFields.diagnosis ? 'voice-filled-highlight' : ''}`}
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="clinical-form-label" htmlFor="treatmentPlan">
                        Plan Terapéutico
                      </label>
                      <input
                        id="treatmentPlan"
                        type="text"
                        className={`clinical-form-input ${highlightedFields.treatmentPlan ? 'voice-filled-highlight' : ''}`}
                        value={treatmentPlan}
                        onChange={(e) => setTreatmentPlan(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Sesión Terapéutica */}
            {activeTab === 'sesion' && (
              <>
                {/* Comparador de Dolor */}
                <div className="clinical-section-card">
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="medical_services" size={18} color="#15803d" />
                      Evolución del Dolor en la Sesión (Antes vs Después)
                    </h4>
                    <span className="clinical-tag" style={{ background: '#ecfdf5', borderColor: '#86efac', color: '#15803d' }}>
                      COMPARADOR EVA
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="eva-scale-box">
                      <div className="profile-field-label">Dolor al Ingresar (EVA Antes): <strong style={{ color: '#dc2626' }}>{painBefore}/10</strong></div>
                      <div className="eva-scale-buttons" style={{ marginTop: '0.5rem' }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`eva-btn ${painBefore === val ? 'active high-pain' : ''}`}
                            onClick={() => setPainBefore(val)}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="eva-scale-box">
                      <div className="profile-field-label">Dolor al Salir (EVA Después): <strong style={{ color: '#16a34a' }}>{painAfter}/10</strong></div>
                      <div className="eva-scale-buttons" style={{ marginTop: '0.5rem' }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`eva-btn ${painAfter === val ? 'active' : ''}`}
                            onClick={() => setPainAfter(val)}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Técnicas */}
                <div className={`clinical-section-card ${highlightedFields.techniques ? 'voice-filled-highlight' : ''}`}>
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="bolt" size={18} color="#0284c7" />
                      Técnicas y Procedimientos Aplicados en la Sesión
                    </h4>
                    <span className="clinical-tag" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}>
                      {selectedTechniques.length} SELECCIONADAS
                    </span>
                  </div>

                  <div className="technique-chips-grid">
                    {THERAPY_TECHNIQUES.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        className={`technique-chip ${selectedTechniques.includes(tech) ? 'selected' : ''}`}
                        onClick={() => toggleTechnique(tech)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MaterialIcon name={selectedTechniques.includes(tech) ? "check" : "add"} size={14} />
                        <span>{tech}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas de Sesión */}
                <div className="clinical-section-card">
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="edit_note" size={18} color="#0284c7" />
                      Evolución y Observaciones de la Sesión
                    </h4>
                    <span className="clinical-tag">HISTORIAL</span>
                  </div>

                  <div className="form-field-group">
                    <label className="clinical-form-label" htmlFor="sessionNotes">
                      Observaciones de respuesta al tratamiento y tolerancia
                    </label>
                    <textarea
                      id="sessionNotes"
                      className={`clinical-form-input ${highlightedFields.sessionNotes ? 'voice-filled-highlight' : ''}`}
                      rows={3}
                      style={{ height: 'auto', padding: '0.75rem' }}
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: Receta Médica */}
            {activeTab === 'receta' && (
              <>
                <div className={`clinical-section-card ${highlightedFields.medications ? 'voice-filled-highlight' : ''}`}>
                  <div className="clinical-section-header">
                    <h4 className="clinical-section-title">
                      <MaterialIcon name="medication" size={18} color="#0284c7" />
                      Medicamentos Prescritos
                    </h4>
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7', fontWeight: 800 }}
                      onClick={() =>
                        setMedications([
                          ...medications,
                          { medicationName: '', dose: '', route: 'Oral', frequency: '', duration: '' },
                        ])
                      }
                    >
                      + Agregar Medicamento
                    </button>
                  </div>

                  {medications.map((med, idx) => (
                    <div key={idx} className="rx-item-card">
                      <div className="form-field-group">
                        <label className="clinical-form-label">Medicamento</label>
                        <input
                          type="text"
                          className="clinical-form-input"
                          placeholder="Ej. Paracetamol 500mg"
                          value={med.medicationName}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].medicationName = e.target.value;
                            setMedications(updated);
                          }}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="clinical-form-label">Dosis</label>
                        <input
                          type="text"
                          className="clinical-form-input"
                          placeholder="1 tab"
                          value={med.dose}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].dose = e.target.value;
                            setMedications(updated);
                          }}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="clinical-form-label">Frecuencia</label>
                        <input
                          type="text"
                          className="clinical-form-input"
                          placeholder="Cada 8h"
                          value={med.frequency}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].frequency = e.target.value;
                            setMedications(updated);
                          }}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="clinical-form-label">Duración</label>
                        <input
                          type="text"
                          className="clinical-form-input"
                          placeholder="5 días"
                          value={med.duration}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].duration = e.target.value;
                            setMedications(updated);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-rx-delete"
                        title="Eliminar medicamento"
                        onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <MaterialIcon name="close" size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sello de Firma Digital */}
                <div className="clinical-section-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderColor: '#86efac' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)' }}>
                      <MaterialIcon name="draw" size={24} color="#15803d" />
                    </div>
                    <div>
                      <strong style={{ color: '#14532d', fontSize: '0.92rem', display: 'block' }}>
                        Firma Digital Colegiada Activa (Ley N° 27269)
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                        La receta electrónica se emitirá con sello digital de la Dra. María González (CMP 48291) con validez legal ante farmacias y SUNAT.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '0.5rem', paddingTop: '1.15rem', borderTop: '1.5px solid #f1f5f9' }}>
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
      <VoiceConsultationAssistant onApplyVoiceData={handleApplyVoiceData} activeContext="consultation" />
    </div>
  );
};
