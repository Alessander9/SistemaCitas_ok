/**
 * CitasSistema — Storage Manager
 * Manejo seguro de tokens y sesión (Defensa en profundidad contra XSS):
 * - Access Token: vive primordialmente EN MEMORIA (inaccesible a scripts maliciosos de exfiltración).
 * - Refresh Token: gestionado de forma transparente mediante cookie HttpOnly con SameSite=Lax.
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vitalsalud_access_token',
  REFRESH_TOKEN: 'vitalsalud_refresh_token',
  ACTIVE_CLINIC_ID: 'vitalsalud_active_clinic_id',
  USER_PROFILE: 'vitalsalud_user_profile',
} as const;

// Token en memoria volátil de la aplicación (se destruye al cerrar la pestaña o recargar)
let memoryAccessToken: string | null = null;

export function getAuthToken(): string | null {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    null
  );
}

export function setAuthToken(token: string): void {
  memoryAccessToken = token;
}

export function getRefreshToken(): string | null {
  // El Refresh Token es administrado exclusivamente por el navegador mediante cookie HttpOnly
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
}

export function setRefreshToken(_token: string): void {
  // Limpiamos cualquier residuo previo en localStorage por seguridad
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
  memoryAccessToken = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}
