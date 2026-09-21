import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Root Component Navigation', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders Landing page by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('navigates to Booking Wizard when clicking Reservar Cita and returns to home', async () => {
    render(<App />);

    const bookBtn = screen.getAllByRole('button', { name: /Reservar Cita/i })[0];
    fireEvent.click(bookBtn);

    expect(await screen.findByRole('heading', { name: /Selecciona la Especialidad Médica/i })).toBeInTheDocument();
  });

  it('navigates to Login page when clicking Acceder and returns to home', () => {
    render(<App />);

    const loginBtn = screen.getByRole('button', { name: /Acceder/i });
    fireEvent.click(loginBtn);

    expect(screen.getByRole('heading', { name: /Acceso a la Plataforma/i })).toBeInTheDocument();

    const returnHomeBtn = screen.getByRole('button', { name: /Volver a Inicio/i });
    fireEvent.click(returnHomeBtn);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
