// =============================================================================
// CitasSistema — Shared Types (Specialties, Services, Professionals, Schedules)
// =============================================================================

export interface Specialty {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalService {
  id: string;
  clinicId: string;
  specialtyId?: string;
  specialtyName?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  requiresDeposit: boolean;
  depositAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  clinicId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  consultationFee?: number;
  services?: MedicalService[];
  schedules?: ProfessionalSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalSchedule {
  id: string;
  professionalId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // 'HH:MM:SS' or 'HH:MM'
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  professionalId: string;
  blockDate: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM:SS' or 'HH:MM'
  endTime: string;
  reason?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: string;
}
