import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlotAvailability } from './appointmentTypes';
import { BookingSummary, BookingSummaryItem } from './BookingSummary';
import { MonthCalendar } from './MonthCalendar';
import { SelectedAppointment } from './SelectedAppointment';
import { WeekCalendar } from './WeekCalendar';
import { WeekNavigation } from './WeekNavigation';
import { IconCalendar } from '../ui/Icons';
import { IconCheck, IconClock, IconLocation, IconMoon, IconSun, IconSunrise } from './AppointmentIcons';
import {
  buildAvailabilityIndex,
  buildCalendarMonth,
  buildDayAvailability,
  buildWeekAvailability,
  findSlot,
  toSlotAvailabilityList,
} from './availabilityCatalog';
import {
  addDays,
  addMonths,
  buildMonthWeeks,
  formatLongDate,
  formatTime12,
  formatTimeRange,
  startOfWeek,
  todayIso,
} from './dateUtils';
import type { ProfessionalCardModel, SelectedSpecialtySummary, ServiceCardModel } from './appointmentTypes';
import { fetchMonthAvailability, fetchWeekAvailability } from '../../services/api';
import './AppointmentStep.css';

export interface AppointmentScheduleStepProps {
  specialty: SelectedSpecialtySummary;
  service: ServiceCardModel;
  /** null when the patient chose the automatic assignment. */
  professional: ProfessionalCardModel | null;
  /** Professional id sent to the availability API (undefined = any). */
  professionalId?: string;
  location?: string;
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onEdit: () => void;
  /** Injectable for deterministic tests. */
  today?: string;
}

/**
 * Step 4 of the booking wizard — "Elige el día y horario de tu cita".
 * Owns the calendar/agenda state and the availability requests; the whole
 * visual layer (calendars, slots, summary) stays presentational.
 */
