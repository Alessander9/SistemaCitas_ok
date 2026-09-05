import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ManualPaymentProvider } from './providers/manual-payment.provider';
import { GatewayPaymentProvider } from './providers/gateway-payment.provider';
import { DatabaseService } from '../../database/database.service';
import * as crypto from 'crypto';

describe('PaymentsService (Idempotency & Webhooks Tests)', () => {
  let service: PaymentsService;
  let db: { query: jest.Mock; transaction: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockPatientId = '22222222-2222-2222-2222-222222222222';
  const mockPaymentId = '88888888-8888-8888-8888-888888888888';

  beforeEach(async () => {
    db = {
      query: jest.fn(),
      transaction: jest.fn().mockImplementation((cb) =>
        cb({
          query: db.query,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        ManualPaymentProvider,
        GatewayPaymentProvider,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('create() & Idempotency Guarantee', () => {
    it('should process new payment when idempotency key is fresh', async () => {
      // 1. Idempotency check: not found
      db.query.mockResolvedValueOnce({ rows: [] });
      // 2. Insert payment
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockPaymentId,
            clinic_id: mockClinicId,
            patient_id: mockPatientId,
            amount: '120.00',
            currency: 'PEN',
            status: 'completed',
            method: 'cash',
            idempotency_key: 'key-123',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
      // 3. Insert transaction
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.create(mockClinicId, {
        patientId: mockPatientId,
        amount: 120,
        method: 'cash',
        idempotencyKey: 'key-123',
      });

      expect(result.id).toBe(mockPaymentId);
      expect(result.amount).toBe(120);
      expect(result.status).toBe('completed');
    });

    it('should return existing payment when idempotency key is repeated without reprocessing', async () => {
      // 1. Idempotency check: already exists
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockPaymentId,
            clinic_id: mockClinicId,
            patient_id: mockPatientId,
            amount: '120.00',
            currency: 'PEN',
            status: 'completed',
            method: 'cash',
            idempotency_key: 'key-123',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const result = await service.create(mockClinicId, {
        patientId: mockPatientId,
        amount: 120,
        method: 'cash',
        idempotencyKey: 'key-123',
      });

      // Assert that it returned the existing payment and didn't call transaction
      expect(result.id).toBe(mockPaymentId);
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });

  describe('processWebhook() & HMAC Signature Verification', () => {
    const secret = 'super-secret-webhook-key';
    const payload = { paymentId: mockPaymentId, status: 'completed' };
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    it('should process webhook when HMAC-SHA256 signature is valid', async () => {
      // 1. Event idempotency check: not processed
      db.query.mockResolvedValueOnce({ rows: [] });
      // 2. Insert event
      db.query.mockResolvedValueOnce({ rows: [] });
      // 3. Update payment status
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.processWebhook(
        'gateway',
        {
          eventId: 'evt-1001',
          eventType: 'payment.completed',
          payload,
          signature: validSignature,
        },
        secret,
      );

      expect(result.status).toBe('success');
    });

    it('should throw UnauthorizedException when HMAC signature is invalid or tampered', async () => {
      await expect(
        service.processWebhook(
          'gateway',
          {
            eventId: 'evt-1002',
            eventType: 'payment.completed',
            payload,
            signature: 'invalid-tampered-signature-hex',
          },
          secret,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return already_processed when duplicate webhook event is received', async () => {
      // 1. Event idempotency check: already processed
      db.query.mockResolvedValueOnce({
        rows: [{ id: 'evt-rec-1', is_processed: true }],
      });

      const result = await service.processWebhook(
        'gateway',
        {
          eventId: 'evt-1001',
          eventType: 'payment.completed',
          payload,
          signature: validSignature,
        },
        secret,
      );

      expect(result.status).toBe('already_processed');
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });
});
