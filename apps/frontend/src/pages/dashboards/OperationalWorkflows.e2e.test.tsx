import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoctorDashboard } from './DoctorDashboard';
import { ClinicalConsultationView } from '../clinical/ClinicalConsultationView';
import { ClinicAdminDashboard } from './ClinicAdminDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { ReceptionBookingPage } from '../admin/ReceptionBookingPage';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { ThemeProvider } from '../../context/ThemeContext';
import {
  resetDoctorDashboardStore,
  DoctorQueuePatient,
} from '../../components/doctor';
import { soundEffects } from '../../utils/soundEffects';

describe('Operational E2E Workflows & State Propagation Across All Roles', () => {
  beforeEach(() => {
    resetDoctorDashboardStore();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('Doctor E2E: calling Rosa Morales passes her real data to ClinicalConsultationView and persists queue + EVA sync on return', () => {
    let capturedPatient: DoctorQueuePatient | undefined;
    const handleOpen = vi.fn((patient?: DoctorQueuePatient) => {
      capturedPatient = patient;
    });

    const { unmount } = render(<DoctorDashboard onOpenConsultation={handleOpen} />);

    // Click "Llamar" on Rosa Morales Silva (first waiting patient)
    const callButtons = screen.getAllByRole('button', { name: /Llamar/i });
    fireEvent.click(callButtons[0]);

    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(capturedPatient?.patientName).toBe('Rosa Morales Silva');
    expect(capturedPatient?.dni).toBe('09843211');

    // Unmount DoctorDashboard (simulating navigation to ClinicalConsultationView)
    unmount();

    // Render ClinicalConsultationView with the called patient's real data
    const onBack = vi.fn();
    const { unmount: unmountConsult } = render(
      <ClinicalConsultationView patientData={capturedPatient} onBack={onBack} />,
    );

    expect(screen.getByText('Rosa Morales Silva')).toBeInTheDocument();
    expect(screen.getByText(/DNI: 09843211/i)).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Lumbalgia aguda con irradiación ciática/i),
    ).toBeInTheDocument();

    // Update EVA to 5 and save clinical evolution
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha y Evolución/i }));
    expect(
      screen.getByText(/Atención médica y evolución registradas exitosamente/i),
    ).toBeInTheDocument();

    unmountConsult();

    // Return to DoctorDashboard: Rosa Morales must STILL be active in the Hero with updated EVA 5/10
    render(<DoctorDashboard onOpenConsultation={handleOpen} />);
    expect(screen.getAllByText(/EVA 5\/10/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Rosa Morales Silva/i).length).toBeGreaterThan(0);
  });

  it('Doctor Sidebar RBAC: hides Notificaciones Telegram for PROFESIONAL role', () => {
    render(
      <Sidebar
        currentView="dashboard"
        activeRole="PROFESIONAL"
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText(/Mi Cola de Consulta/i)).toBeInTheDocument();
    expect(screen.getByText(/Ficha EVA & Diagnósticos/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi Agenda Semanal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Notificaciones Telegram/i)).not.toBeInTheDocument();
  });

  it('Clinic Admin E2E: Director schedule booking button routes to internal reception-booking, not public booking', () => {
    const handleNav = vi.fn();
    render(<ClinicAdminDashboard onNavigate={handleNav} />);

    fireEvent.click(screen.getByRole('tab', { name: /Agenda/i }));
    const newBookingBtn = screen.getByRole('button', { name: /Ir al calendario completo/i });
    fireEvent.click(newBookingBtn);

    expect(handleNav).toHaveBeenCalledWith('reception-booking');
  });

  it('Super Admin E2E: switches governance sections (Audit & Health, Finance, Users) cleanly without window.alert', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SuperAdminDashboard />);

    fireEvent.click(screen.getByRole('tab', { name: /Auditoría & Salud/i }));
    expect(screen.getByText(/Bitácora de Auditoría y Trazabilidad/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Finanzas Red/i }));
    expect(screen.getByText(/Comparativa Financiera por Sede/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Administradores/i }));
    expect(screen.getByText(/Administradores y Accesos por Sede/i)).toBeInTheDocument();

    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('Topbar E2E: global search navigates by role, sound toggle updates soundEffects, and profile modal is role-aware', () => {
    const handleNavigate = vi.fn();
    render(
      <ThemeProvider>
        <Topbar
          currentView="dashboard"
          activeRole="PACIENTE"
          onNavigate={handleNavigate}
        />
      </ThemeProvider>,
    );

    // Global search
    const searchInput = screen.getByLabelText(/Búsqueda rápida/i);
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Recetas' } });
    fireEvent.click(screen.getByRole('option', { name: /Mis Recetas & Pagos/i }));
    expect(handleNavigate).toHaveBeenCalledWith('patient-portal');

    // Open profile modal and verify it shows Patient DNI instead of Doctor CMP
    fireEvent.click(screen.getByTitle(/Abrir menú de usuario/i));
    fireEvent.click(screen.getByRole('button', { name: /Mi Perfil Clínico/i }));
    expect(screen.getByText(/DNI 73829104/i)).toBeInTheDocument();
    expect(screen.queryByText(/CMP 48291/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));

    // Sound preference toggle syncs with soundEffects singleton
    fireEvent.click(screen.getByTitle(/Abrir menú de usuario/i));
    fireEvent.click(screen.getByRole('button', { name: /Personalizar Interfaz/i }));
    const checkboxes = screen.getAllByRole('checkbox');
    const initialSound = soundEffects.isEnabled();
    fireEvent.click(checkboxes[1]);
    expect(soundEffects.isEnabled()).toBe(!initialSound);
    soundEffects.setEnabled(true);
  });

  it('Reception Booking E2E: per-day slots work, service price updates accurately to S/ 150.00, and day selector routes booking to target day', () => {
    render(<ReceptionBookingPage />);

    // Switching to Lunes shows Monday's distinct patient
    fireEvent.click(screen.getByText('Lun'));
    expect(screen.getByText(/Mariana Ríos Soto/i)).toBeInTheDocument();

    // Open express booking modal
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Cita Express/i }));

    // Fill patient via quick button
    fireEvent.click(screen.getByRole('button', { name: /Luciana Paredes/i }));

    // Select Consulta Traumatológica -> price must update to S/ 150.00 (was stuck at S/ 100.00 before)
    const modalSelects = document.querySelectorAll('form select');
    fireEvent.change(modalSelects[0], { target: { value: 'Consulta Traumatológica' } });
    expect(screen.getByText(/Cobrado en Ventanilla \(S\/ 150\.00\)/i)).toBeInTheDocument();

    // Select Jueves 14 Sep (index 2 in modal form selects)
    fireEvent.change(modalSelects[2], { target: { value: 'jue' } });

    // Submit booking
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Cita & Notificar/i }));

    // Toast confirms S/ 150.00 and Thursday view shows the newly booked patient
    expect(screen.getByText(/Luciana Paredes Soto \(S\/ 150\.00\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Diego Herrera Solís/i)).toBeInTheDocument();
  });
});
