import React from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
} from './AppointmentIcons';
import { CalendarDay } from './appointmentTypes';
import { CALENDAR_WEEKDAYS, MONTH_LEGEND } from './availabilityCatalog';
import { formatLongDate, formatMonthYear } from './dateUtils';
import './AppointmentStep.css';

export interface MonthCalendarProps {
  /** Any ISO date inside the month being displayed. */
  monthDate: string;
  days: CalendarDay[];
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

/** Monthly availability calendar (Monday first, Sunday included as closed day). */
export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  monthDate,
  days,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => (
  <section className="apx-month" aria-label="Calendario de disponibilidad">
    <h3 className="apx-month__heading">Selecciona una fecha</h3>

    <div className="apx-month__bar">
      <button type="button" className="apx-iconbtn" onClick={onPrevMonth} aria-label="Mes anterior">
        <IconChevronLeft size={16} />
      </button>

      <span className="apx-month__label" aria-live="polite">
        {formatMonthYear(monthDate)}
      </span>

      <button type="button" className="apx-iconbtn" onClick={onNextMonth} aria-label="Mes siguiente">
        <IconChevronRight size={16} />
      </button>

      <button type="button" className="apx-month__today" onClick={onToday}>
        Hoy
      </button>
    </div>

    <div className="apx-month__weekdays" aria-hidden="true">
      {CALENDAR_WEEKDAYS.map((weekday) => (
        <span className="apx-month__weekday" key={weekday}>
          {weekday}
        </span>
      ))}
    </div>

    <div className="apx-month__grid" role="group" aria-label="Días del mes">
      {days.map((day) => {
        const disabled = !day.isCurrentMonth || day.isPast || day.availableCount === 0;
        const modifiers = [
          day.isCurrentMonth ? '' : 'is-outside',
          day.isPast ? 'is-past' : '',
          day.isToday ? 'is-today' : '',
          day.isSelected ? 'is-selected' : '',
          day.availableCount > 0 && !day.isPast ? 'has-availability' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            type="button"
            key={day.date}
            className={`apx-day ${modifiers}`}
            data-calendar-day={day.date}
            disabled={disabled}
            aria-pressed={day.isSelected}
            aria-label={
              day.availableCount > 0
                ? `${formatLongDate(day.date)}, ${day.availableCount} horarios disponibles`
                : `${formatLongDate(day.date)}, sin disponibilidad`
            }
            onClick={() => onSelectDate(day.date)}
          >
            <span className="apx-day__number">{day.dayNumber}</span>
            {day.isToday && <span className="apx-day__today">Hoy</span>}
            {day.availableCount > 0 && !day.isSelected && (
              <span className="apx-day__dot" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>

    <ul className="apx-legend apx-legend--month">
      {MONTH_LEGEND.map((item) => (
        <li className="apx-legend__item" key={item.state}>
          <span className={`apx-legend__dot apx-legend__dot--${item.state}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  </section>
);
