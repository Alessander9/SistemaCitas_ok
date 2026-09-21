// =============================================================================
// CitasSistema — Appointment Flow (wizard shell configuration)
// Single source of truth for step count, visual stepper nodes and CTA labels.
// =============================================================================

import { AppointmentStepDefinition } from './appointmentTypes';

/** The booking flow is an 11-step wizard with 11 milestone nodes in the stepper. */
export const APPOINTMENT_TOTAL_STEPS = 11;

/**
 * Main milestones of the booking flow (11 steps):
 * 1. Especialidad
 * 2. Servicio
 * 3. Profesional
 * 4. Fecha
 * 5. Horario
 * 6. Datos
 * 7. Revisión
 * 8. Políticas
 * 9. Modalidad de pago
 * 10. Pago / Confirmación
 * 11. Confirmación de reserva
 */
export const APPOINTMENT_WIZARD_STEPS: AppointmentStepDefinition[] = [
  { id: 'specialty', label: 'Especialidad' },
  { id: 'service', label: 'Servicio' },
  { id: 'professional', label: 'Profesional' },
  { id: 'date', label: 'Fecha' },
  { id: 'time', label: 'Horario' },
  { id: 'data', label: 'Datos' },
  { id: 'review', label: 'Revisión' },
  { id: 'policies', label: 'Políticas' },
  { id: 'payment-mode', label: 'Pago' },
  { id: 'checkout', label: 'Pago' },
  { id: 'confirmation', label: 'Confirmación' },
];

/**
 * Maps every internal wizard step to its milestone node.
 * Step 1..11 maps to 0..10 index.
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
  if (step === 1) return 'Continuar';
  if (step === 7) return 'Continuar con las políticas';
  if (step === 8) return 'Continuar con el pago';
  if (step === 9) return paymentMethod === 'TARJETA' ? 'Continuar al pago' : 'Continuar a la confirmación';
  if (step === 10) return paymentMethod === 'TARJETA' ? `Pagar S/ ${price.toFixed(2)}` : 'Confirmar mi reserva';
  if (step === 11) return 'Finalizar y Descargar';
  return 'Siguiente';
}
