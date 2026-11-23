import { getAuthToken, getActiveClinicId } from '../../utils/storage';

export const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const clinicId = getActiveClinicId();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(clinicId ? { 'x-clinic-id': clinicId } : {}),
  };
}

