import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { ResendEmailProvider } from '../src/modules/emails/providers/resend-email-provider';

describe('CitasSistema — E2E Real (Auth/RBAC, Pagos, Kardex, Clínica & Chanfainita)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let adminToken: string;
  let doctorToken: string;
  let recepcionToken: string;
  let pacienteToken: string;

  const createdProductIds: string[] = [];
  const createdPaymentIds: string[] = [];
  const createdProtocolIds: string[] = [];
  const createdVademecumIds: string[] = [];
  const createdMacroIds: string[] = [];
  const createdCashRegisterIds: string[] = [];
  const createdMedicalRecordIds: string[] = [];
  const createdPrescriptionIds: string[] = [];
  const testIdempotencyKey = `e2e-pay-${Date.now()}`;
  const testSku = `E2E-AGUJA-${Date.now()}`;

  let realPatientId: string;
  let otherPatientId: string;
  let pacienteRefreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ResendEmailProvider)
      .useValue({
        send: jest.fn().mockResolvedValue({ success: true, messageId: 'e2e-mock-msg' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    db = moduleFixture.get<DatabaseService>(DatabaseService);

    const loginRole = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Password123!' });
      expect(res.status).toBe(200);
      return res.body.accessToken as string;
    };

    adminToken = await loginRole('admin@clinica.pe');
    doctorToken = await loginRole('doctor@clinica.pe');
    recepcionToken = await loginRole('recepcion@clinica.pe');

    const pacLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'paciente@clinica.pe', password: 'Password123!' });
    expect(pacLogin.status).toBe(200);
    pacienteToken = pacLogin.body.accessToken as string;
    pacienteRefreshToken = pacLogin.body.refreshToken as string;

    const { rows: pRows } = await db.query<{ id: string; email: string | null }>(
      `SELECT id, email FROM patients WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 5`,
    );
    realPatientId = pRows[0].id;
    otherPatientId =
      pRows.find((p) => (p.email || '').toLowerCase() !== 'paciente@clinica.pe')?.id || pRows[0].id;
  });

  afterAll(async () => {
    if (db) {
      for (const id of createdCashRegisterIds) {
        await db.query(`DELETE FROM cash_movements WHERE cash_register_id = $1`, [id]).catch(() => null);
        await db.query(`DELETE FROM cash_registers WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdPrescriptionIds) {
        await db.query(`DELETE FROM prescriptions WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdMedicalRecordIds) {
        await db.query(`DELETE FROM pain_map_points WHERE medical_record_id = $1`, [id]).catch(() => null);
        await db.query(`DELETE FROM medical_records WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdPaymentIds) {
        await db.query(`DELETE FROM payment_transactions WHERE payment_id = $1`, [id]).catch(() => null);
        await db.query(`DELETE FROM payments WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdProductIds) {
        await db.query(`DELETE FROM inventory_movements WHERE product_id = $1`, [id]).catch(() => null);
        await db.query(`DELETE FROM inventory_products WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdProtocolIds) {
        await db.query(`DELETE FROM clinical_protocols WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdVademecumIds) {
        await db.query(`DELETE FROM vademecum_items WHERE id = $1`, [id]).catch(() => null);
      }
      for (const id of createdMacroIds) {
        await db.query(`DELETE FROM clinical_voice_macros WHERE id = $1`, [id]).catch(() => null);
      }
      await db
        .query(`DELETE FROM clinical_alert_audit WHERE transcript_excerpt LIKE '%E2E_CHANFAINITA_AUDIT%'`)
        .catch(() => null);
    }
    if (app) {
      await app.close();
    }
  });

  // ===========================================================================
  // 1. Seguridad HTTP Real: Auth & RBAC en Endpoints Sensibles
  // ===========================================================================
  describe('1. Auth & RBAC HTTP Real', () => {
    it('1.1 Rechaza con 401 sin token en pagos, inventario, emails, voice-assistant/process, guardado clínico y conocimiento IA', async () => {
      await request(app.getHttpServer()).get('/api/payments').expect(401);
      await request(app.getHttpServer()).get('/api/inventory').expect(401);
      await request(app.getHttpServer()).get('/api/emails/templates').expect(401);
      await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/process')
        .send({ transcript: 'Hola' })
        .expect(401);
      await request(app.getHttpServer()).post('/api/clinical/voice-assistant/save').send({}).expect(401);
      await request(app.getHttpServer()).get('/api/clinical/knowledge/overview').expect(401);
    });

    it('1.2 Bloquea con 403 a PACIENTE en rutas administrativas e IDOR horizontal sobre otro paciente', async () => {
      await request(app.getHttpServer())
        .get('/api/payments')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/inventory')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/emails/templates')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/deduct-supplies')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({ supplies: [{ name: 'Agujas', quantity: 1 }] })
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/clinical/knowledge/overview')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);

      // Anti-IDOR: PACIENTE intentando leer ficha/historia de otro paciente -> 403 Forbidden
      await request(app.getHttpServer())
        .get(`/api/patients/${otherPatientId}`)
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get(`/api/clinical/records/patient/${otherPatientId}`)
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);
    });

    it('1.3 Bloquea con 403 a PROFESIONAL intentando mutar protocolos clínicos (solo ADMIN_CLINIC)', async () => {
      await request(app.getHttpServer())
        .post('/api/clinical/knowledge/protocols')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          pathology: 'Intento no autorizado',
          phase: 'Fase 1',
          recommendedTechniques: ['Terapia Manual'],
          homeExercises: 'Reposo',
        })
        .expect(403);
    });
  });

  // ===========================================================================
  // 2. Pagos (Idempotencia SQL) e Inventario / Kardex por Voz
  // ===========================================================================
  describe('2. Pagos con Idempotencia Real y Descuento Atómico de Kardex', () => {
    it('2.1 Crea un pago con idempotencyKey y garantiza que reintentarlo NO duplica el cobro en PostgreSQL', async () => {
      const payload = {
        patientId: realPatientId,
        amount: 120,
        method: 'cash',
        idempotencyKey: testIdempotencyKey,
      };

      const first = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send(payload)
        .expect(201);

      expect(first.body.id).toBeDefined();
      createdPaymentIds.push(first.body.id);

      const second = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send(payload)
        .expect(201);

      expect(second.body.id).toBe(first.body.id);

      const { rows } = await db.query<{ cnt: string }>(
        `SELECT COUNT(*)::text AS cnt FROM payments WHERE idempotency_key = $1`,
        [testIdempotencyKey],
      );
      expect(Number(rows[0].cnt)).toBe(1);
    });

    it('2.2 Crea producto en inventario y descuenta stock real al confirmar insumos desde consulta', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Agujas Punción Seca E2E',
          sku: testSku,
          category: 'Insumos Clínicos',
          unit: 'unidad',
          currentStock: 10,
          minStock: 2,
          costPrice: 1.5,
          sellPrice: 5.0,
        })
        .expect(201);

      const productId = created.body.id as string;
      createdProductIds.push(productId);
      expect(created.body.currentStock).toBe(10);

      const deduct = await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/deduct-supplies')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          supplies: [{ productId, name: 'Agujas Punción Seca E2E', quantity: 2 }],
          reference: 'E2E-CONSULTA-01',
        })
        .expect(200);

      expect(deduct.body.deductedCount).toBe(1);

      // Verificar en PostgreSQL que el stock bajó exactamente de 10 a 8 y quedó movimiento en Kardex
      const after = await request(app.getHttpServer())
        .get(`/api/inventory/${productId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(after.body.currentStock).toBe(8);

      const { rows: movRows } = await db.query<{ quantity: number; reference: string }>(
        `SELECT quantity, reference FROM inventory_movements WHERE product_id = $1 AND reference = 'E2E-CONSULTA-01'`,
        [productId],
      );
      expect(movRows.length).toBe(1);
      expect(Number(movRows[0].quantity)).toBe(2);
    });
  });

  // ===========================================================================
  // 3. Clínica, "Chanfainita" y Panel de Conocimiento Médico (Tablas 016 & 017)
  // ===========================================================================
  describe('3. Motor Bilateral Chanfainita, Auditoría de Alertas y CRUD de Conocimiento', () => {
    it('3.1 Procesa dictado con alergia a Ibuprofeno, responde en lenguaje humano y registra en clinical_alert_audit', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/process')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          transcript: 'Chanfainita, apunta lumbalgia aguda y recetar Ibuprofeno 400mg. E2E_CHANFAINITA_AUDIT',
          mode: 'ambient',
          patientId: realPatientId,
          patientAllergies: 'AINEs (Ibuprofeno)',
        })
        .expect(200);

      expect(res.body.wakeWordDetected).toBe(true);
      expect(res.body.clinicalAlerts.length).toBeGreaterThan(0);
      expect(res.body.clinicalAlerts[0].type).toBe('allergy');
      expect(res.body.spokenAlert).not.toMatch(/M54\.5|CIE-?10/i);

      // Esperar brevemente el insert asíncrono de auditoría y verificar en BD
      await new Promise((r) => setTimeout(r, 150));
      const { rows } = await db.query<{ title: string }>(
        `SELECT title FROM clinical_alert_audit WHERE transcript_excerpt LIKE '%E2E_CHANFAINITA_AUDIT%'`,
      );
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('3.2 Genera briefing de 10s y resumen para paciente sin exponer códigos CIE-10', async () => {
      const briefing = await request(app.getHttpServer())
        .get(`/api/clinical/voice-assistant/briefing/${realPatientId}`)
        .query({ patientName: 'Rosa Morales', diagnosis: 'M54.5 - Lumbalgia mecánica aguda', evaLast: '7' })
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(briefing.body.lines).toHaveLength(3);
      expect(briefing.body.spokenBriefing).not.toMatch(/M54\.5/i);

      const summary = await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/patient-summary')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientName: 'Rosa Morales',
          clinicalData: {
            diagnosis: 'M54.5 - Lumbalgia mecánica aguda',
            techniques: ['Terapia Manual Ortopédica'],
            homeRecommendations: 'Compresas tibias 15 minutos.',
          },
        })
        .expect(200);

      expect(summary.body.whatsappMessage).toContain('Rosa Morales');
      expect(summary.body.whatsappMessage).not.toMatch(/M54\.5|CIE-?10/i);
    });

    it('3.3 ADMIN_CLINIC puede crear/leer/eliminar Protocolos, Vademécum, Macros y guardar Wake-Word en PostgreSQL', async () => {
      const proto = await request(app.getHttpServer())
        .post('/api/clinical/knowledge/protocols')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pathology: 'Tendinitis Rotuliana E2E',
          phase: 'Fase 1 · Control',
          recommendedTechniques: ['Crioterapia'],
          homeExercises: 'Isométricos suaves sin dolor',
          durationSessions: 8,
        })
        .expect(201);
      createdProtocolIds.push(proto.body.id);

      const vad = await request(app.getHttpServer())
        .post('/api/clinical/knowledge/vademecum')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          medicationName: 'Naproxeno 550mg E2E',
          activeIngredient: 'Naproxeno',
          drugClass: 'AINE',
          defaultDose: '1 tableta',
          defaultFrequency: 'Cada 12 horas',
          defaultDuration: 'Por 5 días',
          allergyKeywords: ['naproxeno', 'aine'],
        })
        .expect(201);
      createdVademecumIds.push(vad.body.id);

      const macro = await request(app.getHttpServer())
        .post('/api/clinical/knowledge/macros')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          triggerPhrase: 'control rodilla e2e',
          title: 'Control Rodilla E2E',
          templateData: { anamnesis: 'Evolución favorable de rodilla.' },
        })
        .expect(201);
      createdMacroIds.push(macro.body.id);

      const settings = await request(app.getHttpServer())
        .put('/api/clinical/knowledge/voice-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          wakeWord: 'Chanfainita',
          wakeAliases: ['chanfainita', 'chanfanita', 'chanfaina', 'chanfa'],
          defaultMode: 'ambient',
          privacyModeDefault: false,
        })
        .expect(200);
      expect(settings.body.wakeWord).toBe('Chanfainita');

      const overview = await request(app.getHttpServer())
        .get('/api/clinical/knowledge/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(overview.body.protocols.some((p: { id?: string }) => p.id === proto.body.id)).toBe(true);
      expect(overview.body.vademecum.some((v: { id?: string }) => v.id === vad.body.id)).toBe(true);
      expect(overview.body.macros.some((m: { id?: string }) => m.id === macro.body.id)).toBe(true);

      await request(app.getHttpServer())
        .delete(`/api/clinical/knowledge/protocols/${proto.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('3.4 Persiste consulta MINSA real vía voice-assistant/save + mapa de dolor en PostgreSQL', async () => {
      const saved = await request(app.getHttpServer())
        .post('/api/clinical/voice-assistant/save')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: realPatientId,
          clinicalData: {
            chiefComplaint: 'Lumbalgia aguda E2E',
            anamnesis: 'Dolor lumbar de 3 días de evolución.',
            physicalExam: 'Contractura paravertebral L4-L5.',
            painScale: 7,
            diagnosis: 'M54.5 - Lumbalgia mecánica aguda',
            treatmentPlan: '10 sesiones de fisioterapia.',
            medications: [
              {
                medicationName: 'Paracetamol 500mg',
                dose: '1 tableta',
                route: 'Oral',
                frequency: 'Cada 8 horas',
                duration: 'Por 3 días',
              },
            ],
          },
        })
        .expect(201);

      expect(saved.body.recordId).toBeDefined();
      createdMedicalRecordIds.push(saved.body.recordId);
      if (saved.body.prescriptionId) {
        createdPrescriptionIds.push(saved.body.prescriptionId);
      }

      const painSaved = await request(app.getHttpServer())
        .put('/api/clinical/pain-map')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: realPatientId,
          medicalRecordId: saved.body.recordId,
          points: [
            {
              structureCode: 'COL_LUMBAR',
              regionCode: 'COL_LUMBAR',
              laterality: 'central',
              view: 'posterior',
              coordX: 52,
              coordY: 48,
              eva: 7,
            },
          ],
        })
        .expect(200);

      expect(Array.isArray(painSaved.body)).toBe(true);
      expect(painSaved.body.length).toBe(1);
      expect(painSaved.body[0].eva).toBe(7);
    });
  });

  // ===========================================================================
  // 4. Ciclo Completo de Caja Chica (SQL Real) y Ciclo de Auth (me/refresh/logout)
  // ===========================================================================
  describe('4. Caja Chica (Apertura, Movimientos, Arqueo) y Auth Lifecycle', () => {
    it('4.1 Abre caja, bloquea doble apertura, registra ingreso/egreso y cierra cuadrando arqueo real', async () => {
      // Cerrar cualquier caja abierta hoy para aislar el test
      const today = new Date().toISOString().split('T')[0];
      await db.query(
        `UPDATE cash_registers SET status = 'closed', closed_at = NOW() WHERE session_date = $1 AND status = 'open'`,
        [today],
      );

      const opened = await request(app.getHttpServer())
        .post('/api/cash/open')
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ name: 'Caja E2E Test', openingAmount: 200 })
        .expect(201);

      const registerId = opened.body.id as string;
      createdCashRegisterIds.push(registerId);
      expect(opened.body.status).toBe('open');

      // Bloqueo de doble apertura el mismo día
      await request(app.getHttpServer())
        .post('/api/cash/open')
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ name: 'Caja Duplicada', openingAmount: 100 })
        .expect(400);

      // Ingreso +150 (sale) y Egreso -30 (purchase) => esperado = 200 + 150 - 30 = 320
      await request(app.getHttpServer())
        .post(`/api/cash/${registerId}/movements`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ type: 'sale', amount: 150, description: 'Cobro sesión fisioterapia E2E' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/cash/${registerId}/movements`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ type: 'purchase', amount: 30, description: 'Compra insumos menores E2E' })
        .expect(201);

      const closed = await request(app.getHttpServer())
        .post(`/api/cash/${registerId}/close`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ closingAmount: 320, notes: 'Arqueo cuadrado E2E' })
        .expect(200);

      expect(closed.body.status).toBe('closed');
      expect(closed.body.difference).toBe(0);
    });

    it('4.2 Valida /auth/me, renovación con /auth/refresh y revocación con /auth/logout', async () => {
      const me = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(200);
      expect(me.body.email).toBe('paciente@clinica.pe');

      const refreshed = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: pacienteRefreshToken })
        .expect(200);
      expect(refreshed.body.accessToken).toBeDefined();

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${refreshed.body.accessToken}`)
        .send({ refreshToken: refreshed.body.refreshToken })
        .expect(200);
    });
  });
});
