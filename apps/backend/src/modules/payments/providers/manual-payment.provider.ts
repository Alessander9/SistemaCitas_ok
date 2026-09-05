import { Injectable } from '@nestjs/common';
import { IPaymentProvider, PaymentProviderResult } from '../interfaces/payment-provider.interface';
import { CreatePaymentPayload } from '@citassistema/shared-types';

@Injectable()
export class ManualPaymentProvider implements IPaymentProvider {
  readonly providerName = 'manual';

  async processPayment(
    _clinicId: string,
    payload: CreatePaymentPayload,
  ): Promise<PaymentProviderResult> {
    return {
      success: true,
      externalTransactionId: payload.referenceNumber || `MANUAL-${Date.now()}`,
      status: 'completed',
      rawResponse: {
        method: payload.method || 'cash',
        processedBy: 'cashier',
        timestamp: new Date().toISOString(),
      },
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}
