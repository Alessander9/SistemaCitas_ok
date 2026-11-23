import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { ClinicalMedicationItem } from '../ClinicalConsultationView';

export interface ClinicalPrescriptionTabProps {
  medications: ClinicalMedicationItem[];
  setMedications: React.Dispatch<React.SetStateAction<ClinicalMedicationItem[]>>;
  highlightedFields: Record<string, boolean>;
}

export const ClinicalPrescriptionTab: React.FC<ClinicalPrescriptionTabProps> = ({
  medications,
  setMedications,
  highlightedFields,
}) => {
  return (
    <>
      <div
        className={`clinical-section-card ${highlightedFields.medications ? 'voice-filled-highlight' : ''}`}
      >
        <div className="clinical-section-header">
          <h4 className="clinical-section-title">
            <MaterialIcon name="medication" size={18} color="#0284c7" />
            Medicamentos Prescritos
          </h4>
          <button
            type="button"
            className="btn-action-ghost"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.8rem',
              background: '#f0f9ff',
              borderColor: '#bae6fd',
              color: '#0284c7',
              fontWeight: 800,
            }}
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
      <div
        className="clinical-section-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderColor: '#86efac',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
            }}
          >
            <MaterialIcon name="draw" size={24} color="#15803d" />
          </div>
          <div>
            <strong style={{ color: '#14532d', fontSize: '0.92rem', display: 'block' }}>
              Firma Digital Colegiada Activa (Ley N° 27269)
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
              La receta electrónica se emitirá con sello digital de la Dra. María González (CMP
              48291) con validez legal ante farmacias y SUNAT.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
