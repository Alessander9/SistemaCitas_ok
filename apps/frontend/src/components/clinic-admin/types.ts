export type DirectorViewMode = 'overview' | 'schedule';
export type ClinicAppointmentStatus = 'in_consultation' | 'waiting' | 'confirmed' | 'attended';
export type ClinicScheduleFilter = 'all' | ClinicAppointmentStatus;

export interface ProfessionalStatusItem {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  room: string;
  liveStatus: 'in_consultation' | 'waiting_patient' | 'available';
  bookedSlots: number;
  totalSlots: number;
  revenueToday: number;
}

export interface OperationalAlert {
  id: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  detail: string;
  actionLabel: string;
  targetView: string;
}

export interface ClinicAppointmentItem {
  id: string;
  time: string;
  patient: string;
  dni: string;
  doctor: string;
  specialty: string;
  service: string;
  room: string;
  status: ClinicAppointmentStatus;
  priceAmount: number;
  priceLabel: string;
  paid: boolean;
}