export const AppointmentScheduleStep: React.FC<AppointmentScheduleStepProps> = ({
  specialty,
  service,
  professional,
  professionalId,
  location = 'Sede San Isidro',
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onEdit,
  today = todayIso(),
}) => {
  const [monthDate, setMonthDate] = useState<string>(selectedDate || today);
  const [weekStart, setWeekStart] = useState<string>(startOfWeek(selectedDate || today));
  const [weekSlots, setWeekSlots] = useState<SlotAvailability[]>([]);
  const [monthSlots, setMonthSlots] = useState<SlotAvailability[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);

  const weekRequestRef = useRef(0);
  const monthRequestRef = useRef(0);

  const availabilityQuery = useMemo(
    () => ({
      durationMinutes: service.durationMinutes,
      professionalId,
      serviceId: service.serviceId,
    }),
    [service.durationMinutes, service.serviceId, professionalId],
  );

  // Weekly availability for the agenda.
  useEffect(() => {
    const requestId = weekRequestRef.current + 1;
    weekRequestRef.current = requestId;
    setIsLoadingWeek(true);

    fetchWeekAvailability({ ...availabilityQuery, startDate: weekStart })
      .then((slots) => {
        if (weekRequestRef.current === requestId) {
          setWeekSlots(toSlotAvailabilityList(slots));
          setIsLoadingWeek(false);
        }
      })
      .catch(() => {
        if (weekRequestRef.current === requestId) {
          setWeekSlots([]);
          setIsLoadingWeek(false);
        }
      });
  }, [weekStart, availabilityQuery]);

  // Monthly availability (one request per week overlapping the month).
  useEffect(() => {
    const requestId = monthRequestRef.current + 1;
    monthRequestRef.current = requestId;
    setIsLoadingMonth(true);

    const weekStarts = buildMonthWeeks(monthDate);

    fetchMonthAvailability({ ...availabilityQuery, weekStarts })
      .then((slots) => {
        if (monthRequestRef.current === requestId) {
          setMonthSlots(toSlotAvailabilityList(slots));
          setIsLoadingMonth(false);
        }
      })
      .catch(() => {
        if (monthRequestRef.current === requestId) {
          setMonthSlots([]);
          setIsLoadingMonth(false);
        }
      });
  }, [monthDate, availabilityQuery]);

  const handleSelectDate = useCallback(
    (date: string) => {
      onSelectDate(date);
      setWeekStart(startOfWeek(date));
      setMonthDate((current) => (current.slice(0, 7) === date.slice(0, 7) ? current : date));
    },
    [onSelectDate],
  );

  const handleSelectTime = useCallback(
    (slot: SlotAvailability) => {
      if (slot.date !== selectedDate) {
        onSelectDate(slot.date);
      }
      onSelectTime(slot.startTime);
    },
    [onSelectDate, onSelectTime, selectedDate],
  );

  const handleToday = useCallback(() => {
    handleSelectDate(today);
  }, [handleSelectDate, today]);

  const calendarDays = useMemo(
    () =>
      buildCalendarMonth({
        monthDate,
        selectedDate,
        today,
        availableByDate: buildAvailabilityIndex(monthSlots),
      }),
    [monthDate, monthSlots, selectedDate, today],
  );

  const week = useMemo(
    () => buildWeekAvailability({ weekStart, slots: weekSlots, selectedDate, today }),
    [weekStart, weekSlots, selectedDate, today],
  );

  const allSlots = useMemo(() => {
    if (weekSlots.length === 0) return monthSlots;
    if (monthSlots.length === 0) return weekSlots;
    const map = new Map<string, SlotAvailability>();
    for (const s of monthSlots) {
      map.set(`${s.date}_${s.startTime}`, s);
    }
    for (const s of weekSlots) {
      map.set(`${s.date}_${s.startTime}`, s);
    }
    return Array.from(map.values());
  }, [monthSlots, weekSlots]);

  const selectedDay = week.days.find((day) => day.date === selectedDate) ?? null;
  const selectedSlot = findSlot(allSlots, selectedDate, selectedTime);
  const isComplete = Boolean(selectedDate && selectedTime && selectedSlot);

  const dayAvailability = useMemo(
    () => (selectedDate ? buildDayAvailability({ date: selectedDate, slots: allSlots }) : null),
    [selectedDate, allSlots],
  );

  const summaryItems: BookingSummaryItem[] = [
    {
      id: 'specialty',
      icon: 'specialty',
      specialtyIconKey: specialty.icon,
      label: 'Especialidad',
      value: specialty.name,
    },
    { id: 'service', icon: 'service', label: 'Servicio', value: service.name },
    {
      id: 'professional',
      icon: 'professional',
      label: 'Profesional',
      value: professional?.name ?? 'Primero disponible',
      meta: professional?.licenseNumber,
      photoUrl: professional?.photoUrl,
    },
    {
      id: 'duration',
      icon: 'duration',
      label: 'Duración',
      value: `${service.durationMinutes} min`,
    },
  ];

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            4. Elige el día y horario de tu cita
          </h2>
          <p className="apx-step__desc">
            Selecciona una fecha disponible y luego el horario que mejor se adapte a ti.
          </p>
        </div>
      </div>

      <BookingSummary items={summaryItems} onEdit={onEdit} />

      <div className="apx-schedule">
        <MonthCalendar
          monthDate={monthDate}
          days={calendarDays}
          onSelectDate={handleSelectDate}
          onPrevMonth={() => setMonthDate((current) => addMonths(current, -1))}
          onNextMonth={() => setMonthDate((current) => addMonths(current, 1))}
          onToday={handleToday}
        />

        <section className="apx-daypanel" aria-label="Detalle de la fecha seleccionada">
          <header className="apx-daypanel__header">
            <span className="apx-daypanel__icon" aria-hidden="true">
              <IconCalendar size={20} />
            </span>
            <div>
              <h3 className="apx-daypanel__title">
                {selectedDate ? formatLongDate(selectedDate) : 'Elige una fecha en el calendario'}
              </h3>
              <p className="apx-daypanel__count">
                {selectedDate
                  ? `${dayAvailability?.availableCount ?? selectedDay?.availableCount ?? 0} horarios disponibles`
                  : 'Los horarios publicados de ese día aparecerán aquí.'}
              </p>
            </div>
          </header>

          <div className="apx-daypanel__stats">
            <div className="apx-stat">
              <span className="apx-stat__icon" aria-hidden="true">
                <IconCalendar size={14} />
              </span>
              <div className="apx-stat__info">
                <strong>{dayAvailability?.availableCount ?? selectedDay?.availableCount ?? 0}</strong>
                <span>Horarios disponibles</span>
              </div>
            </div>

            <div className="apx-stat">
              <span className="apx-stat__icon" aria-hidden="true">
                <IconClock size={14} />
              </span>
              <div className="apx-stat__info">
                <strong>{service.durationMinutes} min</strong>
                <span>Duración del servicio</span>
              </div>
            </div>

            <div className="apx-stat">
              <span className="apx-stat__icon" aria-hidden="true">
                <IconLocation size={14} />
              </span>
              <div className="apx-stat__info">
                <strong title={location}>{location}</strong>
                <span>Sede de atención</span>
              </div>
            </div>
          </div>

          {dayAvailability && dayAvailability.groups.length > 0 ? (
            <div className="apx-daypanel__slots" aria-label="Horarios disponibles del día">
              <div className="apx-daypanel__slots-header">
                <span className="apx-daypanel__slots-instruction">
                  Elige tu turno directamente aquí:
                </span>
                {selectedTime && (
                  <span className="apx-daypanel__selected-pill">
                    <IconCheck size={12} /> {formatTime12(selectedTime)} seleccionado
                  </span>
                )}
              </div>
              {dayAvailability.groups.map((group) => {
                const GroupIcon =
                  group.id === 'morning' ? IconSunrise : group.id === 'afternoon' ? IconSun : IconMoon;
                return (
                  <div key={group.id} className="apx-daypanel-group">
                    <div className="apx-daypanel-group__header">
                      <span className="apx-daypanel-group__title">
                        <GroupIcon size={15} />
                        <strong>{group.label}</strong>
                        <span className="apx-daypanel-group__hours">({group.rangeLabel})</span>
                      </span>
                      <span className="apx-daypanel-group__count">
                        {group.availableCount} {group.availableCount === 1 ? 'cupo' : 'cupos'}
                      </span>
                    </div>
                    <div className="apx-daypanel-group__pills">
                      {group.slots.map((slot) => {
                        const isSelected = slot.date === selectedDate && slot.startTime === selectedTime;
                        const isBookable = slot.state === 'available' || isSelected;
                        return (
                          <button
                            key={slot.slotId}
                            type="button"
                            disabled={!isBookable}
                            aria-pressed={isSelected}
                            className={`apx-time-pill ${isSelected ? 'is-selected' : ''} ${!isBookable ? 'is-disabled' : ''}`}
                            onClick={() => handleSelectTime(slot)}
                            title={
                              !isBookable
                                ? 'Horario no disponible'
                                : `Reservar a las ${formatTime12(slot.startTime)}`
                            }
                          >
                            {isSelected && <IconCheck size={13} />}
                            <span>{formatTime12(slot.startTime)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="apx-daypanel__hint">
              <span className="apx-daypanel__hint-icon" aria-hidden="true">
                <IconClock size={20} />
              </span>
              <div>
                <strong>
                  {selectedDate
                    ? 'Sin horarios publicados para este día'
                    : 'Selecciona una fecha en el calendario'}
                </strong>
                <p>
                  {selectedDate
                    ? 'Prueba seleccionando otro día marcado con punto verde en el calendario.'
                    : 'Haz clic en una fecha disponible para ver los turnos de mañana, tarde y noche.'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="apx-schedule__week">
        <section className="apx-weekcard" aria-busy={isLoadingWeek || isLoadingMonth}>
          <header className="apx-weekcard__header">
            <div>
              <h3 className="apx-weekcard__title">Disponibilidad semanal</h3>
              <p className="apx-weekcard__subtitle">
                Visualiza los horarios disponibles de la semana y selecciona tu cita.
              </p>
            </div>
            <WeekNavigation
              rangeLabel={week.rangeLabel}
              onPrevWeek={() => setWeekStart((current) => addDays(current, -7))}
              onNextWeek={() => setWeekStart((current) => addDays(current, 7))}
              onCurrentWeek={() => setWeekStart(startOfWeek(today))}
              isCurrentWeek={weekStart === startOfWeek(today)}
            />
          </header>

          <WeekCalendar
            week={week}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            isLoading={isLoadingWeek}
            onSelectDate={handleSelectDate}
            onSelectTime={handleSelectTime}
          />
        </section>

        <div className="apx-schedule__week-row">
          <SelectedAppointment
            isComplete={isComplete}
            emptyTitle="Selecciona una fecha y un horario"
            emptyText="Los detalles de tu cita aparecerán aquí."
            dateLabel={selectedDate ? formatLongDate(selectedDate) : undefined}
            timeRangeLabel={
              selectedSlot
                ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)
                : undefined
            }
            durationLabel={`${service.durationMinutes} minutos`}
            professionalName={professional?.name ?? 'Primero disponible'}
            professionalLicense={professional?.licenseNumber}
            professionalPhotoUrl={professional?.photoUrl}
            serviceName={service.name}
            specialtyName={specialty.name}
            specialtyIconKey={specialty.icon}
            location={location}
            priceLabel={`S/ ${service.price.toFixed(2)}`}
            onEdit={isComplete ? onEdit : undefined}
          />
        </div>
      </div>

    </section>
  );
};
