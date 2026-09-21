import React from 'react';
import { TimeSlotGroup } from './TimeSlotGroup';
import { IconClock } from './AppointmentIcons';
import { DayAvailability, SlotAvailability } from './appointmentTypes';
import './AppointmentStep.css';

export interface AvailabilitySectionProps {
  day: DayAvailability;
  selectedDate: string;
  selectedTime: string;
  isLoading?: boolean;
  onSelect: (slot: SlotAvailability) => void;
  /** Clears the filters/refresh action of the empty state. */
  onRetry?: () => void;
}

/**
 * Day agenda: counter of published hours plus the grouped slot cards. The
 * grouping (mañana / tarde / noche) is organizational only.
 */
export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  day,
  selectedDate,
  selectedTime,
  isLoading = false,
  onSelect,
  onRetry,
}) => (
  <section className="apx-availability" aria-labelledby="apx-availability-title">
    <header className="apx-availability__header">
      <div>
        <h3 className="apx-availability__title" id="apx-availability-title">
          Horarios disponibles
        </h3>
        <p className="apx-availability__desc">Selecciona el horario que más te convenga.</p>
      </div>

      <span className="apx-availability__count" aria-live="polite">
        {day.availableCount === 1
          ? '1 horario disponible'
          : `${day.availableCount} horarios disponibles`}
      </span>
    </header>

    {isLoading && (
      <p className="apx-availability__empty" role="status">
        Consultando la disponibilidad del día...
      </p>
    )}

    {!isLoading && day.groups.length === 0 && (
      <div className="apx-availability__empty" role="status">
        <span className="apx-availability__empty-icon" aria-hidden="true">
          <IconClock size={22} />
        </span>
        <strong>No hay horarios publicados para este día</strong>
        <p>Elige otra fecha o vuelve al calendario para ver los días con atención.</p>
        {onRetry && (
          <button type="button" className="apx-availability__retry" onClick={onRetry}>
            Elegir otra fecha
          </button>
        )}
      </div>
    )}

    {!isLoading &&
      day.groups.map((group) => (
        <TimeSlotGroup
          key={group.id}
          group={group}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelect={onSelect}
        />
      ))}
  </section>
);
