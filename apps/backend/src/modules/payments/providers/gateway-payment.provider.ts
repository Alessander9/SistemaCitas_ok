import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IPaymentProvider, PaymentProviderResult } from '../interfaces/payment-provider.interface';
import { CreatePaymentPayload } from '@citassistema/shared-types';

@Injectable()
export class GatewayPaymentProvider implements IPaymentProvider {
  readonly providerName = 'gateway';

  async processPayment(
    _clinicId: string,
    payload: CreatePaymentPayload,
  ): Promise<PaymentProviderResult> {
    const extId = `GW-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      externalTransactionId: extId,
      status: 'completed',
      receiptUrl: `https://citassistema.pe/receipts/${extId}.pdf`,
      rawResponse: {
        authorizationCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
        amount: payload.amount,
        currency: payload.currency || 'PEN',
        gateway: 'mock-gateway',
        timestamp: new Date().toISOString(),
      },
    };
  }

  verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      // Use timingSafeEqual to protect against timing attacks
      const signatureBuffer = Buffer.from(signature, 'utf8');
      const hashBuffer = Buffer.from(computedHash, 'utf8');

      if (signatureBuffer.length !== hashBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(signatureBuffer, hashBuffer);
    } catch {
      return false;
    }
  }
}
