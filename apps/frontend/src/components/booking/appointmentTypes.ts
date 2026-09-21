// =============================================================================
// CitasSistema — Appointment Booking Flow Types (Step 1: Specialty selection)
// Presentational view-models only: the UI never talks to raw API shapes.
// =============================================================================

/** Visual treatment of a specialty card (kept neutral: no saturated colors). */
export type SpecialtyAccent = 'teal' | 'blue' | 'amber' | 'green';

/** Iconography family resolved from the catalog (never hardcoded in the UI). */
export type SpecialtyIconKey = 'physiotherapy' | 'orthopedics' | 'occupational' | 'nutrition' | 'default';

/**
 * Everything a SpecialtyCard needs to render, already resolved from the API
 * (specialties + professionals + treatments) by the data layer.
 */
export interface SpecialtyCardModel {
  /** Primary key used across the whole flow: GET /specialties/:id/treatments */
  specialtyId: string;
  name: string;
  description: string;
  professionalCount: number;
  /** Ready-to-render label, e.g. "5 médicos" | "3 especialistas". */
  professionalLabel: string;
  treatmentCount: number;
  location: string;
  accent: SpecialtyAccent;
  icon: SpecialtyIconKey;
  imageUrl: string;
  /** Extra search tokens (aliases + treatment names) for the search box. */
  keywords: string[];
}

/**
 * Step 2 view-model: a service/treatment already resolved with its
 * presentation metadata (image, highlight badge) from the catalog.
 */
export interface ServiceCardModel {
  /** Primary key of the service: stored as `selectedServiceId`. */
  serviceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationMinutes: number;
  imageUrl: string;
  isPopular: boolean;
  requiresDeposit: boolean;
  depositAmount: number;
}

/** Toolbar state of the services step. */
export type ServiceFilterOption = 'all' | 'popular' | 'under-100' | 'over-100';
export type ServiceSortOption = 'relevance' | 'price-asc' | 'price-desc';

/** Compact summary of the specialty chosen in step 1, shown as context. */
export interface SelectedSpecialtySummary {
  specialtyId: string;
  name: string;
  description: string;
  icon: SpecialtyIconKey;
  accent: SpecialtyAccent;
  imageUrl: string;
}

/** Sentinel selection meaning "let the system assign the first available". */
export const ANY_AVAILABLE_PROFESSIONAL_ID = 'ANY_AVAILABLE';

/**
 * Step 3 view-model. Only the properties actually returned by the API are
 * populated: `rating`, `reviewCount` and `availability` stay undefined when the
 * backend has no data for them, and the card hides those blocks.
 */
