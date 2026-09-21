// =============================================================================
// CitasSistema — Appointment Flow (wizard shell configuration)
// Single source of truth for step count, visual stepper nodes and CTA labels.
// =============================================================================

import { AppointmentStepDefinition } from './appointmentTypes';

/** The booking flow is a 6-step streamlined wizard (5 active steps + 1 confirmation). */
export const APPOINTMENT_TOTAL_STEPS = 6;

/**
 * Main milestones of the streamlined booking flow (6 steps):
 * 1. Especialidad & Servicio (includes optional doctor selection)
 * 2. Fecha & Horario (calendar + day slots integrated)
 * 3. Datos del Paciente (identity + contact details)
 * 4. Revisión & Políticas (summary + consent checkboxes)
 * 5. Pago y Confirmación (modalities + checkout)
 * 6. Confirmación de Reserva (success code + post-booking actions)
 */
export const APPOINTMENT_WIZARD_STEPS: AppointmentStepDefinition[] = [
  { id: 'selection', label: 'Especialidad & Servicio' },
  { id: 'schedule', label: 'Fecha & Horario' },
  { id: 'data', label: 'Datos' },
  { id: 'review', label: 'Revisión & Políticas' },
  { id: 'payment', label: 'Pago' },
  { id: 'confirmation', label: 'Confirmación' },
];

/**
 * Maps every internal wizard step to its milestone node (0-indexed).
 * Step 1..6 maps to 0..5 index.
 */
export function resolveStepperIndex(step: number): number {
  if (step <= 1) return 0;
  if (step >= APPOINTMENT_TOTAL_STEPS) return APPOINTMENT_TOTAL_STEPS - 1;
  return step - 1;
}

export function resolveProgressPercent(
  step: number,
  totalSteps: number = APPOINTMENT_TOTAL_STEPS,
): number {
  const clamped = Math.min(Math.max(step, 1), totalSteps);
  return Math.round((clamped / totalSteps) * 100);
}

export function resolveBackLabel(step: number): string {
  return step <= 1 ? 'Volver' : 'Anterior';
}

export function resolveNextLabel(
  step: number,
  paymentMethod?: 'CLINICA' | 'TARJETA',
  price: number = 150,
): string {
  if (step === 1) return 'Continuar al horario';
  if (step === 2) return 'Continuar con mis datos';
  if (step === 3) return 'Revisar mi reserva';
  if (step === 4) return 'Continuar al pago';
  if (step === 5) return paymentMethod === 'TARJETA' ? `Pagar S/ ${price.toFixed(2)}` : 'Confirmar mi reserva';
  if (step === 6) return 'Finalizar';
  return 'Siguiente';
}

