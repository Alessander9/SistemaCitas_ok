/**
 * CitasSistema — Storage Manager
 * Fuente única de verdad para el almacenamiento de tokens, sesión y contexto de tenant.
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vitalsalud_access_token',
  REFRESH_TOKEN: 'vitalsalud_refresh_token',
  ACTIVE_CLINIC_ID: 'vitalsalud_active_clinic_id',
  USER_PROFILE: 'vitalsalud_user_profile',
} as const;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    null
  );
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function getActiveClinicId(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(STORAGE_KEYS.ACTIVE_CLINIC_ID) ||
    localStorage.getItem(STORAGE_KEYS.ACTIVE_CLINIC_ID) ||
    localStorage.getItem('clinic_id') ||
    null
  );
}

export function setActiveClinicId(clinicId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, clinicId);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, clinicId);
  localStorage.setItem('clinic_id', clinicId);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}
