export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partial';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'transfer'
  | 'insurance'
  | 'yape'
  | 'plin'
  | 'other';

export interface Payment {
  id: string;
  clinicId: string;
  appointmentId?: string;
  patientId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  description?: string;
  referenceNumber?: string;
  idempotencyKey?: string;
  gatewayProvider?: string;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  externalId?: string;
  gateway: string;
  amount: number;
  status: string;
  rawResponse?: Record<string, unknown>;
  createdAt: string;
}

export interface CreatePaymentPayload {
  appointmentId?: string;
  patientId: string;
  amount: number;
  currency?: string;
  method?: PaymentMethod;
  description?: string;
  referenceNumber?: string;
  idempotencyKey?: string;
  gatewayProvider?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessWebhookPayload {
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  signature?: string;
}
