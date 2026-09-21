// =============================================================================
// CitasSistema — Availability Catalog (data layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Turns the slots returned by the availability API into the calendar / agenda
// view-models. Nothing is generated here: whatever the API sends is shown, so
// the UI never invents availability.
// =============================================================================

import { AvailabilitySlot as ApiAvailabilitySlot } from '@citassistema/shared-types';
import {
  AgendaDay,
  CalendarDay,
  CalendarLegendItem,
  DayAvailability,
  SlotAvailability,
  SlotGroup,
  SlotGroupId,
  SlotState,
  SlotVisualState,
  WeekAvailability,
} from './appointmentTypes';
import {
  CALENDAR_WEEKDAYS,
  buildMonthMatrix,
  buildTimeTicks,
  buildWeekDates,
  formatDayMonth,
  formatLongDate,
  formatTime12,
  formatWeekdayDay,
  formatWeekRange,
  isPastDate,
  isSameMonth,
  timeToMinutes,
} from './dateUtils';

/** Clinic agenda configuration (Monday → Saturday, 09:00 → 18:00). */
export const AGENDA_RANGE_START = '09:00';
export const AGENDA_RANGE_END = '18:00';
export const AGENDA_TICK_MINUTES = 30;
/** Visual scale: each grid row represents 15 minutes. */
export const AGENDA_ROW_MINUTES = 15;

export const SLOT_STATE_LABELS: Record<SlotState, string> = {
  available: 'Disponible',
  busy: 'Ocupado',
  unavailable: 'No disponible',
};

export const AGENDA_LEGEND: CalendarLegendItem[] = [
  { state: 'available', label: 'Disponible' },
  { state: 'selected', label: 'Seleccionado' },
  { state: 'busy', label: 'Ocupado' },
  { state: 'unavailable', label: 'No disponible' },
];

export const MONTH_LEGEND: CalendarLegendItem[] = [
  { state: 'available', label: 'Disponible' },
  { state: 'unavailable', label: 'Sin disponibilidad' },
  { state: 'today', label: 'Hoy' },
  { state: 'selected', label: 'Fecha seleccionada' },
];

export { CALENDAR_WEEKDAYS };

/** Maps the API contract into the slot view-model (adds duration + state). */
export function toSlotAvailability(slot: ApiAvailabilitySlot): SlotAvailability {
  const durationMinutes =
    timeToMinutes(slot.endTime) > timeToMinutes(slot.startTime)
      ? timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)
      : 0;

  const state: SlotState = slot.state ?? (slot.available ? 'available' : 'busy');

  return {
    slotId: slot.id ?? `${slot.date}T${slot.startTime}`,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    durationMinutes,
    state,
    recommended: slot.recommended,
    recommendationLabel: slot.recommendationLabel,
  };
}

export function toSlotAvailabilityList(slots: ApiAvailabilitySlot[]): SlotAvailability[] {
  return slots.map(toSlotAvailability);
}

/** date → number of bookable slots (used by the month calendar). */
export type AvailabilityIndex = Record<string, number>;

export function buildAvailabilityIndex(slots: SlotAvailability[]): AvailabilityIndex {
  const index: AvailabilityIndex = {};
  for (const slot of slots) {
    if (slot.state !== 'available') continue;
    index[slot.date] = (index[slot.date] ?? 0) + 1;
  }
  return index;
}

export function countAvailable(slots: SlotAvailability[]): number {
  return slots.filter((slot) => slot.state === 'available').length;
}

/**
 * Organizational windows of the day agenda. They only group the published
 * slots for readability: a slot belongs to the window its start time falls in.
 */
export const DAY_GROUP_WINDOWS: {
  id: SlotGroupId;
  label: string;
  startTime: string;
  endTime: string;
}[] = [
  { id: 'morning', label: 'Mañana', startTime: '00:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Tarde', startTime: '12:00', endTime: '17:00' },
  { id: 'evening', label: 'Noche', startTime: '17:00', endTime: '24:00' },
];

