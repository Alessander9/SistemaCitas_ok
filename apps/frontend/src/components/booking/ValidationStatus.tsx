import React from 'react';
import { IconArrowRight } from '../ui/Icons';
import { IconAlert, IconCheck } from './AppointmentIcons';
import { BookingValidationModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface ValidationStatusProps {
  validation: BookingValidationModel;
  onContinue: () => void;
  continueLabel?: string;
  /** Keeps the primary action disabled while something is still missing. */
  continueDisabled?: boolean;
  isBusy?: boolean;
}

/**
 * "¿Todo correcto?" card: tells the patient, item by item, whether everything
 * is ready, and owns the primary action of the review step. Each item states its
 * state in text (not only colour) for screen readers and non-colour users.
 */
export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  validation,
  onContinue,
  continueLabel = 'Continuar con la confirmación',
  continueDisabled = false,
  isBusy = false,
}) => (
  <section
    className={`apx-validate${validation.isReady ? ' is-ready' : ' is-pending'}`}
    aria-labelledby="apx-validate-title"
  >
    <header className="apx-validate__header">
      <span className="apx-validate__badge" aria-hidden="true">
        {validation.isReady ? <IconCheck size={18} /> : <IconAlert size={18} />}
      </span>
      <span className="apx-validate__heading">
        <h3 className="apx-validate__title" id="apx-validate-title">
          {validation.title}
        </h3>
        <span className="apx-validate__chip">
          {validation.isReady ? 'Datos completos' : 'Falta información'}
        </span>
      </span>
    </header>

    <p className="apx-validate__desc">{validation.description}</p>

    <ul className="apx-validate__list">
      {validation.items.map((item) => (
        <li
          className={`apx-validate__item${item.isComplete ? ' is-done' : ' is-missing'}`}
          key={item.id}
        >
          <span className="apx-validate__item-icon" aria-hidden="true">
            {item.isComplete ? <IconCheck size={13} /> : <IconAlert size={13} />}
          </span>
          <span className="apx-validate__item-label">{item.label}</span>
          <span className="apx-visually-hidden">
            {item.isComplete ? 'Listo' : 'Información pendiente'}
          </span>
        </li>
      ))}
    </ul>

    <button
      type="button"
      className="apx-validate__cta"
      onClick={onContinue}
      disabled={continueDisabled || isBusy}
    >
      {isBusy ? 'Procesando...' : continueLabel}
      {!isBusy && <IconArrowRight size={17} />}
    </button>
  </section>
);
