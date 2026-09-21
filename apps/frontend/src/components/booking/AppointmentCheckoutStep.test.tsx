import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppointmentCheckoutStep } from './AppointmentCheckoutStep';

describe('AppointmentCheckoutStep (Step 10)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders online checkout correctly with 4 submethod tabs and summary card', () => {
    render(
      <AppointmentCheckoutStep
        paymentMethod="TARJETA"
        price={150}
        currency="PEN"
        specialtyName="Traumatología y Ortopedia"
        serviceName="Consulta Médica Traumatológica"
        professionalName="Dr. Carlos Mendoza Ruiz"
        professionalLicense="CMP-51294"
        dateLabel="Jueves, 24 de septiembre de 2026"
        timeRangeLabel="05:30 PM – 06:00 PM"
      />,
    );

    // Title & subtitle
    expect(screen.getByText('10. Completa tu pago')).toBeInTheDocument();
    expect(
      screen.getByText('Realiza el pago de forma segura para confirmar tu reserva.'),
    ).toBeInTheDocument();

    // Timer banner
    expect(screen.getByText('Tu horario está reservado temporalmente')).toBeInTheDocument();

    // Submethods tabs
    expect(screen.getByText('Tarjeta de crédito o débito')).toBeInTheDocument();
    expect(screen.getByText('Yape')).toBeInTheDocument();
    expect(screen.getByText('Plin')).toBeInTheDocument();
    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();

    // Card form fields
    expect(screen.getByLabelText(/Número de tarjeta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de vencimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de seguridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del titular/i)).toBeInTheDocument();

    // Trust badges
    expect(screen.getByText('Pago 100% seguro')).toBeInTheDocument();
    expect(screen.getByText('Tus datos están protegidos')).toBeInTheDocument();
    expect(screen.getByText('Comprobante electrónico')).toBeInTheDocument();

    // Summary card
    expect(screen.getByText('Resumen de tu reserva')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Mendoza Ruiz')).toBeInTheDocument();
    expect(screen.getByText('CMP-51294')).toBeInTheDocument();
    expect(screen.getByText('S/ 150.00 PEN')).toBeInTheDocument();
  });

  it('switches online payment submethods to Yape, Plin, and Transfer', () => {
    const onSelectSubMethod = vi.fn();
    render(
      <AppointmentCheckoutStep
        paymentMethod="TARJETA"
        price={150}
        currency="PEN"
        onSelectSubMethod={onSelectSubMethod}
      />,
    );

    // Switch to Yape
    fireEvent.click(screen.getByText('Yape'));
    expect(onSelectSubMethod).toHaveBeenCalledWith('YAPE');
    expect(
      screen.getByLabelText(/Número celular registrado en Yape/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de aprobación/i)).toBeInTheDocument();

    // Switch to Plin
    fireEvent.click(screen.getByText('Plin'));
    expect(onSelectSubMethod).toHaveBeenCalledWith('PLIN');
    expect(
      screen.getByLabelText(/Número celular registrado en Plin/i),
    ).toBeInTheDocument();

    // Switch to Transfer
    fireEvent.click(screen.getByText('Transferencia bancaria'));
    expect(onSelectSubMethod).toHaveBeenCalledWith('TRANSFER');
    expect(screen.getByText('Cuentas bancarias de la clínica')).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de operación bancaria/i)).toBeInTheDocument();
  });

  it('renders clinic confirmation mode without online credit card form', () => {
    const onEditBooking = vi.fn();
    render(
      <AppointmentCheckoutStep
        paymentMethod="CLINICA"
        price={150}
        currency="PEN"
        onEditBooking={onEditBooking}
      />,
    );

    // Title & subtitle
    expect(screen.getByText('10. Confirma tu reserva')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tu cita quedará reservada y podrás realizar el pago directamente en la clínica.',
      ),
    ).toBeInTheDocument();

    // Clinic details
    expect(screen.getByText('Pago directo en recepción')).toBeInTheDocument();
    expect(screen.getByText('Total pendiente en clínica')).toBeInTheDocument();
    expect(screen.getByText('Medios de pago aceptados en caja')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();

    // No card fields in clinic mode
    expect(screen.queryByLabelText(/Número de tarjeta/i)).not.toBeInTheDocument();

    // Click Edit button in summary
    const editBtn = screen.getByRole('button', { name: /Editar/i });
    fireEvent.click(editBtn);
    expect(onEditBooking).toHaveBeenCalledTimes(1);
  });

  it('handles reservation timer expiration', () => {
    const onTimerExpired = vi.fn();
    render(
      <AppointmentCheckoutStep
        paymentMethod="TARJETA"
        initialSecondsRemaining={2}
        onTimerExpired={onTimerExpired}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onTimerExpired).toHaveBeenCalled();
    expect(screen.getByText('Tu reserva temporal ha vencido')).toBeInTheDocument();
  });
});
