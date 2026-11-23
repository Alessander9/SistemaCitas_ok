import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { NewBookingInput, PatientProfileInfo, PatientUpcomingAppointment } from './types';

const AVAILABLE_DATES = [
  'Viernes, 11 Sep',
  'Sábado, 12 Sep',
  'Lunes, 14 Sep',
  'Martes, 15 Sep',
  'Miércoles, 16 Sep',
  'Jueves, 17 Sep',
];

const MORNING_SLOTS = ['09:00 AM', '10:30 AM', '11:45 AM'];
const AFTERNOON_SLOTS = ['03:00 PM', '04:30 PM', '06:00 PM'];

const BOOKING_SERVICES = [
  {
    id: 'plan_lumbar',
    title: 'Rehabilitación de Columna Lumbar (Sesión 9/10)',
    doctorName: 'Dra. María González',
    doctorSpecialty: 'Fisioterapia y Rehabilitación',
    durationLabel: '45 min',
    priceLabel: 'S/ 80.00',
    recommended: true,
    subtitle: 'Continúa tu plan activo · Tarifa preferencial',
  },
  {
    id: 'fisio_general',
    title: 'Evaluación Inicial de Fisioterapia',
    doctorName: 'Dra. María González',
    doctorSpecialty: 'Fisioterapia y Rehabilitación',
    durationLabel: '45 min',
    priceLabel: 'S/ 100.00',
    recommended: false,
    subtitle: 'Evaluación física completa para una nueva molestia',
  },
  {
    id: 'trauma',
    title: 'Consulta de Traumatología',
    doctorName: 'Dr. Carlos Mendoza',
    doctorSpecialty: 'Traumatología y Ortopedia',
    durationLabel: '30 min',
    priceLabel: 'S/ 150.00',
    recommended: false,
    subtitle: 'Evaluación articular y revisión de imágenes',
  },
];

/* ---------------------------------------------------------------------------
   1. Modal de Reprogramación
   --------------------------------------------------------------------------- */
