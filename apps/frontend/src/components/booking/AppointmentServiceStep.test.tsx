import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentServiceStep } from './AppointmentServiceStep';
import { MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';

const PHYSIO_SERVICES = MOCK_SERVICES.filter((service) => service.specialtyId === 'spec-1');

const renderStep = (
  overrides: Partial<ComponentProps<typeof AppointmentServiceStep>> = {},
) => {
  const onSelectService = vi.fn();
  const onChangeSpecialty = vi.fn();
  const utils = render(
    <AppointmentServiceStep
      specialty={MOCK_SPECIALTIES[0]}
      services={PHYSIO_SERVICES}
      selectedServiceId={null}
      onSelectService={onSelectService}
      onChangeSpecialty={onChangeSpecialty}
      {...overrides}
    />,
  );
  return { onSelectService, onChangeSpecialty, container: utils.container };
};

const cardOrder = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-service-card]')).map((node) =>
    node.getAttribute('data-service-card'),
  );

describe('AppointmentServiceStep (Step 2)', () => {
  it('renders the specialty context, the services and the trust panel', () => {
    renderStep();

    expect(
      screen.getByRole('heading', { name: /2\. Selecciona el Servicio o Terapia/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Especialidad seleccionada')).toBeInTheDocument();
    expect(screen.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();

    expect(screen.getByText('Servicios disponibles')).toBeInTheDocument();
    expect(screen.getByText('2 servicios')).toBeInTheDocument();
    expect(screen.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Sesión de Terapia Manual y Punción Seca')).toBeInTheDocument();

    expect(screen.getByText('S/ 120.00')).toBeInTheDocument();
    expect(screen.getByText('S/ 90.00')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('Más solicitado')).toBeInTheDocument();

    expect(screen.getByText('Especialistas certificados')).toBeInTheDocument();
    expect(screen.getByText('Atención personalizada')).toBeInTheDocument();
    expect(screen.getByText('Ambiente seguro y moderno')).toBeInTheDocument();
  });

  it('reports the selection by service id (click and keyboard)', () => {
    const { onSelectService } = renderStep();

    fireEvent.click(screen.getByText('Sesión de Terapia Manual y Punción Seca'));
    expect(onSelectService).toHaveBeenCalledWith(PHYSIO_SERVICES[1]);

    const firstCard = screen.getByRole('button', {
      name: /Evaluación y Diagnóstico Físico Inicial/i,
    });
    fireEvent.keyDown(firstCard, { key: 'Enter' });
    expect(onSelectService).toHaveBeenCalledWith(PHYSIO_SERVICES[0]);
  });

  it('marks the selected service card as pressed', () => {
    renderStep({ selectedServiceId: PHYSIO_SERVICES[0].id });

    expect(
      screen.getByRole('button', { name: /Evaluación y Diagnóstico Físico Inicial/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: /Sesión de Terapia Manual y Punción Seca/i }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('filters and sorts the service list from the toolbar', () => {
    const { container } = renderStep();

    expect(cardOrder(container)).toEqual([PHYSIO_SERVICES[0].id, PHYSIO_SERVICES[1].id]);

    // Sort by price ascending swaps the 90 before the 120.
    fireEvent.change(screen.getByLabelText('Ordenar servicios'), {
      target: { value: 'price-asc' },
    });
    expect(cardOrder(container)).toEqual([PHYSIO_SERVICES[1].id, PHYSIO_SERVICES[0].id]);

    // Filter down to services up to S/ 100.
    fireEvent.change(screen.getByLabelText('Filtrar servicios'), {
      target: { value: 'under-100' },
    });
    expect(cardOrder(container)).toEqual([PHYSIO_SERVICES[1].id]);
    expect(screen.getByText('1 servicio')).toBeInTheDocument();
    expect(screen.queryByText('Evaluación y Diagnóstico Físico Inicial')).not.toBeInTheDocument();
  });

  it('offers a way back when the active filter hides every service', () => {
    // Only the S/ 120 service, filtered down to "Hasta S/ 100".
    const { container } = renderStep({ services: [PHYSIO_SERVICES[0]] });

    fireEvent.change(screen.getByLabelText('Filtrar servicios'), {
      target: { value: 'under-100' },
    });

    expect(cardOrder(container)).toEqual([]);
    expect(screen.getByText(/Sin servicios que coincidan/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver todos los servicios/i }));
    expect(cardOrder(container)).toEqual([PHYSIO_SERVICES[0].id]);
  });

  it('goes back to the specialties step from both entry points', () => {
    const { onChangeSpecialty } = renderStep();

    fireEvent.click(screen.getByRole('button', { name: /Volver a especialidades/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cambiar especialidad/i }));

    expect(onChangeSpecialty).toHaveBeenCalledTimes(2);
  });

  it('explains when the specialty has no published services', () => {
    renderStep({ services: [] });

    expect(screen.getByText(/Sin servicios publicados/i)).toBeInTheDocument();
    expect(screen.queryByText('Servicios disponibles')).not.toBeInTheDocument();
  });
});
