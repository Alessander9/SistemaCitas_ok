import React from 'react';
import { IconFileText } from '../ui/Icons';
import {
  IconCheck,
  IconClock,
  IconInfo,
  IconLocation,
  IconPencil,
  resolveSpecialtyIcon,
} from './AppointmentIcons';
import { SpecialtyIconKey } from './appointmentTypes';
import './AppointmentStep.css';

export interface SelectedAppointmentProps {
  isComplete: boolean;
  /** Panel heading ("Cita seleccionada" in step 4, "Tu cita" in step 5). */
  title?: string;
  subtitle?: string;
  dateLabel?: string;
  timeRangeLabel?: string;
  durationLabel?: string;
  professionalName?: string;
  professionalLicense?: string;
  /** Profession / specialty line of the professional. */
  professionalProfession?: string;
  professionalPhotoUrl?: string | null;
  serviceName?: string;
  specialtyName?: string;
  specialtyIconKey?: SpecialtyIconKey;
  location?: string;
  priceLabel?: string;
  /** Replaces the default note with a success/status box. */
  statusMessage?: string;
  /** Empty-state copy shown before a slot is chosen. */
  emptyTitle?: string;
  emptyText?: string;
  onEdit?: () => void;
}

/** Right-hand panel with the appointment being booked (or its empty state). */
export const SelectedAppointment: React.FC<SelectedAppointmentProps> = ({
  isComplete,
  title = 'Cita seleccionada',
  subtitle,
  dateLabel,
  timeRangeLabel,
  durationLabel,
  professionalName,
  professionalLicense,
  professionalProfession,
  professionalPhotoUrl,
  serviceName,
  specialtyName,
  specialtyIconKey,
  location,
  priceLabel,
  statusMessage,
  emptyTitle = 'Selecciona un horario',
  emptyText = 'Los detalles de tu cita aparecerán aquí.',
  onEdit,
}) => {
  const SpecialtyIcon = resolveSpecialtyIcon(specialtyIconKey ?? 'default');

  return (
    <aside className="apx-appointment" aria-label={title}>
      <header className="apx-appointment__header">
        <span className="apx-appointment__header-icon" aria-hidden="true">
          <IconFileText size={18} />
        </span>
        <span className="apx-appointment__heading">
          <h3 className="apx-appointment__title">{title}</h3>
          {subtitle && <span className="apx-appointment__subtitle">{subtitle}</span>}
        </span>
      </header>

      {isComplete ? (
        <>
          <dl className="apx-appointment__rows">
            <div className="apx-appointment__row">
              <dt>
                <IconClock size={15} className="apx-icon apx-icon--muted" />
                Fecha
              </dt>
              <dd>{dateLabel}</dd>
            </div>

            <div className="apx-appointment__row">
              <dt>
                <IconClock size={15} className="apx-icon apx-icon--muted" />
                Horario
              </dt>
              <dd>
                {timeRangeLabel}
                {durationLabel && <small>({durationLabel})</small>}
              </dd>
            </div>

            <div className="apx-appointment__row">
              <dt>
                {professionalPhotoUrl ? (
                  <img
                    className="apx-appointment__avatar"
                    src={professionalPhotoUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <IconInfo size={15} className="apx-icon apx-icon--muted" />
                )}
                Profesional
              </dt>
              <dd>
                {professionalName}
                {professionalLicense && <small>{professionalLicense}</small>}
                {professionalProfession && <small>{professionalProfession}</small>}
              </dd>
            </div>

            <div className="apx-appointment__row">
              <dt>
                <IconFileText size={15} className="apx-icon apx-icon--muted" />
                Servicio
              </dt>
              <dd>{serviceName}</dd>
            </div>

            <div className="apx-appointment__row">
              <dt>
                <SpecialtyIcon size={15} className="apx-icon apx-icon--muted" />
                Especialidad
              </dt>
              <dd>{specialtyName}</dd>
            </div>

            {location && (
              <div className="apx-appointment__row">
                <dt>
                  <IconLocation size={15} className="apx-icon apx-icon--muted" />
                  Sede
                </dt>
                <dd>{location}</dd>
              </div>
            )}
          </dl>

          {priceLabel && (
            <div className="apx-appointment__price">
              <span>Precio del servicio</span>
              <strong>{priceLabel}</strong>
            </div>
          )}

          {onEdit && (
            <button type="button" className="apx-appointment__edit" onClick={onEdit}>
              <IconPencil size={14} />
              Cambiar horario
            </button>
          )}

          {statusMessage ? (
            <p className="apx-appointment__status">
              <span className="apx-appointment__status-icon" aria-hidden="true">
                <IconCheck size={16} />
              </span>
              <span>
                <strong>Horario seleccionado</strong>
                {statusMessage}
              </span>
            </p>
          ) : (
            <p className="apx-appointment__note">
              <IconInfo size={15} />
              Podrás confirmar los detalles de tu cita en el siguiente paso.
            </p>
          )}
        </>
      ) : (
        <div className="apx-appointment__empty">
          <strong>{emptyTitle}</strong>
          <p>{emptyText}</p>
        </div>
      )}
    </aside>
  );
};