/**
 * Builds the day agenda of the time-selection step from the slots returned by
 * GET /availability. Empty windows are dropped, so the screen never shows a
 * block without published hours.
 */
export function buildDayAvailability(params: {
  date: string;
  slots: SlotAvailability[];
}): DayAvailability {
  const { date, slots } = params;
  const daySlots = slots
    .filter((slot) => slot.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const groups: SlotGroup[] = [];

  for (const window of DAY_GROUP_WINDOWS) {
    const windowSlots = daySlots.filter((slot) => {
      const start = timeToMinutes(slot.startTime);
      return start >= timeToMinutes(window.startTime) && start < timeToMinutes(window.endTime);
    });

    // Windows without published hours are dropped instead of shown empty.
    if (windowSlots.length === 0) continue;

    const first = windowSlots[0];
    const last = windowSlots.reduce((latest, slot) =>
      timeToMinutes(slot.endTime) > timeToMinutes(latest.endTime) ? slot : latest,
    );

    groups.push({
      id: window.id,
      label: window.label,
      rangeLabel: `${formatTime12(first.startTime)} – ${formatTime12(last.endTime)}`,
      availableCount: countAvailable(windowSlots),
      slots: windowSlots,
    });
  }

  return {
    date,
    dateLabel: formatLongDate(date),
    groups,
    availableCount: countAvailable(daySlots),
    totalCount: daySlots.length,
  };
}

/** Resolves the visual state of a slot against the current selection. */
export function resolveSlotVisualState(
  slot: SlotAvailability,
  selectedDate: string,
  selectedTime: string,
): SlotVisualState {
  if (slot.date === selectedDate && slot.startTime === selectedTime) return 'selected';
  return slot.state === 'available' ? 'available' : slot.state;
}

export function findSlot(
  slots: SlotAvailability[],
  date: string,
  startTime: string,
): SlotAvailability | undefined {
  return slots.find((slot) => slot.date === date && slot.startTime === startTime);
}

/** Builds the 42 cells of the month calendar. */
export function buildCalendarMonth(params: {
  monthDate: string;
  selectedDate: string;
  today: string;
  availableByDate: AvailabilityIndex;
}): CalendarDay[] {
  const { monthDate, selectedDate, today, availableByDate } = params;

  return buildMonthMatrix(monthDate).map((date) => ({
    date,
    dayNumber: String(Number(date.slice(8, 10))),
    isToday: date === today,
    isPast: isPastDate(date, today),
    isCurrentMonth: isSameMonth(date, monthDate),
    isSelected: date === selectedDate,
    availableCount: availableByDate[date] ?? 0,
  }));
}

/** Builds the Monday → Saturday agenda of a given week. */
export function buildWeekAvailability(params: {
  weekStart: string;
  slots: SlotAvailability[];
  selectedDate: string;
  today: string;
}): WeekAvailability {
  const { weekStart, slots, selectedDate, today } = params;
  const weekEnd = buildWeekDates(weekStart)[5];

  const days: AgendaDay[] = buildWeekDates(weekStart).map((date) => {
    const daySlots = slots
      .filter((slot) => slot.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      date,
      weekdayShort: formatWeekdayDay(date).split(' ')[0],
      dayNumber: formatWeekdayDay(date).split(' ')[1],
      monthShort: formatDayMonth(date).split(' ')[1],
      dateLabel: formatWeekdayDay(date),
      isToday: date === today,
      isSelected: date === selectedDate,
      availableCount: countAvailable(daySlots),
      slots: daySlots,
    };
  });

  return {
    weekStart,
    weekEnd,
    rangeLabel: formatWeekRange(weekStart, weekEnd),
    rangeStart: AGENDA_RANGE_START,
    rangeEnd: AGENDA_RANGE_END,
    rowMinutes: AGENDA_ROW_MINUTES,
    timeTicks: buildTimeTicks(AGENDA_RANGE_START, AGENDA_RANGE_END, AGENDA_TICK_MINUTES),
    days,
    availableCount: days.reduce((total, day) => total + day.availableCount, 0),
  };
}
