// =============================================================================
// CitasSistema — Shared Types: AI Assistant & Web Widget
// =============================================================================

export type AiActionType = 'book_service' | 'escalate_whatsapp' | 'call_phone' | 'view_faq';

export interface AiSuggestedAction {
  label: string;
  actionType: AiActionType;
  payload?: {
    specialtyId?: string;
    serviceId?: string;
    serviceName?: string;
    phone?: string;
    url?: string;
  };
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestedActions?: AiSuggestedAction[];
  createdAt: string;
}

export interface AiChatQuery {
  message: string;
  clinicId?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AiChatResponse {
  reply: string;
  suggestedActions?: AiSuggestedAction[];
  intent?: 'medical_inquiry' | 'pricing' | 'booking' | 'faq' | 'escalation' | 'general';
}

export interface ClinicKnowledgeSnapshot {
  clinicName: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  specialties: Array<{ id: string; name: string }>;
  services: Array<{
    id: string;
    specialtyId: string;
    specialtyName: string;
    name: string;
    durationMinutes: number;
    price: number;
    currency: string;
  }>;
  professionals: Array<{
    id: string;
    name: string;
    specialtyName: string;
  }>;
}