export interface ProfessionalCardModel {
  professionalId: string;
  name: string;
  profession?: string;
  licenseNumber?: string;
  description?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

/** Content of the "any available professional" card (auto-assignment). */
export interface AnyProfessionalOption {
  professionalId: typeof ANY_AVAILABLE_PROFESSIONAL_ID;
  label: string;
  badge: string;
  description: string;
  benefits: string[];
}

/** Availability lifecycle of a single bookable slot. */
export type SlotState = 'available' | 'busy' | 'unavailable';

/** Visual state of a slot once the current selection is taken into account. */
export type SlotVisualState = SlotState | 'selected';

/**
 * One bookable slot as returned by
 * GET /availability and GET /availability/week.
 */
export interface SlotAvailability {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  state: SlotState;
  /**
   * Only set when the backend actually returns a recommendation rule for the
   * slot; never inferred by the UI.
   */
  recommended?: boolean;
  /** Label sent by the backend next to the recommendation badge. */
  recommendationLabel?: string;
}

/** Time-of-day block that organizes the day agenda. Purely organizational. */
export type SlotGroupId = 'morning' | 'afternoon' | 'evening';

/** One block of the day agenda with its published slots. */
export interface SlotGroup {
  id: SlotGroupId;
  label: string;
  /** Range actually covered by the published slots, e.g. "09:00 AM – 12:00 PM". */
  rangeLabel?: string;
  /** Bookable slots inside the block. */
  availableCount: number;
  slots: SlotAvailability[];
}

/** Whole day modelled for the time-selection step (step 5). */
export interface DayAvailability {
  date: string;
  dateLabel: string;
  groups: SlotGroup[];
  availableCount: number;
  totalCount: number;
}

/**
 * Blocks of the final review screen (step 7). Every block maps to the wizard
 * step the patient must return to in order to edit it.
 */
export type ReviewBlockId =
  | 'specialty'
  | 'service'
  | 'professional'
  | 'datetime'
  | 'patient'
  | 'location'
  | 'reason';

/** One reviewable line of the booking (icon + label + value + edit action). */
export interface ReviewBlockModel {
  id: ReviewBlockId;
  label: string;
  /** Main value, e.g. "Fisioterapia y Rehabilitación". */
  title: string;
  description?: string;
  /** Small chips rendered under the title (duration, price, DNI, hour…). */
  meta?: string[];
  /** Real photo when the API provides one (professional avatar). */
  photoUrl?: string;
  /** Only set for the specialty block: same icon resolution as steps 1-2. */
  specialtyIconKey?: SpecialtyIconKey;
  /** Wizard step that owns this data; no action is rendered without it. */
  editStep?: number;
  editLabel?: string;
  /** Marks the block as missing data so the UI can flag it. */
  isIncomplete?: boolean;
}

/** Payment card of the review screen. */
export interface PaymentSummaryModel {
  serviceName: string;
  priceLabel: string;
  durationLabel: string;
  totalPrefix: string;
  totalValue: string;
  totalCurrency: string;
  note: string;
}

/** One validation rule checked before the booking can be confirmed. */
export interface ValidationItemModel {
  id: string;
  label: string;
  isComplete: boolean;
}

/** Result of validating the whole booking right before confirmation. */
export interface BookingValidationModel {
  isReady: boolean;
  title: string;
  description: string;
  items: ValidationItemModel[];
}

/** Everything the review screen (step 7) renders, resolved by the data layer. */
export interface BookingReviewModel {
  blocks: ReviewBlockModel[];
  payment: PaymentSummaryModel;
  validation: BookingValidationModel;
}

/** One cell of the month calendar. */
export interface CalendarDay {
  date: string;
  dayNumber: string;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  availableCount: number;
}

/** One column (Monday → Saturday) of the weekly agenda. */
export interface AgendaDay {
  date: string;
  weekdayShort: string;
  dayNumber: string;
  monthShort: string;
  dateLabel: string;
  isToday: boolean;
  isSelected: boolean;
  availableCount: number;
  slots: SlotAvailability[];
}

/** Whole week view modelled for the agenda grid. */
export interface WeekAvailability {
  weekStart: string;
  weekEnd: string;
  rangeLabel: string;
  rangeStart: string;
  rangeEnd: string;
  rowMinutes: number;
  timeTicks: string[];
  days: AgendaDay[];
  availableCount: number;
}

/** Legend entry rendered under the calendars. */
export interface CalendarLegendItem {
  state: string;
  label: string;
}

/** One node of the visual stepper shown above the step content. */
export interface AppointmentStepDefinition {
  id: string;
  label: string;
}

export type AppointmentStepState = 'done' | 'active' | 'upcoming';

// =============================================================================
// Step 8 — Políticas y Consentimiento
// =============================================================================

/**
 * State of both required consent checkboxes. Includes optional versioning so
 * the backend can record exactly which policy revision was accepted.
 */
export interface ConsentState {
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
  /** Identifies the policy document version the patient agreed to, e.g. "2026-01". */
  cancellationPolicyVersion?: string;
  privacyPolicyVersion?: string;
  /** ISO-8601 timestamp captured in the browser when the patient checks the box. */
  acceptedAt?: string;
}

/** Props passed to POST /appointments/:id/consents when submitting the booking. */
export interface ConsentPayload {
  cancellationPolicyVersion: string;
  privacyPolicyVersion: string;
  acceptedAt: string;
}

// =============================================================================
// Step 9 & 10 — Métodos de Pago y Checkout / Confirmación
// =============================================================================

export type PaymentTiming = 'ONLINE' | 'AT_CLINIC';

export type OnlinePaymentMethodId = 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER';

export type PaymentLifecycleStatus =
  | 'IDLE'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface CardPaymentFormValues {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  saveCard: boolean;
}

export interface YapePaymentFormValues {
  phoneNumber: string;
  approvalCode: string;
}

export interface PlinPaymentFormValues {
  phoneNumber: string;
  otpCode: string;
}

export interface TransferPaymentFormValues {
  bankName: string;
  operationNumber: string;
}

