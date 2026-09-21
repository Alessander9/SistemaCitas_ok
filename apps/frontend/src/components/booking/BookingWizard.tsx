import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../../data/mockData';
import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { fetchSpecialties, fetchServices, fetchProfessionals, createAppointment } from '../../services/api';
import {
  ANY_AVAILABLE_PROFESSIONAL_ID,
  AppointmentConsentStep,
  AppointmentHeader,
  AppointmentNavigation,
  AppointmentPatientStep,
  AppointmentPaymentStep,
  AppointmentProfessionalStep,
  AppointmentReviewStep,
  AppointmentScheduleStep,
  AppointmentServiceStep,
  AppointmentTimeStep,
  AppointmentSpecialtyStep,
  AppointmentStepper,
  buildBookingValidation,
  buildSelectedSpecialtySummary,
  buildServiceCards,
  describePatientValidation,
  findProfessionalCard,
  formatLongDate,
  PatientFieldId,
  PatientFormValues,
  ReviewPatientInput,
  validatePatientForm,
} from './index';
import type { PatientLookupMatch } from '../../services/api';
import {
  APPOINTMENT_TOTAL_STEPS,
  APPOINTMENT_WIZARD_STEPS,
  resolveBackLabel,
  resolveNextLabel,
  resolveProgressPercent,
  resolveStepperIndex,
} from './appointmentFlow';
import './BookingWizard.css';

