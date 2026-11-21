import React, { useState, useEffect, useMemo } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../../data/mockData';
import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { fetchSpecialties, fetchServices, fetchProfessionals, createAppointment } from '../../services/api';
import {
  ANY_AVAILABLE_PROFESSIONAL_ID,
  AppointmentCheckoutStep,
  AppointmentHeader,
  AppointmentNavigation,
  AppointmentPatientStep,
  AppointmentReceiptModal,
  AppointmentReviewStep,
  AppointmentScheduleStep,
  AppointmentSelectionStep,
  AppointmentStepper,
  CardPaymentFormValues,
  OnlinePaymentMethodId,
  PlinPaymentFormValues,
  TransferPaymentFormValues,
  YapePaymentFormValues,
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
import { StickyBookingSidebar } from './StickyBookingSidebar';
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
  const [step, setStep] = useState<number>(1);

  // Live Database State
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>(MOCK_SPECIALTIES);
  const [servicesList, setServicesList] = useState<MedicalService[]>(MOCK_SERVICES);
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(MOCK_PROFESSIONALS);

  // Booking State (Step 1)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(() => {
    return MOCK_SPECIALTIES.find((s) => s.id === preselectedSpecialtyId) || null;
  });

  const [selectedService, setSelectedService] = useState<MedicalService | null>(() => {
    return MOCK_SERVICES.find((s) => s.id === preselectedServiceId) || null;
  });

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(
    ANY_AVAILABLE_PROFESSIONAL_ID,
  );

  // Date & Time (Step 2)
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient Info (Step 3)
  const [patientDocType, setPatientDocType] = useState<string>('DNI');
  const [patientDocNumber, setPatientDocNumber] = useState<string>('');
  const [patientFirstName, setPatientFirstName] = useState<string>('');
  const [patientLastName, setPatientLastName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Policies & Consent (Step 4)
  const [acceptCancellationPolicy, setAcceptCancellationPolicy] = useState<boolean>(false);
  const [acceptDataProtection, setAcceptDataProtection] = useState<boolean>(false);
  const [consentSubmitAttempted, setConsentSubmitAttempted] = useState<boolean>(false);

  // Payment Selection (Step 5)
  const [paymentMethod, setPaymentMethod] = useState<'CLINICA' | 'TARJETA'>('TARJETA');
  const [onlineSubMethod, setOnlineSubMethod] = useState<OnlinePaymentMethodId>('CARD');
  const [cardValues, setCardValues] = useState<CardPaymentFormValues>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    saveCard: false,
  });
  const [yapeValues, setYapeValues] = useState<YapePaymentFormValues>({
    phoneNumber: '',
    approvalCode: '',
  });
  const [plinValues, setPlinValues] = useState<PlinPaymentFormValues>({
    phoneNumber: '',
    otpCode: '',
  });
  const [transferValues, setTransferValues] = useState<TransferPaymentFormValues>({
    bankName: 'BCP',
    operationNumber: '',
  });

  // Confirmation Details (Step 6)
  const [bookingCode, setBookingCode] = useState<string>('CIT-2026-8491');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [returnToReview, setReturnToReview] = useState<boolean>(false);

  // Fetch from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [specs, servs, profs] = await Promise.all([
          fetchSpecialties(),
          fetchServices(),
          fetchProfessionals(),
        ]);
        if (!isMounted) return;
        if (specs?.length) setSpecialtiesList(specs);
        if (servs?.length) setServicesList(servs);
        if (profs?.length) setProfessionalsList(profs);
      } catch (err) {
        console.warn('API error, using mock catalog data:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Selection is stored as an id (ANY_AVAILABLE_PROFESSIONAL_ID = auto-assign).
  const manualProfessionalId =
    selectedProfessionalId && selectedProfessionalId !== ANY_AVAILABLE_PROFESSIONAL_ID
      ? selectedProfessionalId
      : null;

  const selectedProfessionalRecord = manualProfessionalId
    ? professionalsList.find((prof) => prof.id === manualProfessionalId) ?? null
    : null;

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

    // Paso 1: Especialidad y Servicio
    if (step === 1) {
      if (!selectedSpecialty) {
        setFormError('Por favor selecciona una especialidad para continuar.');
        return;
      }
      if (!selectedService) {
        setFormError('Por favor selecciona un servicio o terapia para continuar.');
        return;
      }
    }

    // Paso 2: Fecha y Horario
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        setFormError('Por favor selecciona la fecha y el turno horario deseado.');
        return;
      }
    }

    // Paso 3: Datos del paciente
    if (step === 3) {
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

    // Paso 4: Revisión y Consentimientos
    if (step === 4) {
      if (!reviewValidation.isReady) {
        const missing = reviewValidation.items
          .filter((item) => !item.isComplete)
          .map((item) => item.label)
          .join(', ');
        setFormError(`Falta completar: ${missing}.`);
        return;
      }
      if (!acceptCancellationPolicy || !acceptDataProtection) {
        setConsentSubmitAttempted(true);
        return;
      }
      setConsentSubmitAttempted(false);
    }

    // Paso 5: Pago y Confirmación de reserva
    if (step === 5) {
      setIsSubmitting(true);
      try {
        const appointmentRes = await createAppointment({
          professionalId:
            manualProfessionalId ||
            professionalsList[0]?.id ||
            'e0000000-0000-4000-a000-000000000001',
          serviceId: selectedService?.id || servicesList[0]?.id || 'd0000000-0000-4000-a000-000000000001',
          appointmentDate: selectedDate || '2026-09-24',
          startTime: selectedTime || '05:30 PM',
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

    if (returnToReview) {
      backToReview();
      return;
    }

    setStep((prev) => Math.min(prev + 1, APPOINTMENT_TOTAL_STEPS));
  };

  const handleBack = () => {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const backToReview = () => {
    setFormError(null);
    setReturnToReview(false);
    setStep(4);
  };

  const handleAddToGoogleCalendar = () => {
    const title = encodeURIComponent(
      `Cita Médica: ${selectedService?.name || 'Consulta Médica'} - VitalSalud`,
    );
    const details = encodeURIComponent(
      `Código de Reserva: ${bookingCode}\n` +
      `Especialidad: ${selectedSpecialty?.name || 'Medicina General'}\n` +
      `Servicio: ${selectedService?.name || 'Consulta Médica'}\n` +
      `Profesional: ${scheduleProfessional?.name || 'Médico Asignado'}\n` +
      `Paciente: ${patientFirstName || 'Paciente'} ${patientLastName || ''} (${patientDocType || 'DNI'}: ${patientDocNumber || ''})\n` +
      `Sede: Av. Javier Prado Este 2465, San Isidro, Lima\n\n` +
      `Por favor presentarse 15 minutos antes de la hora programada para el control de triaje.`,
    );
    const location = encodeURIComponent('VitalSalud - Av. Javier Prado Este 2465, San Isidro, Lima');

    let datesParam = '';
    if (selectedDate) {
      const cleanDate = selectedDate.replace(/-/g, '');
      datesParam = `&dates=${cleanDate}T153000Z/${cleanDate}T163000Z`;
    }

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

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

  const handleApplyPatient = (patient: PatientLookupMatch) => {
    if (patient.firstName) setPatientFirstName(patient.firstName);
    if (patient.lastName) setPatientLastName(patient.lastName);
    if (patient.phone) setPatientPhone(patient.phone);
    if (patient.email) setPatientEmail(patient.email);
  };

  const handleEditStep = (targetStep: number) => {
    setFormError(null);
    setReturnToReview(true);
    setStep(targetStep);
  };

  const progressPercentage = resolveProgressPercent(step, APPOINTMENT_TOTAL_STEPS);
  const serviceHint = selectedService
    ? `Servicio: ${selectedService.name}`
    : 'Selecciona un servicio para continuar';
  const scheduleHint =
    selectedDate && selectedTime
      ? `${selectedDate} · ${selectedTime} hrs`
      : 'Selecciona un horario para continuar';

  return (
    <div className="wizard-page-container">
      <div className="wizard-shell wizard-shell--wide">
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
        <div className={`wizard-content${step <= 2 ? ' wizard-content--flush' : ''}`}>
          <div className={step <= 3 ? 'apx-split-layout' : ''}>
            <div className={step <= 3 ? 'apx-split-main' : ''}>
              {/* PASO 1: Especialidad, Servicio y Profesional */}
              {step === 1 && (
                <AppointmentSelectionStep
                  specialties={specialtiesList}
                  services={servicesList}
                  professionals={professionalsList}
                  selectedSpecialtyId={selectedSpecialty?.id ?? null}
                  selectedServiceId={selectedService?.id ?? null}
                  selectedProfessionalId={selectedProfessionalId}
                  onSelectSpecialty={(specialty) => {
                    setSelectedSpecialty(specialty);
                    setSelectedService(null);
                  }}
                  onSelectService={setSelectedService}
                  onSelectProfessional={setSelectedProfessionalId}
                />
              )}

              {/* PASO 2: Fecha y Horario integrados */}
              {step === 2 && scheduleSpecialty && scheduleService && (
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

              {/* PASO 3: Datos del paciente */}
              {step === 3 && (
                <AppointmentPatientStep
                  values={patientValues}
                  onChange={handlePatientFieldChange}
                  onApplyPatient={handleApplyPatient}
                  specialty={scheduleSpecialty}
                  service={scheduleService}
                  professional={scheduleProfessional}
                  date={selectedDate}
                  time={selectedTime}
                  showSummary={false}
                />
              )}
            </div>

            {step <= 3 && (
              <StickyBookingSidebar
                step={step}
                totalSteps={APPOINTMENT_TOTAL_STEPS}
                specialty={selectedSpecialty}
                service={selectedService}
                professionalRecord={selectedProfessionalRecord}
                autoAssignProfessional={autoAssignProfessional}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>

          {/* PASO 4: Revisión de la cita + Políticas integradas */}
          {step === 4 && (
            <AppointmentReviewStep
              specialty={scheduleSpecialty}
              service={scheduleService}
              professional={scheduleProfessional}
              autoAssignProfessional={autoAssignProfessional}
              date={selectedDate}
              time={selectedTime}
              patient={reviewPatient}
              cancellationAccepted={acceptCancellationPolicy}
              privacyAccepted={acceptDataProtection}
              onCancellationToggle={() => {
                setAcceptCancellationPolicy((v) => !v);
                if (!acceptCancellationPolicy) setConsentSubmitAttempted(false);
              }}
              onPrivacyToggle={() => {
                setAcceptDataProtection((v) => !v);
                if (!acceptDataProtection) setConsentSubmitAttempted(false);
              }}
              hasConsentError={consentSubmitAttempted}
              onEditStep={handleEditStep}
              onContinue={handleNext}
              isBusy={isSubmitting}
            />
          )}

          {/* PASO 5: Pago y Confirmación de reserva */}
          {step === 5 && (
            <AppointmentCheckoutStep
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              selectedSubMethod={onlineSubMethod}
              onSelectSubMethod={setOnlineSubMethod}
              cardValues={cardValues}
              onCardChange={setCardValues}
              yapeValues={yapeValues}
              onYapeChange={setYapeValues}
              plinValues={plinValues}
              onPlinChange={setPlinValues}
              transferValues={transferValues}
              onTransferChange={setTransferValues}
              price={selectedService?.price ?? 150}
              currency={selectedService?.currency === 'USD' ? 'USD' : 'PEN'}
              specialtyName={scheduleSpecialty?.name ?? 'Traumatología y Ortopedia'}
              serviceName={scheduleService?.name ?? 'Consulta Médica Traumatológica'}
              durationLabel={
                scheduleService?.durationMinutes
                  ? `${scheduleService.durationMinutes} minutos`
                  : '30 minutos'
              }
              professionalName={
                selectedProfessionalRecord
                  ? `${selectedProfessionalRecord.firstName} ${selectedProfessionalRecord.lastName}`
                  : 'Dr. Carlos Mendoza Ruiz'
              }
              professionalLicense={selectedProfessionalRecord?.licenseNumber ?? 'CMP-51294'}
              professionalPhotoUrl={selectedProfessionalRecord?.avatarUrl ?? null}
              dateLabel={selectedDate ? formatLongDate(selectedDate) : 'Jueves, 24 de septiembre de 2026'}
              timeRangeLabel={selectedTime ? `${selectedTime} hrs` : '05:30 PM – 06:00 PM'}
              location="Sede San Isidro"
              locationAddress="Av. Emilio Cavenecia 225, San Isidro, Lima"
              patientName={
                patientFirstName || patientLastName
                  ? `${patientFirstName} ${patientLastName}`.trim()
                  : undefined
              }
              isProcessing={isSubmitting}
              onEditBooking={() => handleEditStep(4)}
              onTimerExpired={() => {
                setFormError('El tiempo para completar la reserva ha vencido. Por favor selecciona tu horario nuevamente.');
                setStep(2);
              }}
            />
          )}

          {/* PASO 6: Confirmación de reserva y comprobante */}
          {step === 6 && (
            <div className="confirmation-success-box">
              <div className="success-icon-badge" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>¡Tu Cita ha sido Reservada con Éxito!</h2>
              <p style={{ color: 'var(--slate-300)', marginTop: '0.5rem' }}>
                Hemos enviado un correo de confirmación a <strong>{patientEmail || 'tu correo registrado'}</strong> con todos los detalles.
              </p>

              <div className="booking-code-card">
                <div className="booking-code-label">Código de Reserva</div>
                <div className="booking-code-val">{bookingCode}</div>
              </div>

              <div style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MaterialIcon name="calendar_today" size={16} /> {selectedDate || '2026-09-24'} a las {selectedTime || '05:30 PM'} hrs
                </span>
                •
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MaterialIcon name="medical_services" size={16} /> {selectedService?.name || 'Consulta Médica'}
                </span>
              </div>

              <div className="post-booking-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={handleAddToGoogleCalendar}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <MaterialIcon name="event" size={18} />
                  <span>Añadir a Google Calendar</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setIsReceiptModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <MaterialIcon name="description" size={18} />
                  <span>Descargar Comprobante PDF</span>
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
        {step <= 5 && (
          <AppointmentNavigation
            onBack={step === 1 ? onBackToHome : handleBack}
            onNext={handleNext}
            backLabel={resolveBackLabel(step)}
            nextLabel={
              returnToReview
                ? 'Volver a la revisión'
                : resolveNextLabel(step, paymentMethod, selectedService?.price ?? 150)
            }
            nextDisabled={
              (step === 1 && (!selectedSpecialty || !selectedService)) ||
              (step === 2 && (!selectedDate || !selectedTime)) ||
              (step === 3 && !patientValidation.isValid) ||
              (step === 4 && (!reviewValidation.isReady || !acceptCancellationPolicy || !acceptDataProtection)) ||
              isSubmitting
            }
            showNext={step !== 4}
            note={
              step === 4
                ? 'Tus datos están protegidos y serán utilizados únicamente para gestionar tu atención.'
                : undefined
            }
            isBusy={isSubmitting}
            hint={
              step === 1
                ? serviceHint
                : step === 2
                  ? scheduleHint
                  : step === 3
                    ? patientValidation.isValid
                      ? 'Datos completos'
                      : 'Completa los campos obligatorios'
                    : undefined
            }
          />
        )}
      </div>

      {isReceiptModalOpen && (
        <AppointmentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          bookingCode={bookingCode}
          specialtyName={selectedSpecialty?.name || 'Traumatología y Ortopedia'}
          serviceName={selectedService?.name || 'Consulta Médica Traumatológica'}
          servicePrice={selectedService?.price ?? 150}
          serviceDuration={selectedService?.durationMinutes ?? 30}
          doctorName={scheduleProfessional?.name || 'Dr. Carlos Mendoza Ruiz'}
          doctorLicense={scheduleProfessional?.licenseNumber || 'CMP-48291 • RNE-24190'}
          appointmentDate={selectedDate || '2026-11-21'}
          appointmentTime={selectedTime || '10:30 hrs'}
          patientName={`${patientFirstName || 'Luis'} ${patientLastName || 'Fernández'}`.trim()}
          patientDocType={patientDocType || 'DNI'}
          patientDocNumber={patientDocNumber || '08502322'}
          patientPhone={patientPhone || '+51 987 654 321'}
          patientEmail={patientEmail || 'arsrq@gmail.com'}
          paymentMethod={paymentMethod}
          paymentSubMethod={paymentMethod === 'TARJETA' ? onlineSubMethod : undefined}
          location="Sede San Isidro"
          locationAddress="Av. Javier Prado Este 2465, San Isidro, Lima"
        />
      )}
    </div>
  );
};
