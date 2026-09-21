// =============================================================================
// CitasSistema — Appointment Flow (wizard shell configuration)
// Single source of truth for step count, visual stepper nodes and CTA labels.
// =============================================================================

import { AppointmentStepDefinition } from './appointmentTypes';

/** The booking flow is a 11-step wizard; only 9 milestones are shown visually. */
export const APPOINTMENT_TOTAL_STEPS = 11;

/**
 * Main milestones of the booking flow. The wizard has 11 internal steps, but
 * only the steps the patient actually goes through are shown, and the active
 * milestone always matches the real step number.
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
  { id: 'confirmation', label: 'Confirmación' },
];

/**
 * Maps every internal wizard step to its milestone: 1 → Especialidad ·
 * 2 → Servicio · 3 → Profesional · 4 → Fecha · 5 → Horario · 6 → Datos ·
 * 7 → Revisión · 8 → Políticas · 9-11 → Confirmación.
 *
 * Header (step X de 11) and stepper both read from here, so they can never
 * contradict each other.
 */
export function resolveStepperIndex(step: number): number {
  if (step <= 1) return 0;
  if (step === 2) return 1;
  if (step === 3) return 2;
  if (step === 4) return 3;
  if (step === 5) return 4;
  if (step === 6) return 5;
  if (step === 7) return 6;
  if (step === 8) return 7;
  return 8;
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

export function resolveNextLabel(step: number, paymentMethod?: 'CLINICA' | 'TARJETA'): string {
  if (step === 1) return 'Continuar';
  if (step === 7) return 'Continuar con las políticas';
  if (step === 8) return 'Continuar con la confirmación';
  if (step === 9) return paymentMethod === 'TARJETA' ? 'Continuar al pago' : 'Confirmar reserva';
  if (step === 10) return 'Finalizar y Descargar';
  return 'Siguiente';
}
