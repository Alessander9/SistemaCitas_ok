import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { IconStethoscope } from '../ui/Icons';
import { DoctorQueuePatient } from './types';
import { getEvaTone } from './useDoctorDashboard';

interface ActiveConsultationHeroProps {
  activePatient: DoctorQueuePatient | null;
  nextWaitingPatient: DoctorQueuePatient | null;
  onOpenConsultation: (patient?: DoctorQueuePatient) => void;
  onOpenQuickNote: (patient: DoctorQueuePatient) => void;
  onComplete: (patientId: string) => void;
  onCallNext: (patientId: string) => void;
}

export const ActiveConsultationHero: React.FC<ActiveConsultationHeroProps> = ({
  activePatient,
  nextWaitingPatient,
  onOpenConsultation,
  onOpenQuickNote,
  onComplete,
  onCallNext,
}) => {
  // Si no hay paciente en consulta, mostrar al siguiente en sala listo para llamar
  if (!activePatient) {
    if (!nextWaitingPatient) {
      return (
        <section className="dd-hero dd-hero-idle" aria-label="Estado de consulta">
          <div className="dd-hero-idle-icon">
            <MaterialIcon name="check_circle" size={26} />
          </div>
          <div className="dd-hero-idle-body">
            <h2>Jornada al día</h2>
            <p>No tienes pacientes esperando en sala en este momento.</p>
          </div>
        </section>
      );
    }

    const nextEva = getEvaTone(nextWaitingPatient.evaLast);
    return (
      <section className="dd-hero dd-hero-next" aria-label="Siguiente paciente en sala">
        <div className="dd-hero-top">
          <span className="dd-live-pill waiting">
            <MaterialIcon name="hourglass_top" size={14} />
            <span>Siguiente en sala de espera · {nextWaitingPatient.time}</span>
          </span>
          <span className={`dd-eva-pill ${nextEva.className}`}>
            EVA {nextWaitingPatient.evaLast}/10 · {nextEva.label}
          </span>
        </div>

        <div className="dd-hero-body">
          <div className="dd-hero-patient">
            <span className="dd-hero-avatar">{nextWaitingPatient.initials}</span>
            <div>
              <h2>{nextWaitingPatient.patientName}</h2>
              <p className="dd-hero-meta">
                {nextWaitingPatient.age} · {nextWaitingPatient.service} ({nextWaitingPatient.sessionLabel})
              </p>
              <p className="dd-hero-reason">Motivo: {nextWaitingPatient.reason}</p>
            </div>
          </div>

          <div className="dd-hero-actions">
            <button
              type="button"
              className="dd-btn-primary"
              onClick={() => {
                onCallNext(nextWaitingPatient.id);
                onOpenConsultation(nextWaitingPatient);
              }}
            >
              <IconStethoscope className="w-4 h-4" />
              <span>Llamar e iniciar consulta</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  const eva = getEvaTone(activePatient.evaLast);

  return (
    <section className="dd-hero dd-hero-active" aria-label="Consulta en curso">
      <div className="dd-hero-top">
        <div className="dd-hero-badges">
          <span className="dd-live-pill active">
            <span className="dd-dot-live" />
            En consulta ahora · {activePatient.room}
          </span>
          <span className="dd-session-pill">{activePatient.sessionLabel}</span>
        </div>

        <span className={`dd-eva-pill ${eva.className}`}>
          EVA {activePatient.evaLast}/10 · {eva.label}
        </span>
      </div>

      <div className="dd-hero-body">
        <div className="dd-hero-patient">
          <span className="dd-hero-avatar active">{activePatient.initials}</span>
          <div>
            <h2>{activePatient.patientName}</h2>
            <p className="dd-hero-meta">
              {activePatient.age} · DNI {activePatient.dni} · {activePatient.service}
            </p>
            <p className="dd-hero-reason">
              <strong>Motivo:</strong> {activePatient.reason}
            </p>
            {activePatient.notes && (
              <p className="dd-hero-note">Última nota: {activePatient.notes}</p>
            )}
          </div>
        </div>

        <div className="dd-hero-actions">
          <button
            type="button"
            className="dd-btn-primary"
            onClick={() => onOpenConsultation(activePatient || undefined)}
          >
            <IconStethoscope className="w-4 h-4" />
            <span>Continuar Ficha Clínica</span>
          </button>

          <button
            type="button"
            className="dd-btn-secondary"
            onClick={() => onOpenQuickNote(activePatient)}
          >
            <MaterialIcon name="edit_note" size={17} />
            <span>Nota rápida</span>
          </button>

          <button
            type="button"
            className="dd-btn-finish"
            onClick={() => onComplete(activePatient.id)}
          >
            <MaterialIcon name="check" size={16} />
            <span>Finalizar</span>
          </button>
        </div>
      </div>
    </section>
  );
};
