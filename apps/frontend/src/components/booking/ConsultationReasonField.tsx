import React from 'react';
import { PatientField } from './PatientField';
import { CONSULTATION_REASON_MAX_LENGTH } from './patientCatalog';
import './AppointmentStep.css';

export interface ConsultationReasonFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  /** The section card already shows the title, so the label can stay hidden. */
  hideLabel?: boolean;
}

/** Optional free-text field: what the patient wants to be seen for. */
export const ConsultationReasonField: React.FC<ConsultationReasonFieldProps> = ({
  id = 'patientConsultationReason',
  value,
  onChange,
  error,
  label = 'Motivo de consulta',
  hideLabel = false,
}) => (
  <PatientField
    id={id}
    label={label}
    optional
    hideLabel={hideLabel}
    error={error}
    span="full"
  >
    <textarea
      id={id}
      className="apx-input apx-input--textarea"
      rows={3}
      maxLength={CONSULTATION_REASON_MAX_LENGTH}
      placeholder="Cuéntanos brevemente el motivo de tu consulta..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    <span className="apx-field__counter" aria-hidden="true">
      {value.length} / {CONSULTATION_REASON_MAX_LENGTH}
    </span>
  </PatientField>
);
