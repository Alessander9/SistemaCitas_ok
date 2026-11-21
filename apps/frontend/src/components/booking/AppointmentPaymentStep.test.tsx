import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppointmentPaymentStep } from './AppointmentPaymentStep';

describe('AppointmentPaymentStep (Step 9 — Método de Pago)', () => {
  const defaultProps = {
    paymentMethod: 'CLINICA' as const,
    onSelectPaymentMethod: vi.fn(),
    specialtyName: 'Traumatología y Ortopedia',
    serviceName: 'Consulta Médica Traumatológica',
    durationLabel: '30 minutos',
    professionalName: 'Dr. Carlos Mendoza Ruiz',
    professionalLicense: 'CMP-51294',
    dateLabel: 'Jueves, 24 de septiembre de 2026',
    timeRangeLabel: '05:30 PM – 06:00 PM',
    location: 'Sede San Isidro',
    locationAddress: 'Av. Emilio Cavenecia 225, San Isidro, Lima',
    price: 150.0,
    currency: 'PEN',
    onEditBooking: vi.fn(),
    onTimerExpired: vi.fn(),
  };

  it('renders step heading, subtitle and reservation timer', () => {
    render(<AppointmentPaymentStep {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: /9\. Elige cómo realizarás el pago/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona la modalidad que prefieras para completar tu reserva/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tu horario está reservado temporalmente/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('renders both payment method cards with details and available badges', () => {
    render(<AppointmentPaymentStep {...defaultProps} />);

    expect(screen.getByText('Pago en clínica')).toBeInTheDocument();
    expect(screen.getByText('Pago al asistir')).toBeInTheDocument();
    expect(
      screen.getByText(/Realiza el pago directamente en recepción el día de tu cita/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta en clínica')).toBeInTheDocument();
    expect(screen.getByText('Sin cobro online')).toBeInTheDocument();

    expect(screen.getByText('Pago online')).toBeInTheDocument();
    expect(screen.getByText('Confirmación inmediata')).toBeInTheDocument();
    expect(
      screen.getByText(/Realiza el pago ahora mediante nuestra pasarela de pagos segura/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('Mastercard')).toBeInTheDocument();
    expect(screen.getByText('American Express')).toBeInTheDocument();
    expect(screen.getByText('Pago seguro')).toBeInTheDocument();
  });

  it('calls onSelectPaymentMethod when clicking a payment card', () => {
    const onSelectPaymentMethod = vi.fn();
    render(
      <AppointmentPaymentStep
        {...defaultProps}
        onSelectPaymentMethod={onSelectPaymentMethod}
      />,
    );

    const onlineCard = screen.getByRole('radio', { name: /Pago online/i });
    fireEvent.click(onlineCard);
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('TARJETA');

    const clinicCard = screen.getByRole('radio', { name: /Pago en clínica/i });
    fireEvent.click(clinicCard);
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('CLINICA');
  });

  it('supports keyboard navigation with Space and Enter keys on payment cards', () => {
    const onSelectPaymentMethod = vi.fn();
    render(
      <AppointmentPaymentStep
        {...defaultProps}
        onSelectPaymentMethod={onSelectPaymentMethod}
      />,
    );

    const onlineCard = screen.getByRole('radio', { name: /Pago online/i });
    fireEvent.keyDown(onlineCard, { key: ' ' });
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('TARJETA');

    fireEvent.keyDown(onlineCard, { key: 'Enter' });
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('TARJETA');
  });

  it('renders the 3-step timeline of What Happens Next', () => {
    render(<AppointmentPaymentStep {...defaultProps} />);

    expect(screen.getByText('¿Qué sucede después?')).toBeInTheDocument();
    expect(screen.getByText('Confirmas tu reserva')).toBeInTheDocument();
    expect(screen.getByText('Procesamos la información')).toBeInTheDocument();
    expect(screen.getByText('Recibes la confirmación')).toBeInTheDocument();
  });

  it('renders the reservation summary card with all booking details', () => {
    render(<AppointmentPaymentStep {...defaultProps} />);

    expect(screen.getByText('Resumen de tu reserva')).toBeInTheDocument();
    expect(screen.getByText('Traumatología y Ortopedia')).toBeInTheDocument();
    expect(screen.getByText('Consulta Médica Traumatológica')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Mendoza Ruiz')).toBeInTheDocument();
    expect(screen.getByText('CMP-51294')).toBeInTheDocument();
    expect(screen.getByText('Jueves, 24 de septiembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('05:30 PM – 06:00 PM')).toBeInTheDocument();
    expect(screen.getByText('30 minutos')).toBeInTheDocument();
    expect(screen.getByText('Sede San Isidro')).toBeInTheDocument();
    expect(screen.getByText('Av. Emilio Cavenecia 225, San Isidro, Lima')).toBeInTheDocument();
  });

  it('renders prominent price box and dynamic subnote depending on payment method', () => {
    const { rerender } = render(
      <AppointmentPaymentStep {...defaultProps} paymentMethod="CLINICA" />,
    );

    expect(screen.getByText('Total de la reserva')).toBeInTheDocument();
    expect(screen.getByText(/S\/ 150\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Monto a pagar ahora:/i)).toBeInTheDocument();

    rerender(
      <AppointmentPaymentStep {...defaultProps} paymentMethod="TARJETA" />,
    );

    expect(screen.getByText('Monto total a pagar')).toBeInTheDocument();
    expect(screen.queryByText(/Monto a pagar ahora: S\/ 0\.00/i)).not.toBeInTheDocument();
  });

  it('triggers onEditBooking when clicking the edit button in the summary header', () => {
    const onEditBooking = vi.fn();
    render(
      <AppointmentPaymentStep {...defaultProps} onEditBooking={onEditBooking} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Editar detalles de la reserva/i }));
    expect(onEditBooking).toHaveBeenCalledTimes(1);
  });
});
