import React from 'react';
import { IconAlert, IconCheck, IconLoader } from './AppointmentIcons';
import './AppointmentStep.css';

export interface PatientFieldProps {
  id: string;
  label: string;
  /** Renders the required asterisk next to the label. */
  required?: boolean;
  /** Renders the "Opcional" badge instead. */
  optional?: boolean;
  /** Small helper text under the control. */
  hint?: string;
  /** Replaces the hint with an accessible error message. */
  error?: string;
  /** Shows the ✓ mark once the value passes its own rule. */
  isValid?: boolean;
  /** Shows the spinner instead of the check (async validation/lookup). */
  isValidating?: boolean;
  /** Grid span helper: 'full' makes the field use the whole row. */
  span?: 'full';
  /** Keeps the label for screen readers only (section title already shows it). */
  hideLabel?: boolean;
  children: React.ReactNode;
}

/**
 * Label + control + state for one form field. Owns the visual language of the
 * required/optional marks, the hint, the error message and the valid/loading
 * indicator, so every field of the patient step stays identical.
 */
export const PatientField: React.FC<PatientFieldProps> = ({
  id,
  label,
  required = false,
  optional = false,
  hint,
  error,
  isValid = false,
  isValidating = false,
  span,
  hideLabel = false,
  children,
}) => (
  <div
    className={[
      'apx-field',
      error ? 'is-error' : '',
      isValid ? 'is-valid' : '',
      isValid || isValidating ? 'has-state' : '',
      span === 'full' ? 'apx-field--full' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {hideLabel ? (
      <label className="apx-visually-hidden" htmlFor={id}>
        {label}
      </label>
    ) : (
      <div className="apx-field__top">
        <label className="apx-field__label" htmlFor={id}>
          {label}
        </label>
        {required && (
          <span className="apx-field__required" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="apx-field__optional">Opcional</span>}
      </div>
    )}

    <div className="apx-field__control">
      {children}
      {(isValid || isValidating) && (
        <span className="apx-field__state" aria-hidden="true">
          {isValidating ? <IconLoader size={16} /> : <IconCheck size={16} />}
        </span>
      )}
    </div>

    {error ? (
      <p className="apx-field__error" id={`${id}-error`} role="alert">
        <IconAlert size={13} />
        {error}
      </p>
    ) : hint ? (
      <p className="apx-field__hint" id={`${id}-hint`}>
        {hint}
      </p>
    ) : null}
  </div>
);

export interface PatientSectionProps {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Extra element of the header, e.g. the "Opcional" badge. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Titled card of the patient form (personal data, contact, reason). */
export const PatientSection: React.FC<PatientSectionProps> = ({
  id,
  icon,
  title,
  description,
  action,
  children,
}) => (
  <section className="apx-patient-card" aria-labelledby={id}>
    <header className="apx-patient-card__header">
      <span className="apx-patient-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="apx-patient-card__heading">
        <div className="apx-patient-card__title-row">
          <h3 className="apx-patient-card__title" id={id}>
            {title}
          </h3>
          {action}
        </div>
        {description && <p className="apx-patient-card__desc">{description}</p>}
      </div>
    </header>

    <div className="apx-patient-card__body">{children}</div>
  </section>
);
