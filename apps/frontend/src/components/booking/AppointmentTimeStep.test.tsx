import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvailabilitySlot, AvailabilitySlotState } from '@citassistema/shared-types';
import { AppointmentTimeStep } from './AppointmentTimeStep';
import { buildSelectedSpecialtySummary } from './specialtyCatalog';
import { buildServiceCards } from './serviceCatalog';
import { findProfessionalCard } from './professionalCatalog';
import { minutesToTime } from './dateUtils';
import { MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';
import { fetchDayAvailability } from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchDayAvailability: vi.fn(),
}));

const DATE = '2026-09-08'; // martes

const specialty = buildSelectedSpecialtySummary(MOCK_SPECIALTIES[0]);
/** 60-minute service: "Evaluación y Diagnóstico Físico Inicial". */
const service = buildServiceCards([MOCK_SERVICES[0]])[0]!;

const BUSY_TIMES = ['11:00'];
const UNAVAILABLE_TIMES = ['12:00'];

/** 09:00 → 18:00 day agenda with 60-minute blocks every hour. */
function buildDaySlots(overrides: Partial<AvailabilitySlot>[] = []): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  for (let minute = 9 * 60; minute + 60 <= 18 * 60; minute += 60) {
    const startTime = minutesToTime(minute);
    const endTime = minutesToTime(minute + 60);
    const state: AvailabilitySlotState = BUSY_TIMES.includes(startTime)
      ? 'busy'
      : UNAVAILABLE_TIMES.includes(startTime)
        ? 'unavailable'
        : 'available';

    slots.push({
      id: `${DATE}T${startTime}`,
      date: DATE,
      startTime,
      endTime,
      available: state === 'available',
      state,
      professionalId: MOCK_PROFESSIONALS[1].id,
      serviceId: MOCK_SERVICES[0].id,
    });
  }
  return slots.map((slot) => {
    const override = overrides.find((candidate) => candidate.startTime === slot.startTime);
    return override ? { ...slot, ...override } : slot;
  });
}

const renderStep = (overrides: Partial<ComponentProps<typeof AppointmentTimeStep>> = {}) => {
  const onSelectTime = vi.fn();
  const onChangeDate = vi.fn();
  const onEdit = vi.fn();

  const utils = render(
    <AppointmentTimeStep
      specialty={specialty}
      service={service}
      professional={findProfessionalCard(MOCK_PROFESSIONALS, MOCK_PROFESSIONALS[1].id, specialty.name)}
      professionalId={MOCK_PROFESSIONALS[1].id}
      selectedDate={DATE}
      selectedTime=""
      onSelectTime={onSelectTime}
      onChangeDate={onChangeDate}
      onEdit={onEdit}
      {...overrides}
    />,
  );

  return { onSelectTime, onChangeDate, onEdit, ...utils };
};

beforeEach(() => {
  vi.mocked(fetchDayAvailability).mockResolvedValue(buildDaySlots());
  vi.clearAllMocks();
});

