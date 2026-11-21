import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppointmentConsentStep } from './AppointmentConsentStep';

describe('AppointmentConsentStep', () => {
  const defaultProps = {
    cancellationAccepted: false,
    privacyAccepted: false,
    onCancellationToggle: vi.fn(),
    onPrivacyToggle: vi.fn(),
    hasSubmitError: false,
    specialtyName: 'Fisioterapia y Rehabilitación',
    serviceName: 'Evaluación y Diagnóstico Físico Inicial',
    durationLabel: '60 minutos',
    professionalName: 'Dr. Carlos Mendoza Ruiz',
    patientName: 'Juan Carlos Pérez Gómez',
    location: 'Sede San Isidro',
    priceLabel: 'S/ 120.00',
    dateLabel: 'Martes, 08 de septiembre de 2026',
    timeRangeLabel: '09:00 AM - 10:00 AM',
  };

  it('renders step heading and subtitle correctly', () => {
    render(<AppointmentConsentStep {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: /8\. Revisa y acepta las condiciones/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Antes de continuar, necesitamos tu autorización/i),
    ).toBeInTheDocument();
  });

  it('renders both consent cards with badges and summary text', () => {
    render(<AppointmentConsentStep {...defaultProps} />);

    expect(
      screen.getByText('Política de cancelación y reprogramación'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tratamiento de datos personales'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Obligatorio')).toHaveLength(2);
    expect(screen.getByText('Leer política completa')).toBeInTheDocument();
    expect(screen.getByText('Leer política de privacidad')).toBeInTheDocument();
  });

  it('calls toggle handlers when cards are clicked', () => {
    const onCancellationToggle = vi.fn();
    const onPrivacyToggle = vi.fn();

    render(
      <AppointmentConsentStep
        {...defaultProps}
        onCancellationToggle={onCancellationToggle}
        onPrivacyToggle={onPrivacyToggle}
      />,
    );

    const cards = screen.getAllByRole('checkbox');
    fireEvent.click(cards[0]);
    expect(onCancellationToggle).toHaveBeenCalledTimes(1);

    fireEvent.click(cards[1]);
    expect(onPrivacyToggle).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation and activation with Space and Enter', () => {
    const onCancellationToggle = vi.fn();

    render(
      <AppointmentConsentStep
        {...defaultProps}
        onCancellationToggle={onCancellationToggle}
      />,
    );

    const cards = screen.getAllByRole('checkbox');
    fireEvent.keyDown(cards[0], { key: ' ' });
    expect(onCancellationToggle).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(cards[0], { key: 'Enter' });
    expect(onCancellationToggle).toHaveBeenCalledTimes(2);
  });

  it('does not display the error alert initially', () => {
    render(<AppointmentConsentStep {...defaultProps} hasSubmitError={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays the error alert when hasSubmitError is true and policies are pending', () => {
    render(<AppointmentConsentStep {...defaultProps} hasSubmitError={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Revisa los campos obligatorios')).toBeInTheDocument();
    expect(
      screen.getByText(/Debes aceptar las políticas requeridas para continuar/i),
    ).toBeInTheDocument();
  });

  it('opens and closes the cancellation policy modal without leaving the flow', () => {
    render(<AppointmentConsentStep {...defaultProps} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Leer política completa'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/1\. Cancelación sin penalidad/i)).toBeInTheDocument();

    // Close button dismisses modal
    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar' });
    fireEvent.click(closeButtons[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens and closes the privacy policy modal on Escape key', () => {
    render(<AppointmentConsentStep {...defaultProps} />);

    fireEvent.click(screen.getByText('Leer política de privacidad'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Ley N.° 29733/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates the status checklist when policies are accepted', () => {
    const { rerender } = render(<AppointmentConsentStep {...defaultProps} />);

    expect(screen.getByText('Falta aceptar las políticas para continuar.')).toBeInTheDocument();
    expect(screen.getByText('Falta aceptar las políticas requeridas.')).toBeInTheDocument();

    rerender(
      <AppointmentConsentStep
        {...defaultProps}
        cancellationAccepted={true}
        privacyAccepted={true}
      />,
    );

    expect(screen.getByText('Todos los pasos requeridos están completos.')).toBeInTheDocument();
    expect(screen.getByText('Reserva lista para confirmar')).toBeInTheDocument();
  });

  it('renders the right-hand appointment summary with patient and clinic details', () => {
    render(<AppointmentConsentStep {...defaultProps} />);

    expect(screen.getByText('Resumen de tu cita')).toBeInTheDocument();
    expect(screen.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();
    expect(screen.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Mendoza Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Juan Carlos Pérez Gómez')).toBeInTheDocument();
    expect(screen.getByText('Sede San Isidro')).toBeInTheDocument();
    expect(screen.getByText('S/ 120.00')).toBeInTheDocument();
  });
});
