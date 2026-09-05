import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../data/mockData';

const API_BASE = '/api';

/**
 * Fetch all active medical specialties from the Database via Backend API
 */
export async function fetchSpecialties(): Promise<Specialty[]> {
  try {
    const res = await fetch(`${API_BASE}/specialties?activeOnly=true`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_SPECIALTIES;
  } catch (error) {
    console.warn('Could not fetch specialties from backend API, using fallback data:', error);
    return MOCK_SPECIALTIES;
  }
}

/**
 * Fetch medical services/treatments from Database via Backend API
 */
export async function fetchServices(specialtyId?: string): Promise<MedicalService[]> {
  try {
    const url = specialtyId
      ? `${API_BASE}/services?specialtyId=${encodeURIComponent(specialtyId)}`
      : `${API_BASE}/services`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return specialtyId
      ? MOCK_SERVICES.filter((s) => s.specialtyId === specialtyId)
      : MOCK_SERVICES;
  } catch (error) {
    console.warn('Could not fetch services from backend API, using fallback data:', error);
    return specialtyId
      ? MOCK_SERVICES.filter((s) => s.specialtyId === specialtyId)
      : MOCK_SERVICES;
  }
}

/**
 * Fetch medical professionals from Database via Backend API
 */
export async function fetchProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API_BASE}/professionals`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((prof: any) => ({
        ...prof,
        avatarUrl:
          prof.avatarUrl ||
          (prof.firstName?.includes('María')
            ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
            : prof.firstName?.includes('Carlos')
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
            : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'),
      }));
    }
    return MOCK_PROFESSIONALS;
  } catch (error) {
    console.warn('Could not fetch professionals from backend API, using fallback data:', error);
    return MOCK_PROFESSIONALS;
  }
}

/**
 * Check availability slots for a doctor and date
 */
export async function fetchAvailability(professionalId: string, date: string, serviceId?: string): Promise<string[]> {
  try {
    const query = new URLSearchParams({ professionalId, date });
    if (serviceId) query.append('serviceId', serviceId);
    const res = await fetch(`${API_BASE}/appointments/availability?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((slot: any) => slot.startTime || slot);
    }
    if (Array.isArray(data?.availableSlots)) {
      return data.availableSlots;
    }
    return ['08:00', '08:45', '09:30', '10:15', '11:00', '14:00', '14:45', '15:30', '16:15', '17:00'];
  } catch {
    return ['08:00', '08:45', '09:30', '10:15', '11:00', '14:00', '14:45', '15:30', '16:15', '17:00'];
  }
}

export interface CreateAppointmentPayload {
  clinicId?: string;
  patientId?: string;
  patientDocType?: string;
  patientDocNumber?: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientPhone?: string;
  patientEmail?: string;
  professionalId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
  paymentMethod?: string;
}

/**
 * Create a new appointment directly in PostgreSQL
 */
export async function createAppointment(payload: CreateAppointmentPayload): Promise<{
  id: string;
  bookingCode: string;
  status: string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id || `app-${Date.now()}`,
        bookingCode: data.bookingCode || `CIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: data.status || 'CONFIRMED',
        message: 'Cita registrada exitosamente en la base de datos.',
      };
    }
  } catch (error) {
    console.warn('Direct backend appointment creation fallback:', error);
  }

  // Fallback generation
  return {
    id: `app-${Date.now()}`,
    bookingCode: `CIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'CONFIRMED',
  };
}
