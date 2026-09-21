import React, { useState, useCallback, useId, useRef, useEffect } from 'react';
import { ConsentCard } from './ConsentCard';
import { PolicyModal } from './PolicyModal';
import { ConsentStatusChecklist } from './ConsentStatusChecklist';
import { AppointmentSummary } from './AppointmentSummary';
import { IconShieldCheck, IconCalendar, IconAlert } from './AppointmentIcons';
import { SpecialtyIconKey } from './appointmentTypes';
import './AppointmentStep.css';

// =============================================================================
// CitasSistema — AppointmentConsentStep (Step 8)
// Premium redesign: two-column layout (70 / 30), full-card consent cards,
// accessible policy modals, animated error alert and booking status checklist.
// =============================================================================

/** Policy document definitions — content lives here, not in the UI layer. */
const CANCELLATION_POLICY_VERSION = '2026-01';
const PRIVACY_POLICY_VERSION = '2026-01';

const CANCELLATION_POLICY_BODY = `Puedes cancelar o reprogramar tu cita sin penalidad hasta 24 horas antes de la hora de atención programada. En caso de inasistencia sin previo aviso, el horario reservado podrá considerarse perdido y quedará disponible para otro paciente.`;

const CANCELLATION_POLICY_FULL: React.ReactNode = (
  <>
    <p>
      <strong>1. Cancelación sin penalidad</strong>
      <br />
      El paciente puede cancelar o reprogramar su cita sin costo adicional siempre que lo realice con un
      mínimo de 24 horas de anticipación respecto a la hora de atención confirmada.
    </p>
    <p>
      <strong>2. Cancelación tardía</strong>
      <br />
      Las cancelaciones realizadas con menos de 24 horas de anticipación podrán estar sujetas a la retención
      del depósito de reserva, si aplica.
    </p>
    <p>
      <strong>3. Inasistencia (No-Show)</strong>
      <br />
      En caso de inasistencia sin previo aviso, el horario reservado se considerará perdido. El sistema
      registrará el evento y podrá afectar futuras reservas según el historial del paciente.
    </p>
    <p>
      <strong>4. Reprogramación</strong>
      <br />
      El paciente puede reprogramar su cita hasta 2 veces sin penalidad, respetando la ventana de 24 horas.
      A partir de la tercera reprogramación se podrá solicitar un depósito de reserva.
    </p>
    <p>
      <strong>5. Casos de fuerza mayor</strong>
      <br />
      En situaciones de emergencia médica debidamente justificada, la institución evaluará la situación de
      manera individual y flexible.
    </p>
  </>
);

const PRIVACY_POLICY_BODY = `Autorizo el tratamiento de mis datos personales y de contacto para la gestión de citas, recordatorios automáticos y apertura o actualización de mi historia clínica, conforme a la política de privacidad de la institución.`;

const PRIVACY_POLICY_FULL: React.ReactNode = (
  <>
    <p>
      <strong>1. Responsable del tratamiento</strong>
      <br />
      La institución médica es responsable del tratamiento de sus datos personales, en cumplimiento de la
      Ley N.° 29733 — Ley de Protección de Datos Personales del Perú y su reglamento.
    </p>
    <p>
      <strong>2. Datos recopilados</strong>
      <br />
      Se recopilan: nombre completo, tipo y número de documento de identidad, número de teléfono (WhatsApp),
      correo electrónico y, opcionalmente, el motivo de consulta o síntomas referidos por el paciente.
    </p>
    <p>
      <strong>3. Finalidad del tratamiento</strong>
      <br />
      Los datos serán utilizados exclusivamente para: confirmación y gestión de citas, envío de recordatorios
      automáticos, apertura o actualización de la historia clínica, y comunicaciones operativas relacionadas
      con la atención médica.
    </p>
    <p>
      <strong>4. Compartición de datos</strong>
      <br />
      Los datos no serán compartidos con terceros con fines comerciales. Podrán ser compartidos con el
      equipo médico asignado y con sistemas operativos internos de la institución.
    </p>
    <p>
      <strong>5. Derechos del titular</strong>
      <br />
      El paciente puede ejercer sus derechos de acceso, rectificación, cancelación y oposición (ARCO)
      contactando a la institución a través de los canales oficiales.
    </p>
    <p>
      <strong>6. Plazo de conservación</strong>
      <br />
      Los datos se conservarán durante el tiempo que la relación médico-paciente esté vigente y durante
      el plazo legalmente establecido para la historia clínica.
    </p>
  </>
);

// -----------------------------------------------------------------------

export interface AppointmentConsentStepProps {
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
  onCancellationToggle: () => void;
  onPrivacyToggle: () => void;
  /** Set to true after a failed submit attempt to show field-level errors. */
  hasSubmitError?: boolean;
  /** Booking summary props passed to the right-column card. */
  specialtyName?: string;
  specialtyIconKey?: SpecialtyIconKey;
  serviceName?: string;
  durationLabel?: string;
  professionalName?: string;
  professionalLicense?: string;
  professionalPhotoUrl?: string | null;
  dateLabel?: string;
  timeRangeLabel?: string;
  patientName?: string;
  location?: string;
  priceLabel?: string;
}

type ModalType = 'cancellation' | 'privacy' | null;

/**
 * Step 8 — Políticas y Consentimiento.
 * Orchestrates the two-column layout, consent cards, modals and status panel.
 */
