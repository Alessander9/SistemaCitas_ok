export type DoctorQueueStatus = 'waiting' | 'in_progress' | 'completed';
export type DoctorQueueFilter = 'all' | DoctorQueueStatus;
export type EvaTrend = 'down' | 'equal' | 'up';
export type DoctorMainView = 'queue' | 'weekly';

export interface DoctorMedicationItem {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface DoctorQueuePatient {
  id: string;
  time: string;
  patientName: string;
  initials: string;
  age: string;
  dni: string;
  room: string;
  service: string;
  reason: string;
  status: DoctorQueueStatus;
  evaLast: number;
  evaTrend: EvaTrend;
  sessionCurrent: number;
  sessionTotal: number;
  sessionLabel: string;
  treatmentPhase: string;
  appliedTechniques: string[];
  notes: string;
  homeRecommendations: string;
  physicalExam?: string;
  diagnosis?: string;
  emergencyContact?: string;
  meds?: DoctorMedicationItem[];
}

export interface WeeklySlot {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  room: string;
  status: 'occupied' | 'available' | 'blocked';
  patient?: string;
  service?: string;
  note?: string;
}

export interface WeeklyDaySchedule {
  key: string;
  date: string;
  dayName: string;
  dayNum: string;
  isToday?: boolean;
  slots: WeeklySlot[];
}
