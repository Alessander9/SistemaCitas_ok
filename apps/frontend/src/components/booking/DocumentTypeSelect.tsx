import React from 'react';
import { IconChevronDown } from './AppointmentIcons';
import { PatientField } from './PatientField';
import { PATIENT_DOCUMENT_TYPES, PatientDocumentType } from './patientCatalog';
import './AppointmentStep.css';

export interface DocumentTypeSelectProps {
  id?: string;
  value: PatientDocumentType;
  onChange: (value: PatientDocumentType) => void;
  error?: string;
}

/** Document type selector; only the types the backend supports are listed. */
export const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({
  id = 'patientDocumentType',
  value,
  onChange,
  error,
}) => {
  return (
    <PatientField
      id={id}
      label="Tipo de documento"
      required
      error={error}
      hint={error ? undefined : 'Elige el documento con el que te registrarás en la clínica.'}
    >
      <select
        id={id}
        className="apx-input apx-input--select"
        value={value}
        onChange={(event) => onChange(event.target.value as PatientDocumentType)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
      >
        {PATIENT_DOCUMENT_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <IconChevronDown size={16} className="apx-input__chevron" />
    </PatientField>
  );
};
