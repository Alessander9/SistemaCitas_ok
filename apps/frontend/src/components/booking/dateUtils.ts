// =============================================================================
// CitasSistema — Date & time helpers for the schedule step
// -----------------------------------------------------------------------------
// Works with local-time ISO dates ('YYYY-MM-DD') to avoid UTC day shifts and
// formats everything in Spanish without relying on ICU locale data.
// =============================================================================

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Monday-first weekday headers used by the month calendar. */
export const CALENDAR_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function addMonths(iso: string, months: number): string {
  const date = parseIsoDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toIsoDate(date);
}

/** Monday of the week containing `iso` (clinic agenda runs Monday → Saturday). */
export function startOfWeek(iso: string): string {
  const date = parseIsoDate(iso);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toIsoDate(date);
}

/** ISO dates of a week, Monday → Saturday (6 days, no Sunday). */
export function buildWeekDates(weekStartIso: string): string[] {
  return Array.from({ length: 6 }, (_, index) => addDays(weekStartIso, index));
}

/** All Monday week-starts that overlap the month of `monthIso`. */
export function buildMonthWeeks(monthIso: string): string[] {
  const date = parseIsoDate(monthIso);
  const firstOfMonth = toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const lastOfMonth = toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  const weeks: string[] = [];
  let cursor = startOfWeek(firstOfMonth);
  while (cursor <= lastOfMonth) {
    weeks.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

/** 42 ISO dates (6 weeks, Monday first) covering the month of `monthIso`. */
export function buildMonthMatrix(monthIso: string): string[] {
  const date = parseIsoDate(monthIso);
  const firstOfMonth = toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const firstCell = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => addDays(firstCell, index));
}

export function isSameMonth(iso: string, monthIso: string): boolean {
  return iso.slice(0, 7) === monthIso.slice(0, 7);
}

/** ISO strings compare lexicographically, so this is a plain string compare. */
export function isPastDate(iso: string, today: string): boolean {
  return iso < today;
}

export function formatLongDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${WEEKDAYS_LONG[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} de ${
    MONTHS_LONG[date.getMonth()]
  }`;
}

/** "Martes, 08 de septiembre de 2026" — used by the time-selection step. */
export function formatFullDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${WEEKDAYS_LONG[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} de ${
    MONTHS_LONG[date.getMonth()]
  } de ${date.getFullYear()}`;
}

export function formatMonthYear(iso: string): string {
  const date = parseIsoDate(iso);
  const month = MONTHS_LONG[date.getMonth()];
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

/** "Lun 31" */
export function formatWeekdayDay(iso: string): string {
  const date = parseIsoDate(iso);
  return `${WEEKDAYS_SHORT[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}`;
}

/** "31 Ago" */
export function formatDayMonth(iso: string): string {
  const date = parseIsoDate(iso);
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "Semana del 31 Ago – 05 Sep 2026" */
export function formatWeekRange(startIso: string, endIso: string): string {
  const end = parseIsoDate(endIso);
  return `Semana del ${formatDayMonth(startIso)} – ${formatDayMonth(endIso)} ${end.getFullYear()}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** "09:00" + 45 → "09:45" (start + real service duration). */
export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

/** Every 30 minutes between two times, inclusive of the start. */
export function buildTimeTicks(start: string, end: string, stepMinutes = 30): string[] {
  const ticks: string[] = [];
  for (let minute = timeToMinutes(start); minute <= timeToMinutes(end); minute += stepMinutes) {
    ticks.push(minutesToTime(minute));
  }
  return ticks;
}

/** "09:00" → "09:00 AM" */
export function formatTime12(time: string): string {
  const [rawHours, rawMinutes] = time.split(':').map(Number);
  const suffix = rawHours < 12 ? 'AM' : 'PM';
  const hours = rawHours % 12 === 0 ? 12 : rawHours % 12;
  return `${String(hours).padStart(2, '0')}:${String(rawMinutes || 0).padStart(2, '0')} ${suffix}`;
}

/** "09:00 AM – 10:00 AM" */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}