export const AppointmentConsentStep: React.FC<AppointmentConsentStepProps> = ({
  cancellationAccepted,
  privacyAccepted,
  onCancellationToggle,
  onPrivacyToggle,
  hasSubmitError = false,
  specialtyName,
  specialtyIconKey,
  serviceName,
  durationLabel,
  professionalName,
  professionalLicense,
  professionalPhotoUrl,
  dateLabel,
  timeRangeLabel,
  patientName,
  location,
  priceLabel,
}) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const alertId = useId();
  const alertRef = useRef<HTMLDivElement>(null);

  // Show error alert only when a submit was attempted and policies are missing
  const showError = hasSubmitError && (!cancellationAccepted || !privacyAccepted);

  // Announce the alert to screen readers when it appears
  useEffect(() => {
    if (showError) {
      alertRef.current?.focus();
    }
  }, [showError]);

  const bothAccepted = cancellationAccepted && privacyAccepted;

  const handleCancellationToggle = useCallback(() => {
    onCancellationToggle();
  }, [onCancellationToggle]);

  const handlePrivacyToggle = useCallback(() => {
    onPrivacyToggle();
  }, [onPrivacyToggle]);

  const acceptedTimestamp = bothAccepted
    ? new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : undefined;

  return (
    <div className="apx-step">
      {/* Step heading */}
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title">8. Revisa y acepta las condiciones</h2>
          <p className="apx-step__desc">
            Antes de continuar, necesitamos tu autorización para gestionar tu cita y tus datos
            personales.
          </p>
        </div>
      </div>

      {/* Animated error alert — only shown after a failed submit */}
      {showError && (
        <div
          ref={alertRef}
          className="apx-consent-alert"
          role="alert"
          id={alertId}
          tabIndex={-1}
        >
          <span className="apx-consent-alert__icon" aria-hidden="true">
            <IconAlert size={18} />
          </span>
          <div>
            <strong className="apx-consent-alert__title">Revisa los campos obligatorios</strong>
            <p className="apx-consent-alert__body">
              Debes aceptar las políticas requeridas para continuar con tu reserva.
            </p>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="apx-consent-layout">
        {/* ── LEFT: consent forms (70%) ── */}
        <div className="apx-consent-layout__main">
          {/* Card 1 — Cancellation policy */}
          <ConsentCard
            id="cancellation"
            title="Política de cancelación y reprogramación"
            badge="Obligatorio"
            icon={<IconCalendar size={20} />}
            body={CANCELLATION_POLICY_BODY}
            linkLabel="Leer política completa"
            accepted={cancellationAccepted}
            hasError={hasSubmitError && !cancellationAccepted}
            onToggle={handleCancellationToggle}
            onReadMore={() => setOpenModal('cancellation')}
            acceptedAt={cancellationAccepted ? acceptedTimestamp : undefined}
          />

          {/* Card 2 — Privacy policy */}
          <ConsentCard
            id="privacy"
            title="Tratamiento de datos personales"
            badge="Obligatorio"
            icon={<IconShieldCheck size={20} />}
            body={PRIVACY_POLICY_BODY}
            linkLabel="Leer política de privacidad"
            accepted={privacyAccepted}
            hasError={hasSubmitError && !privacyAccepted}
            onToggle={handlePrivacyToggle}
            onReadMore={() => setOpenModal('privacy')}
            acceptedAt={privacyAccepted ? acceptedTimestamp : undefined}
          />

          {/* Authorization summary block */}
          <div className="apx-consent-auth-block" aria-hidden="true">
            <span className="apx-consent-auth-block__icon">
              <IconShieldCheck size={18} />
            </span>
            <div>
              <strong className="apx-consent-auth-block__title">Tu autorización</strong>
              <p className="apx-consent-auth-block__text">
                Al continuar, confirmas que has leído y aceptado las condiciones requeridas para
                gestionar tu cita y el tratamiento de tus datos personales.
              </p>
            </div>
          </div>

          {/* Booking status checklist */}
          <ConsentStatusChecklist
            cancellationAccepted={cancellationAccepted}
            privacyAccepted={privacyAccepted}
          />
        </div>

        {/* ── RIGHT: booking summary (30%) ── */}
        <div className="apx-consent-layout__aside">
          <AppointmentSummary
            specialtyName={specialtyName}
            specialtyIconKey={specialtyIconKey}
            serviceName={serviceName}
            durationLabel={durationLabel}
            professionalName={professionalName}
            professionalLicense={professionalLicense}
            professionalPhotoUrl={professionalPhotoUrl}
            dateLabel={dateLabel}
            timeRangeLabel={timeRangeLabel}
            patientName={patientName}
            location={location}
            priceLabel={priceLabel}
            statusTitle={
              bothAccepted
                ? 'Reserva lista para confirmar'
                : 'Falta aceptar las políticas requeridas.'
            }
            statusMessage={
              bothAccepted
                ? 'Has aceptado todas las políticas requeridas.'
                : 'Acepta las condiciones para continuar.'
            }
          />
        </div>
      </div>

      {/* Policy modals */}
      <PolicyModal
        isOpen={openModal === 'cancellation'}
        title="Política de cancelación y reprogramación"
        lastUpdated="Septiembre 2026"
        content={CANCELLATION_POLICY_FULL}
        onClose={() => setOpenModal(null)}
      />
      <PolicyModal
        isOpen={openModal === 'privacy'}
        title="Tratamiento de datos personales"
        lastUpdated="Septiembre 2026"
        content={PRIVACY_POLICY_FULL}
        onClose={() => setOpenModal(null)}
      />
    </div>
  );
};

export { CANCELLATION_POLICY_VERSION, PRIVACY_POLICY_VERSION };
