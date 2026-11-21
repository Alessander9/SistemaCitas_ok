import React, { useCallback, useMemo, useState } from 'react';
import { AppointmentSummary } from './AppointmentSummary';
import { PatientForm } from './PatientForm';
import type { PatientLookupState } from './PatientLookupNotice';
import { addMinutesToTime, formatFullDate, formatTimeRange } from './dateUtils';
import {
  PatientFieldId,
  PatientFormValues,
  isDocumentNumberValid,
  validatePatientForm,
} from './patientCatalog';
import { fetchPatientByDocument, type PatientLookupMatch } from '../../services/api';
import type {
  ProfessionalCardModel,
  SelectedSpecialtySummary,
  ServiceCardModel,
} from './appointmentTypes';
import './AppointmentStep.css';

export interface AppointmentPatientStepProps {
  /** Patient form state, owned by the wizard so it survives navigation. */
  values: PatientFormValues;
  onChange: (field: PatientFieldId, value: string) => void;
  /** Applies the patient returned by GET /patients/by-document. */
  onApplyPatient: (patient: PatientLookupMatch) => void;
  specialty: SelectedSpecialtySummary | null;
  service: ServiceCardModel | null;
  professional: ProfessionalCardModel | null;
  location?: string;
  date: string;
  time: string;
  showSummary?: boolean;
}

const DEFAULT_LOCATION = 'Sede San Isidro';

/**
 * Step 6 — "Completa tus datos".
 * Owns the interaction state of the form (visited fields, document lookup) and
 * composes it with the always-visible appointment summary. The validation rules
 * themselves live in `patientCatalog`.
 */
export const AppointmentPatientStep: React.FC<AppointmentPatientStepProps> = ({
  values,
  onChange,
  onApplyPatient,
  specialty,
  service,
  professional,
  location = DEFAULT_LOCATION,
  date,
  time,
  showSummary = true,
}) => {
  const [touched, setTouched] = useState<Partial<Record<PatientFieldId, boolean>>>({});
  const [lookupState, setLookupState] = useState<PatientLookupState>('idle');
  const [isLookupAvailable, setIsLookupAvailable] = useState(true);

  const validation = useMemo(() => validatePatientForm(values), [values]);

  // Errors only show up on fields the patient already visited.
  const visibleErrors = useMemo(() => {
    const errors: Partial<Record<PatientFieldId, string>> = {};
    (Object.keys(validation.errors) as PatientFieldId[]).forEach((field) => {
      if (touched[field]) errors[field] = validation.errors[field];
    });
    return errors;
  }, [validation.errors, touched]);

  const runLookup = useCallback(async () => {
    if (!isDocumentNumberValid(values.documentType, values.documentNumber)) return;

    setLookupState('loading');
    const result = await fetchPatientByDocument({
      documentType: values.documentType,
      documentNumber: values.documentNumber,
    });

    if (result.status === 'unsupported') {
      // The backend has no public lookup endpoint yet: hide the affordance
      // instead of showing a button that cannot work.
      setIsLookupAvailable(false);
      setLookupState('idle');
      return;
    }

    if (result.status === 'not-found') {
      setLookupState('not-found');
      return;
    }

    onApplyPatient(result.patient);
    setLookupState('found');
  }, [values.documentType, values.documentNumber, onApplyPatient]);

  const handleFieldBlur = useCallback(
    (field: PatientFieldId) => {
      setTouched((previous) =>
        previous[field] ? previous : { ...previous, [field]: true },
      );

      // A complete document is looked up as soon as the patient leaves the
      // field, so existing records pre-fill without an extra tap.
      if (field === 'documentNumber' && lookupState === 'idle' && isLookupAvailable) {
        void runLookup();
      }
    },
    [lookupState, isLookupAvailable, runLookup],
  );

  const handleFieldChange = useCallback(
    (field: PatientFieldId, value: string) => {
      onChange(field, value);
      // Only a different document invalidates a previous lookup result.
      if (
        (field === 'documentNumber' || field === 'documentType') &&
        lookupState !== 'idle'
      ) {
        setLookupState('idle');
      }
    },
    [onChange, lookupState],
  );

  const timeRangeLabel =
    time && service
      ? formatTimeRange(time, addMinutesToTime(time, service.durationMinutes))
      : undefined;

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top apx-step__top--center">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            6. Completa tus datos
          </h2>
          <p className="apx-step__desc">
            Necesitamos algunos datos para registrar tu cita y asociarla a tu historia clínica.
          </p>
        </div>
      </div>

      <div className={`apx-patient-layout ${!showSummary ? 'apx-patient-layout--single' : ''}`}>
        <div className="apx-patient-layout__main">
          <PatientForm
            values={values}
            visibleErrors={visibleErrors}
            onChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            lookupState={lookupState}
            isLookupAvailable={isLookupAvailable}
            onLookup={runLookup}
            isPrefilled={lookupState === 'found'}
          />
        </div>

        {showSummary && (
          <div className="apx-patient-layout__aside">
            <AppointmentSummary
              dateLabel={date ? formatFullDate(date) : undefined}
              timeRangeLabel={timeRangeLabel}
              durationLabel={service ? `${service.durationMinutes} minutos` : undefined}
              professionalName={professional?.name}
              professionalLicense={professional?.licenseNumber}
              professionalProfession={professional?.profession}
              professionalPhotoUrl={professional?.photoUrl}
              specialtyName={specialty?.name}
              specialtyIconKey={specialty?.icon}
              serviceName={service?.name}
              location={location}
              priceLabel={
                service
                  ? `${service.currency === 'PEN' ? 'S/' : service.currency} ${service.price.toFixed(2)}`
                  : undefined
              }
              statusTitle="Estás a un paso de confirmar tu cita"
              statusMessage="Completa tus datos para continuar."
            />
          </div>
        )}
      </div>
    </section>
  );
};
