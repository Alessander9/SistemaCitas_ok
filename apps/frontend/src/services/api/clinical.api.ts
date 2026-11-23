import {
  PainPoint,
  SavePainMapPayload,
  PainEvolutionSeries,
} from '@citassistema/shared-types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem('vitalsalud_access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token');
  const clinicId =
    localStorage.getItem('clinic_id') || 'a0000000-0000-4000-a000-000000000001';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-clinic-id': clinicId,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function savePainMap(payload: SavePainMapPayload): Promise<PainPoint[]> {
  try {
    const res = await fetch(`${API_BASE}/clinical/pain-map`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Error al guardar puntos del mapa de dolor en backend:', error);
    throw error;
  }
}

export async function fetchPainMap(
  patientId: string,
  options?: { recordId?: string; sessionId?: string },
): Promise<PainPoint[]> {
  try {
    const params = new URLSearchParams();
    if (options?.recordId) params.append('recordId', options.recordId);
    if (options?.sessionId) params.append('sessionId', options.sessionId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(
      `${API_BASE}/clinical/patients/${encodeURIComponent(patientId)}/pain-map${qs}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Error al obtener mapa de dolor:', error);
    return [];
  }
}

export async function fetchPainEvolution(
  patientId: string,
  structureCode?: string,
): Promise<PainEvolutionSeries[]> {
  try {
    const params = new URLSearchParams();
    if (structureCode) params.append('structureCode', structureCode);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(
      `${API_BASE}/clinical/patients/${encodeURIComponent(patientId)}/pain-map/evolution${qs}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Error al obtener serie de evolución del dolor:', error);
    return [];
  }
}

// -----------------------------------------------------------------------------
// Asistente Clínico de Voz Bidireccional (IA Multi-Proveedor & Altavoz)
// -----------------------------------------------------------------------------

export interface ParsedMedicationItem {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface ParsedClinicalVoiceData {
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExam?: string;
  painScale?: number;
  painBefore?: number;
  painAfter?: number;
  diagnosis?: string;
  treatmentPlan?: string;
  techniques?: string[];
  medications?: ParsedMedicationItem[];
  homeRecommendations?: string;
  notes?: string;
}

export interface MissingFieldInfo {
  field: string;
  label: string;
  spokenPrompt: string;
}

export interface ClinicalAlertItem {
  type: 'allergy' | 'red_flag';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  detail: string;
  spokenWarning: string;
}

export interface SuggestedSupplyItem {
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  currentStock?: number;
}

export interface VoiceAssistantProcessResult {
  parsedData: ParsedClinicalVoiceData;
  missingFields: MissingFieldInfo[];
  isComplete: boolean;
  spokenAlert: string;
  providerUsed: string;
  rawTranscript: string;
  mode?: 'ambient' | 'active';
  wakeWordDetected?: boolean;
  intent?: string;
  shouldSpeak?: boolean;
  clinicalAlerts?: ClinicalAlertItem[];
  silentCie10?: { code: string; displayName: string } | null;
  suggestedSupplies?: SuggestedSupplyItem[];
}

export interface SaveVoiceConsultationDto {
  patientId: string;
  professionalId?: string;
  appointmentId?: string;
  clinicalData: ParsedClinicalVoiceData;
}

export async function processVoiceDictation(
  transcript: string,
  currentData?: Partial<ParsedClinicalVoiceData>,
  options?: {
    mode?: 'ambient' | 'active';
    patientId?: string;
    patientAllergies?: string;
    privacyMode?: boolean;
  },
): Promise<VoiceAssistantProcessResult> {
  const res = await fetch(`${API_BASE}/clinical/voice-assistant/process`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      transcript,
      currentData,
      mode: options?.mode || 'ambient',
      patientId: options?.patientId,
      patientAllergies: options?.patientAllergies,
      privacyMode: options?.privacyMode,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function saveVoiceConsultation(
  dto: SaveVoiceConsultationDto,
): Promise<{ recordId: string; prescriptionId?: string; spokenConfirmation: string }> {
  const res = await fetch(`${API_BASE}/clinical/voice-assistant/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function transcribeVoiceAudio(
  audioBase64: string,
  mimeType = 'audio/webm',
): Promise<{ transcript: string; provider: string }> {
  const res = await fetch(`${API_BASE}/clinical/voice-assistant/transcribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function generatePatientSummary(
  clinicalData: ParsedClinicalVoiceData,
  patientName?: string,
): Promise<{ whatsappMessage: string; portalSummary: string; provider: string }> {
  const res = await fetch(`${API_BASE}/clinical/voice-assistant/patient-summary`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ clinicalData, patientName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchPatientBriefing(
  patientId: string,
  params?: { patientName?: string; allergies?: string; diagnosis?: string; evaLast?: number; sessionLabel?: string },
): Promise<{ lines: string[]; spokenBriefing: string; allergies: string }> {
  const qs = new URLSearchParams();
  if (params?.patientName) qs.set('patientName', params.patientName);
  if (params?.allergies) qs.set('allergies', params.allergies);
  if (params?.diagnosis) qs.set('diagnosis', params.diagnosis);
  if (params?.evaLast !== undefined) qs.set('evaLast', String(params.evaLast));
  if (params?.sessionLabel) qs.set('sessionLabel', params.sessionLabel);

  const res = await fetch(`${API_BASE}/clinical/voice-assistant/briefing/${encodeURIComponent(patientId)}?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function deductConfirmedSupplies(
  supplies: Array<{ productId?: string; name: string; quantity: number }>,
  reference?: string,
): Promise<{ deductedCount: number; details: string[] }> {
  const res = await fetch(`${API_BASE}/clinical/voice-assistant/deduct-supplies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ supplies, reference }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}
