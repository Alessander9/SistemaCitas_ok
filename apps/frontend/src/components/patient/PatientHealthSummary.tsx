import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { PatientPrescription, PatientTreatmentProgress } from './types';

interface PatientHealthSummaryProps {
  treatment: PatientTreatmentProgress;
  activePrescription: PatientPrescription | null;
  onDownloadPrescription: (rx: PatientPrescription) => void;
  onViewAllPrescriptions: () => void;
}

export const PatientHealthSummary: React.FC<PatientHealthSummaryProps> = ({
  treatment,
  activePrescription,
  onDownloadPrescription,
  onViewAllPrescriptions,
}) => {
  const [showEvolutionDetail, setShowEvolutionDetail] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.round((treatment.completedSessions / Math.max(1, treatment.totalSessions)) * 100),
  );
  const painReduction = Math.round(
    ((treatment.painStart - treatment.painCurrent) / Math.max(1, treatment.painStart)) * 100,
  );

  return (
    <section className="pd-summary-grid" aria-label="Resumen de tu salud">
      {/* Tarjeta 1: Mi Progreso */}
      <article className="pd-card pd-progress-card">
        <div className="pd-card-head">
          <div className="pd-card-title-row">
            <span className="pd-card-icon teal">
              <MaterialIcon name="trending_up" size={18} />
            </span>
            <div>
              <h3>Mi progreso</h3>
              <p>{treatment.title}</p>
            </div>
          </div>
          <span className="pd-sessions-pill">
            {treatment.completedSessions} de {treatment.totalSessions} sesiones
          </span>
        </div>

        <div className="pd-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="pd-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="pd-pain-highlight">
          <div className="pd-pain-highlight-text">
            <MaterialIcon name="favorite" size={16} />
            <span>
              Tu nivel de dolor bajó de <strong>{treatment.painStart}</strong> a{' '}
              <strong>{treatment.painCurrent}</strong> ({painReduction}% menos dolor)
            </span>
          </div>
          <button
            type="button"
            className="pd-text-toggle"
            onClick={() => setShowEvolutionDetail((v) => !v)}
          >
            {showEvolutionDetail ? 'Ocultar detalle' : 'Ver por sesión'}
          </button>
        </div>

        {showEvolutionDetail && (
          <div className="pd-evolution-strip">
            {treatment.checkpoints.map((cp) => (
              <div key={cp.session} className={`pd-evolution-item ${cp.level}`}>
                <span className="pd-evo-date">{cp.date}</span>
                <strong className="pd-evo-score">{cp.score}/10</strong>
                <span className="pd-evo-label">{cp.label}</span>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Tarjeta 2: Cuidados y Receta Activa */}
      <article className="pd-card pd-care-card">
        <div className="pd-card-head">
          <div className="pd-card-title-row">
            <span className="pd-card-icon violet">
              <MaterialIcon name="medication" size={18} />
            </span>
            <div>
              <h3>Cuidados de hoy</h3>
              <p>Tu receta vigente e indicaciones</p>
            </div>
          </div>
          {activePrescription && (
            <span className="pd-active-tag">Vigente hasta {activePrescription.validUntil}</span>
          )}
        </div>

        {activePrescription ? (
          <div className="pd-active-rx-box">
            <div className="pd-active-rx-main">
              <strong>{activePrescription.medication}</strong>
              <span className="pd-active-rx-schedule">{activePrescription.schedule}</span>
            </div>
            <p className="pd-active-rx-instructions">{activePrescription.instructions}</p>

            <div className="pd-care-actions">
              <button
                type="button"
                className="pd-btn-violet-soft"
                onClick={() => onDownloadPrescription(activePrescription)}
              >
                <MaterialIcon name="download" size={16} />
                <span>Descargar receta (PDF)</span>
              </button>
              <button type="button" className="pd-text-toggle" onClick={onViewAllPrescriptions}>
                Ver todas
              </button>
            </div>
          </div>
        ) : (
          <div className="pd-active-rx-box">
            <p className="pd-active-rx-instructions">{treatment.homeTip}</p>
          </div>
        )}
      </article>
    </section>
  );
};
