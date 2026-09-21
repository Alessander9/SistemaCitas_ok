import React from 'react';
import { IconFileText } from '../ui/Icons';
import { IconPhone, IconUser } from './AppointmentIcons';
import { ConsultationReasonField } from './ConsultationReasonField';
import { ContactFields } from './ContactFields';
import { DocumentNumberField } from './DocumentNumberField';
import { DocumentTypeSelect } from './DocumentTypeSelect';
import { PatientIdentityFields } from './PatientIdentityFields';
import { PatientLookupNotice, PatientLookupState } from './PatientLookupNotice';
import { PatientSection } from './PatientField';
import { PrivacyNotice } from './PrivacyNotice';
import {
  PatientFieldId,
  PatientFormValues,
  isDocumentNumberValid,
  resolvePatientFieldFromInputId,
} from './patientCatalog';
import './AppointmentStep.css';

export interface PatientFormProps {
  values: PatientFormValues;
  /** Only the errors the patient should see (visited/submitted fields). */
  visibleErrors: Partial<Record<PatientFieldId, string>>;
  onChange: (field: PatientFieldId, value: string) => void;
  /** Tracks which fields have been visited, so errors are never premature. */
  onFieldBlur: (field: PatientFieldId) => void;
  lookupState: PatientLookupState;
  isLookupAvailable: boolean;
  onLookup: () => void;
  /** True when the lookup filled the identity/contact fields. */
  isPrefilled?: boolean;
}

/**
 * Patient data form (step 6). Purely presentational: values, errors and the
 * document lookup state all come from the step container.
 */
export const PatientForm: React.FC<PatientFormProps> = ({
  values,
  visibleErrors,
  onChange,
  onFieldBlur,
  lookupState,
  isLookupAvailable,
  onLookup,
  isPrefilled = false,
}) => {
  // Blur delegation: React's onBlur bubbles, so a single handler marks the
  // visited field without threading a callback through every input.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const field = resolvePatientFieldFromInputId((event.target as HTMLElement).id);
    if (field) onFieldBlur(field);
  };

  return (
    <div className="apx-patient-form" onBlur={handleBlur}>
      <PatientSection
        id="patient-section-identity"
        icon={<IconUser size={19} />}
        title="Datos personales"
        description="Completa tus datos tal como aparecen en tu documento de identidad."
      >
        <div className="apx-patient-grid">
          <DocumentTypeSelect
            value={values.documentType}
            onChange={(value) => onChange('documentType', value)}
            error={visibleErrors.documentType}
          />
          <DocumentNumberField
            documentType={values.documentType}
            value={values.documentNumber}
            onChange={(value) => onChange('documentNumber', value)}
            error={visibleErrors.documentNumber}
            isValidating={lookupState === 'loading'}
          />
          <PatientIdentityFields
            firstName={values.firstName}
            lastName={values.lastName}
            onFirstNameChange={(value) => onChange('firstName', value)}
            onLastNameChange={(value) => onChange('lastName', value)}
            firstNameError={visibleErrors.firstName}
            lastNameError={visibleErrors.lastName}
            isPrefilled={isPrefilled}
          />
        </div>

        {isLookupAvailable && (
          <PatientLookupNotice
            state={lookupState}
            onLookup={onLookup}
            disabled={!isDocumentNumberValid(values.documentType, values.documentNumber)}
          />
        )}
      </PatientSection>

      <PatientSection
        id="patient-section-contact"
        icon={<IconPhone size={19} />}
        title="Información de contacto"
        description="Usaremos esta información para enviarte los detalles de tu cita."
      >
        <div className="apx-patient-grid">
          <ContactFields
            phone={values.phone}
            email={values.email}
            onPhoneChange={(value) => onChange('phone', value)}
            onEmailChange={(value) => onChange('email', value)}
            phoneError={visibleErrors.phone}
            emailError={visibleErrors.email}
          />
        </div>
      </PatientSection>

      <PatientSection
        id="patient-section-reason"
        icon={<IconFileText size={19} className="apx-icon" />}
        title="Motivo de consulta"
        description="Este detalle ayuda al profesional a preparar tu atención."
        action={<span className="apx-patient-card__badge">Opcional</span>}
      >
        <ConsultationReasonField
          value={values.consultationReason}
          onChange={(value) => onChange('consultationReason', value)}
          error={visibleErrors.consultationReason}
          hideLabel
        />
      </PatientSection>

      <p className="apx-patient-form__footnote">* Campos obligatorios</p>

      <PrivacyNotice />
    </div>
  );
};
