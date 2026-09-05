import { CreatePaymentPayload } from '@citassistema/shared-types';

export interface PaymentProviderResult {
  success: boolean;
  externalTransactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  rawResponse?: Record<string, unknown>;
  receiptUrl?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  readonly providerName: string;
  processPayment(clinicId: string, payload: CreatePaymentPayload): Promise<PaymentProviderResult>;
  verifyWebhookSignature(payload: string | Record<string, unknown>, signature: string, secret: string): boolean;
}
