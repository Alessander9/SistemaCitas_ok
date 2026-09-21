import { AvailabilitySlot, AvailabilitySlotState } from '@citassistema/shared-types';

// =============================================================================
// CitasSistema — Demo availability dataset
// -----------------------------------------------------------------------------
// Same role as MOCK_SPECIALTIES / MOCK_SERVICES: a deterministic dataset used
// while the availability endpoints are not available in the current
// environment. The UI itself never fabricates slots — it renders whatever the
// data layer returns, and shows an empty state when there is nothing.
// =============================================================================

const RANGE_START_MINUTES = 9 * 60;
const RANGE_END_MINUTES = 18 * 60;
const AGENDA_DAYS = 6; // Monday → Saturday

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export interface MockAvailabilityParams {
  /** Monday of the week to generate. */
  startDate: string;
  durationMinutes: number;
  professionalId?: string;
  serviceId?: string;
}

/**
 * Sequential slots of `durationMinutes` between 09:00 and 18:00, Monday to
 * Saturday, with a stable available / busy / unavailable distribution.
 */
export function buildMockWeekAvailability({
  startDate,
  durationMinutes,
  professionalId,
  serviceId,
}: MockAvailabilityParams): AvailabilitySlot[] {
  const duration = Math.max(15, durationMinutes || 60);
  const slots: AvailabilitySlot[] = [];

  for (let dayIndex = 0; dayIndex < AGENDA_DAYS; dayIndex += 1) {
    const date = addDaysIso(startDate, dayIndex);

    for (
      let minute = RANGE_START_MINUTES;
      minute + duration <= RANGE_END_MINUTES;
      minute += duration
    ) {
      const startTime = minutesToTime(minute);
      const endTime = minutesToTime(minute + duration);
      const bucket = hash(`${date}|${startTime}|${professionalId ?? ''}|${serviceId ?? ''}`) % 100;

      const state: AvailabilitySlotState =
        bucket < 58 ? 'available' : bucket < 82 ? 'busy' : 'unavailable';

      slots.push({
        id: `${date}T${startTime}`,
        date,
        startTime,
        endTime,
        available: state === 'available',
        state,
        professionalId,
        serviceId,
      });
    }
  }

  return slots;
}
