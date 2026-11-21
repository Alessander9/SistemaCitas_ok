import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentReceiptModal } from './AppointmentReceiptModal';

describe('AppointmentReceiptModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    bookingCode: 'CIT-2026-B745',
    specialtyName: 'Traumatología y Ortopedia',
    serviceName: 'Consulta Médica Traumatológica',
    servicePrice: 150.0,
    serviceDuration: 30,
    doctorName: 'Dr. Carlos Mendoza Ruiz',
    doctorLicense: 'CMP-48291 • RNE-24190',
    appointmentDate: '2026-11-21',
    appointmentTime: '10:30 hrs',
    patientName: 'Luis Fernández',
    patientDocType: 'DNI',
    patientDocNumber: '08502322',
    patientPhone: '+51 987 654 321',
    patientEmail: 'arsrq@gmail.com',
    paymentMethod: 'TARJETA' as const,
    location: 'Sede San Isidro',
    locationAddress: 'Av. Javier Prado Este 2465, San Isidro, Lima',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  it('renders correctly when open with all appointment details', () => {
    render(<AppointmentReceiptModal {...defaultProps} />);

    expect(screen.getByText('Comprobante de Reserva de Cita Médica')).toBeInTheDocument();
    expect(screen.getByText('CIT-2026-B745')).toBeInTheDocument();
    expect(screen.getByText('Luis Fernández')).toBeInTheDocument();
    expect(screen.getByText('DNI 08502322')).toBeInTheDocument();
    expect(screen.getByText('Traumatología y Ortopedia')).toBeInTheDocument();
    expect(screen.getAllByText('Consulta Médica Traumatológica').length).toBeGreaterThan(0);
    expect(screen.getByText(/Dr\. Carlos Mendoza Ruiz/)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-21 — 10:30 hrs/)).toBeInTheDocument();
    expect(screen.getByText(/S\/ 150\.00 PEN/)).toBeInTheDocument();
    expect(screen.getByText(/ESTADO: CITA CONFIRMADA — PAGO EN LÍNEA ACREDITADO/)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AppointmentReceiptModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls window.print when clicking "Descargar PDF / Imprimir"', () => {
    render(<AppointmentReceiptModal {...defaultProps} />);

    const printBtn = screen.getByRole('button', { name: /Descargar PDF \/ Imprimir/i });
    fireEvent.click(printBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the close button', () => {
    render(<AppointmentReceiptModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /Cerrar comprobante/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing the Escape key', () => {
    render(<AppointmentReceiptModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
