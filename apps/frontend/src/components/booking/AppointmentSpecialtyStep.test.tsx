import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentSpecialtyStep } from './AppointmentSpecialtyStep';
import { MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';

const renderStep = (overrides: Partial<ComponentProps<typeof AppointmentSpecialtyStep>> = {}) => {
  const onSelectSpecialty = vi.fn();
  render(
    <AppointmentSpecialtyStep
      specialties={MOCK_SPECIALTIES}
      services={MOCK_SERVICES}
      professionals={MOCK_PROFESSIONALS}
      selectedSpecialtyId={null}
      onSelectSpecialty={onSelectSpecialty}
      {...overrides}
    />,
  );
  return { onSelectSpecialty };
};

describe('AppointmentSpecialtyStep (Step 1)', () => {
  it('renders the specialty catalog with professional counts and location', () => {
    renderStep();

    expect(screen.getByRole('heading', { name: /Selecciona la Especialidad Médica/i })).toBeInTheDocument();
    expect(screen.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();
    expect(screen.getByText('Traumatología y Ortopedia')).toBeInTheDocument();
    expect(screen.getByText('Terapia Ocupacional')).toBeInTheDocument();
    expect(screen.getByText('Nutrición Clínica y Deportiva')).toBeInTheDocument();

    expect(screen.getByText(/5 médicos/i)).toBeInTheDocument();
    expect(screen.getByText(/3 especialistas/i)).toBeInTheDocument();
    expect(screen.getAllByText('Sede San Isidro')).toHaveLength(MOCK_SPECIALTIES.length);
    expect(screen.getAllByRole('button', { name: /Ver Tratamientos/i })).toHaveLength(
      MOCK_SPECIALTIES.length,
    );
  });

  it('filters specialties by name, description and treatment keywords', () => {
    renderStep();
    const search = screen.getByPlaceholderText(/Buscar especialidad o tratamiento/i);

    fireEvent.change(search, { target: { value: 'nutricion' } });
    expect(screen.getByText('Nutrición Clínica y Deportiva')).toBeInTheDocument();
    expect(screen.queryByText('Fisioterapia y Rehabilitación')).not.toBeInTheDocument();

    // Accent-insensitive: "fisioterapia" matches even typing without accents.
    fireEvent.change(search, { target: { value: 'fisioterapia' } });
    expect(screen.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();
    expect(screen.queryByText('Terapia Ocupacional')).not.toBeInTheDocument();
  });

  it('shows an empty state and restores the full catalog', () => {
    renderStep();
    const search = screen.getByPlaceholderText(/Buscar especialidad o tratamiento/i);

    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver todas las especialidades/i }));
    expect(screen.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();
    expect(screen.getByText('Nutrición Clínica y Deportiva')).toBeInTheDocument();
  });

  it('reports the selection by specialty id (click and keyboard)', () => {
    const { onSelectSpecialty } = renderStep();

    const card = screen.getByRole('button', { name: /Fisioterapia y Rehabilitación/i });
    fireEvent.click(card);
    expect(onSelectSpecialty).toHaveBeenCalledWith(MOCK_SPECIALTIES[0]);

    const otherCard = screen.getByRole('button', { name: /Terapia Ocupacional/i });
    fireEvent.keyDown(otherCard, { key: 'Enter' });
    expect(onSelectSpecialty).toHaveBeenCalledWith(MOCK_SPECIALTIES[2]);
  });

  it('marks the selected card as pressed', () => {
    renderStep({ selectedSpecialtyId: MOCK_SPECIALTIES[1].id });

    const selected = screen.getByRole('button', { name: /Traumatología y Ortopedia/i });
    const notSelected = screen.getByRole('button', { name: /Fisioterapia y Rehabilitación/i });

    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(notSelected).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the treatments listing without leaving the step and can confirm the specialty', async () => {
    const { onSelectSpecialty } = renderStep();

    fireEvent.click(screen.getAllByRole('button', { name: /Ver Tratamientos/i })[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      await screen.findByText('Evaluación y Diagnóstico Físico Inicial'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Seleccionar esta especialidad/i }));
    expect(onSelectSpecialty).toHaveBeenCalledWith(MOCK_SPECIALTIES[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the treatments listing with Escape', async () => {
    renderStep();

    fireEvent.click(screen.getAllByRole('button', { name: /Ver Tratamientos/i })[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
