// =============================================================================
// CitasSistema — Shared Types (Appointments, Availability, Patients)
// =============================================================================

// ---------------------------------------------------------------------------
// Appointment Status (state machine)
// ---------------------------------------------------------------------------
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// Valid transitions: maps current status → allowed next statuses
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.CHECKED_IN, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
  [AppointmentStatus.CHECKED_IN]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
};

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName?: string;
  professionalId: string;
  professionalName?: string;
  serviceId: string;
  serviceName?: string;
  appointmentDate: string; // 'YYYY-MM-DD'
  startTime: string;       // 'HH:MM:SS' or 'HH:MM'
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  reminderSent: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Appointment Status History
// ---------------------------------------------------------------------------
export interface AppointmentStatusHistoryEntry {
  id: string;
  appointmentId: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  changedBy?: string;
  changedByName?: string;
  reason?: string;
  changedAt: string;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------
export interface AvailabilitySlot {
  startTime: string;  // 'HH:MM'
  endTime: string;    // 'HH:MM'
  professionalId: string;
  serviceId: string;
  date: string;       // 'YYYY-MM-DD'
}

export interface AvailabilityQuery {
  professionalId: string;
  serviceId: string;
  date: string;       // 'YYYY-MM-DD'
}

