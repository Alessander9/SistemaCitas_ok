import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessWebhookDto } from './dto/process-webhook.dto';
import { ManualPaymentProvider } from './providers/manual-payment.provider';
import { GatewayPaymentProvider } from './providers/gateway-payment.provider';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { Payment, PaymentMethod, PaymentStatus } from '@citassistema/shared-types';

interface PaymentDbRow {
  id: string;
  clinic_id: string;
  appointment_id?: string;
  patient_id: string;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  description?: string;
  reference_number?: string;
  idempotency_key?: string;
  gateway_provider?: string;
  receipt_url?: string;
  metadata?: Record<string, unknown>;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, IPaymentProvider> = new Map();

  constructor(
    private readonly db: DatabaseService,
    private readonly manualProvider: ManualPaymentProvider,
    private readonly gatewayProvider: GatewayPaymentProvider,
  ) {
    this.providers.set('manual', this.manualProvider);
    this.providers.set('gateway', this.gatewayProvider);
  }

  private mapRow(row: PaymentDbRow): Payment {
    return {
      id: row.id,
      clinicId: row.clinic_id,
      appointmentId: row.appointment_id,
      patientId: row.patient_id,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      method: row.method,
      description: row.description,
      referenceNumber: row.reference_number,
      idempotencyKey: row.idempotency_key,
      gatewayProvider: row.gateway_provider,
      receiptUrl: row.receipt_url,
      metadata: row.metadata,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(clinicId: string, dto: CreatePaymentDto, userId?: string): Promise<Payment> {
    // 1. Idempotency check: if key is present and already processed, return existing record
    if (dto.idempotencyKey) {
      const { rows: existing } = await this.db.query<PaymentDbRow>(
        `SELECT id, clinic_id, appointment_id, patient_id, amount, currency, status,
                method, description, reference_number, idempotency_key, gateway_provider,
                receipt_url, metadata, processed_at, created_at, updated_at
         FROM payments
         WHERE clinic_id = $1 AND idempotency_key = $2 AND deleted_at IS NULL`,
        [clinicId, dto.idempotencyKey],
      );

      if (existing.length > 0) {
        return this.mapRow(existing[0]);
      }
    }

    // 2. Select payment provider
    const isGateway = dto.method === 'credit_card' || dto.method === 'debit_card' || dto.gatewayProvider === 'gateway';
    const providerName = isGateway ? 'gateway' : 'manual';
    const provider = this.providers.get(providerName) || this.manualProvider;

    // 3. Process with provider
    const result = await provider.processPayment(clinicId, {
      ...dto,
      currency: dto.currency || 'PEN',
    });

    if (!result.success) {
      throw new BadRequestException(result.errorMessage || 'El procesamiento del pago ha fallado.');
    }

    // 4. Save payment in database using transaction
    return this.db.transaction(async (client) => {
      const { rows: paymentRows } = await client.query<PaymentDbRow>(
        `INSERT INTO payments (
          clinic_id, appointment_id, patient_id, amount, currency, status,
          method, description, reference_number, idempotency_key, gateway_provider,
          receipt_url, metadata, processed_at, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14)
         RETURNING id, clinic_id, appointment_id, patient_id, amount, currency, status,
                   method, description, reference_number, idempotency_key, gateway_provider,
                   receipt_url, metadata, processed_at, created_at, updated_at`,
        [
          clinicId,
          dto.appointmentId || null,
          dto.patientId,
          dto.amount,
          dto.currency || 'PEN',
          result.status,
          dto.method || 'cash',
          dto.description || null,
          result.externalTransactionId || dto.referenceNumber || null,
          dto.idempotencyKey || null,
          providerName,
          result.receiptUrl || null,
          JSON.stringify(dto.metadata || {}),
          userId || null,
        ],
      );

      const payment = paymentRows[0];

      // Insert transaction record
      await client.query(
        `INSERT INTO payment_transactions (payment_id, external_id, gateway, amount, status, raw_response)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          payment.id,
          result.externalTransactionId || null,
          providerName,
          dto.amount,
          result.status,
          JSON.stringify(result.rawResponse || {}),
        ],
      );

      return this.mapRow(payment);
    });
  }

  async findOne(clinicId: string, id: string): Promise<Payment> {
    const { rows } = await this.db.query<PaymentDbRow>(
      `SELECT id, clinic_id, appointment_id, patient_id, amount, currency, status,
              method, description, reference_number, idempotency_key, gateway_provider,
              receipt_url, metadata, processed_at, created_at, updated_at
       FROM payments
       WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
      [id, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado.`);
    }

    return this.mapRow(rows[0]);
  }

  async findAll(
    clinicId: string,
    filters?: { patientId?: string; appointmentId?: string; status?: PaymentStatus },
  ): Promise<Payment[]> {
    let query = `
      SELECT id, clinic_id, appointment_id, patient_id, amount, currency, status,
             method, description, reference_number, idempotency_key, gateway_provider,
             receipt_url, metadata, processed_at, created_at, updated_at
      FROM payments
      WHERE clinic_id = $1 AND deleted_at IS NULL
    `;
    const params: unknown[] = [clinicId];
    let idx = 2;

    if (filters?.patientId) {
      query += ` AND patient_id = $${idx++}`;
      params.push(filters.patientId);
    }
    if (filters?.appointmentId) {
      query += ` AND appointment_id = $${idx++}`;
      params.push(filters.appointmentId);
    }
    if (filters?.status) {
      query += ` AND status = $${idx++}`;
      params.push(filters.status);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await this.db.query<PaymentDbRow>(query, params);
    return rows.map((r) => this.mapRow(r));
  }

  async processWebhook(
    providerName: string,
    dto: ProcessWebhookDto,
    webhookSecret?: string,
  ): Promise<{ status: string; message: string }> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new NotFoundException(`Proveedor de pago ${providerName} no soportado.`);
    }

    // 1. Signature Verification
    if (webhookSecret && dto.signature) {
      const isValid = provider.verifyWebhookSignature(dto.payload, dto.signature, webhookSecret);
      if (!isValid) {
        throw new UnauthorizedException('Firma criptográfica de webhook inválida.');
      }
    }

    // 2. Webhook Event Idempotency Check
    const { rows: existingEvent } = await this.db.query<{ id: string; is_processed: boolean }>(
      `SELECT id, is_processed FROM webhook_events WHERE provider = $1 AND event_id = $2`,
      [providerName, dto.eventId],
    );

    if (existingEvent.length > 0 && existingEvent[0].is_processed) {
      return { status: 'already_processed', message: 'Evento de webhook ya procesado previamente.' };
    }

    // 3. Process event & record event log
    await this.db.transaction(async (client) => {
      // Record or update webhook event
      await client.query(
        `INSERT INTO webhook_events (provider, event_id, event_type, payload, signature, is_processed, processed_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         ON CONFLICT (provider, event_id) DO UPDATE 
         SET is_processed = true, processed_at = NOW()`,
        [providerName, dto.eventId, dto.eventType, JSON.stringify(dto.payload), dto.signature || null],
      );

      // If payload has payment reference, update payment status
      const paymentId = (dto.payload['paymentId'] || dto.payload['payment_id']) as string | undefined;
      const newStatus = (dto.payload['status'] as PaymentStatus) || 'completed';

      if (paymentId) {
        await client.query(
          `UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`,
          [newStatus, paymentId],
        );
      }
    });

    return { status: 'success', message: 'Webhook procesado exitosamente.' };
  }
}
