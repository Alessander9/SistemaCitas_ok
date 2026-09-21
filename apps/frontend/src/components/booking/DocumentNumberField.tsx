import React from 'react';
import { IconIdCard } from './AppointmentIcons';
import { PatientField } from './PatientField';
import {
  PatientDocumentType,
  isDocumentNumberValid,
  resolveDocumentTypeOption,
  sanitizeDocumentInput,
} from './patientCatalog';
import './AppointmentStep.css';

export interface DocumentNumberFieldProps {
  id?: string;
  documentType: PatientDocumentType;
  value: string;
  onChange: (value: string) => void;
  /** True while the lookup of this document is running. */
  isValidating?: boolean;
  error?: string;
}

/**
 * Document number input: masks what the patient types according to the selected
 * document type and reports its own normal / focus / error / validating / valid
 * states through `PatientField`.
 */
export const DocumentNumberField: React.FC<DocumentNumberFieldProps> = ({
  id = 'patientDocumentNumber',
  documentType,
  value,
  onChange,
  isValidating = false,
  error,
}) => {
  const option = resolveDocumentTypeOption(documentType);
  const isValid = !isValidating && isDocumentNumberValid(documentType, value);

  return (
    <PatientField
      id={id}
      label="Número de documento"
      required
      error={error}
      hint={error ? undefined : `${option.label}: ${option.hint}`}
      isValid={isValid}
      isValidating={isValidating}
    >
      <span className="apx-input__adornment" aria-hidden="true">
        <IconIdCard size={17} />
      </span>
      <input
        id={id}
        className="apx-input apx-input--adorned"
        type="text"
        inputMode={option.inputMode}
        autoComplete="off"
        spellCheck={false}
        maxLength={option.maxLength}
        placeholder={option.placeholder}
        value={value}
        onChange={(event) => onChange(sanitizeDocumentInput(documentType, event.target.value))}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
        aria-busy={isValidating}
      />
    </PatientField>
  );
};
