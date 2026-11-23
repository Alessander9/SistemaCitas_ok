import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { PatientPrescription } from './types';
import './PatientDocsPanels.css';

interface PatientPrescriptionsPanelProps {
  prescriptions: PatientPrescription[];
  onDownload: (rx: PatientPrescription) => void;
  showHeading?: boolean;
}

export const PatientPrescriptionsPanel: React.FC<PatientPrescriptionsPanelProps> = ({
  prescriptions,
  onDownload,
  showHeading = true,
}) => {
  const [onlyActive, setOnlyActive] = useState(false);

  const activeList = prescriptions.filter((rx) => rx.isActive);
  const pastList = prescriptions.filter((rx) => !rx.isActive);
  const hasBoth = activeList.length > 0 && pastList.length > 0;

  if (prescriptions.length === 0) {
    return (
      <div className="pdoc-empty">
        <MaterialIcon name="medication" size={28} />
        <p>Aún no tienes recetas médicas registradas.</p>
      </div>
    );
  }

  return (
    <div className="pdoc-stack">
      {(showHeading || hasBoth) && (
        <div className="pdoc-section-top">
          {showHeading && (
            <div>
              <h3 className="pdoc-title">Mis recetas</h3>
              <p className="pdoc-subtitle">Medicamentos vigentes e indicaciones de toma</p>
            </div>
          )}

          {hasBoth && (
            <div className="pdoc-filter-group" role="tablist" aria-label="Filtrar recetas">
              <button
                type="button"
                role="tab"
                aria-selected={!onlyActive}
                className={`pdoc-filter-btn ${!onlyActive ? 'active' : ''}`}
                onClick={() => setOnlyActive(false)}
              >
                Todas ({prescriptions.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={onlyActive}
                className={`pdoc-filter-btn ${onlyActive ? 'active' : ''}`}
                onClick={() => setOnlyActive(true)}
              >
                Vigentes ({activeList.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bloque 1: Recetas vigentes */}
      {activeList.length > 0 && (
        <div className="pdoc-group">
          <span className="pdoc-group-label active">Receta vigente · Qué debes tomar</span>
          <div className="pdoc-list">
            {activeList.map((rx) => (
              <article key={rx.id} className="pdoc-rx-card active">
                <div className="pdoc-rx-content">
                  <div className="pdoc-rx-meta-row">
                    <span className="pdoc-badge-vigente">Vigente hasta {rx.validUntil}</span>
                    <span className="pdoc-date-muted">Emitida {rx.issuedDate}</span>
                  </div>

                  <h4 className="pdoc-rx-med">{rx.medication}</h4>
                  <div className="pdoc-rx-schedule">
                    <MaterialIcon name="schedule" size={15} />
                    <span>{rx.schedule}</span>
                  </div>
                  <p className="pdoc-rx-instructions">{rx.instructions}</p>
                  <span className="pdoc-rx-doctor">Indicada por {rx.doctorName}</span>
                </div>

                <div className="pdoc-rx-action">
                  <button
                    type="button"
                    className="pdoc-btn-primary-rx"
                    onClick={() => onDownload(rx)}
                  >
                    <MaterialIcon name="download" size={16} />
                    <span>Descargar receta (PDF)</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Bloque 2: Recetas anteriores */}
      {!onlyActive && pastList.length > 0 && (
        <div className="pdoc-group">
          <span className="pdoc-group-label past">Recetas anteriores</span>
          <div className="pdoc-list">
            {pastList.map((rx) => (
              <article key={rx.id} className="pdoc-rx-card past">
                <div className="pdoc-rx-content">
                  <div className="pdoc-rx-meta-row">
                    <span className="pdoc-badge-past">Finalizada</span>
                    <span className="pdoc-date-muted">{rx.issuedDate}</span>
                  </div>

                  <h4 className="pdoc-rx-med">{rx.medication}</h4>
                  <p className="pdoc-rx-instructions">
                    {rx.schedule} · {rx.instructions}
                  </p>
                  <span className="pdoc-rx-doctor">Indicada por {rx.doctorName}</span>
                </div>

                <div className="pdoc-rx-action">
                  <button
                    type="button"
                    className="pdoc-btn-outline"
                    onClick={() => onDownload(rx)}
                  >
                    <MaterialIcon name="download" size={15} />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
