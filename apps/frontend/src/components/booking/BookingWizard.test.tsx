import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingWizard } from './BookingWizard';

/** Picks the first *bookable* day of the month (past/outside days are off). */
const clickFirstAvailableDay = async () => {
  const days = await screen.findAllByRole('button', {
    name: /de \w+, \d+ horarios disponibles$/i,
  });
  const bookableDay = days.find((button) => (button as HTMLButtonElement).disabled === false);
  expect(bookableDay).toBeDefined();
  fireEvent.click(bookableDay as HTMLButtonElement);
};

/** Picks the first bookable hour of the day agenda (step 5). */
const clickFirstAvailableSlot = async () => {
  const [firstSlot] = await screen.findAllByRole('button', {
    name: /, disponible, \d+ minutos$/i,
  });
  fireEvent.click(firstSlot);
};

/** Walks steps 1-5 with real selections so the patient form is reachable. */
const completeStepsOneToFive = async () => {
  fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

  fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
  fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

  fireEvent.click(screen.getByText(/Cualquier Profesional Disponible/i));
  fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

  await clickFirstAvailableDay();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

  await clickFirstAvailableSlot();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
};

/** Fills the patient form (step 6) and advances to the review step. */
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
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
};

describe('BookingWizard (11-Step Booking Flow)', { timeout: 15000 }, () => {
  it('renders Step 1 (Specialty selection) initially', () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    expect(screen.getByRole('heading', { name: /Selecciona la Especialidad Médica/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 11/i)).toBeInTheDocument();

    // The stepper mirrors the real flow: 7 main milestones, never a stray one.
    ['Especialidad', 'Servicio', 'Profesional', 'Fecha', 'Horario', 'Datos', 'Confirmación'].forEach(
      (milestone) => expect(screen.getByText(milestone)).toBeInTheDocument(),
    );
  });

  it('progresses through steps when selections are made and valid', async () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    // Step 1: Select Specialty
    const firstSpecialty = screen.getByText('Fisioterapia y Rehabilitación');
    fireEvent.click(firstSpecialty);

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);

    // Step 2: Select Service
    expect(screen.getByRole('heading', { name: /2\. Selecciona el Servicio/i })).toBeInTheDocument();
    const firstService = screen.getByText('Evaluación y Diagnóstico Físico Inicial');
    fireEvent.click(firstService);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 3: Select Professional
    expect(
      screen.getByRole('heading', { name: /Elige a tu Profesional de Confianza/i }),
    ).toBeInTheDocument();
    const autoProfessional = screen.getByText(/Cualquier Profesional Disponible/i);
    fireEvent.click(autoProfessional);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 4: date selection in the calendar
    expect(
      screen.getByRole('heading', { name: /4\. Elige el día y horario de tu cita/i }),
    ).toBeInTheDocument();
    await clickFirstAvailableDay();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    // Step 5: time selection for the chosen date
    expect(
      screen.getByRole('heading', { name: /5\. Elige el horario de tu cita/i }),
    ).toBeInTheDocument();
    await clickFirstAvailableSlot();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    // Step 6: Patient Information
    expect(screen.getByRole('heading', { name: /6\. Completa tus datos/i })).toBeInTheDocument();
  });

  it('requires a date on step 4 and a slot on step 5 before continuing', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /^Seleccionar$/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 4 — Fecha
    expect(
      screen.getByRole('heading', { name: /4\. Elige el día y horario de tu cita/i }),
    ).toBeInTheDocument();
    await screen.findByText('Disponibilidad semanal');
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    await clickFirstAvailableDay();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    // Step 5 — Horario: the header and the stepper stay in sync with the step.
    expect(
      screen.getByRole('heading', { name: /5\. Elige el horario de tu cita/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Paso 5 de 11')).toBeInTheDocument();
    expect(screen.getByText('45% completado')).toBeInTheDocument();
    expect(screen.getByText('Horario').closest('[aria-current="step"]')).not.toBeNull();

    await screen.findByText('Horarios disponibles');
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    expect(screen.getByLabelText('Tu cita')).toHaveTextContent('Selecciona un horario');

    await clickFirstAvailableSlot();

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    expect(screen.getByText(/\d{4}-\d{2}-\d{2} · \d{2}:\d{2} hrs/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Tu cita')).toHaveTextContent('Horario seleccionado');
  });

  it('returns to the calendar from step 5 without losing the booking', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /^Seleccionar$/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    await clickFirstAvailableDay();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await screen.findByText('Horarios disponibles');
    fireEvent.click(screen.getByRole('button', { name: /Cambiar fecha/i }));

    expect(
      screen.getByRole('heading', { name: /4\. Elige el día y horario de tu cita/i }),
    ).toBeInTheDocument();
    // The day stays selected, so the booking is not lost.
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('keeps the patient step closed until the required fields are valid', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepsOneToFive();

    // Step 6 — the CTA stays disabled while the form is incomplete.
    expect(screen.getByRole('heading', { name: /6\. Completa tus datos/i })).toBeInTheDocument();
    expect(screen.getByText('Paso 6 de 11')).toBeInTheDocument();
    expect(screen.getByText('55% completado')).toBeInTheDocument();
    expect(screen.getByText('Datos').closest('[aria-current="step"]')).not.toBeNull();
    expect(screen.getByText('Completa los campos obligatorios')).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Siguiente' });
    expect(next).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Número de documento/i), {
      target: { value: '08502322' },
    });
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^Nombres/), { target: { value: 'Luis' } });
    fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'Fernandez' } });
    fireEvent.change(screen.getByLabelText(/Celular \/ WhatsApp/i), {
      target: { value: '+51 987 654 321' },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'correo-invalido' },
    });

    // Invalid e-mail keeps the action blocked (format is validated).
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'luis@email.com' },
    });

    expect(screen.getByText('Datos completos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('keeps the Continue action disabled until a specialty is selected', async () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    // Let the initial catalog sync settle before asserting.
    await waitFor(() => expect(screen.getByText('Especialidad')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled();

    fireEvent.click(screen.getByText('Terapia Ocupacional'));

    expect(screen.getByRole('button', { name: /Continuar/i })).toBeEnabled();
    expect(screen.getByText(/Especialidad: Terapia Ocupacional/i)).toBeInTheDocument();
  });

  it('keeps Siguiente disabled until a service is selected on step 2', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(
      screen.getByRole('heading', { name: /2\. Selecciona el Servicio o Terapia/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Servicios disponibles')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeDisabled();

    fireEvent.click(screen.getByText('Sesión de Terapia Manual y Punción Seca'));

    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeEnabled();
    expect(screen.getByText(/Servicio: Sesión de Terapia Manual/i)).toBeInTheDocument();
  });

  it('keeps Siguiente disabled until a professional is selected on step 3', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(
      screen.getByRole('heading', { name: /Elige a tu Profesional de Confianza/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeDisabled();

    // The auto-assignment card is a real alternative and renders first.
    const [autoAssignCta] = screen.getAllByRole('button', { name: /^Seleccionar$/i });
    fireEvent.click(autoAssignCta);

    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeEnabled();
    expect(screen.getByText(/Profesional: primero disponible/i)).toBeInTheDocument();
  });

  it('shows the review step (7) with the real step, the booking and a single CTA', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepsOneToFive();
    completePatientStep();

    // Header and stepper stay in sync with the real step.
    expect(screen.getByRole('heading', { name: /7\. Revisa tu reserva/i })).toBeInTheDocument();
    expect(screen.getByText('Paso 7 de 11')).toBeInTheDocument();
    expect(screen.getByText('64% completado')).toBeInTheDocument();
    expect(screen.getByText('Revisión').closest('[aria-current="step"]')).not.toBeNull();

    // The review mirrors the real booking state.
    expect(screen.getByText('Detalles de tu cita')).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();
    expect(screen.getByText('DNI: 08502322')).toBeInTheDocument();
    expect(screen.getByText('Resumen de pago')).toBeInTheDocument();
    expect(screen.getByText('Datos completos')).toBeInTheDocument();

    // The CTA lives inside the payment summary: no duplicated footer button.
    expect(screen.getByRole('button', { name: /Continuar con la confirmación/i })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /^Siguiente$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Tus datos están protegidos/i)).toBeInTheDocument();
  });

  it('continues from the review to the confirmation step', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepsOneToFive();
    completePatientStep();

    fireEvent.click(screen.getByRole('button', { name: /Continuar con la confirmación/i }));

    expect(
      screen.getByRole('heading', { name: /8\. Revisa y acepta las condiciones/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Paso 8 de 11')).toBeInTheDocument();
    expect(screen.getByText('Políticas').closest('[aria-current="step"]')).not.toBeNull();
  });

  it('edits a review block and comes back to the review with the booking intact', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepsOneToFive();
    completePatientStep();

    // "Editar" on the specialty block returns to step 1 with everything kept.
    fireEvent.click(screen.getByRole('button', { name: 'Editar: Especialidad' }));
    expect(
      screen.getByRole('heading', { name: /Selecciona la Especialidad Médica/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Especialidad: Fisioterapia y Rehabilitación/i)).toBeInTheDocument();

    // The edited step leads back to the review instead of walking the wizard.
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la revisión' }));

    expect(screen.getByRole('heading', { name: /7\. Revisa tu reserva/i })).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();
    expect(screen.getByText('Datos completos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar con la confirmación/i })).toBeEnabled();
  });

  it('changes the specialty from the review and keeps the rest of the booking', async () => {
    render(<BookingWizard onBackToHome={vi.fn()} />);

    await completeStepsOneToFive();
    completePatientStep();

    fireEvent.click(screen.getByRole('button', { name: 'Editar: Especialidad' }));
    fireEvent.click(screen.getByText('Terapia Ocupacional'));
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la revisión' }));

    // The new value is mirrored by the review without any extra navigation.
    expect(screen.getByText('Terapia Ocupacional')).toBeInTheDocument();
    expect(screen.getByText('Luis Fernandez')).toBeInTheDocument();
    // Changing the specialty clears the service, so the review flags it.
    expect(screen.getByText('Falta información')).toBeInTheDocument();
    expect(screen.getByText('Por definir')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar con la confirmación/i })).toBeDisabled();
  });
});
