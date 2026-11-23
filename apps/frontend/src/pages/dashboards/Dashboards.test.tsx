import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SuperAdminDashboard,
  ClinicAdminDashboard,
  DoctorDashboard,
  ReceptionDashboard,
  PatientDashboard,
} from './index';

describe('Multi-Role Dashboards Suite', () => {
  it('should render SuperAdminDashboard with multi-tenant metrics and clinics directory', () => {
    const handleSwitch = vi.fn();
    render(<SuperAdminDashboard onSwitchClinic={handleSwitch} />);

    expect(screen.getByText(/Panel de Control Global de Clínicas/i)).toBeInTheDocument();
    expect(screen.getByText(/Clínica Sanitas Lima/i)).toBeInTheDocument();
    expect(screen.getByText(/Centro Médico Arequipa Salud/i)).toBeInTheDocument();
  });

  it('should render ClinicAdminDashboard with operational and financial summary, team occupancy and alerts', () => {
    const handleNav = vi.fn();
    render(<ClinicAdminDashboard onNavigate={handleNav} />);

    expect(screen.getByText(/Gestión Operativa y Financiera/i)).toBeInTheDocument();
    expect(screen.getByText(/Caja Chica Hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasa de Ocupación/i)).toBeInTheDocument();
    expect(screen.getByText(/Equipo y consultorios hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Requiere tu atención/i)).toBeInTheDocument();

    const cashBtn = screen.getByRole('button', { name: /Ver Caja Chica/i });
    fireEvent.click(cashBtn);
    expect(handleNav).toHaveBeenCalledWith('cash-register');

    // Switch to Agenda supervision tab
    fireEvent.click(screen.getByRole('tab', { name: /Agenda/i }));
    expect(screen.getByText(/Supervisión de agenda/i)).toBeInTheDocument();
  });

  it('should render DoctorDashboard with active consultation hero, patient queue and consultation launcher', () => {
    const handleConsult = vi.fn();
    render(<DoctorDashboard onOpenConsultation={handleConsult} />);

    expect(screen.getByText(/Mi Agenda de Consultas y Pacientes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Carlos Benítez Vega/i).length).toBeGreaterThan(0);

    const openBtn = screen.getByRole('button', { name: /Abrir Ficha Clínica \(Escala EVA\)/i });
    fireEvent.click(openBtn);
    expect(handleConsult).toHaveBeenCalled();

    // Completing active consultation promotes next waiting patient into the hero
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));
    expect(screen.getByText(/Siguiente en sala de espera/i)).toBeInTheDocument();
  });

  it('should render ReceptionDashboard with front-desk check-in search, 1-click arrival and live payment', () => {
    const handleBooking = vi.fn();
    const handleCash = vi.fn();
    render(
      <ReceptionDashboard
        onNavigateToBooking={handleBooking}
        onNavigateToCash={handleCash}
      />,
    );

    expect(screen.getByText(/Mostrador de Atención al Paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/María Santos López/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Escribe DNI o Apellidos/i);
    expect(searchInput).toBeInTheDocument();

    // 1-click check-in for Rosa Morales Silva
    const checkInButtons = screen.getAllByRole('button', { name: /Marcar llegada/i });
    expect(checkInButtons.length).toBeGreaterThan(0);
    fireEvent.click(checkInButtons[0]);
    expect(screen.getByText(/Llegada registrada:/i)).toBeInTheDocument();

    // Live payment updates cash total
    fireEvent.click(screen.getByRole('button', { name: /Cobrar S\/ 150\.00/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar cobro/i }));
    expect(screen.getByText(/Cobro de S\/ 150\.00/i)).toBeInTheDocument();
  });

  it('should render PatientDashboard with upcoming appointment, active care and clean history tabs', () => {
    const handleBook = vi.fn();
    render(<PatientDashboard onBookAppointment={handleBook} />);

    expect(screen.getByText(/Portal del Paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/Próxima cita confirmada/i)).toBeInTheDocument();
    expect(screen.getByText(/Terapia Manual Ortopédica/i)).toBeInTheDocument();
    expect(screen.getByText(/Cuidados de hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi progreso/i)).toBeInTheDocument();

    const bookBtn = screen.getByRole('button', { name: /Nueva cita/i });
    fireEvent.click(bookBtn);
    expect(handleBook).toHaveBeenCalled();

    // Cancel flow updates the hero to the smart empty state
    fireEvent.click(screen.getByRole('button', { name: /Cancelar cita/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sí, cancelar cita/i }));
    expect(screen.getByText(/No tienes citas programadas/i)).toBeInTheDocument();
  });
});
