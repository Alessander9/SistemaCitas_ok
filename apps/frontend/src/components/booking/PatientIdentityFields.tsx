import React from 'react';
import { IconUser } from './AppointmentIcons';
import { PatientField } from './PatientField';
import './AppointmentStep.css';

export interface PatientIdentityFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  firstNameError?: string;
  lastNameError?: string;
  /** True once the lookup filled them, so the UI can hint they are editable. */
  isPrefilled?: boolean;
}

/** Identity fields (names + last names) as shown on the identity document. */
export const PatientIdentityFields: React.FC<PatientIdentityFieldsProps> = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  firstNameError,
  lastNameError,
  isPrefilled = false,
}) => (
  <>
    <PatientField
      id="patientFirstName"
      label="Nombres"
      required
      error={firstNameError}
      hint={isPrefilled && !firstNameError ? 'Dato recuperado de tu registro.' : undefined}
      isValid={!firstNameError && firstName.trim().length > 1}
    >
      <span className="apx-input__adornment" aria-hidden="true">
        <IconUser size={17} />
      </span>
      <input
        id="patientFirstName"
        className="apx-input apx-input--adorned"
        type="text"
        autoComplete="given-name"
        placeholder="ej. Juan Carlos"
        value={firstName}
        onChange={(event) => onFirstNameChange(event.target.value)}
        aria-invalid={Boolean(firstNameError)}
        aria-describedby={firstNameError ? 'patientFirstName-error' : undefined}
      />
    </PatientField>

    <PatientField
      id="patientLastName"
      label="Apellidos"
      required
      error={lastNameError}
      isValid={!lastNameError && lastName.trim().length > 1}
    >
      <span className="apx-input__adornment" aria-hidden="true">
        <IconUser size={17} />
      </span>
      <input
        id="patientLastName"
        className="apx-input apx-input--adorned"
        type="text"
        autoComplete="family-name"
        placeholder="ej. Pérez Gómez"
        value={lastName}
        onChange={(event) => onLastNameChange(event.target.value)}
        aria-invalid={Boolean(lastNameError)}
        aria-describedby={lastNameError ? 'patientLastName-error' : undefined}
      />
    </PatientField>
  </>
);
