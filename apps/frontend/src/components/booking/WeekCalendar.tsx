import React from 'react';
import { AvailabilitySlot } from './AvailabilitySlot';
import { SlotAvailability, WeekAvailability } from './appointmentTypes';
import { AGENDA_LEGEND, resolveSlotVisualState } from './availabilityCatalog';
import { formatTime12, timeToMinutes } from './dateUtils';
import './AppointmentStep.css';

export interface WeekCalendarProps {
  week: WeekAvailability;
  selectedDate: string;
  selectedTime: string;
  isLoading?: boolean;
  onSelectDate: (date: string) => void;
  onSelectTime: (slot: SlotAvailability) => void;
}

/** Monday → Saturday agenda: 15-minute rows, blocks spanning their real duration. */
export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  week,
  selectedDate,
  selectedTime,
  isLoading = false,
  onSelectDate,
  onSelectTime,
}) => {
  const rows = week.timeTicks.length * (30 / week.rowMinutes);
  const rangeStartMinutes = timeToMinutes(week.rangeStart);

  return (
    <div className="apx-agenda">
      <div className="apx-agenda__scroll">
        <div
          className="apx-agenda__grid"
          role="group"
          aria-label={`Disponibilidad de la ${week.rangeLabel.toLowerCase()}`}
          style={{ '--apx-agenda-rows': rows } as React.CSSProperties}
        >
          <div className="apx-agenda__corner" style={{ gridColumn: 1, gridRow: 1 }}>
            Hora
          </div>

          {week.days.map((day, index) => (
            <button
              type="button"
              key={day.date}
              className={`apx-agenda__dayhead${
                day.date === selectedDate ? ' is-selected' : ''
              }${day.isToday ? ' is-today' : ''}`}
              style={{ gridColumn: index + 2, gridRow: 1 }}
              aria-pressed={day.date === selectedDate}
              onClick={() => onSelectDate(day.date)}
            >
              <span className="apx-agenda__dayname">{day.dateLabel}</span>
              <span className="apx-agenda__daymonth">{day.monthShort}</span>
              <span className="apx-agenda__daycount">{day.availableCount} disponibles</span>
            </button>
          ))}

          {week.days.map((day, index) => (
            <span
              key={`col-${day.date}`}
              className={`apx-agenda__col${
                day.date === selectedDate ? ' is-selected' : ''
              }${day.isToday ? ' is-today' : ''}`}
              style={{ gridColumn: index + 2, gridRow: `2 / span ${rows}` }}
              aria-hidden="true"
            />
          ))}

          {week.timeTicks.map((tick, index) => (
            <span
              key={tick}
              className="apx-agenda__tick"
              style={{ gridColumn: 1, gridRow: `${index * (30 / week.rowMinutes) + 2} / span ${
                30 / week.rowMinutes
              }` }}
            >
              {formatTime12(tick)}
            </span>
          ))}

          {week.days.map((day, dayIndex) =>
            day.slots.map((slot) => {
              const state = resolveSlotVisualState(slot, selectedDate, selectedTime);
              const startRow = Math.max(
                2,
                Math.round((timeToMinutes(slot.startTime) - rangeStartMinutes) / week.rowMinutes) + 2,
              );
              const maxSpan = rows + 2 - startRow;
              const span = Math.max(
                1,
                Math.min(Math.round(slot.durationMinutes / week.rowMinutes), Math.max(1, maxSpan)),
              );

              return (
                <AvailabilitySlot
                  key={slot.slotId}
                  slot={slot}
                  state={state}
                  isCompact={span <= 2}
                  style={{ gridColumn: dayIndex + 2, gridRow: `${startRow} / span ${span}` }}
                  onSelect={onSelectTime}
                />
              );
            }),
          )}

          {!isLoading && week.availableCount === 0 && (
            <p className="apx-agenda__empty" style={{ gridColumn: `2 / span 6`, gridRow: `2 / span ${rows}` }}>
              No hay horarios publicados para esta semana. Prueba con otra fecha.
            </p>
          )}

          {isLoading && (
            <p className="apx-agenda__empty" style={{ gridColumn: `2 / span 6`, gridRow: `2 / span ${rows}` }}>
              Cargando disponibilidad...
            </p>
          )}
        </div>
      </div>

      <ul className="apx-legend apx-legend--agenda">
        {AGENDA_LEGEND.map((item) => (
          <li className="apx-legend__item" key={item.state}>
            <span className={`apx-legend__dot apx-legend__dot--${item.state}`} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