interface BookingWizardProps {
  onBackToHome: () => void;
  preselectedSpecialtyId?: string;
  preselectedServiceId?: string;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  onBackToHome,
  preselectedSpecialtyId,
  preselectedServiceId,
}) => {
  const [step, setStep] = useState<number>(() => {
    if (preselectedServiceId) return 3;
    if (preselectedSpecialtyId) return 2;
    return 1;
  });

  // Live Database State
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>(MOCK_SPECIALTIES);
  const [servicesList, setServicesList] = useState<MedicalService[]>(MOCK_SERVICES);
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(MOCK_PROFESSIONALS);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchSpecialties(), fetchServices(), fetchProfessionals()])
      .then(([specs, servs, profs]) => {
        if (isMounted) {
          if (specs && specs.length > 0) setSpecialtiesList(specs);
          if (servs && servs.length > 0) setServicesList(servs);
          if (profs && profs.length > 0) setProfessionalsList(profs);
        }
      })
      .catch((err) => console.warn('BookingWizard database sync:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Booking State
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(() => {
    return MOCK_SPECIALTIES.find((s) => s.id === preselectedSpecialtyId) || null;
  });

  const [selectedService, setSelectedService] = useState<MedicalService | null>(() => {
    return MOCK_SERVICES.find((s) => s.id === preselectedServiceId) || null;
  });

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  // The date and time are chosen in the schedule step; both stay empty until then.
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient Info (Step 6)
  const [patientDocType, setPatientDocType] = useState<string>('DNI');
  const [patientDocNumber, setPatientDocNumber] = useState<string>('');
  const [patientFirstName, setPatientFirstName] = useState<string>('');
  const [patientLastName, setPatientLastName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Policies (Step 8)
  const [acceptCancellationPolicy, setAcceptCancellationPolicy] = useState<boolean>(false);
  const [acceptDataProtection, setAcceptDataProtection] = useState<boolean>(false);
  // Tracks whether the patient tried to advance step 8 without accepting both policies.
  // Only set to true on a failed submit attempt so the alert stays hidden initially.
  const [consentSubmitAttempted, setConsentSubmitAttempted] = useState<boolean>(false);

  // Payment (Step 9)
  const [paymentMethod, setPaymentMethod] = useState<'CLINICA' | 'TARJETA'>('CLINICA');

  // Confirmation Details (Step 10 & 11)
  const [bookingCode, setBookingCode] = useState<string>('CIT-2026-8491');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // True while the patient is editing a block launched from the review step:
  // finishing (or cancelling) that step returns straight to the review.
  const [returnToReview, setReturnToReview] = useState<boolean>(false);

  // Filtered Services based on chosen Specialty
  const availableServices = selectedSpecialty
    ? servicesList.filter((s) => s.specialtyId === selectedSpecialty.id)
    : servicesList;

  // Selection is stored as an id (ANY_AVAILABLE_PROFESSIONAL_ID = auto-assign).
  const manualProfessionalId =
    selectedProfessionalId && selectedProfessionalId !== ANY_AVAILABLE_PROFESSIONAL_ID
      ? selectedProfessionalId
      : null;

  const selectedProfessionalRecord = manualProfessionalId
    ? professionalsList.find((prof) => prof.id === manualProfessionalId) ?? null
    : null;

  // View-models for the schedule step (memoized so the availability requests
  // are not re-triggered on every render).
  const scheduleSpecialty = useMemo(
    () => (selectedSpecialty ? buildSelectedSpecialtySummary(selectedSpecialty) : null),
    [selectedSpecialty],
  );
  const scheduleService = useMemo(
    () => (selectedService ? (buildServiceCards([selectedService])[0] ?? null) : null),
    [selectedService],
  );
  const scheduleProfessional = useMemo(
    () => findProfessionalCard(professionalsList, selectedProfessionalId, selectedSpecialty?.name),
    [professionalsList, selectedProfessionalId, selectedSpecialty],
  );

  // Step 7 reads the booking as it really is: the validation rules live in the
  // data layer, so the review screen and this guard can never disagree.
  const autoAssignProfessional = selectedProfessionalId === ANY_AVAILABLE_PROFESSIONAL_ID;
  const reviewPatient = useMemo<ReviewPatientInput>(
    () => ({
      docType: patientDocType,
      docNumber: patientDocNumber,
      firstName: patientFirstName,
      lastName: patientLastName,
      phone: patientPhone,
      email: patientEmail,
      notes: patientNotes,
    }),
    [
      patientDocType,
      patientDocNumber,
      patientFirstName,
      patientLastName,
      patientPhone,
      patientEmail,
      patientNotes,
    ],
  );

  // Step 6 works on the same values the review and the payload consume.
  const patientValues = useMemo<PatientFormValues>(
    () => ({
      documentType: patientDocType as PatientFormValues['documentType'],
      documentNumber: patientDocNumber,
      firstName: patientFirstName,
      lastName: patientLastName,
      phone: patientPhone,
      email: patientEmail,
      consultationReason: patientNotes,
    }),
    [
      patientDocType,
      patientDocNumber,
      patientFirstName,
      patientLastName,
      patientPhone,
      patientEmail,
      patientNotes,
    ],
  );

  const patientValidation = useMemo(
    () => validatePatientForm(patientValues),
    [patientValues],
  );

  const reviewValidation = useMemo(
    () =>
      buildBookingValidation({
        specialty: scheduleSpecialty,
        service: scheduleService,
        professional: scheduleProfessional,
        autoAssignProfessional,
        date: selectedDate,
        time: selectedTime,
        patient: reviewPatient,
      }),
    [
      scheduleSpecialty,
      scheduleService,
      scheduleProfessional,
      autoAssignProfessional,
      selectedDate,
      selectedTime,
      reviewPatient,
    ],
  );

  const handleNext = async () => {
    setFormError(null);

    if (step === 1 && !selectedSpecialty) {
      setFormError('Por favor selecciona una especialidad para continuar.');
      return;
    }
    if (step === 2 && !selectedService) {
      setFormError('Por favor selecciona un servicio o terapia para continuar.');
      return;
    }
    if (step === 6) {
      // Revalidated on submit; the CTA is already disabled while it is invalid.
      if (!patientValidation.isValid) {
        const missing = describePatientValidation(patientValidation);
        setFormError(
          missing.length > 0
            ? `Revisa los campos obligatorios: ${missing.join(', ')}.`
            : 'Revisa los datos obligatorios antes de continuar.',
        );
        return;
      }
    }
    if (step === 7 && !reviewValidation.isReady) {
      // Defensive guard: the CTA is already disabled while something is missing.
      const missing = reviewValidation.items
        .filter((item) => !item.isComplete)
        .map((item) => item.label)
        .join(', ');
      setFormError(`Falta completar: ${missing}.`);
      return;
    }
    if (step === 8) {
      if (!acceptCancellationPolicy || !acceptDataProtection) {
        // Signal the consent step to show its inline alert (no global formError banner).
        setConsentSubmitAttempted(true);
        return;
      }
      // Reset attempt flag when both are accepted and the step advances.
      setConsentSubmitAttempted(false);
    }
    if (step === 9) {
      setIsSubmitting(true);
      try {
        const appointmentRes = await createAppointment({
          professionalId:
            manualProfessionalId ||
            professionalsList[0]?.id ||
            'e0000000-0000-4000-a000-000000000001',
          serviceId: selectedService?.id || servicesList[0]?.id || 'd0000000-0000-4000-a000-000000000001',
          appointmentDate: selectedDate,
          startTime: selectedTime,
          patientDocType,
          patientDocNumber,
          patientFirstName,
          patientLastName,
          patientPhone,
          patientEmail,
          notes: patientNotes,
          paymentMethod,
        });
        if (appointmentRes?.bookingCode) {
          setBookingCode(appointmentRes.bookingCode);
        }
      } catch (err) {
        console.warn('Booking creation error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Coming from the review, any edited step leads back to it automatically.
    if (returnToReview) {
      backToReview();
      return;
    }

    setStep((prev) => Math.min(prev + 1, 11));
  };

  const handleBack = () => {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  /** Sends the patient back to the review keeping every selection untouched. */
  const backToReview = () => {
    setFormError(null);
    setReturnToReview(false);
    setStep(7);
  };

  /** Writes one field of the patient form (state lives here, not in the UI). */
  const handlePatientFieldChange = (field: PatientFieldId, value: string) => {
    switch (field) {
      case 'documentType':
        setPatientDocType(value);
        break;
      case 'documentNumber':
        setPatientDocNumber(value);
        break;
      case 'firstName':
        setPatientFirstName(value);
        break;
      case 'lastName':
        setPatientLastName(value);
        break;
      case 'phone':
        setPatientPhone(value);
        break;
      case 'email':
        setPatientEmail(value);
        break;
      case 'consultationReason':
        setPatientNotes(value);
        break;
      default:
        break;
    }
  };

  /** Pre-fills the form with the patient returned by GET /patients/by-document. */
  const handleApplyPatient = (patient: PatientLookupMatch) => {
    if (patient.firstName) setPatientFirstName(patient.firstName);
    if (patient.lastName) setPatientLastName(patient.lastName);
    if (patient.phone) setPatientPhone(patient.phone);
    if (patient.email) setPatientEmail(patient.email);
  };

  /**
   * Sends the patient back to the step that owns a review block without
   * touching the booking state, so nothing is lost (and the review is rebuilt
   * with the same data on the way back).
   */
  const handleEditStep = (targetStep: number) => {
    setFormError(null);
    setReturnToReview(true);
    setStep(Math.min(Math.max(targetStep, 1), 11));
  };

  const progressPercentage = resolveProgressPercent(step);
  const specialtyHint = selectedSpecialty
    ? `Especialidad: ${selectedSpecialty.name}`
    : 'Selecciona una especialidad para continuar';
  const serviceHint = selectedService
    ? `Servicio: ${selectedService.name}`
    : 'Selecciona un servicio para continuar';
  const professionalHint = !selectedProfessionalId
    ? 'Selecciona un profesional para continuar'
    : selectedProfessionalRecord
      ? `Profesional: ${selectedProfessionalRecord.firstName} ${selectedProfessionalRecord.lastName}`
      : 'Profesional: primero disponible';
  const dateHint = selectedDate
    ? `Fecha: ${formatLongDate(selectedDate)}`
    : 'Selecciona una fecha para continuar';
  const scheduleHint =
    selectedDate && selectedTime
      ? `${selectedDate} · ${selectedTime} hrs`
      : 'Selecciona un horario para continuar';

  return (
    <div className="wizard-page-container">
      <div className="wizard-shell">
        {/* Booking header + visual milestone stepper */}
        <AppointmentHeader
          currentStep={step}
          totalSteps={APPOINTMENT_TOTAL_STEPS}
          progressPercent={progressPercentage}
        />
        <AppointmentStepper
          steps={APPOINTMENT_WIZARD_STEPS}
          activeIndex={resolveStepperIndex(step)}
        />

        {/* Error Alert */}
        {formError && (
          <div className="apx-alert" role="alert">
            <span>{formError}</span>
          </div>
        )}

        {/* Content Body based on step */}
        <div className={`wizard-content${step <= 5 ? ' wizard-content--flush' : ''}`}>
          {/* PASO 1: Especialidad — premium specialty selection step */}
          {step === 1 && (
            <AppointmentSpecialtyStep
              specialties={specialtiesList}
              services={servicesList}
              professionals={professionalsList}
              selectedSpecialtyId={selectedSpecialty?.id ?? null}
              onSelectSpecialty={(specialty) => {
                setSelectedSpecialty(specialty);
                setSelectedService(null);
              }}
            />
          )}

          {/* PASO 2: Servicio — premium service selection step */}
          {step === 2 &&
            (selectedSpecialty ? (
              <AppointmentServiceStep
                specialty={selectedSpecialty}
                services={availableServices}
                selectedServiceId={selectedService?.id ?? null}
                onSelectService={setSelectedService}
                onChangeSpecialty={() => setStep(1)}
              />
            ) : (
              <div className="apx-step">
                <div className="apx-empty" role="status">
                  <h3 className="apx-empty__title">Selecciona una especialidad</h3>
                  <p className="apx-empty__text">
                    Necesitas elegir una especialidad para ver sus servicios disponibles.
                  </p>
                </div>
              </div>
            ))}

          {/* PASO 3: Profesional — premium professional selection step */}
          {step === 3 && (
            <AppointmentProfessionalStep
              professionals={professionalsList}
              specialtyName={selectedSpecialty?.name}
              selectedProfessionalId={selectedProfessionalId}
              onSelectProfessional={setSelectedProfessionalId}
            />
          )}

          {/* PASO 4: Fecha y hora — calendario mensual + agenda semanal */}
          {step === 4 && scheduleSpecialty && scheduleService && (
            <AppointmentScheduleStep
              specialty={scheduleSpecialty}
              service={scheduleService}
              professional={scheduleProfessional}
              professionalId={manualProfessionalId ?? undefined}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
              onEdit={() => setStep(1)}
            />
          )}

          {/* PASO 5: Horario — agenda del día + panel lateral sticky */}
          {step === 5 && scheduleSpecialty && scheduleService && (
            <AppointmentTimeStep
              specialty={scheduleSpecialty}
              service={scheduleService}
              professional={scheduleProfessional}
              professionalId={manualProfessionalId ?? undefined}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              onChangeDate={() => setStep(4)}
              onEdit={() => setStep(1)}
            />
          )}

          {/* PASO 6: Datos del paciente — formulario premium + resumen sticky */}
          {step === 6 && (
            <AppointmentPatientStep
              values={patientValues}
              onChange={handlePatientFieldChange}
              onApplyPatient={handleApplyPatient}
              specialty={scheduleSpecialty}
              service={scheduleService}
              professional={scheduleProfessional}
              date={selectedDate}
              time={selectedTime}
            />
          )}

          {/* PASO 7: Revisión — detalles por bloques + resumen de pago + validación */}
          {step === 7 && (
            <AppointmentReviewStep
              specialty={scheduleSpecialty}
              service={scheduleService}
              professional={scheduleProfessional}
              autoAssignProfessional={autoAssignProfessional}
              date={selectedDate}
              time={selectedTime}
              patient={reviewPatient}
              onEditStep={handleEditStep}
              onContinue={handleNext}
              isBusy={isSubmitting}
            />
          )}

          {/* PASO 8: Políticas y Consentimiento — premium redesign */}
          {step === 8 && (
            <AppointmentConsentStep
              cancellationAccepted={acceptCancellationPolicy}
              privacyAccepted={acceptDataProtection}
              onCancellationToggle={() => {
                setAcceptCancellationPolicy((v) => !v);
                // Clear the error hint once the patient starts correcting.
                if (!acceptCancellationPolicy) setConsentSubmitAttempted(false);
              }}
              onPrivacyToggle={() => {
                setAcceptDataProtection((v) => !v);
                if (!acceptDataProtection) setConsentSubmitAttempted(false);
              }}
              hasSubmitError={consentSubmitAttempted}
              specialtyName={scheduleSpecialty?.name}
              specialtyIconKey={scheduleSpecialty?.icon}
              serviceName={scheduleService?.name}
              durationLabel={
                scheduleService?.durationMinutes
                  ? `${scheduleService.durationMinutes} minutos`
                  : undefined
              }
              professionalName={
                selectedProfessionalRecord
                  ? `${selectedProfessionalRecord.firstName} ${selectedProfessionalRecord.lastName}`
                  : undefined
              }
              professionalLicense={selectedProfessionalRecord?.licenseNumber}
              professionalPhotoUrl={selectedProfessionalRecord?.avatarUrl ?? null}
              dateLabel={selectedDate ? formatLongDate(selectedDate) : undefined}
              timeRangeLabel={selectedTime || undefined}
              patientName={
                patientFirstName || patientLastName
                  ? `${patientFirstName} ${patientLastName}`.trim()
                  : undefined
              }
              location="Sede San Isidro"
              priceLabel={
                selectedService?.price != null
                  ? `S/ ${selectedService.price.toFixed(2)}`
                  : undefined
              }
            />
          )}

          {/* PASO 9: Método de Pago — Premium Redesign */}
          {step === 9 && (
            <AppointmentPaymentStep
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              specialtyName={scheduleSpecialty?.name}
              specialtyIconKey={scheduleSpecialty?.icon}
              serviceName={scheduleService?.name}
              durationLabel={
                scheduleService?.durationMinutes
                  ? `${scheduleService.durationMinutes} minutos`
                  : undefined
              }
              professionalName={
                selectedProfessionalRecord
                  ? `${selectedProfessionalRecord.firstName} ${selectedProfessionalRecord.lastName}`
                  : 'Primero disponible'
              }
              professionalLicense={selectedProfessionalRecord?.licenseNumber}
              professionalPhotoUrl={selectedProfessionalRecord?.avatarUrl ?? null}
              dateLabel={selectedDate ? formatLongDate(selectedDate) : undefined}
              timeRangeLabel={selectedTime ? `${selectedTime} hrs` : undefined}
              location="Sede San Isidro"
              locationAddress="Av. Emilio Cavenecia 225, San Isidro, Lima"
              price={selectedService?.price ?? 150}
              currency={selectedService?.currency ?? 'PEN'}
              onEditBooking={() => handleEditStep(7)}
              onTimerExpired={() => {
                setFormError('El tiempo para completar la reserva ha vencido. Por favor selecciona tu horario nuevamente.');
                setStep(4);
              }}
            />
          )}

          {/* PASO 10: Confirmación */}
          {step === 10 && (
            <div className="confirmation-success-box">
              <div className="success-icon-badge" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>¡Tu Cita ha sido Reservada con Éxito!</h2>
              <p style={{ color: 'var(--slate-300)', marginTop: '0.5rem' }}>
                Hemos enviado un correo de confirmación a <strong>{patientEmail}</strong> con todos los detalles.
              </p>

              <div className="booking-code-card">
                <div className="booking-code-label">Código de Reserva</div>
                <div className="booking-code-val">{bookingCode}</div>
              </div>

              <div style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', color: 'var(--slate-400)' }}>
                <span>📅 {selectedDate} a las {selectedTime} hrs</span> • <span>🩺 {selectedService?.name}</span>
              </div>
            </div>
          )}

          {/* PASO 11: Acciones Post-Reserva */}
          {step === 11 && (
            <div className="confirmation-success-box">
              <h2>11. Acciones y Recordatorios</h2>
              <p style={{ color: 'var(--slate-300)' }}>Guarda tu cita o agrégala a tu calendario personal.</p>

              <div className="post-booking-actions">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => alert('Evento generado: cita agendada en tu calendario.')}
                >
                  📅 Añadir a Google Calendar
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => alert(`Descargando comprobante para código ${bookingCode}...`)}
                >
                  📄 Descargar Comprobante PDF
                </button>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <button type="button" className="btn-wizard-next" onClick={onBackToHome} style={{ margin: '0 auto' }}>
                  Volver a la Página Principal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {step <= 10 && (
          <AppointmentNavigation
            onBack={step === 1 ? onBackToHome : handleBack}
            onNext={handleNext}
            backLabel={resolveBackLabel(step)}
            nextLabel={returnToReview ? 'Volver a la revisión' : resolveNextLabel(step, paymentMethod)}
            nextDisabled={
              (step === 1 && !selectedSpecialty) ||
              (step === 2 && !selectedService) ||
              (step === 3 && !selectedProfessionalId) ||
              (step === 4 && !selectedDate) ||
              (step === 5 && (!selectedDate || !selectedTime)) ||
              (step === 6 && !patientValidation.isValid) ||
              (step === 7 && !reviewValidation.isReady) ||
              (step === 8 && (!acceptCancellationPolicy || !acceptDataProtection))
            }
            /* Step 7 owns its primary action inside the payment summary. */
            showNext={step !== 7}
            note={
              step === 7
                ? 'Tus datos están protegidos y serán utilizados únicamente para gestionar tu atención.'
                : undefined
            }
            isBusy={isSubmitting}
            hint={
              step === 1
                ? specialtyHint
                : step === 2
                  ? serviceHint
                  : step === 3
                    ? professionalHint
                    : step === 4
                      ? dateHint
                      : step === 5
                        ? scheduleHint
                        : step === 6
                          ? patientValidation.isValid
                            ? 'Datos completos'
                            : 'Completa los campos obligatorios'
                          : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
