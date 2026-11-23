import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { PainMapPicker } from '../../../components/clinical/pain-map';
import { PainPoint } from '@citassistema/shared-types';

export interface ClinicalEvolutionTabProps {
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  anamnesis: string;
  setAnamnesis: (val: string) => void;
  physicalExam: string;
  setPhysicalExam: (val: string) => void;
  painScale: number;
  setPainScale: (val: number) => void;
  painPoints: PainPoint[];
  setPainPoints: (pts: PainPoint[]) => void;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  treatmentPlan: string;
  setTreatmentPlan: (val: string) => void;
  highlightedFields: Record<string, boolean>;
}

export const ClinicalEvolutionTab: React.FC<ClinicalEvolutionTabProps> = ({
  chiefComplaint,
  setChiefComplaint,
  anamnesis,
  setAnamnesis,
  physicalExam,
  setPhysicalExam,
  painScale,
  setPainScale,
  painPoints,
  setPainPoints,
  diagnosis,
  setDiagnosis,
  treatmentPlan,
  setTreatmentPlan,
  highlightedFields,
}) => {
  return (
    <>
      {/* Tarjeta 1: Motivo y Anamnesis */}
      <div className="clinical-section-card">
        <div className="clinical-section-header">
          <h4 className="clinical-section-title">
            <MaterialIcon name="my_location" size={18} color="#0284c7" />
            Motivo de Consulta & Anamnesis
          </h4>
          <span
            className="clinical-tag"
            style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}
          >
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '0.25rem',
          }}
        >
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
              background:
                painScale >= 7 ? '#fee2e2' : painScale >= 4 ? '#fef3c7' : '#dcfce7',
              color: painScale >= 7 ? '#dc2626' : painScale >= 4 ? '#b45309' : '#15803d',
              border: `1.5px solid ${painScale >= 7 ? '#fca5a5' : painScale >= 4 ? '#fde68a' : '#86efac'}`,
              boxShadow: painScale >= 7 ? '0 0 12px rgba(220, 38, 38, 0.25)' : 'none',
              transition: 'all 180ms ease',
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
          <span
            className="clinical-tag"
            style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}
          >
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
  );
};
