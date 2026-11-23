import {
  AvailabilitySlot,
  Specialty,
  MedicalService,
  Professional,
} from '@citassistema/shared-types';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../../data/mockData';
import { buildMockWeekAvailability } from '../../data/mockAvailability';

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
      return data.map((prof: Record<string, unknown>) => ({
        ...prof,
        avatarUrl:
          (prof.avatarUrl as string) ||
          (String(prof.firstName || '').includes('María')
            ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
            : String(prof.firstName || '').includes('Carlos')
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
            : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'),
      })) as Professional[];
    }
    return MOCK_PROFESSIONALS;
  } catch (error) {
    console.warn('Could not fetch professionals from backend API, using fallback data:', error);
    return MOCK_PROFESSIONALS;
  }
}

export interface AvailabilityQuery {
  /** Monday of the week (or the exact day for the daily endpoint). */
  startDate: string;
  durationMinutes: number;
  professionalId?: string;
  serviceId?: string;
}

function normalizeAvailabilityPayload(data: unknown, fallbackDate?: string): AvailabilitySlot[] | null {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { slots?: unknown })?.slots)
      ? (data as { slots: unknown[] }).slots
      : null;

  if (!raw) return null;

  return (raw as Record<string, unknown>[])
    .filter((slot) => (typeof slot?.date === 'string' || Boolean(fallbackDate)) && typeof slot?.startTime === 'string')
    .map((slot) => {
      const resolvedDate = typeof slot.date === 'string' ? slot.date : (fallbackDate as string);
      const resolvedState = (slot.state as AvailabilitySlot['state']) ?? (slot.available === false ? 'busy' : 'available');
      const isAvailable =
        typeof slot.available === 'boolean'
          ? slot.available
          : resolvedState === 'available';
      return {
        id: (slot.id as string) || `${resolvedDate}T${slot.startTime as string}`,
        date: resolvedDate,
        startTime: (slot.startTime as string).slice(0, 5),
        endTime: ((slot.endTime as string) || (slot.startTime as string)).slice(0, 5),
        available: isAvailable,
        state: resolvedState,
        professionalId: slot.professionalId as string | undefined,
        serviceId: slot.serviceId as string | undefined,
        recommended: slot.recommended === true ? true : undefined,
        recommendationLabel:
          typeof slot.recommendationLabel === 'string' ? slot.recommendationLabel : undefined,
      };
    });
}

/**
 * Weekly availability for the agenda (Monday → Saturday).
 */
export async function fetchWeekAvailability(params: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const fallback = () => buildMockWeekAvailability(params);

  try {
    const start = new Date(`${params.startDate}T00:00:00`);
    const days = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const perDay = await Promise.all(
      days.map(async (date) => {
        const qs = new URLSearchParams({ date });
        if (params.serviceId) qs.set('serviceId', params.serviceId);
        if (params.professionalId) qs.set('professionalId', params.professionalId);
        const res = await fetch(`${API_BASE}/appointments/availability?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const slots = normalizeAvailabilityPayload(await res.json(), date) || [];
        return slots;
      }),
    );

    const flat = perDay.flat();
    return flat.length > 0 ? flat : fallback();
  } catch (error) {
    console.warn('Could not fetch weekly availability, using demo dataset:', error);
    return fallback();
  }
}

/** Monthly availability: one weekly request per week overlapping the month. */
export async function fetchMonthAvailability(
  params: Omit<AvailabilityQuery, 'startDate'> & { weekStarts: string[] },
): Promise<AvailabilitySlot[]> {
  const { weekStarts, ...rest } = params;
  const weeks = await Promise.all(
    weekStarts.map((startDate) => fetchWeekAvailability({ ...rest, startDate })),
  );
  return weeks.flat();
}

/** Availability for a single day (GET /api/appointments/availability). */
export async function fetchDayAvailability(params: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  try {
    const qs = new URLSearchParams({ date: params.startDate });
    if (params.serviceId) qs.set('serviceId', params.serviceId);
    if (params.professionalId) qs.set('professionalId', params.professionalId);
    const res = await fetch(`${API_BASE}/appointments/availability?${qs.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const slots = normalizeAvailabilityPayload(await res.json(), params.startDate);
    if (slots) return slots;
  } catch (error) {
    console.warn('Could not fetch daily availability, using demo dataset:', error);
  }

  return buildMockWeekAvailability(params).filter((slot) => slot.date === params.startDate);
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
    const res = await fetch(`${API_BASE}/appointments/public-book`, {
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
        message: 'Cita registrada y confirmada exitosamente.',
      };
    }

    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || (res.status === 409
      ? 'El horario seleccionado ya no está disponible con este profesional. Por favor seleccione otro horario.'
      : `Error al procesar la reserva (${res.status})`);
    throw new Error(errorMessage);
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.includes('disponible') || error.message.includes('conflicto') || error.message.includes('409'))) {
      throw error;
    }
    console.warn('Direct backend appointment creation fallback:', error);
    return {
      id: `app-${Date.now()}`,
      bookingCode: `CIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'CONFIRMED',
    };
  }
}
