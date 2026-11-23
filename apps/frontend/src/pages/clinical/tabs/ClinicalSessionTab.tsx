import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

export const THERAPY_TECHNIQUES = [
  'Terapia Manual Ortopédica',
  'Electroterapia (TENS / EMS)',
  'Ultrasonido Terapéutico',
  'Punción Seca',
  'Termoterapia / Crioterapia',
  'Ejercicio Terapéutico Funcional',
  'Liberación Miofascial',
  'Magnetoterapia',
];

export interface ClinicalSessionTabProps {
  painBefore: number;
  setPainBefore: (val: number) => void;
  painAfter: number;
  setPainAfter: (val: number) => void;
  selectedTechniques: string[];
  toggleTechnique: (tech: string) => void;
  sessionNotes: string;
  setSessionNotes: (val: string) => void;
  highlightedFields: Record<string, boolean>;
}

export const ClinicalSessionTab: React.FC<ClinicalSessionTabProps> = ({
  painBefore,
  setPainBefore,
  painAfter,
  setPainAfter,
  selectedTechniques,
  toggleTechnique,
  sessionNotes,
  setSessionNotes,
  highlightedFields,
}) => {
  return (
    <>
      {/* Comparador de Dolor */}
      <div className="clinical-section-card">
        <div className="clinical-section-header">
          <h4 className="clinical-section-title">
            <MaterialIcon name="medical_services" size={18} color="#15803d" />
            Evolución del Dolor en la Sesión (Antes vs Después)
          </h4>
          <span
            className="clinical-tag"
            style={{ background: '#ecfdf5', borderColor: '#86efac', color: '#15803d' }}
          >
            COMPARADOR EVA
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="eva-scale-box">
            <div className="profile-field-label">
              Dolor al Ingresar (EVA Antes):{' '}
              <strong style={{ color: '#dc2626' }}>{painBefore}/10</strong>
            </div>
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
            <div className="profile-field-label">
              Dolor al Salir (EVA Después):{' '}
              <strong style={{ color: '#16a34a' }}>{painAfter}/10</strong>
            </div>
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
      <div
        className={`clinical-section-card ${highlightedFields.techniques ? 'voice-filled-highlight' : ''}`}
      >
        <div className="clinical-section-header">
          <h4 className="clinical-section-title">
            <MaterialIcon name="bolt" size={18} color="#0284c7" />
            Técnicas y Procedimientos Aplicados en la Sesión
          </h4>
          <span
            className="clinical-tag"
            style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}
          >
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
              <MaterialIcon
                name={selectedTechniques.includes(tech) ? 'check' : 'add'}
                size={14}
              />
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
  );
};
