import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientPortal } from './PatientPortal';

describe('PatientPortal Component', () => {
  it('renders patient greeting and default appointments tab', () => {
    const onLogout = vi.fn();
    const onBookAppointment = vi.fn();

    render(<PatientPortal onLogout={onLogout} onBookAppointment={onBookAppointment} />);

    expect(screen.getByRole('heading', { name: /¡Hola, Juan Carlos!/i })).toBeInTheDocument();
    expect(screen.getByText(/Próximas Atenciones Agendadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Sesión de Fisioterapia y Punción Seca/i)).toBeInTheDocument();
  });

  it('switches between tabs (Tratamientos, Perfil)', () => {
    const onLogout = vi.fn();
    const onBookAppointment = vi.fn();

    render(<PatientPortal onLogout={onLogout} onBookAppointment={onBookAppointment} />);

    // Switch to Tratamientos
    const treatmentsTab = screen.getByRole('button', { name: /Mis Tratamientos y Recetas/i });
    fireEvent.click(treatmentsTab);

    expect(screen.getByText(/Plan de Readaptación Lumbar y Postural/i)).toBeInTheDocument();
    expect(screen.getByText(/6 de 10 Sesiones Completadas/i)).toBeInTheDocument();

    // Switch to Perfil
    const profileTab = screen.getByRole('button', { name: /Ficha Médica y Perfil/i });
    fireEvent.click(profileTab);

    expect(screen.getByText(/Ficha Maestra del Paciente/i)).toBeInTheDocument();
    expect(screen.getByText('73829104')).toBeInTheDocument();
  });

  it('triggers onBookAppointment when clicking Agendar Nueva Cita', () => {
    const onLogout = vi.fn();
    const onBookAppointment = vi.fn();

    render(<PatientPortal onLogout={onLogout} onBookAppointment={onBookAppointment} />);

    const bookBtn = screen.getByRole('button', { name: /Agendar Nueva Cita/i });
    fireEvent.click(bookBtn);

    expect(onBookAppointment).toHaveBeenCalledTimes(1);
  });
});
