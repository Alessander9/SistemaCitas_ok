export interface ClinicalVitals {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
}

export interface MedicalRecord {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  professionalName?: string;
  appointmentId?: string;
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  painScale?: number; // EVA 0-10
  notes?: string;
  vitals?: ClinicalVitals;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordPayload {
  patientId: string;
  professionalId: string;
  appointmentId?: string;
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  painScale?: number;
  notes?: string;
  vitals?: ClinicalVitals;
}

export interface Treatment {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  professionalName?: string;
  name: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  totalSessions: number;
  completedSessions: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentPayload {
  patientId: string;
  professionalId: string;
  name: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  totalSessions: number;
  startDate?: string;
  endDate?: string;
}

export interface TreatmentSession {
  id: string;
  clinicId: string;
  treatmentId: string;
  appointmentId?: string;
  sessionNumber: number;
  sessionDate: string;
  notes?: string;
  evolution?: string;
  nextSessionNotes?: string;
  durationMinutes?: number;
  painScaleBefore?: number; // EVA 0-10
  painScaleAfter?: number; // EVA 0-10
  techniquesApplied?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentSessionPayload {
  treatmentId: string;
  appointmentId?: string;
  sessionDate: string;
  notes?: string;
  evolution?: string;
  nextSessionNotes?: string;
  durationMinutes?: number;
  painScaleBefore?: number;
  painScaleAfter?: number;
  techniquesApplied?: string[];
}

export interface PrescriptionItem {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  professionalName?: string;
  appointmentId?: string;
  medications: PrescriptionItem[];
  instructions?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionPayload {
  patientId: string;
  professionalId: string;
  appointmentId?: string;
  medications: PrescriptionItem[];
  instructions?: string;
  validUntil?: string;
}
