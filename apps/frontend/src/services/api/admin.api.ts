const API_BASE = '/api';

export interface AdminClinic {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  slug: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  consultingRooms: number;
  activeAppointments: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  monthlyRevenue: string;
  revenueAmount: number;
}

export interface CreateAdminClinicDto {
  name: string;
  slug: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  ruc?: string;
  legalName?: string;
  renipressCode?: string;
  ipressCategory?: string;
  consultingRooms?: number;
}

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem('vitalsalud_access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Obtiene la lista de clínicas registradas desde la base de datos
 */
export async function fetchAdminClinics(): Promise<AdminClinic[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/clinics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Registra una nueva clínica en la base de datos
 */
export async function createAdminClinic(dto: CreateAdminClinicDto): Promise<AdminClinic> {
  const res = await fetch(`${API_BASE}/admin/clinics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al crear clínica (${res.status})`);
  }
  return await res.json();
}

/**
 * Actualiza los datos o configuración IPRESS/RENIPRESS de una clínica existente
 */
export async function updateAdminClinic(
  id: string,
  dto: Partial<CreateAdminClinicDto>,
): Promise<AdminClinic> {
  const res = await fetch(`${API_BASE}/admin/clinics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al actualizar clínica (${res.status})`);
  }
  return await res.json();
}
