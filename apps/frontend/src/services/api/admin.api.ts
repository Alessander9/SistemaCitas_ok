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
  logoUrl?: string;
  specialtyPreset?: string;
  landingStyle?: string;
  brandColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  loginTagline?: string;
  whatsappNumber?: string;
  aiAssistantName?: string;
  enableSelfBooking?: boolean;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  adminsCount?: number;
  consultingRooms: number;
  activeAppointments: number;
  monthAppointments?: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  isActive?: boolean;
  monthlyRevenue: string;
  revenueAmount: number;
}

export interface AdminOverview {
  totalClinics: number;
  activeClinics: number;
  suspendedClinics: number;
  totalDoctors: number;
  totalUsers: number;
  todayAppointments: number;
  monthAppointments: number;
  monthRevenue: number;
  health: {
    database: 'ok' | 'degraded';
    latencyMs: number;
    emailProvider: 'brevo' | 'resend' | 'mock';
    emailsLast24h: {
      total: number;
      sent: number;
      failed: number;
    };
  };
}

export interface AdminUser {
  id: string;
  clinicId: string;
  clinicName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateAdminUserDto {
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'ADMIN_CLINIC' | 'RECEPCION' | 'SUPER_ADMIN';
}

export interface AdminClinicFinance {
  clinicId: string;
  clinicName: string;
  slug: string;
  city: string;
  isActive: boolean;
  monthAppointments: number;
  totalRevenue: number;
  cardRevenue: number;
  digitalWalletRevenue: number;
  cashRevenue: number;
  otherRevenue: number;
}

export interface AdminAuditEvent {
  id: string;
  source: 'audit' | 'email';
  createdAt: string;
  actor: string;
  action: string;
  resource: string;
  clinicName: string;
  ipAddress: string;
  status: 'ok' | 'error';
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
  logoUrl?: string;
  specialtyPreset?: string;
  landingStyle?: string;
  brandColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  loginTagline?: string;
  whatsappNumber?: string;
  aiAssistantName?: string;
  enableSelfBooking?: boolean;
  initialAdmin?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  };
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('vitalsalud_access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token')
      : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAdminOverview(): Promise<AdminOverview | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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

export async function toggleAdminClinicStatus(
  id: string,
  isActive: boolean,
): Promise<AdminClinic> {
  const res = await fetch(`${API_BASE}/admin/clinics/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al cambiar estado (${res.status})`);
  }
  return await res.json();
}

export async function fetchAdminNetworkFinance(): Promise<AdminClinicFinance[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/finance`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createAdminUser(dto: CreateAdminUserDto): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al crear usuario (${res.status})`);
  }
  return await res.json();
}

export async function toggleAdminUserStatus(
  id: string,
  isActive: boolean,
): Promise<{ id: string; isActive: boolean }> {
  const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al actualizar usuario (${res.status})`);
  }
  return await res.json();
}

export async function fetchAdminAuditFeed(limit = 40): Promise<AdminAuditEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/audit?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