describe('AppointmentTimeStep (Step 5)', () => {
  it('renders the title, the description and the friendly date banner', async () => {
    renderStep();

    expect(
      screen.getByRole('heading', { name: /5\. Elige el horario de tu cita/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona uno de los horarios disponibles para la fecha que elegiste/i),
    ).toBeInTheDocument();

    // The date is repeated in the side panel, so both must agree.
    const dateLabels = screen.getAllByText('Martes, 08 de septiembre de 2026');
    expect(dateLabels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(`${specialty.name} · ${service.name}`)).toBeInTheDocument();

    await screen.findByText('Horarios disponibles');
  });

  it('goes back to the calendar without losing the booking', async () => {
    const { onChangeDate } = renderStep();
    await screen.findByText('Horarios disponibles');

    fireEvent.click(screen.getByRole('button', { name: /Cambiar fecha/i }));

    expect(onChangeDate).toHaveBeenCalledTimes(1);
  });

  it('shows the booking context: specialty, service, professional, duration and price', async () => {
    const { onEdit } = renderStep();
    await screen.findByText('Horarios disponibles');

    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Servicio')).toBeInTheDocument();
    expect(screen.getByText(service.name)).toBeInTheDocument();
    expect(screen.getByText('Profesional')).toBeInTheDocument();
    expect(screen.getByText('Duración')).toBeInTheDocument();
    expect(screen.getAllByText('60 min').length).toBeGreaterThan(0);
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('S/ 120.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('groups the day agenda into mañana, tarde and noche with live counters', async () => {
    renderStep();

    await screen.findByText('Horarios disponibles');
    expect(screen.getByText('Selecciona el horario que más te convenga.')).toBeInTheDocument();

    // 09:00–18:00 hourly → 9 slots, 2 of them blocked.
    expect(screen.getByText('7 horarios disponibles')).toBeInTheDocument();

    ['Mañana', 'Tarde', 'Noche'].forEach((label) => {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    });

    expect(screen.getByText('09:00 AM – 12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM – 05:00 PM')).toBeInTheDocument();
    expect(screen.getByText('05:00 PM – 06:00 PM')).toBeInTheDocument();
    expect(screen.getByText('2 horarios disponibles')).toBeInTheDocument();
    expect(screen.getByText('4 horarios disponibles')).toBeInTheDocument();
    expect(screen.getByText('1 horario disponible')).toBeInTheDocument();

    const groups = document.querySelectorAll('.apx-group');
    expect(groups).toHaveLength(3);
    // The blocks are organizational only: every group uses the same icon slot.
    expect(document.querySelectorAll('.apx-group__icon svg')).toHaveLength(3);
  });

  it('shows the real start and end range of every slot', async () => {
    renderStep();
    await screen.findByText('Horarios disponibles');

    const slot = screen.getByRole('button', {
      name: /09:00 AM a 10:00 AM, disponible, 60 minutos/i,
    });
    expect(slot).toBeEnabled();
    expect(slot).toHaveTextContent('09:00 AM');
    expect(slot).toHaveTextContent('– 10:00 AM');
    expect(slot).toHaveTextContent('60 min');
  });

  it('keeps the blocked slots visible but not interactive', async () => {
    renderStep();
    await screen.findByText('Horarios disponibles');

    const busy = screen.getByRole('button', { name: /11:00 AM a 12:00 PM, ocupado, 60 minutos/i });
    expect(busy).toBeDisabled();
    expect(busy).toHaveTextContent('Ocupado');

    const blocked = screen.getByRole('button', {
      name: /12:00 PM a 01:00 PM, no disponible, 60 minutos/i,
    });
    expect(blocked).toBeDisabled();
    expect(blocked).toHaveTextContent('No disponible');
  });

  it('selects a slot, keeps it marked and reports the start time', async () => {
    const { onSelectTime } = renderStep();
    await screen.findByText('Horarios disponibles');

    fireEvent.click(
      screen.getByRole('button', { name: /09:00 AM a 10:00 AM, disponible, 60 minutos/i }),
    );

    expect(onSelectTime).toHaveBeenCalledWith('09:00');
  });

  it('fills the side panel only once a slot is chosen', async () => {
    renderStep({ selectedTime: '09:00' });

    const panel = await screen.findByLabelText('Tu cita');
    expect(panel).toHaveTextContent('Resumen de la reserva');
    expect(panel).toHaveTextContent('09:00 AM – 10:00 AM');
    expect(panel).toHaveTextContent('(60 minutos)');
    expect(panel).toHaveTextContent(service.name);
    expect(panel).toHaveTextContent(specialty.name);
    expect(panel).toHaveTextContent('S/ 120.00');
    expect(panel).toHaveTextContent('Horario seleccionado');
    expect(panel).toHaveTextContent('Puedes continuar con el siguiente paso.');

    const selected = screen.getByRole('button', {
      name: /09:00 AM a 10:00 AM, seleccionado, 60 minutos/i,
    });
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(selected).toHaveTextContent('Seleccionado');
  });

  it('shows the panel empty state before choosing an hour', async () => {
    renderStep();

    const panel = await screen.findByLabelText('Tu cita');
    expect(panel).toHaveTextContent('Selecciona un horario');
    expect(panel).toHaveTextContent('Los detalles de tu cita aparecerán aquí.');
    expect(panel).not.toHaveTextContent('Horario seleccionado');
  });

  it('only shows the recommendation badge when the backend sends it', async () => {
    renderStep();
    await screen.findByText('Horarios disponibles');
    expect(screen.queryByText('Recomendado')).not.toBeInTheDocument();

    vi.mocked(fetchDayAvailability).mockResolvedValue(
      buildDaySlots([
        { startTime: '09:00', recommended: true, recommendationLabel: 'Mayor disponibilidad' },
      ]),
    );
    renderStep();
    await waitFor(() =>
      expect(screen.getAllByText('Mayor disponibilidad').length).toBeGreaterThan(0),
    );
  });

  it('keeps an empty state when the day has no published hours', async () => {
    vi.mocked(fetchDayAvailability).mockResolvedValue([]);

    const { onChangeDate } = renderStep();

    expect(
      await screen.findByText('No hay horarios publicados para este día'),
    ).toBeInTheDocument();
    expect(screen.getByText('0 horarios disponibles')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Elegir otra fecha/i }));
    expect(onChangeDate).toHaveBeenCalledTimes(1);
  });

  it('requests the day availability with the service duration and professional', async () => {
    renderStep();
    await screen.findByText('Horarios disponibles');

    expect(fetchDayAvailability).toHaveBeenCalledWith({
      startDate: DATE,
      durationMinutes: service.durationMinutes,
      professionalId: MOCK_PROFESSIONALS[1].id,
      serviceId: service.serviceId,
    });
  });

  it('supports the automatic professional assignment', async () => {
    renderStep({ professional: null, professionalId: undefined });
    await screen.findByText('Horarios disponibles');

    expect(fetchDayAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ professionalId: undefined }),
    );
    expect(screen.getByText('Primero disponible')).toBeInTheDocument();
  });
});
