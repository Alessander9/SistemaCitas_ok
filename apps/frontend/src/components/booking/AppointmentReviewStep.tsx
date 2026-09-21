import React, { useMemo, useState } from 'react';
import { BookingReview } from './BookingReview';
import { PaymentSummary } from './PaymentSummary';
import { ValidationStatus } from './ValidationStatus';
import { PolicyModal } from './PolicyModal';
import { IconAlert, IconCheck } from './AppointmentIcons';
import { buildBookingReview, ReviewPatientInput } from './reviewCatalog';
import { DEFAULT_SPECIALTY_LOCATION_ADDRESS } from './specialtyCatalog';
import type {
  ProfessionalCardModel,
  SelectedSpecialtySummary,
  ServiceCardModel,
} from './appointmentTypes';
import './AppointmentStep.css';

export interface AppointmentReviewStepProps {
  specialty: SelectedSpecialtySummary | null;
  service: ServiceCardModel | null;
  /** null when the patient chose the automatic assignment. */
  professional: ProfessionalCardModel | null;
  /** true when the patient picked "cualquier profesional disponible". */
  autoAssignProfessional?: boolean;
  date: string;
  time: string;
  location?: string;
  locationAddress?: string;
  patient: ReviewPatientInput;
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
  onCancellationToggle: () => void;
  onPrivacyToggle: () => void;
  hasConsentError?: boolean;
  /** Sends the patient back to the step that owns a block, keeping the booking. */
  onEditStep: (step: number) => void;
  onContinue: () => void;
  isBusy?: boolean;
}

/**
 * Step 7 — "Revisa tu reserva".
 * Owns nothing but the composition: the data layer resolves the blocks, the
 * payment breakdown and the validation from the real booking state.
 */
export const AppointmentReviewStep: React.FC<AppointmentReviewStepProps> = ({
  specialty,
  service,
  professional,
  autoAssignProfessional = false,
  date,
  time,
  location = 'Sede San Isidro',
  locationAddress = DEFAULT_SPECIALTY_LOCATION_ADDRESS,
  patient,
  cancellationAccepted,
  privacyAccepted,
  onCancellationToggle,
  onPrivacyToggle,
  hasConsentError = false,
  onEditStep,
  onContinue,
  isBusy = false,
}) => {
  const [modalType, setModalType] = useState<'cancellation' | 'privacy' | null>(null);

  const review = useMemo(
    () =>
      buildBookingReview({
        specialty,
        service,
        professional,
        autoAssignProfessional,
        date,
        time,
        patient,
        location,
        locationAddress,
      }),
    [
      specialty,
      service,
      professional,
      autoAssignProfessional,
      date,
      time,
      patient,
      location,
      locationAddress,
    ],
  );

  const { isReady } = review.validation;
  const isBothConsentsAccepted = cancellationAccepted && privacyAccepted;

  return (
    <section className="apx-step apx-review-step" aria-labelledby="review-step-title">
      <div className="apx-step__top apx-step__top--center">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="review-step-title">
            4. Revisa tu reserva y acepta las políticas
          </h2>
          <p className="apx-step__desc">
            Verifica que todos los datos de tu cita sean correctos y confirma los consentimientos médicos.
          </p>
        </div>

        <p className={`apx-note${isReady && isBothConsentsAccepted ? '' : ' apx-note--warn'}`} role="status">
          <span className="apx-note__icon" aria-hidden="true">
            {isReady && isBothConsentsAccepted ? <IconCheck size={18} /> : <IconAlert size={18} />}
          </span>
          <span className="apx-note__text">
            <strong>{isReady && isBothConsentsAccepted ? 'Reserva lista' : 'Acción requerida'}</strong>
            {isReady && isBothConsentsAccepted
              ? 'Revisa la información y continúa al pago.'
              : 'Verifica los datos y acepta los consentimientos obligatorios para continuar.'}
          </span>
        </p>
      </div>

      <div className="apx-split apx-split--review">
        <div className="apx-split__main">
          <BookingReview
            blocks={review.blocks}
            patient={patient}
            locationAddress={review.locationAddress}
            onEditStep={onEditStep}
          />

          {/* Integrated Consent Policies */}
          <div className={`apx-consent-group ${hasConsentError && !isBothConsentsAccepted ? 'apx-consent-group--error' : ''}`}>
            <h3 className="apx-consent-group__title">Consentimientos y Políticas Requeridas</h3>

            <label className="apx-consent-checkbox-card">
              <input
                type="checkbox"
                checked={cancellationAccepted}
                onChange={onCancellationToggle}
                className="apx-consent-checkbox"
              />
              <div className="apx-consent-checkbox__text">
                <strong>Acepto la Política de Cancelación y Reprogramación</strong>
                <span>
                  Entiendo que puedo cancelar o reprogramar sin costo hasta 24 horas antes de mi cita.{' '}
                  <button
                    type="button"
                    className="apx-inline-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalType('cancellation');
                    }}
                  >
                    Ver términos
                  </button>
                </span>
              </div>
            </label>

            <label className="apx-consent-checkbox-card">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={onPrivacyToggle}
                className="apx-consent-checkbox"
              />
              <div className="apx-consent-checkbox__text">
                <strong>Acepto la Protección y Tratamiento de Datos Personales</strong>
                <span>
                  Autorizo el uso de mi información médica de acuerdo a la Ley N° 29733.{' '}
                  <button
                    type="button"
                    className="apx-inline-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalType('privacy');
                    }}
                  >
                    Ver términos
                  </button>
                </span>
              </div>
            </label>

            {hasConsentError && !isBothConsentsAccepted && (
              <p className="apx-consent-error-msg" role="alert">
                ⚠️ Debes aceptar ambos consentimientos para poder continuar con la reserva.
              </p>
            )}
          </div>
        </div>

        <aside className="apx-split__aside">
          <div className="apx-aside-stack">
            <PaymentSummary
              payment={review.payment}
            />
            <ValidationStatus
              validation={review.validation}
              onContinue={onContinue}
              continueLabel="Continuar al pago"
              continueDisabled={!isReady || !isBothConsentsAccepted}
              isBusy={isBusy}
            />
          </div>
        </aside>
      </div>

      {modalType && (
        <PolicyModal
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </section>
  );
};
