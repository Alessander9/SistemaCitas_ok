import React, { useMemo } from 'react';
import { BookingReview } from './BookingReview';
import { PaymentSummary } from './PaymentSummary';
import { ValidationStatus } from './ValidationStatus';
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
  onEditStep,
  onContinue,
  isBusy = false,
}) => {
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

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top apx-step__top--center">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            7. Revisa tu reserva
          </h2>
          <p className="apx-step__desc">
            Verifica que todos los datos de tu cita sean correctos antes de continuar.
          </p>
        </div>

        <p className={`apx-note${isReady ? '' : ' apx-note--warn'}`} role="status">
          <span className="apx-note__icon" aria-hidden="true">
            {isReady ? <IconCheck size={18} /> : <IconAlert size={18} />}
          </span>
          <span className="apx-note__text">
            <strong>{isReady ? 'Reserva casi lista' : 'Reserva incompleta'}</strong>
            {isReady
              ? 'Revisa la información y continúa.'
              : 'Completa los datos marcados para continuar.'}
          </span>
        </p>
      </div>

      <div className="apx-review-layout">
        <div className="apx-review-layout__main">
          <BookingReview blocks={review.blocks} onEditStep={onEditStep} />
        </div>

        <div className="apx-review-layout__aside">
          <PaymentSummary payment={review.payment} />
          <ValidationStatus
            validation={review.validation}
            onContinue={onContinue}
            continueDisabled={!isReady}
            isBusy={isBusy}
          />
        </div>
      </div>
    </section>
  );
};
