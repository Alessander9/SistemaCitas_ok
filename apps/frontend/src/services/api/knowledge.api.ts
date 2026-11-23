import { API_BASE, getAuthHeaders } from './http';
import type { ParsedClinicalVoiceData } from '../api';

export interface ClinicalProtocolItem {
  id?: string;
  pathology: string;
  phase: string;
  specialty?: string;
  recommendedTechniques: string[];
  homeExercises: string;
  durationSessions?: number;
  notes?: string;
}

export interface VademecumCatalogItem {
  id?: string;
  medicationName: string;
  activeIngredient: string;
  drugClass: string;
  defaultDose: string;
  defaultRoute?: string;
  defaultFrequency: string;
  defaultDuration: string;
  contraindications?: string;
  allergyKeywords: string[];
}

export interface VoiceMacroItem {
  id?: string;
  triggerPhrase: string;
  title: string;
  templateData: Partial<ParsedClinicalVoiceData>;
}

export interface ClinicVoiceSettings {
  wakeWord: string;
  wakeAliases: string[];
  defaultMode: 'ambient' | 'active';
  privacyModeDefault: boolean;
}

export interface ClinicalAlertAuditItem {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  detail: string;
  transcriptExcerpt?: string;
  createdAt: string;
}

export interface ClinicalKnowledgeOverview {
  protocols: ClinicalProtocolItem[];
  vademecum: VademecumCatalogItem[];
  macros: VoiceMacroItem[];
  voiceSettings: ClinicVoiceSettings;
  alertsAudit: ClinicalAlertAuditItem[];
}

export async function fetchClinicalKnowledgeOverview(): Promise<ClinicalKnowledgeOverview> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/overview`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function createClinicalProtocol(dto: ClinicalProtocolItem): Promise<ClinicalProtocolItem> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/protocols`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deleteClinicalProtocol(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/protocols/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function createVademecumItem(dto: VademecumCatalogItem): Promise<VademecumCatalogItem> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/vademecum`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deleteVademecumItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/vademecum/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function createVoiceMacro(dto: VoiceMacroItem): Promise<VoiceMacroItem> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/macros`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deleteVoiceMacro(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/macros/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function updateClinicVoiceSettings(
  dto: Partial<ClinicVoiceSettings>,
): Promise<ClinicVoiceSettings> {
  const res = await fetch(`${API_BASE}/clinical/knowledge/voice-settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
