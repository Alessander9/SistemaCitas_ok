import React, { useState } from 'react';
import { IconFileText } from '../ui/Icons';
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconLocation,
  IconUser,
  resolveSpecialtyIcon,
} from './AppointmentIcons';
import { SpecialtyIconKey } from './appointmentTypes';
import './AppointmentStep.css';

export interface AppointmentSummaryProps {
  dateLabel?: string;
  timeRangeLabel?: string;
  durationLabel?: string;
  professionalName?: string;
  professionalLicense?: string;
  professionalProfession?: string;
  professionalPhotoUrl?: string | null;
  specialtyName?: string;
  specialtyIconKey?: SpecialtyIconKey;
  serviceName?: string;
  patientName?: string;
  location?: string;
  priceLabel?: string;
  statusTitle?: string;
  statusMessage?: string;
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  meta?: string;
  photoUrl?: string | null;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ icon, label, value, meta, photoUrl }) => (
  <div className="apx-appointment-row">
    <span className="apx-appointment-row__icon" aria-hidden="true">
      {photoUrl ? (
        <img className="apx-appointment-row__photo" src={photoUrl} alt="" loading="lazy" />
      ) : (
        icon
      )}
    </span>
    <span className="apx-appointment-row__text">
      <small className="apx-appointment-row__label">{label}</small>
      <strong className="apx-appointment-row__value">{value}</strong>
      {meta && <span className="apx-appointment-row__meta">{meta}</span>}
    </span>
  </div>
);

/**
 * Sticky context panel: what is being booked, kept visible while the patient
 * fills the form. On phones it collapses into a "Ver resumen de la cita"
 * accordion so the form stays the focus.
 */
export const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  dateLabel,
  timeRangeLabel,
  durationLabel,
  professionalName,
  professionalLicense,
  professionalProfession,
  professionalPhotoUrl,
  specialtyName,
  specialtyIconKey,
  serviceName,
  patientName,
  location,
  priceLabel,
  statusTitle = 'Estás a un paso de confirmar tu cita',
  statusMessage = 'Completa tus datos para continuar.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const SpecialtyIcon = resolveSpecialtyIcon(specialtyIconKey ?? 'default');

  return (
    <aside className="apx-appointment-card" aria-labelledby="apx-appointment-card-title">
      <header className="apx-appointment-card__header">
        <span className="apx-appointment-card__icon" aria-hidden="true">
          <IconCalendar size={19} />
        </span>
        <div className="apx-appointment-card__heading">
          <h3 className="apx-appointment-card__title" id="apx-appointment-card-title">
            Resumen de tu cita
          </h3>
          <p className="apx-appointment-card__subtitle">Revisa los detalles de tu reserva</p>
        </div>
        <button
          type="button"
          className={`apx-appointment-card__toggle${isOpen ? ' is-open' : ''}`}
          aria-expanded={isOpen}
          aria-controls="apx-appointment-card-body"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? 'Ocultar resumen' : 'Ver resumen de la cita'}
          <IconChevronDown size={15} />
        </button>
      </header>

      <div
        className={`apx-appointment-card__body${isOpen ? '' : ' is-collapsed'}`}
        id="apx-appointment-card-body"
      >
        <SummaryRow
          icon={<IconCalendar size={17} />}
          label="Fecha"
          value={dateLabel ?? 'Por definir'}
        />
        <SummaryRow
          icon={<IconClock size={17} />}
          label="Horario"
          value={timeRangeLabel ?? 'Por definir'}
          meta={durationLabel}
        />
        <SummaryRow
          icon={<IconUser size={17} />}
          label="Profesional"
          value={professionalName ?? 'Primero disponible'}
          meta={[professionalLicense, professionalProfession].filter(Boolean).join(' · ') || undefined}
          photoUrl={professionalPhotoUrl}
        />
        {patientName && (
          <SummaryRow
            icon={<IconUser size={17} />}
            label="Paciente"
            value={patientName}
          />
        )}
        <SummaryRow
          icon={<IconFileText size={17} className="apx-icon" />}
          label="Servicio"
          value={serviceName ?? 'Por definir'}
        />
        <SummaryRow
          icon={<SpecialtyIcon size={17} />}
          label="Especialidad"
          value={specialtyName ?? 'Por definir'}
        />
        <SummaryRow icon={<IconLocation size={17} />} label="Sede" value={location ?? 'San Isidro'} />

        <div className="apx-appointment-card__price">
          <span className="apx-appointment-card__price-label">Precio del servicio</span>
          <strong className="apx-appointment-card__price-value">{priceLabel ?? '—'}</strong>
        </div>

        <p className="apx-appointment-card__status">
          <span className="apx-appointment-card__status-icon" aria-hidden="true">
            <IconCheck size={15} />
          </span>
          <span>
            <strong>{statusTitle}</strong>
            {statusMessage}
          </span>
        </p>
      </div>
    </aside>
  );
};
