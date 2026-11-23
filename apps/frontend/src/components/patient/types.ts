export interface PatientUpcomingAppointment {
  id: string;
  title: string;
  durationLabel: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorInitials: string;
  dateLabel: string;
  timeLabel: string;
  countdownLabel: string;
  mode: 'presencial' | 'teleconsulta';
  locationLabel: string;
  status: 'confirmed' | 'pending';
}

export interface PatientPastAppointment {
  id: string;
  day: string;
  month: string;
  fullDate: string;
  title: string;
  doctorName: string;
  summary: string;
}

export interface PatientPrescription {
  id: string;
  code: string;
  medication: string;
  schedule: string;
  instructions: string;
  issuedDate: string;
  validUntil: string;
  doctorName: string;
  isActive: boolean;
}

export interface PatientReceipt {
  id: string;
  number: string;
  concept: string;
  date: string;
  paymentMethod: string;
  amount: string;
}

export interface PatientPainCheckpoint {
  session: string;
  date: string;
  score: number;
  level: 'high' | 'mid' | 'low';
  label: string;
  note: string;
}

export interface PatientTreatmentProgress {
  title: string;
  completedSessions: number;
  totalSessions: number;
  startedDate: string;
  homeTip: string;
  painStart: number;
  painCurrent: number;
  checkpoints: PatientPainCheckpoint[];
}

export interface PatientProfileInfo {
  fullName: string;
  documentNumber: string;
  clinicName: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
}

export interface NewBookingInput {
  serviceId: string;
  serviceTitle: string;
  doctorName: string;
  doctorSpecialty: string;
  durationLabel: string;
  mode: 'presencial' | 'teleconsulta';
  dateLabel: string;
  timeLabel: string;
  paymentMethod: 'clinica' | 'yape' | 'eps';
  priceLabel: string;
}