interface RescheduleModalProps {
  appointment: PatientUpcomingAppointment;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]);
  const [selectedTime, setSelectedTime] = useState(MORNING_SLOTS[1]);

  return (
    <div className="pd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Cambiar fecha de cita">
      <div className="pd-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-header">
          <div>
            <h3>Cambiar fecha de tu cita</h3>
            <p>
              Actual: {appointment.dateLabel} · {appointment.timeLabel}
            </p>
          </div>
          <button type="button" className="pd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="pd-modal-body">
          <div className="pd-field-block">
            <label className="pd-field-label">1. Elige un nuevo día</label>
            <div className="pd-choice-grid">
              {AVAILABLE_DATES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`pd-choice-btn ${selectedDate === d ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-field-block">
            <label className="pd-field-label">2. Elige un horario</label>
            <span className="pd-slot-group-title">Mañana</span>
            <div className="pd-choice-grid">
              {MORNING_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pd-choice-btn ${selectedTime === t ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <span className="pd-slot-group-title">Tarde</span>
            <div className="pd-choice-grid">
              {AFTERNOON_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pd-choice-btn ${selectedTime === t ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pd-modal-footer">
          <button type="button" className="pd-btn-secondary" onClick={onClose}>
            Volver
          </button>
          <button
            type="button"
            className="pd-btn-primary"
            onClick={() => {
              onConfirm(selectedDate, selectedTime);
              onClose();
            }}
          >
            <MaterialIcon name="check" size={16} />
            <span>Confirmar cambio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   2. Modal de Cancelación
   --------------------------------------------------------------------------- */
interface CancelAppointmentModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Motivos laborales o de estudio');

  return (
    <div className="pd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Cancelar cita">
      <div className="pd-modal-box pd-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-header">
          <div>
            <h3>¿Deseas cancelar tu cita?</h3>
            <p>Puedes hacerlo sin costo hasta 2 horas antes de tu turno.</p>
          </div>
          <button type="button" className="pd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="pd-modal-body">
          <div className="pd-field-block">
            <label htmlFor="cancel-reason-select" className="pd-field-label">
              Motivo (opcional)
            </label>
            <select
              id="cancel-reason-select"
              className="pd-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Motivos laborales o de estudio">Motivos laborales o de estudio</option>
              <option value="Inconveniente de salud o movilidad">Inconveniente de salud o movilidad</option>
              <option value="Viaje no planificado">Viaje no planificado</option>
              <option value="Otro motivo personal">Otro motivo personal</option>
            </select>
          </div>
        </div>

        <div className="pd-modal-footer">
          <button type="button" className="pd-btn-secondary" onClick={onClose}>
            Conservar cita
          </button>
          <button
            type="button"
            className="pd-btn-danger"
            onClick={() => {
              onConfirm(reason);
              onClose();
            }}
          >
            Sí, cancelar cita
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   3. Modal de Nueva Cita Express (3 pasos)
   --------------------------------------------------------------------------- */
interface QuickBookingModalProps {
  onClose: () => void;
  onBooked: (input: NewBookingInput) => void;
}

export const QuickBookingModal: React.FC<QuickBookingModalProps> = ({
  onClose,
  onBooked,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState<string>(BOOKING_SERVICES[0].id);
  const [mode, setMode] = useState<'presencial' | 'teleconsulta'>('presencial');
  const [dateLabel, setDateLabel] = useState<string>(AVAILABLE_DATES[2]);
  const [timeLabel, setTimeLabel] = useState<string>(MORNING_SLOTS[1]);
  const [paymentMethod, setPaymentMethod] = useState<'clinica' | 'yape' | 'eps'>('clinica');

  const selectedService = BOOKING_SERVICES.find((s) => s.id === serviceId) || BOOKING_SERVICES[0];

  const handleConfirm = () => {
    onBooked({
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      doctorName: selectedService.doctorName,
      doctorSpecialty: selectedService.doctorSpecialty,
      durationLabel: selectedService.durationLabel,
      mode,
      dateLabel,
      timeLabel,
      paymentMethod,
      priceLabel: selectedService.priceLabel,
    });
    onClose();
  };

  return (
    <div className="pd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Agendar nueva cita">
      <div className="pd-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-header">
          <div>
            <h3>Nueva cita</h3>
            <p>Paso {step} de 3 · Reserva en menos de un minuto</p>
          </div>
          <button type="button" className="pd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="pd-modal-body">
          {step === 1 && (
            <div className="pd-service-list">
              {BOOKING_SERVICES.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  className={`pd-service-card ${serviceId === svc.id ? 'selected' : ''}`}
                  onClick={() => setServiceId(svc.id)}
                >
                  <div className="pd-service-card-left">
                    {svc.recommended && <span className="pd-recommended-tag">Recomendado · Plan activo</span>}
                    <strong>{svc.title}</strong>
                    <span>{svc.subtitle}</span>
                    <small>{svc.doctorName} · {svc.durationLabel}</small>
                  </div>
                  <strong className="pd-service-price">{svc.priceLabel}</strong>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="pd-field-block">
                <label className="pd-field-label">Modalidad</label>
                <div className="pd-mode-row">
                  <button
                    type="button"
                    className={`pd-choice-btn ${mode === 'presencial' ? 'selected' : ''}`}
                    onClick={() => setMode('presencial')}
                  >
                    <MaterialIcon name="location_on" size={16} />
                    <span>Presencial</span>
                  </button>
                  <button
                    type="button"
                    className={`pd-choice-btn ${mode === 'teleconsulta' ? 'selected' : ''}`}
                    onClick={() => setMode('teleconsulta')}
                  >
                    <MaterialIcon name="videocam" size={16} />
                    <span>Teleconsulta</span>
                  </button>
                </div>
              </div>

              <div className="pd-field-block">
                <label className="pd-field-label">Día</label>
                <div className="pd-choice-grid">
                  {AVAILABLE_DATES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`pd-choice-btn ${dateLabel === d ? 'selected' : ''}`}
                      onClick={() => setDateLabel(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pd-field-block">
                <label className="pd-field-label">Hora</label>
                <div className="pd-choice-grid">
                  {[...MORNING_SLOTS, ...AFTERNOON_SLOTS].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`pd-choice-btn ${timeLabel === t ? 'selected' : ''}`}
                      onClick={() => setTimeLabel(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="pd-booking-summary">
                <strong>{selectedService.title}</strong>
                <span>{selectedService.doctorName} · {mode === 'presencial' ? 'Sede San Isidro' : 'Teleconsulta Online'}</span>
                <div className="pd-booking-summary-foot">
                  <span>{dateLabel} · {timeLabel}</span>
                  <strong>{selectedService.priceLabel}</strong>
                </div>
              </div>

              <div className="pd-field-block">
                <label className="pd-field-label">¿Cómo prefieres pagar?</label>
                <div className="pd-service-list">
                  {[
                    { id: 'clinica', label: 'Pagar en clínica al asistir', sub: 'Efectivo, tarjeta o Yape en recepción' },
                    { id: 'yape', label: 'Pagar ahora con Yape / Plin', sub: 'Confirmación instantánea' },
                    { id: 'eps', label: 'Usar mi seguro / EPS', sub: 'Pacífico, Rímac, Sanitas o Mapfre' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`pd-service-card ${paymentMethod === opt.id ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(opt.id as 'clinica' | 'yape' | 'eps')}
                    >
                      <div className="pd-service-card-left">
                        <strong>{opt.label}</strong>
                        <span>{opt.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pd-modal-footer">
          {step > 1 ? (
            <button type="button" className="pd-btn-secondary" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
              Anterior
            </button>
          ) : (
            <button type="button" className="pd-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button type="button" className="pd-btn-primary" onClick={() => setStep((s) => (s + 1) as 2 | 3)}>
              Continuar
            </button>
          ) : (
            <button type="button" className="pd-btn-primary" onClick={handleConfirm}>
              <MaterialIcon name="check" size={16} />
              <span>Confirmar cita</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   4. Modal de Perfil del Paciente (absorbe lo esencial de PatientPortal)
   --------------------------------------------------------------------------- */
interface PatientProfileModalProps {
  profile: PatientProfileInfo;
  onClose: () => void;
  onDownloadFullHistory: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  profile,
  onClose,
  onDownloadFullHistory,
}) => {
  return (
    <div className="pd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mi perfil">
      <div className="pd-modal-box pd-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-header">
          <div>
            <h3>Mi perfil</h3>
            <p>{profile.clinicName}</p>
          </div>
          <button type="button" className="pd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="pd-modal-body">
          <div className="pd-profile-grid">
            <div className="pd-profile-row">
              <span>Nombre completo</span>
              <strong>{profile.fullName}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Documento (DNI)</span>
              <strong>{profile.documentNumber}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Teléfono</span>
              <strong>{profile.phone}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Correo</span>
              <strong>{profile.email}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Grupo sanguíneo</span>
              <strong>{profile.bloodType}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Alergias</span>
              <strong>{profile.allergies}</strong>
            </div>
            <div className="pd-profile-row">
              <span>Contacto de emergencia</span>
              <strong>{profile.emergencyContact}</strong>
            </div>
          </div>
        </div>

        <div className="pd-modal-footer">
          <button type="button" className="pd-btn-secondary" onClick={onDownloadFullHistory}>
            <MaterialIcon name="download" size={16} />
            <span>Descargar historial completo</span>
          </button>
          <button type="button" className="pd-btn-primary" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
