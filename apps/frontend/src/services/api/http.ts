export const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('vitalsalud_access_token') : null;
  const clinicId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('vitalsalud_active_clinic_id') ||
        localStorage.getItem('vitalsalud_active_clinic_id')
      : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(clinicId ? { 'x-clinic-id': clinicId } : {}),
  };
}
