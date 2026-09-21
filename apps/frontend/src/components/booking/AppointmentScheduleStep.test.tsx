import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvailabilitySlot, AvailabilitySlotState } from '@citassistema/shared-types';
import { AppointmentScheduleStep } from './AppointmentScheduleStep';
import { buildSelectedSpecialtySummary } from './specialtyCatalog';
import { buildServiceCards } from './serviceCatalog';
import { findProfessionalCard } from './professionalCatalog';
import type { ServiceCardModel } from './appointmentTypes';
import { addDays, minutesToTime, startOfWeek } from './dateUtils';
import { MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';
import { fetchMonthAvailability, fetchWeekAvailability } from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchWeekAvailability: vi.fn(),
  fetchMonthAvailability: vi.fn(),
}));

/** Fixed "today" (Wednesday) so the calendar and the agenda are deterministic. */
const TODAY = '2026-09-02';
const WEEK_START = startOfWeek(TODAY); // 2026-08-31

const specialty = buildSelectedSpecialtySummary(MOCK_SPECIALTIES[0]);
/** 60-minute service: "Evaluación y Diagnóstico Físico Inicial". */
const service = buildServiceCards([MOCK_SERVICES[0]])[0] as ServiceCardModel;

const BUSY_TIMES = ['12:00'];
const UNAVAILABLE_TIMES = ['17:00'];

/** Deterministic agenda: Monday → Saturday, 09:00 → 18:00, Tuesday closed. */
function buildSlots(date: string, durationMinutes: number, closedDays: string[] = []): AvailabilitySlot[] {
  if (closedDays.includes(date)) return [];

  const weekday = new Date(`${date}T00:00:00`).getDay();
  if (weekday === 0) return []; // Sunday is not part of the clinic agenda

  const slots: AvailabilitySlot[] = [];
  for (let minute = 9 * 60; minute + durationMinutes <= 18 * 60; minute += durationMinutes) {
    const startTime = minutesToTime(minute);
    const endTime = minutesToTime(minute + durationMinutes);
    const state: AvailabilitySlotState = BUSY_TIMES.includes(startTime)
      ? 'busy'
      : UNAVAILABLE_TIMES.includes(startTime)
        ? 'unavailable'
        : 'available';

    slots.push({
      id: `${date}T${startTime}`,
      date,
      startTime,
      endTime,
      available: state === 'available',
      state,
      professionalId: MOCK_PROFESSIONALS[0].id,
      serviceId: MOCK_SERVICES[0].id,
    });
  }
  return slots;
}

const CLOSED_DAY = addDays(WEEK_START, 1); // Tuesday

function buildWeek(startDate: string, durationMinutes: number): AvailabilitySlot[] {
  return Array.from({ length: 6 }, (_, index) =>
    buildSlots(addDays(startDate, index), durationMinutes, [CLOSED_DAY]),
  ).flat();
}

const renderStep = (overrides: Partial<ComponentProps<typeof AppointmentScheduleStep>> = {}) => {
  const onSelectDate = vi.fn();
  const onSelectTime = vi.fn();
  const onEdit = vi.fn();

  const utils = render(
    <AppointmentScheduleStep
      specialty={specialty}
      service={service}
      professional={findProfessionalCard(MOCK_PROFESSIONALS, MOCK_PROFESSIONALS[0].id, specialty.name)}
      professionalId={MOCK_PROFESSIONALS[0].id}
      selectedDate=""
      selectedTime=""
      onSelectDate={onSelectDate}
      onSelectTime={onSelectTime}
      onEdit={onEdit}
      today={TODAY}
      {...overrides}
    />,
  );

  return { onSelectDate, onSelectTime, onEdit, ...utils };
};

beforeEach(() => {
  vi.mocked(fetchWeekAvailability).mockImplementation((params) =>
    Promise.resolve(buildWeek(params.startDate, params.durationMinutes)),
  );
  vi.mocked(fetchMonthAvailability).mockImplementation((params) =>
    Promise.resolve(params.weekStarts.flatMap((weekStart) => buildWeek(weekStart, params.durationMinutes))),
  );
  vi.clearAllMocks();
});

