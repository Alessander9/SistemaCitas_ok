// =============================================================================
// CitasSistema — Review Catalog (data layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Builds the step 7 view-models (booking blocks, payment card and validation)
// from the real booking state that lives in the wizard. Nothing here renders,
// and nothing is invented: every value comes from the selection made in the
// previous steps, so the review screen is always a mirror of the reservation.
// =============================================================================

import {
  BookingReviewModel,
  BookingValidationModel,
  PaymentSummaryModel,
  ProfessionalCardModel,
  ReviewBlockModel,
  SelectedSpecialtySummary,
  ServiceCardModel,
  ValidationItemModel,
} from './appointmentTypes';
import { addMinutesToTime, formatFullDate, formatTimeRange } from './dateUtils';
import { formatPriceLabel } from './serviceCatalog';

/** Patient form state (step 6) as typed by the patient. */
export interface ReviewPatientInput {
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BuildBookingReviewParams {
  specialty: SelectedSpecialtySummary | null;
  service: ServiceCardModel | null;
  /** null when the patient chose the automatic assignment. */
  professional: ProfessionalCardModel | null;
  /** true when the patient picked "cualquier profesional disponible". */
  autoAssignProfessional?: boolean;
  date: string;
  time: string;
  patient: ReviewPatientInput;
  location: string;
  locationAddress?: string;
}

/** Wizard steps that own each block in the 5-step streamlined flow. */
export const REVIEW_EDIT_STEPS = {
  specialty: 1,
  service: 1,
  professional: 1,
  datetime: 2,
  patient: 3,
} as const;

/** Mandatory patient fields; the review flags the block when any is missing. */
export function isPatientComplete(patient: ReviewPatientInput): boolean {
  return Boolean(
    patient.docNumber.trim() &&
      patient.firstName.trim() &&
      patient.lastName.trim() &&
      patient.phone.trim() &&
      patient.email.trim(),
  );
}

export function formatPatientName(patient: ReviewPatientInput): string {
  return `${patient.firstName} ${patient.lastName}`.replace(/\s+/g, ' ').trim();
}

/** End of the appointment = start + real service duration. */
export function resolveTimeRange(time: string, durationMinutes: number): string {
  if (!time) return '';
  return formatTimeRange(time, addMinutesToTime(time, durationMinutes));
}

function buildSpecialtyBlock(
  specialty: SelectedSpecialtySummary | null,
): ReviewBlockModel {
  return {
    id: 'specialty',
    label: 'Especialidad',
    title: specialty?.name ?? 'Por definir',
    description: specialty?.description || undefined,
    specialtyIconKey: specialty?.icon,
    editStep: REVIEW_EDIT_STEPS.specialty,
    editLabel: 'Editar',
    isIncomplete: !specialty,
  };
}

function buildServiceBlock(service: ServiceCardModel | null): ReviewBlockModel {
  return {
    id: 'service',
    label: 'Servicio',
    title: service?.name ?? 'Por definir',
    description: service?.description || undefined,
    meta: service
      ? [`${service.durationMinutes} minutos`, formatPriceLabel(service.price, service.currency)]
      : undefined,
    editStep: REVIEW_EDIT_STEPS.service,
    editLabel: 'Editar',
    isIncomplete: !service,
  };
}

function buildProfessionalBlock(
  professional: ProfessionalCardModel | null,
  autoAssignProfessional: boolean,
): ReviewBlockModel {
  const hasSelection = Boolean(professional) || autoAssignProfessional;
  return {
    id: 'professional',
    label: 'Profesional',
    title: professional?.name ?? (autoAssignProfessional ? 'Primero disponible' : 'Por definir'),
    description: professional?.profession,
    meta: professional?.licenseNumber ? [professional.licenseNumber] : undefined,
    photoUrl: professional?.photoUrl,
    editStep: REVIEW_EDIT_STEPS.professional,
    editLabel: 'Cambiar',
    isIncomplete: !hasSelection,
  };
}

function buildDateTimeBlock(
  date: string,
  time: string,
  durationMinutes: number,
): ReviewBlockModel {
  const timeRange = resolveTimeRange(time, durationMinutes);
  return {
    id: 'datetime',
    label: 'Fecha y hora',
    title: date ? formatFullDate(date) : 'Por definir',
    meta:
      date && timeRange
        ? [timeRange, durationMinutes ? `${durationMinutes} minutos` : ''].filter(Boolean)
        : undefined,
    editStep: REVIEW_EDIT_STEPS.datetime,
    editLabel: 'Cambiar',
    isIncomplete: !date || !time,
  };
}

function buildPatientBlock(patient: ReviewPatientInput): ReviewBlockModel {
  const docLabel = patient.docNumber.trim()
    ? `${patient.docType || 'Documento'}: ${patient.docNumber.trim()}`
    : 'Documento pendiente';

  return {
    id: 'patient',
    label: 'Datos del paciente',
    title: formatPatientName(patient) || 'Por completar',
    meta: [docLabel, patient.phone.trim(), patient.email.trim()].filter(Boolean),
    editStep: REVIEW_EDIT_STEPS.patient,
    editLabel: 'Editar datos',
    isIncomplete: !isPatientComplete(patient),
  };
}

function buildLocationBlock(
  location: string,
  locationAddress?: string,
): ReviewBlockModel {
  return {
    id: 'location',
    label: 'Sede de atención',
    title: location,
    description: locationAddress,
  };
}

function buildReasonBlock(patient: ReviewPatientInput): ReviewBlockModel | null {
  const notes = patient.notes.trim();
  if (!notes) return null;
  return {
    id: 'reason',
    label: 'Motivo de consulta',
    title: notes,
    editStep: REVIEW_EDIT_STEPS.patient,
    editLabel: 'Editar',
  };
}

/** Payment breakdown of the review screen. The total is the service price. */
export function buildPaymentSummary(service: ServiceCardModel | null): PaymentSummaryModel {
  return {
    serviceName: service?.name ?? 'Servicio por definir',
    priceLabel: service ? formatPriceLabel(service.price, service.currency) : '—',
    durationLabel: service ? `${service.durationMinutes} minutos` : '—',
    totalPrefix: service?.currency === 'PEN' || !service ? 'S/' : `${service.currency} `,
    totalValue: service ? service.price.toFixed(2) : '0.00',
    totalCurrency: service?.currency || 'PEN',
    note: 'Podrás elegir el método de pago en el siguiente paso.',
  };
}

/** Steps 7 validation: what still blocks the confirmation. */
export function buildBookingValidation(params: {
  specialty: SelectedSpecialtySummary | null;
  service: ServiceCardModel | null;
  professional: ProfessionalCardModel | null;
  autoAssignProfessional?: boolean;
  date: string;
  time: string;
  patient: ReviewPatientInput;
}): BookingValidationModel {
  const items: ValidationItemModel[] = [
    {
      id: 'specialty',
      label: 'Especialidad y servicio',
      isComplete: Boolean(params.specialty && params.service),
    },
    {
      id: 'professional',
      label: 'Profesional asignado',
      isComplete: Boolean(params.professional) || Boolean(params.autoAssignProfessional),
    },
    {
      id: 'datetime',
      label: 'Fecha y hora',
      isComplete: Boolean(params.date && params.time),
    },
    {
      id: 'patient',
      label: 'Datos del paciente',
      isComplete: isPatientComplete(params.patient),
    },
  ];

  const isReady = items.every((item) => item.isComplete);

  return {
    isReady,
    title: '¿Todo correcto?',
    description: isReady
      ? 'Tu información está lista para continuar.'
      : 'Revisa los datos marcados antes de continuar.',
    items,
  };
}

/** Assembles the whole review screen (blocks + payment + validation). */
export function buildBookingReview(params: BuildBookingReviewParams): BookingReviewModel {
  const {
    specialty,
    service,
    professional,
    autoAssignProfessional = false,
    date,
    time,
    patient,
    location,
    locationAddress,
  } = params;

  const duration = service?.durationMinutes ?? 0;
  const blocks = [
    buildSpecialtyBlock(specialty),
    buildServiceBlock(service),
    buildProfessionalBlock(professional, autoAssignProfessional),
    buildDateTimeBlock(date, time, duration),
    buildPatientBlock(patient),
    buildLocationBlock(location, locationAddress),
    buildReasonBlock(patient),
  ].filter((block): block is ReviewBlockModel => block !== null);

  return {
    blocks,
    payment: buildPaymentSummary(service),
    validation: buildBookingValidation({
      specialty,
      service,
      professional,
      autoAssignProfessional,
      date,
      time,
      patient,
    }),
  };
}
