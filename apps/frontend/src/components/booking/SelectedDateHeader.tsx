import React from 'react';
import { IconCalendar } from '../ui/Icons';
import './AppointmentStep.css';

export interface SelectedDateHeaderProps {
  /** Human date of the day being scheduled, e.g. "Martes, 08 de septiembre de 2026". */
  dateLabel: string;
  /** Short instruction shown under the date. */
  hint?: string;
  /** Returns to the calendar of the previous step without losing the booking. */
  onChangeDate: () => void;
}

/**
 * Day banner of the time-selection step: the chosen date, a one-line hint and
 * the shortcut back to the calendar.
 */
export const SelectedDateHeader: React.FC<SelectedDateHeaderProps> = ({
  dateLabel,
  hint = 'Selecciona un horario disponible',
  onChangeDate,
}) => (
  <header className="apx-datehead">
    <span className="apx-datehead__icon" aria-hidden="true">
      <IconCalendar size={22} />
    </span>

    <div className="apx-datehead__text">
      <h3 className="apx-datehead__title">{dateLabel}</h3>
      <p className="apx-datehead__hint">{hint}</p>
    </div>

    <button type="button" className="apx-datehead__action" onClick={onChangeDate}>
      <IconCalendar size={16} />
      Cambiar fecha
    </button>
  </header>
);
