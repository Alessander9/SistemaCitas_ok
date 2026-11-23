import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { DoctorQueuePatient, EvaTrend } from './types';
import { getEvaTone } from './useDoctorDashboard';

const TECHNIQUES = [
  'Terapia Manual',
  'Ultrasonido',
  'Electroterapia TENS',
  'Crioterapia',
  'Termoterapia',
  'Kinesiotape',
  'Ejercicios Terapéuticos',
];

const BLOCK_SLOTS = ['11:00 AM', '12:00 PM', '01:00 PM', '05:30 PM', '06:00 PM'];
const BLOCK_REASONS = [
  'Capacitación Médica / Junta',
  'Pausa Activa / Almuerzo',
  'Permiso Personal',
  'Emergencia Externa',
];

/* ---------------------------------------------------------------------------
   1. Modal de Nota Clínica Rápida
   --------------------------------------------------------------------------- */
interface QuickClinicalNoteModalProps {
  patient: DoctorQueuePatient;
  onClose: () => void;
  onSave: (updated: DoctorQueuePatient) => void;
  onSaveAndOpenFull: (updated: DoctorQueuePatient) => void;
}

export const QuickClinicalNoteModal: React.FC<QuickClinicalNoteModalProps> = ({
  patient,
  onClose,
  onSave,
  onSaveAndOpenFull,
}) => {
  const [draft, setDraft] = useState<DoctorQueuePatient>(patient);

  const toggleTechnique = (tech: string) => {
    const exists = draft.appliedTechniques.includes(tech);
    setDraft({
      ...draft,
      appliedTechniques: exists
        ? draft.appliedTechniques.filter((t) => t !== tech)
        : [...draft.appliedTechniques, tech],
    });
  };

  return (
    <div className="dd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Nota rápida del paciente">
      <div className="dd-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="dd-modal-header">
          <div>
            <h3>Nota rápida · {draft.patientName}</h3>
            <p>
              {draft.age} · {draft.sessionLabel} · {draft.service}
            </p>
          </div>
          <button type="button" className="dd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="dd-modal-body">
          {/* Escala EVA */}
          <div className="dd-field">
            <label>Dolor actual (Escala EVA 1–10)</label>
            <div className="dd-eva-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const tone = getEvaTone(num);
                const selected = draft.evaLast === num;
                return (
                  <button
                    key={num}
                    type="button"
                    className={`dd-eva-btn ${selected ? `selected ${tone.className}` : ''}`}
                    onClick={() => setDraft({ ...draft, evaLast: num })}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="dd-trend-row">
              {(
                [
                  { id: 'down', label: '↓ Bajó el dolor' },
                  { id: 'equal', label: '= Estable' },
                  { id: 'up', label: '↑ Aumentó' },
                ] as Array<{ id: EvaTrend; label: string }>
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`dd-chip-btn ${draft.evaTrend === t.id ? 'selected' : ''}`}
                  onClick={() => setDraft({ ...draft, evaTrend: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Técnicas aplicadas */}
          <div className="dd-field">
            <label>Técnicas aplicadas hoy</label>
            <div className="dd-tech-row">
              {TECHNIQUES.map((tech) => {
                const active = draft.appliedTechniques.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    className={`dd-chip-btn ${active ? 'selected' : ''}`}
                    onClick={() => toggleTechnique(tech)}
                  >
                    {active && <MaterialIcon name="check" size={12} />}
                    <span>{tech}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div className="dd-field">
            <label htmlFor="dd-quick-notes">Evolución clínica</label>
            <textarea
              id="dd-quick-notes"
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Respuesta al tratamiento, observaciones de la sesión..."
            />
          </div>

          {/* Indicaciones */}
          <div className="dd-field">
            <label htmlFor="dd-quick-home">Indicaciones para casa</label>
            <input
              id="dd-quick-home"
              type="text"
              value={draft.homeRecommendations}
              onChange={(e) => setDraft({ ...draft, homeRecommendations: e.target.value })}
              placeholder="Ej. Aplicar hielo 15 min y estiramientos suaves..."
            />
          </div>
        </div>

        <div className="dd-modal-footer between">
          <button
            type="button"
            className="dd-btn-secondary"
            onClick={() => onSaveAndOpenFull(draft)}
          >
            Abrir ficha completa →
          </button>

          <div className="dd-modal-footer-right">
            <button type="button" className="dd-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="dd-btn-primary" onClick={() => onSave(draft)}>
              <MaterialIcon name="check" size={16} />
              <span>Guardar nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   2. Modal de Bloqueo de Franja Horaria
   --------------------------------------------------------------------------- */
interface BlockSlotModalProps {
  dayLabel: string;
  onClose: () => void;
  onConfirm: (time: string, reason: string) => void;
}

export const BlockSlotModal: React.FC<BlockSlotModalProps> = ({
  dayLabel,
  onClose,
  onConfirm,
}) => {
  const [time, setTime] = useState(BLOCK_SLOTS[1]);
  const [reason, setReason] = useState(BLOCK_REASONS[0]);

  return (
    <div className="dd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Bloquear horario">
      <div className="dd-modal-box dd-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="dd-modal-header">
          <div>
            <h3>Bloquear franja horaria</h3>
            <p>{dayLabel}</p>
          </div>
          <button type="button" className="dd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="dd-modal-body">
          <div className="dd-field">
            <label htmlFor="dd-block-time">Horario</label>
            <select
              id="dd-block-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {BLOCK_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="dd-field">
            <label htmlFor="dd-block-reason">Motivo</label>
            <select
              id="dd-block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {BLOCK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dd-modal-footer">
          <button type="button" className="dd-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="dd-btn-danger"
            onClick={() => {
              onConfirm(time, reason);
              onClose();
            }}
          >
            <MaterialIcon name="lock" size={15} />
            <span>Confirmar bloqueo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