describe('AppointmentScheduleStep (Step 4)', () => {
  it('renders the title, the description and the booking context bar', async () => {
    renderStep();

    expect(
      screen.getByRole('heading', { name: /4\. Elige el día y horario de tu cita/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona una fecha disponible y luego el horario que mejor se adapte a ti/i),
    ).toBeInTheDocument();

    expect(screen.getByText('Especialidad')).toBeInTheDocument();
    expect(screen.getByText(specialty.name)).toBeInTheDocument();
    expect(screen.getByText(service.name)).toBeInTheDocument();
    expect(screen.getByText('Duración')).toBeInTheDocument();

    await screen.findByText('Disponibilidad semanal');
    // Durations are printed on every agenda block as well as in the context bar.
    expect(screen.getAllByText('60 min').length).toBeGreaterThan(0);
  });

  it('reports the edit action from the context bar', async () => {
    const { onEdit } = renderStep();
    await screen.findByText('Disponibilidad semanal');

    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders a real month calendar: only days with availability can be picked', async () => {
    const { container } = renderStep();

    expect(screen.getByRole('heading', { level: 3, name: 'Selecciona una fecha' })).toBeInTheDocument();
    expect(screen.getByText('Septiembre 2026')).toBeInTheDocument();
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach((weekday) => {
      expect(screen.getByText(weekday)).toBeInTheDocument();
    });

    // Yesterday is not bookable, a published day is, and a Sunday never is.
    await screen.findByRole('button', {
      name: /Jueves 03 de septiembre, \d+ horarios disponibles/i,
    });
    expect(screen.getByRole('button', { name: /Martes 01 de septiembre, sin disponibilidad/i })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Jueves 03 de septiembre, \d+ horarios disponibles/i }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: /Domingo 06 de septiembre, sin disponibilidad/i })).toBeDisabled();

    // Today is flagged so the patient can locate themselves.
    const today = container.querySelector('[data-calendar-day="2026-09-02"]');
    expect(today).not.toBeNull();
    expect(today).toHaveTextContent('Hoy');

    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');
  });

  it('selects a date from the month calendar and syncing the agenda week', async () => {
    const { onSelectDate } = renderStep();
    await screen.findByText('Disponibilidad semanal');

    fireEvent.click(
      screen.getByRole('button', { name: /Jueves 10 de septiembre, \d+ horarios disponibles/i }),
    );

    expect(onSelectDate).toHaveBeenCalledWith('2026-09-10');

    // 2026-09-10 belongs to the week of Monday 07 September.
    await waitFor(() =>
      expect(fetchWeekAvailability).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2026-09-07' }),
      ),
    );
    expect(await screen.findByText('Semana del 07 Sep – 12 Sep 2026')).toBeInTheDocument();
  });

  it('shows the weekly milestone of the chosen date in the day panel and the agenda', async () => {
    renderStep({ selectedDate: '2026-09-03' });

    expect(screen.getByText('Jueves 03 de septiembre')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByText(/\d+ horarios disponibles/).length).toBeGreaterThan(0),
    );

    const heads = document.querySelectorAll('.apx-agenda__dayhead');
    expect(heads).toHaveLength(6);
    expect(heads[3]).toHaveTextContent('Jue 03');
    expect([...heads].map((head) => head.textContent).join(' ')).not.toContain('Dom');
  });

  it('lists every slot state of the agenda and keeps the blocked ones disabled', async () => {
    const { container } = renderStep({ selectedDate: '2026-08-31' });

    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');

    // Every open day repeats the same grid, so the first column is enough.
    expect(
      screen.getAllByRole('button', { name: /09:00 AM – 10:00 AM, disponible, 60 minutos/i })[0],
    ).toBeEnabled();
    expect(
      screen.getAllByRole('button', { name: /12:00 PM – 01:00 PM, ocupado, 60 minutos/i })[0],
    ).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: /05:00 PM – 06:00 PM, no disponible, 60 minutos/i })[0],
    ).toBeDisabled();

    const legend = [...container.querySelectorAll('.apx-legend--agenda .apx-legend__item')].map(
      (item) => item.textContent,
    );
    expect(legend).toEqual(['Disponible', 'Seleccionado', 'Ocupado', 'No disponible']);
  });

  it('selects a slot by start time and moves the selected date when needed', async () => {
    const { onSelectDate, onSelectTime } = renderStep({ selectedDate: '2026-09-03' });

    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');

    fireEvent.click(
      screen.getAllByRole('button', { name: /09:00 AM – 10:00 AM, disponible, 60 minutos/i })[0],
    );

    expect(onSelectDate).toHaveBeenCalledWith('2026-08-31');
    expect(onSelectTime).toHaveBeenCalledWith('09:00');
  });

  it('marks the chosen slot as selected without relying on colour only', async () => {
    const { onEdit } = renderStep({ selectedDate: '2026-08-31', selectedTime: '09:00' });

    const slot = await screen.findByRole('button', {
      name: /09:00 AM – 10:00 AM, seleccionado, 60 minutos/i,
    });
    expect(slot).toHaveAttribute('aria-pressed', 'true');

    const panel = screen.getByLabelText('Cita seleccionada');
    expect(panel).toHaveTextContent('09:00 AM – 10:00 AM');
    expect(panel).toHaveTextContent(service.name);
    expect(panel).toHaveTextContent('S/ 120.00');

    fireEvent.click(screen.getByRole('button', { name: /Cambiar horario/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('navigates between weeks and always requests the right week start', async () => {
    renderStep();
    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');

    fireEvent.click(screen.getByRole('button', { name: /Semana anterior/i }));

    expect(await screen.findByText('Semana del 24 Ago – 29 Ago 2026')).toBeInTheDocument();
    expect(fetchWeekAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: '2026-08-24' }),
    );

    const currentWeek = screen.getByRole('button', { name: /Esta semana/i });
    expect(currentWeek).toBeEnabled();
    fireEvent.click(currentWeek);

    expect(await screen.findByText('Semana del 31 Ago – 05 Sep 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Esta semana/i })).toBeDisabled();
  });

  it('returns to the current month with the Hoy shortcut', async () => {
    renderStep();
    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');

    fireEvent.click(screen.getByRole('button', { name: /Mes siguiente/i }));
    expect(screen.getByText('Octubre 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Hoy$/i }));
    expect(screen.getByText('Septiembre 2026')).toBeInTheDocument();

    await screen.findByText('Semana del 31 Ago – 05 Sep 2026');
  });

  it('requests the availability of the chosen service, duration and professional', async () => {
    const { onSelectDate } = renderStep();
    await screen.findByText('Disponibilidad semanal');

    expect(fetchWeekAvailability).toHaveBeenCalledWith({
      startDate: WEEK_START,
      durationMinutes: service.durationMinutes,
      professionalId: MOCK_PROFESSIONALS[0].id,
      serviceId: service.serviceId,
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Jueves 03 de septiembre, \d+ horarios disponibles/i }),
    );
    expect(onSelectDate).toHaveBeenCalledWith('2026-09-03');
  });

  it('works without a specific professional (auto assignment)', async () => {
    renderStep({ professional: null, professionalId: undefined });
    await screen.findByText('Disponibilidad semanal');

    expect(fetchWeekAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ professionalId: undefined }),
    );
    expect(screen.getByText('Primero disponible')).toBeInTheDocument();
  });

  it('keeps an empty agenda state when the backend publishes no slots', async () => {
    vi.mocked(fetchWeekAvailability).mockResolvedValue([]);
    vi.mocked(fetchMonthAvailability).mockResolvedValue([]);

    renderStep();

    expect(await screen.findByText('No hay horarios publicados para esta semana. Prueba con otra fecha.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Jueves 03 de septiembre, sin disponibilidad/i })).toBeDisabled();
  });
});
