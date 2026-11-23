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

  it('opens Reschedule modal when clicking Reprogramar and updates appointment', () => {
    const onLogout = vi.fn();
    const onBookAppointment = vi.fn();

    render(<PatientPortal onLogout={onLogout} onBookAppointment={onBookAppointment} />);

    // Check reprogramar buttons exist
    const rescheduleBtns = screen.getAllByRole('button', { name: /Reprogramar/i });
    expect(rescheduleBtns.length).toBeGreaterThan(0);

    // Click the first one
    fireEvent.click(rescheduleBtns[0]);

    // Modal should be open
    expect(screen.getByRole('dialog', { name: /Cambiar fecha de cita/i })).toBeInTheDocument();
    expect(screen.getByText(/Cambiar fecha de tu cita/i)).toBeInTheDocument();

    // Confirm reschedule
    const confirmBtn = screen.getByRole('button', { name: /Confirmar cambio/i });
    fireEvent.click(confirmBtn);

    // Toast message should appear
    expect(screen.getByText(/Cita reprogramada con éxito/i)).toBeInTheDocument();
  });

  it('opens Cancel modal when clicking Cancelar and cancels appointment', () => {
    const onLogout = vi.fn();
    const onBookAppointment = vi.fn();

    render(<PatientPortal onLogout={onLogout} onBookAppointment={onBookAppointment} />);

    // Two appointments initially
    expect(screen.getByText(/Sesión de Fisioterapia y Punción Seca/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluación y Control Traumatológico/i)).toBeInTheDocument();

    const cancelBtns = screen.getAllByRole('button', { name: /Cancelar/i });
    expect(cancelBtns.length).toBe(2);

    // Click cancel on the first appointment
    fireEvent.click(cancelBtns[0]);

    // Cancel modal should be visible
    expect(screen.getByRole('dialog', { name: /Cancelar cita/i })).toBeInTheDocument();
    expect(screen.getByText(/¿Deseas cancelar tu cita\?/i)).toBeInTheDocument();

    // Confirm cancellation
    const confirmCancelBtn = screen.getByRole('button', { name: /Sí, Cancelar Cita/i });
    fireEvent.click(confirmCancelBtn);

    // Toast message should appear and the appointment should be removed
    expect(screen.getByText(/Cita cancelada con éxito/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sesión de Fisioterapia y Punción Seca/i)).not.toBeInTheDocument();
    // The second appointment should remain
    expect(screen.getByText(/Evaluación y Control Traumatológico/i)).toBeInTheDocument();
  });
});
