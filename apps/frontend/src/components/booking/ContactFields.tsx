import React from 'react';
import { IconMail } from '../ui/Icons';
import { IconWhatsApp } from './AppointmentIcons';
import { PatientField } from './PatientField';
import { isEmailValid, isPhoneValid, sanitizePhoneInput } from './patientCatalog';
import './AppointmentStep.css';

export interface ContactFieldsProps {
  phone: string;
  email: string;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  phoneError?: string;
  emailError?: string;
}

const PHONE_HINT = 'Usaremos este número para enviarte información relacionada con tu cita.';

/** Contact data (WhatsApp cell + e-mail) with live format feedback. */
export const ContactFields: React.FC<ContactFieldsProps> = ({
  phone,
  email,
  onPhoneChange,
  onEmailChange,
  phoneError,
  emailError,
}) => (
  <>
    <PatientField
      id="patientPhone"
      label="Celular / WhatsApp"
      required
      error={phoneError}
      hint={phoneError ? undefined : PHONE_HINT}
      isValid={!phoneError && isPhoneValid(phone)}
    >
      <span className="apx-input__adornment" aria-hidden="true">
        <IconWhatsApp size={17} />
      </span>
      <input
        id="patientPhone"
        className="apx-input apx-input--adorned"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+51 987 654 321"
        value={phone}
        onChange={(event) => onPhoneChange(sanitizePhoneInput(event.target.value))}
        aria-invalid={Boolean(phoneError)}
        aria-describedby={phoneError ? 'patientPhone-error' : 'patientPhone-hint'}
      />
    </PatientField>

    <PatientField
      id="patientEmail"
      label="Correo electrónico"
      required
      error={emailError}
      isValid={!emailError && isEmailValid(email)}
    >
      <span className="apx-input__adornment" aria-hidden="true">
        <IconMail size={17} className="apx-icon" />
      </span>
      <input
        id="patientEmail"
        className="apx-input apx-input--adorned"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nombre@correo.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        aria-invalid={Boolean(emailError)}
        aria-describedby={emailError ? 'patientEmail-error' : undefined}
      />
    </PatientField>
  </>
);
