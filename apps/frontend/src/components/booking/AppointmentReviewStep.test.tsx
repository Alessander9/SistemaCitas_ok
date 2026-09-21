import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AppointmentReviewStep } from './AppointmentReviewStep';
import type { AppointmentReviewStepProps } from './AppointmentReviewStep';
import {
  buildSelectedSpecialtySummary,
  buildServiceCards,
  findProfessionalCard,
} from './index';
import { MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';

const specialty = buildSelectedSpecialtySummary(MOCK_SPECIALTIES[0]);
const service = buildServiceCards([MOCK_SERVICES[0]])[0];
const professional = findProfessionalCard(MOCK_PROFESSIONALS, 'prof-2', specialty.name);

const PATIENT = {
  docType: 'DNI',
  docNumber: '08502322',
  firstName: 'Luis',
  lastName: 'Fernandez',
  phone: '+51 987 654 321',
  email: 'luis@email.com',
  notes: '',
};

const renderStep = (overrides: Partial<AppointmentReviewStepProps> = {}) => {
  const props: AppointmentReviewStepProps = {
    specialty,
    service,
    professional,
    date: '2026-09-24',
    time: '17:30',
    patient: PATIENT,
    onEditStep: vi.fn(),
    onContinue: vi.fn(),
    ...overrides,
  };
  render(<AppointmentReviewStep {...props} />);
  return props;
};

describe('AppointmentReviewStep (Step 7 — Revisa tu reserva)', () => {
  it('renders the review heading, the details card and the payment summary', () => {
    renderStep();

    expect(screen.getByRole('heading', { name: /7\. Revisa tu reserva/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Verifica que todos los datos de tu cita sean correctos/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Detalles de tu cita' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resumen de pago' })).toBeInTheDocument();
    expect(screen.getByText('Detalle de tu reserva')).toBeInTheDocument();
  });

  it('shows every booking block with its real value and meta chips', () => {
    renderStep();

    ['Especialidad', 'Servicio', 'Profesional', 'Fecha y hora', 'Datos del paciente'].forEach(
      (label) => expect(screen.getAllByText(label).length).toBeGreaterThan(0),
    );

    expect(screen.getAllByText('Fisioterapia y Rehabilitación').length).toBeGreaterThan(0);
    // Also present in the payment summary, hence the "at least once" assertion.
    expect(screen.getAllByText('Evaluación y Diagnóstico Físico Inicial').length).toBeGreaterThan(0);
    expect(screen.getByText('Dr. Carlos Mendoza Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Jueves, 24 de septiembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();

    // Service + schedule chips (duration, price and the real time range).
    expect(screen.getAllByText('60 minutos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('S/ 120.00').length).toBeGreaterThan(0);
    expect(screen.getByText('05:30 PM – 06:30 PM')).toBeInTheDocument();
    expect(screen.getByText('CMP-51294')).toBeInTheDocument();

    // Patient contact data as chips, never a plain table.
    expect(screen.getByText('DNI: 08502322')).toBeInTheDocument();
    expect(screen.getByText('+51 987 654 321')).toBeInTheDocument();
    expect(screen.getByText('luis@email.com')).toBeInTheDocument();
  });

  it('always shows the attending branch', () => {
    renderStep();

    expect(screen.getByText('Sede de atención')).toBeInTheDocument();
    expect(screen.getByText('Sede San Isidro')).toBeInTheDocument();
    expect(screen.queryByText('Motivo de consulta')).not.toBeInTheDocument();
  });

  it('renders the reason block only when the patient actually wrote one', () => {
    renderStep({ patient: { ...PATIENT, notes: 'Dolor lumbar y evaluación general.' } });

    expect(screen.getByText('Motivo de consulta')).toBeInTheDocument();
    expect(screen.getByText('Dolor lumbar y evaluación general.')).toBeInTheDocument();
  });

  it('sends the patient back to the step that owns each block', () => {
    const props = renderStep();

    fireEvent.click(screen.getByRole('button', { name: 'Editar: Especialidad' }));
    expect(props.onEditStep).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Editar: Servicio' }));
    expect(props.onEditStep).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar: Profesional' }));
    expect(props.onEditStep).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar: Fecha y hora' }));
    expect(props.onEditStep).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Editar datos: Datos del paciente' }));
    expect(props.onEditStep).toHaveBeenCalledWith(6);
  });

  it('groups the payment into a high-contrast total and never hides the amount', () => {
    renderStep();

    const payment = within(
      screen.getByRole('heading', { name: 'Resumen de pago' }).closest('section') as HTMLElement,
    );

    expect(payment.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument();
    // Service row + total, both with the real amount.
    expect(payment.getAllByText('S/ 120.00')).toHaveLength(2);

    const total = payment.getByText('Total a pagar').parentElement as HTMLElement;
    expect(within(total).getByText(/120\.00/)).toBeInTheDocument();
    expect(within(total).getByText('PEN')).toBeInTheDocument();
    expect(payment.getByText('Pago seguro')).toBeInTheDocument();
    expect(
      payment.getByText(/Podrás elegir el método de pago en el siguiente paso/i),
    ).toBeInTheDocument();
  });

  it('lists the validation checklist and enables the confirmation CTA when ready', () => {
    const props = renderStep();

    expect(screen.getByRole('heading', { name: '¿Todo correcto?' })).toBeInTheDocument();
    expect(screen.getByText('Datos completos')).toBeInTheDocument();
    [
      'Especialidad y servicio',
      'Profesional asignado',
      'Fecha y hora',
      'Datos del paciente',
    ].forEach((item) => expect(screen.getAllByText(item).length).toBeGreaterThan(0));

    const cta = screen.getByRole('button', { name: /Continuar con la confirmación/i });
    expect(cta).toBeEnabled();

    fireEvent.click(cta);
    expect(props.onContinue).toHaveBeenCalledTimes(1);
  });

  it('flags exactly what is missing and disables the CTA', () => {
    renderStep({ patient: { ...PATIENT, firstName: '', docNumber: '' } });

    expect(screen.getByText('Falta información')).toBeInTheDocument();
    expect(screen.getByText(/Revisa los datos marcados antes de continuar/i)).toBeInTheDocument();
    expect(screen.getByText(/Reserva incompleta/i)).toBeInTheDocument();
    // The patient block keeps the data that exists and flags what does not.
    expect(screen.getByText('Fernandez')).toBeInTheDocument();
    expect(screen.getByText('Documento pendiente')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Continuar con la confirmación/i })).toBeDisabled();
    // The complete items are still reported as ready.
    expect(screen.getAllByText('Listo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Información pendiente').length).toBe(1);
  });

  it('treats the automatic assignment as a valid professional selection', () => {
    renderStep({ professional: null, autoAssignProfessional: true });

    expect(screen.getByText('Primero disponible')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar: Profesional' })).toBeInTheDocument();
    expect(screen.getByText('Datos completos')).toBeInTheDocument();
  });

  it('marks the date and time as missing when the schedule is not set', () => {
    renderStep({ date: '', time: '' });

    expect(screen.getByText('Por definir')).toBeInTheDocument();
    expect(screen.getByText('Falta información')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar con la confirmación/i })).toBeDisabled();
  });
});
