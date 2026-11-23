import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { PatientUpcomingAppointment } from './types';

interface NextAppointmentCardProps {
  appointment: PatientUpcomingAppointment | null;
  onReschedule: () => void;
  onCancel: () => void;
  onAddToCalendar: () => void;
  onBookNew: () => void;
}

export const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointment,
  onReschedule,
  onCancel,
  onAddToCalendar,
  onBookNew,
}) => {
  if (!appointment) {
    return (
      <section className="pd-hero-card pd-hero-empty" aria-label="Próxima cita">
        <div className="pd-hero-empty-icon">
          <MaterialIcon name="event_available" size={28} />
        </div>
        <div className="pd-hero-empty-body">
          <h2>No tienes citas programadas</h2>
          <p>Agenda tu siguiente sesión en menos de un minuto para continuar con tu recuperación.</p>
        </div>
        <button type="button" className="pd-btn-primary" onClick={onBookNew}>
          <MaterialIcon name="calendar_today" size={16} />
          <span>Agendar próxima cita</span>
        </button>
      </section>
    );
  }

  return (
    <section className="pd-hero-card" aria-label="Tu próxima cita">
      <div className="pd-hero-top">
        <div className="pd-hero-badges">
          <span className="pd-status-pill confirmed">
            <span className="pd-dot-live" />
            Próxima cita confirmada
          </span>
          <span className="pd-countdown-pill">{appointment.countdownLabel}</span>
        </div>

        <button
          type="button"
          className="pd-link-btn"
          onClick={onAddToCalendar}
          title="Guardar en mi calendario"
        >
          <MaterialIcon name="event" size={16} />
          <span>Recordarme</span>
        </button>
      </div>

      <div className="pd-hero-schedule">
        <div className="pd-hero-datetime">
          <MaterialIcon name="schedule" size={20} />
          <span>
            {appointment.dateLabel} · <strong>{appointment.timeLabel}</strong>
          </span>
        </div>
        <h2 className="pd-hero-title">
          {appointment.title}
          <span className="pd-hero-duration">({appointment.durationLabel})</span>
        </h2>
      </div>

      <div className="pd-hero-details">
        <div className="pd-hero-detail-item">
          <div className="pd-doctor-badge">{appointment.doctorInitials}</div>
          <div>
            <span className="pd-detail-label">Especialista</span>
            <strong className="pd-detail-value">{appointment.doctorName}</strong>
            <span className="pd-detail-sub">{appointment.doctorSpecialty}</span>
          </div>
        </div>

        <div className="pd-hero-detail-item">
          <div className="pd-location-badge">
            <MaterialIcon
              name={appointment.mode === 'teleconsulta' ? 'videocam' : 'location_on'}
              size={18}
            />
          </div>
          <div>
            <span className="pd-detail-label">
              {appointment.mode === 'teleconsulta' ? 'Modalidad Online' : 'Ubicación'}
            </span>
            <strong className="pd-detail-value">{appointment.locationLabel}</strong>
            <span className="pd-detail-sub">
              {appointment.mode === 'teleconsulta'
                ? 'Enlace disponible 10 min antes'
                : 'Llega 10 min antes de tu turno'}
            </span>
          </div>
        </div>
      </div>

      <div className="pd-hero-actions">
        <button type="button" className="pd-btn-secondary" onClick={onReschedule}>
          <MaterialIcon name="edit_calendar" size={16} />
          <span>Cambiar fecha</span>
        </button>
        <button type="button" className="pd-btn-danger-ghost" onClick={onCancel}>
          <MaterialIcon name="close" size={16} />
          <span>Cancelar cita</span>
        </button>
      </div>
    </section>
  );
};
