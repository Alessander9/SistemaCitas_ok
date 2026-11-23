import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingWizard } from './BookingWizard';

/** Picks the first available day of the month. */
const clickFirstAvailableDay = async () => {
  const days = await screen.findAllByRole('button', {
    name: /de \w+, \d+ horarios disponibles$/i,
  });
  const bookableDay = days.find((button) => (button as HTMLButtonElement).disabled === false);
  expect(bookableDay).toBeDefined();
  fireEvent.click(bookableDay as HTMLButtonElement);
};

/** Picks the first bookable slot of the weekly agenda. */
const clickFirstAvailableSlot = async () => {
  const [firstSlot] = await screen.findAllByRole('button', {
    name: /, disponible, \d+ minutos$/i,
  });
  fireEvent.click(firstSlot);
};

/** Walks Step 1 and Step 2. */
const completeStepOneAndTwo = async () => {
  // Step 1: Specialty + Service
  fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
  await waitFor(() => expect(screen.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
  fireEvent.click(screen.getByRole('button', { name: /Continuar al horario/i }));

  // Step 2: Date + Time
  await clickFirstAvailableDay();
  await clickFirstAvailableSlot();
  fireEvent.click(screen.getByRole('button', { name: /Continuar con mis datos/i }));
};

/** Fills patient data (Step 3). */
const completePatientStep = () => {
  fireEvent.change(screen.getByLabelText(/Número de documento/i), {
    target: { value: '08502322' },
  });
  fireEvent.change(screen.getByLabelText(/^Nombres/), { target: { value: 'Luis' } });
  fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'Fernandez' } });
  fireEvent.change(screen.getByLabelText(/Celular \/ WhatsApp/i), {
    target: { value: '+51 987 654 321' },
  });
  fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
    target: { value: 'luis@email.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Revisar mi reserva/i }));
};

describe('BookingWizard (Streamlined 5-Step Booking Flow)', { timeout: 15000 }, () => {
  it('renders Step 1 (Specialty, Service & Professional) initially', () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    expect(
      screen.getByRole('heading', { name: /1\. Especialidad, Servicio y Profesional/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 6/i)).toBeInTheDocument();
    expect(screen.getByText(/17% completado/i)).toBeInTheDocument();

    // 6 Main Stepper nodes
    ['Especialidad & Servicio', 'Fecha & Horario', 'Datos', 'Revisión & Políticas', 'Pago', 'Confirmación'].forEach(
      (milestone) => expect(screen.getByText(milestone)).toBeInTheDocument(),
    );
  });

  it('progresses through steps 1 to 5 when selections are made and valid', async () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    // Step 1: Select Specialty and Service
    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    await waitFor(() => expect(screen.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));

    const nextBtn = screen.getByRole('button', { name: /Continuar al horario/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);

    // Step 2: Date and Time
    expect(screen.getByRole('heading', { name: /4\. Elige el día y horario de tu cita/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 2 de 6/i)).toBeInTheDocument();
    await clickFirstAvailableDay();
    await clickFirstAvailableSlot();
    fireEvent.click(screen.getByRole('button', { name: /Continuar con mis datos/i }));

    // Step 3: Patient Form
    expect(screen.getByRole('heading', { name: /6\. Completa tus datos/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 3 de 6/i)).toBeInTheDocument();
    completePatientStep();

    // Step 4: Review and Policies
    expect(screen.getByRole('heading', { name: /4\. Revisa tu reserva y acepta las políticas/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 4 de 6/i)).toBeInTheDocument();
  });

  it('keeps the patient step closed until the required fields are valid', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepOneAndTwo();

    // Step 3
    expect(screen.getByRole('heading', { name: /6\. Completa tus datos/i })).toBeInTheDocument();
    expect(screen.getByText('Completa los campos obligatorios')).toBeInTheDocument();

    const next = screen.getByRole('button', { name: /Revisar mi reserva/i });
    expect(next).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Número de documento/i), {
      target: { value: '08502322' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Revisar mi reserva/i })).toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText(/^Nombres/), { target: { value: 'Luis' } });
    fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'Fernandez' } });
    fireEvent.change(screen.getByLabelText(/Celular \/ WhatsApp/i), {
      target: { value: '+51 987 654 321' },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'correo-invalido' },
    });

    expect(screen.getByRole('button', { name: /Revisar mi reserva/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'luis@email.com' },
    });

    expect(screen.getByText('Datos completos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Revisar mi reserva/i })).toBeEnabled();
  });

  it('shows Step 4 (Review and Policies) and requires consent checkboxes before advancing to payment', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepOneAndTwo();
    completePatientStep();

    // Step 4 — Review & Policies
    expect(screen.getByRole('heading', { name: /4\. Revisa tu reserva y acepta las políticas/i })).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();
    expect(screen.getByText('DNI: 08502322')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Continuar al pago/i });
    expect(continueBtn).toBeDisabled();

    // Check cancellation consent
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(continueBtn).toBeDisabled();

    // Check privacy consent
    fireEvent.click(checkboxes[1]);
    expect(continueBtn).toBeEnabled();

    // Advance to payment (Step 5)
    fireEvent.click(continueBtn);
    expect(screen.getByRole('heading', { name: /5\. Completa tu pago/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 5 de 6/i)).toBeInTheDocument();
  });

  it('allows toggling between online payment and clinic reception on Step 5', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepOneAndTwo();
    completePatientStep();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByRole('button', { name: /Continuar al pago/i }));

    // Step 5: Checkout
    expect(screen.getByRole('heading', { name: /5\. Completa tu pago/i })).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de crédito o débito')).toBeInTheDocument();

    // Switch to Clinic
    const clinicBtn = screen.getByRole('radio', { name: /Pago en Recepción/i });
    fireEvent.click(clinicBtn);

    expect(screen.getByRole('heading', { name: /5\. Confirma tu reserva/i })).toBeInTheDocument();
    expect(screen.getByText('Pago directo en recepción')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar mi reserva/i })).toBeInTheDocument();
  });

  it('edits a review block on Step 4 and returns with data intact', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepOneAndTwo();
    completePatientStep();

    // Click Edit on the review block
    fireEvent.click(screen.getByRole('button', { name: 'Editar: Especialidad' }));

    // Returns to Step 1
    expect(screen.getByRole('heading', { name: /1\. Especialidad, Servicio y Profesional/i })).toBeInTheDocument();

    // Click Return to Review
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la revisión' }));

    // Back to Step 4
    expect(screen.getByRole('heading', { name: /4\. Revisa tu reserva y acepta las políticas/i })).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();
  });
});
