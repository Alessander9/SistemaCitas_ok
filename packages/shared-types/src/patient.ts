export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalNotes?: string;
  avatarUrl?: string;
  isActive: boolean;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientHistory {
  patient: Patient;
  appointments: {
    id: string;
    serviceName: string;
    professionalName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    notes?: string;
  }[];
  prescriptions: {
    id: string;
    professionalName: string;
    diagnosis?: string;
    notes?: string;
    issuedAt: string;
  }[];
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method?: string;
    createdAt: string;
  }[];
}
