import React from 'react';
import { IconClinicMark } from './AppointmentIcons';
import './AppointmentStep.css';

export interface AppointmentHeaderProps {
  /** Main product title shown next to the platform mark. */
  title?: string;
  subtitle?: string;
  /** Current wizard step (1-based) and total amount of steps. */
  currentStep: number;
  totalSteps: number;
  /** Already computed percentage so the wizard owns the math. */
  progressPercent: number;
}

/**
 * Full-width booking header: brand identity on the left, step counter and
 * completion percentage on the right, progress bar underneath.
 */
export const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  title = 'Reserva de Cita',
  subtitle = 'Sistema de atención médica',
  currentStep,
  totalSteps,
  progressPercent,
}) => (
  <header className="apx-header">
    <div className="apx-header__row">
      <div className="apx-header__brand">
        <span className="apx-header__logo">
          <IconClinicMark size={26} className="apx-icon apx-icon--md" />
        </span>
        <span className="apx-header__brand-text">
          <span className="apx-header__title">{title}</span>
          <span className="apx-header__subtitle">{subtitle}</span>
        </span>
      </div>

      <div className="apx-header__status">
        <span className="apx-header__step-chip">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="apx-header__progress-text">{progressPercent}% completado</span>
      </div>
    </div>

    <div
      className="apx-progress"
      role="progressbar"
      aria-label="Progreso de la reserva"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="apx-progress__fill" style={{ width: `${progressPercent}%` }} />
    </div>
  </header>
);
