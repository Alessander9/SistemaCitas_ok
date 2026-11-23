const API_BASE = '/api';

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
