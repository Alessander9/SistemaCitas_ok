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

  it('should render ClinicAdminDashboard with operational and financial summary', () => {
    const handleNav = vi.fn();
    render(<ClinicAdminDashboard onNavigate={handleNav} />);

    expect(screen.getByText(/Gestión Operativa y Financiera/i)).toBeInTheDocument();
    expect(screen.getByText(/Caja Chica Hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasa de Ocupación/i)).toBeInTheDocument();

    const cashBtn = screen.getByRole('button', { name: /Ver Caja Chica/i });
    fireEvent.click(cashBtn);
    expect(handleNav).toHaveBeenCalledWith('cash-register');
  });

  it('should render DoctorDashboard with patient queue and consultation launcher', () => {
    const handleConsult = vi.fn();
    render(<DoctorDashboard onOpenConsultation={handleConsult} />);

    expect(screen.getByText(/Mi Agenda de Consultas y Pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Benítez Vega/i)).toBeInTheDocument();

    const openBtn = screen.getByRole('button', { name: /Abrir Ficha Clínica \(Escala EVA\)/i });
    fireEvent.click(openBtn);
    expect(handleConsult).toHaveBeenCalled();
  });

  it('should render ReceptionDashboard with front-desk check-in search', () => {
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
  });

  it('should render PatientDashboard with upcoming appointment and prescription tabs', () => {
    const handleBook = vi.fn();
    render(<PatientDashboard onBookAppointment={handleBook} />);

    expect(screen.getByText(/Portal del Paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/Próxima Cita Confirmada/i)).toBeInTheDocument();
    expect(screen.getByText(/Terapia Manual Ortopédica/i)).toBeInTheDocument();

    const bookBtn = screen.getByRole('button', { name: /\+ Reservar Nueva Cita/i });
    fireEvent.click(bookBtn);
    expect(handleBook).toHaveBeenCalled();
  });
});
