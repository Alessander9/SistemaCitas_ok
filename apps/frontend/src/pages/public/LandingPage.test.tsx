import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage Component', () => {
  it('renders hero title and trust stats', () => {
    const onStartBooking = vi.fn();
    const onNavigateLogin = vi.fn();

    render(
      <LandingPage
        onStartBooking={onStartBooking}
        onNavigateLogin={onNavigateLogin}
      />
    );

    expect(screen.getByRole('heading', { name: /Atención Médica y Fisioterapia de Alta Especialidad/i })).toBeInTheDocument();
    expect(screen.getByText(/10k\+/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.9 \/ 5/i)).toBeInTheDocument();
  });

  it('triggers onStartBooking when clicking hero CTA', () => {
    const onStartBooking = vi.fn();
    const onNavigateLogin = vi.fn();

    render(
      <LandingPage
        onStartBooking={onStartBooking}
        onNavigateLogin={onNavigateLogin}
      />
    );

    const ctaButton = screen.getByRole('button', { name: /Reservar Cita en Línea/i });
    fireEvent.click(ctaButton);

    expect(onStartBooking).toHaveBeenCalledTimes(1);
  });

  it('filters services when selecting specialty filter chips', () => {
    const onStartBooking = vi.fn();
    const onNavigateLogin = vi.fn();

    render(
      <LandingPage
        onStartBooking={onStartBooking}
        onNavigateLogin={onNavigateLogin}
      />
    );

    // Filter by Traumatología
    const traumaFilterChip = screen.getByRole('button', { name: 'Traumatología y Ortopedia' });
    fireEvent.click(traumaFilterChip);

    expect(screen.getByText('Consulta Médica Traumatológica')).toBeInTheDocument();
  });

  it('toggles FAQ accordion answer when clicked', () => {
    const onStartBooking = vi.fn();
    const onNavigateLogin = vi.fn();

    render(
      <LandingPage
        onStartBooking={onStartBooking}
        onNavigateLogin={onNavigateLogin}
      />
    );

    const secondFaq = screen.getByText(/¿Con cuánta anticipación puedo cancelar o reprogramar\?/i);
    fireEvent.click(secondFaq);

    expect(screen.getByText(/hasta con 24 horas de anticipación/i)).toBeInTheDocument();
  });
});
