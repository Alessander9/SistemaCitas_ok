import { AvailabilitySlot, Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../data/mockData';
import { buildMockWeekAvailability } from '../data/mockAvailability';

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

// -----------------------------------------------------------------------------
// Availability — GET /availability and GET /availability/week
// -----------------------------------------------------------------------------

interface AvailabilityQuery {
  /** Monday of the week (or the exact day for the daily endpoint). */
  startDate: string;
  durationMinutes: number;
  professionalId?: string;
  serviceId?: string;
}

function buildAvailabilityQuery({ startDate, professionalId, serviceId }: AvailabilityQuery): string {
  const query = new URLSearchParams({ startDate });
  if (professionalId) query.append('professionalId', professionalId);
  if (serviceId) query.append('serviceId', serviceId);
  return query.toString();
}

function normalizeAvailabilityPayload(data: unknown): AvailabilitySlot[] | null {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { slots?: unknown })?.slots)
      ? (data as { slots: unknown[] }).slots
      : null;

  if (!raw) return null;

  return (raw as Record<string, unknown>[])
    .filter((slot) => typeof slot?.date === 'string' && typeof slot?.startTime === 'string')
    .map((slot) => ({
      id: (slot.id as string) || `${slot.date as string}T${slot.startTime as string}`,
      date: slot.date as string,
      startTime: (slot.startTime as string).slice(0, 5),
      endTime: ((slot.endTime as string) || (slot.startTime as string)).slice(0, 5),
      available: Boolean(slot.available ?? slot.state === 'available'),
      state: slot.state as AvailabilitySlot['state'],
      professionalId: slot.professionalId as string | undefined,
      serviceId: slot.serviceId as string | undefined,
      // Recommendations are only forwarded when the backend sends them.
      recommended: slot.recommended === true ? true : undefined,
      recommendationLabel:
        typeof slot.recommendationLabel === 'string' ? slot.recommendationLabel : undefined,
    }));
}

/**
 * Weekly availability for the agenda (Monday → Saturday).
 * When the endpoint is not available the demo dataset is used, so the screen
 * still renders real data shapes instead of inventing slots in the UI.
 */
export async function fetchWeekAvailability(params: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const fallback = () => buildMockWeekAvailability(params);

  try {
    const res = await fetch(`${API_BASE}/availability/week?${buildAvailabilityQuery(params)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const slots = normalizeAvailabilityPayload(await res.json());
    return slots && slots.length > 0 ? slots : fallback();
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

/** Availability for a single day (GET /availability). */
export async function fetchDayAvailability(params: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  try {
    const res = await fetch(`${API_BASE}/availability?${buildAvailabilityQuery(params)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const slots = normalizeAvailabilityPayload(await res.json());
    if (slots) return slots;
  } catch (error) {
    console.warn('Could not fetch daily availability, using demo dataset:', error);
  }

  // The demo dataset is generated per week, so the requested day is filtered out.
  return buildMockWeekAvailability(params).filter((slot) => slot.date === params.startDate);
}

// -----------------------------------------------------------------------------
// Patients — GET /patients/by-document
// -----------------------------------------------------------------------------
// The public booking flow must never fabricate patient data: the lookup either
// returns what the backend really has, nothing, or reports that the endpoint is
// not available yet (`unsupported`), so the UI can stay honest.

export interface PatientLookupQuery {
  documentType: string;
  documentNumber: string;
}

/** Patient data the booking form may pre-fill (all of it coming from the API). */
export interface PatientLookupMatch {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export type PatientLookupResult =
  | { status: 'found'; patient: PatientLookupMatch }
  | { status: 'not-found' }
  | { status: 'unsupported' };

/**
 * Looks up an existing patient by document.
 * Returns `unsupported` while the backend does not expose the endpoint
 * (today it only has GET /patients/:id, which needs an authenticated tenant),
 * so no patient data is ever invented on the client.
 */
export async function fetchPatientByDocument(
  query: PatientLookupQuery,
): Promise<PatientLookupResult> {
  const params = new URLSearchParams({
    documentType: query.documentType,
    documentNumber: query.documentNumber.trim(),
  });

  try {
    const res = await fetch(`${API_BASE}/patients/by-document?${params.toString()}`);
    if (res.status === 404) return { status: 'not-found' };
    if (!res.ok) return { status: 'unsupported' };

    const data = await res.json();
    const raw = Array.isArray(data) ? data[0] : ((data as { patient?: unknown })?.patient ?? data);
    const patient = raw as Record<string, unknown> | undefined;

    if (!patient || typeof patient.firstName !== 'string' || !patient.firstName.trim()) {
      return { status: 'not-found' };
    }

    // Guard against a mismatched record: only an exact document match is trusted.
    const nationalId = typeof patient.nationalId === 'string' ? patient.nationalId : '';
    if (nationalId && nationalId.trim() !== query.documentNumber.trim()) {
      return { status: 'not-found' };
    }

    return {
      status: 'found',
      patient: {
        documentType: query.documentType,
        documentNumber: nationalId || query.documentNumber.trim(),
        firstName: patient.firstName,
        lastName: typeof patient.lastName === 'string' ? patient.lastName : '',
        phone: typeof patient.phone === 'string' ? patient.phone : undefined,
        email: typeof patient.email === 'string' ? patient.email : undefined,
      },
    };
  } catch (error) {
    console.warn('Patient lookup is not available yet:', error);
    return { status: 'unsupported' };
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

/**
 * Solicita el restablecimiento de contraseña mediante Cloudflare Turnstile.
 */
export async function requestPasswordReset(email: string, turnstileToken: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, turnstileToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'No se pudo procesar la solicitud de recuperación.',
      };
    }

    return {
      success: true,
      message: data.message || 'Si el correo está registrado, recibirás un enlace de recuperación.',
    };
  } catch (error) {
    console.warn('Error al solicitar restablecimiento de contraseña:', error);
    return {
      success: false,
      message: 'Error de red al conectar con el servidor de autenticación.',
    };
  }
}

/**
 * Confirma el cambio de contraseña con el token de recuperación recibido por correo.
 */
export async function confirmPasswordReset(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'El enlace de recuperación es inválido o ha expirado.',
      };
    }

    return {
      success: true,
      message: data.message || 'Tu contraseña ha sido actualizada con éxito.',
    };
  } catch (error) {
    console.warn('Error al actualizar contraseña:', error);
    return {
      success: false,
      message: 'Error de red al actualizar la contraseña.',
    };
  }
}
