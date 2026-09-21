import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Professional } from '@citassistema/shared-types';
import { AppointmentProfessionalStep } from './AppointmentProfessionalStep';
import { ANY_AVAILABLE_PROFESSIONAL_ID } from './appointmentTypes';
import { MOCK_PROFESSIONALS } from '../../data/mockData';

const renderStep = (
  overrides: Partial<ComponentProps<typeof AppointmentProfessionalStep>> = {},
) => {
  const onSelectProfessional = vi.fn();
  const utils = render(
    <AppointmentProfessionalStep
      professionals={MOCK_PROFESSIONALS}
      specialtyName="Fisioterapia y Rehabilitación"
      selectedProfessionalId={null}
      onSelectProfessional={onSelectProfessional}
      {...overrides}
    />,
  );
  return { onSelectProfessional, container: utils.container };
};

describe('AppointmentProfessionalStep (Step 3)', () => {
  it('renders the header, the trust note and every professional', () => {
    renderStep();

    expect(
      screen.getByRole('heading', { name: /Elige a tu Profesional de Confianza/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Puedes seleccionar un especialista específico/i)).toBeInTheDocument();
    expect(screen.getByText('Paso 3 de 11')).toBeInTheDocument();
    expect(
      screen.getByText(/Todos nuestros profesionales están certificados/i),
    ).toBeInTheDocument();

    expect(screen.getByText('Cualquier Profesional Disponible')).toBeInTheDocument();
    expect(screen.getByText('Opción recomendada')).toBeInTheDocument();
    expect(screen.getByText('Atención más rápida')).toBeInTheDocument();

    MOCK_PROFESSIONALS.forEach((professional) => {
      expect(
        screen.getByText(`${professional.firstName} ${professional.lastName}`),
      ).toBeInTheDocument();
      if (professional.licenseNumber) {
        expect(screen.getByText(professional.licenseNumber)).toBeInTheDocument();
      }
    });

    expect(screen.getAllByText('Fisioterapia y Rehabilitación')).toHaveLength(
      MOCK_PROFESSIONALS.length,
    );
    expect(screen.getAllByRole('button', { name: /Seleccionar/i })).toHaveLength(
      MOCK_PROFESSIONALS.length + 1,
    );
  });

  it('never shows a rating when the API does not provide one', () => {
    renderStep();

    expect(screen.queryByLabelText(/Valoración/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it('shows the rating only when the backend sends rating and reviews', () => {
    const ratedProfessional = {
      ...MOCK_PROFESSIONALS[0],
      rating: 4.9,
      reviewCount: 128,
    } as Professional;

    renderStep({ professionals: [ratedProfessional] });

    expect(screen.getByLabelText(/Valoración 4.9 de 5, 128 valoraciones/i)).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(128)')).toBeInTheDocument();
  });

  it('reports the selection by id, including the auto-assignment option', () => {
    const { onSelectProfessional } = renderStep();

    fireEvent.click(
      screen.getAllByRole('button', { name: /Seleccionar/i })[0],
    );
    expect(onSelectProfessional).toHaveBeenCalledWith(ANY_AVAILABLE_PROFESSIONAL_ID);

    fireEvent.click(screen.getByText('Dr. Carlos Mendoza Ruiz'));
    expect(onSelectProfessional).toHaveBeenCalledWith(MOCK_PROFESSIONALS[1].id);
  });

  it('marks the selected card and keeps the accessible state in sync', () => {
    renderStep({ selectedProfessionalId: MOCK_PROFESSIONALS[1].id });

    const ctaButtons = screen.getAllByRole('button', { name: /Seleccionad/i });
    expect(ctaButtons).toHaveLength(1);
    expect(ctaButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(ctaButtons[0]).toHaveTextContent('Seleccionado');

    const available = screen.getAllByRole('button', { name: /^Seleccionar$/i });
    expect(available).toHaveLength(MOCK_PROFESSIONALS.length);
    available.forEach((button) => expect(button).toHaveAttribute('aria-pressed', 'false'));
  });

  it('moves the focus between cards with the arrow keys', () => {
    renderStep();

    const ctas = screen.getAllByRole('button', { name: /Seleccionar/i });
    ctas[0].focus();
    expect(ctas[0]).toHaveFocus();

    fireEvent.keyDown(ctas[0], { key: 'ArrowRight' });
    expect(ctas[1]).toHaveFocus();

    fireEvent.keyDown(ctas[1], { key: 'ArrowLeft' });
    expect(ctas[0]).toHaveFocus();
  });

  it('falls back to the booking specialty when a professional has no profession', () => {
    renderStep({ specialtyName: 'Traumatología y Ortopedia' });

    expect(screen.getAllByText('Traumatología y Ortopedia')).toHaveLength(
      MOCK_PROFESSIONALS.length,
    );
  });
});
