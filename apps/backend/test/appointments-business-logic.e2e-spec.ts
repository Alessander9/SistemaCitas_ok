import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { ResendEmailProvider } from '../src/modules/emails/providers/resend-email-provider';
import { AppointmentStatus } from '@citassistema/shared-types';

describe('CitasSistema — Super E2E Test Suite (Anti-Colisión, Ciclo de Vida y Roles)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  const DOCTOR_CARLOS_ID = 'e0000000-0000-4000-a000-000000000002'; // Miércoles 09:00 - 18:00
  const DOCTORA_MARIA_ID = 'e0000000-0000-4000-a000-000000000001'; // Lunes a Viernes 08:00 - 18:00
  const SERVICE_30MIN_ID = 'd0000000-0000-4000-a000-000000000003'; // Consulta Traumatológica (30 min)
  const SERVICE_60MIN_ID = 'd0000000-0000-4000-a000-000000000001'; // Evaluación Física (60 min)
  const TEST_WEDNESDAY = '2026-11-25'; // Wednesday

  let adminToken: string;
  let doctorToken: string;
  let recepcionToken: string;
  let pacienteToken: string;

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

    // Clean up test appointments created on TEST_WEDNESDAY and clean history
    await db.query(
      `DELETE FROM appointment_status_history WHERE appointment_id IN (
        SELECT id FROM appointments WHERE appointment_date = $1
      )`,
      [TEST_WEDNESDAY],
    );
    await db.query(`DELETE FROM appointments WHERE appointment_date = $1`, [TEST_WEDNESDAY]);

    // Authenticate all test roles
    const loginRole = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Password123!' });
      return res.body.accessToken as string;
    };

    adminToken = await loginRole('admin@clinica.pe');
    doctorToken = await loginRole('doctor@clinica.pe');
    recepcionToken = await loginRole('recepcion@clinica.pe');
    pacienteToken = await loginRole('paciente@clinica.pe');
  });

  afterAll(async () => {
    // Cleanup created test appointments
    if (db) {
      await db.query(
        `DELETE FROM appointment_status_history WHERE appointment_id IN (
          SELECT id FROM appointments WHERE appointment_date = $1
        )`,
        [TEST_WEDNESDAY],
      );
      await db.query(`DELETE FROM appointments WHERE appointment_date = $1`, [TEST_WEDNESDAY]);
    }
    if (app) {
      await app.close();
    }
  });

  // ===========================================================================
  // 1. MOTOR ANTI-COLISIÓN Y CONTROL DE DISPONIBILIDAD
  // ===========================================================================
  describe('1. Motor Anti-Colisión y Verificación de Doble Agendamiento', () => {
    let appointmentId1: string;

    it('1.1 Debe consultar disponibilidad y verificar que el horario 09:00 está libre', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/appointments/availability')
        .query({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          date: TEST_WEDNESDAY,
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const slot0900 = res.body.find((s: { startTime: string }) => s.startTime === '09:00');
      expect(slot0900).toBeDefined();
      expect(slot0900.endTime).toBe('09:30');
    });

    it('1.2 Paciente A reserva con éxito el horario 09:00 con el Dr. Carlos', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '09:00',
          patientFirstName: 'Roberto',
          patientLastName: 'García',
          patientDocType: 'DNI',
          patientDocNumber: '44556677',
          patientEmail: 'roberto.garcia@test.com',
          patientPhone: '+51 988 111 222',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('bookingCode');
      expect(res.body.bookingCode).toMatch(/^CIT-\d{4}-[A-Z0-9]{4}$/);
      expect(res.body.appointment.startTime).toBe('09:00');
      expect(res.body.appointment.endTime).toBe('09:30');
      expect(res.body.status).toBe(AppointmentStatus.CONFIRMED);

      appointmentId1 = res.body.id;
    });

    it('1.3 La disponibilidad ahora EXCLUYE el horario 09:00 para ese doctor', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/appointments/availability')
        .query({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          date: TEST_WEDNESDAY,
        })
        .expect(200);

      const slot0900 = res.body.find((s: { startTime: string }) => s.startTime === '09:00');
      expect(slot0900).toBeUndefined(); // Ya no está disponible
    });

    it('1.4 Paciente B intenta agendar la MISMA hora (09:00) con el MISMO doctor -> RECHAZADO con 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '09:00',
          patientFirstName: 'Elena',
          patientLastName: 'Pérez',
          patientDocType: 'DNI',
          patientDocNumber: '77889900',
          patientEmail: 'elena.perez@test.com',
        })
        .expect(409);

      expect(res.body.message).toContain(
        'El horario seleccionado ya no está disponible con este profesional',
      );
    });

    it('1.5 Paciente C intenta agendar un servicio que se solapa (09:00 con 60 min) -> RECHAZADO con 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_60MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '09:00',
          patientFirstName: 'Carlos',
          patientLastName: 'Alvarez',
          patientDocType: 'DNI',
          patientDocNumber: '11223344',
          patientEmail: 'carlos.alvarez@test.com',
        })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
    });

    it('1.6 Paciente D agenda a la MISMA hora (09:00) pero con OTRA doctora (Dra. María) -> ACEPTADO (Aislamiento por profesional)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTORA_MARIA_ID,
          serviceId: SERVICE_60MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '09:00',
          patientFirstName: 'Patricia',
          patientLastName: 'Ramos',
          patientDocType: 'DNI',
          patientDocNumber: '99887766',
          patientEmail: 'patricia.ramos@test.com',
        })
        .expect(201);

      expect(res.body.appointment.professionalId).toBe(DOCTORA_MARIA_ID);
      expect(res.body.appointment.startTime).toBe('09:00');
    });

    it('1.7 Si Paciente A cancela su cita, el horario 09:00 vuelve a estar disponible en la agenda', async () => {
      // Recepcionista cancela la cita de Paciente A
      await request(app.getHttpServer())
        .patch(`/api/appointments/${appointmentId1}/cancel`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .send({ reason: 'Paciente solicita reprogramación por viaje' })
        .expect(200);

      // Verificamos que el slot 09:00 reapareció como disponible
      const res = await request(app.getHttpServer())
        .get('/api/appointments/availability')
        .query({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          date: TEST_WEDNESDAY,
        })
        .expect(200);

      const slot0900 = res.body.find((s: { startTime: string }) => s.startTime === '09:00');
      expect(slot0900).toBeDefined(); // Vuelve a estar libre
    });

    it('1.8 Ahora Paciente B puede reservar el horario 09:00 liberado con éxito', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '09:00',
          patientFirstName: 'Elena',
          patientLastName: 'Pérez',
          patientDocType: 'DNI',
          patientDocNumber: '77889900',
          patientEmail: 'elena.perez@test.com',
        })
        .expect(201);

      expect(res.body.status).toBe(AppointmentStatus.CONFIRMED);
      expect(res.body.appointment.startTime).toBe('09:00');
    });
  });

  // ===========================================================================
  // 2. REGLAS DE NEGOCIO DE LÍMITES DE HORARIO Y VALIDACIÓN DE SERVICIOS
  // ===========================================================================
  describe('2. Validación de Límites de Horario y Existencia de Entidades', () => {
    it('2.1 Rechaza solicitud de cita fuera del horario laboral del médico (03:00 am) con 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '03:00',
          patientFirstName: 'Test',
          patientLastName: 'Madrugador',
        })
        .expect(400);

      expect(res.body.message).toContain('fuera de la agenda del profesional');
    });

    it('2.2 Rechaza cita en día donde el médico no atiende (Domingo) con 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: '2026-11-29', // Sunday
          startTime: '10:00',
          patientFirstName: 'Test',
          patientLastName: 'Domingo',
        })
        .expect(400);

      expect(res.body.message).toContain('no tiene horario configurado para este día');
    });

    it('2.3 Rechaza cita con profesional inexistente con 404 Not Found', async () => {
      await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: 'e9999999-9999-4000-a000-999999999999',
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '10:00',
          patientFirstName: 'Test',
          patientLastName: 'Inexistente',
        })
        .expect(404);
    });

    it('2.4 Rechaza cita con servicio médico inexistente con 404 Not Found', async () => {
      await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: 'd9999999-9999-4000-a000-999999999999',
          appointmentDate: TEST_WEDNESDAY,
          startTime: '10:00',
          patientFirstName: 'Test',
          patientLastName: 'ServicioFalso',
        })
        .expect(404);
    });
  });

  // ===========================================================================
  // 3. REAGENDAMIENTO ATÓMICO Y DISCIPLINA DE CONFLICTOS
  // ===========================================================================
  describe('3. Reagendamiento Atómico de Citas', () => {
    let apptAId: string;

    beforeAll(async () => {
      // Creamos Cita A a las 10:00
      const resA = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '10:00',
          patientFirstName: 'Paciente',
          patientLastName: 'Alfa',
          patientDocNumber: '11112222',
        });
      apptAId = resA.body.id;

      // Creamos Cita B a las 10:30
      await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '10:30',
          patientFirstName: 'Paciente',
          patientLastName: 'Beta',
          patientDocNumber: '33334444',
        });
    });

    it('3.1 Si Cita A intenta reagendarse a las 10:30 (ocupada por Cita B) -> RECHAZADO con 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/appointments/${apptAId}/reschedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appointmentDate: TEST_WEDNESDAY,
          startTime: '10:30',
          reason: 'Intento moverme a la hora de Beta',
        })
        .expect(409);

      expect(res.body.message).toContain('entra en conflicto con otra cita existente');
    });

    it('3.2 La Cita A NO debe haber sido cancelada por el intento fallido de reagendamiento', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/appointments/${apptAId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Sigue activa y en su hora original
      expect(res.body.status).toBe(AppointmentStatus.CONFIRMED);
      expect(res.body.startTime).toBe('10:00');
    });

    it('3.3 Si Cita A se reagenda a un horario libre (11:00) -> ÉXITO (Cita A se cancela y se genera la nueva)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/appointments/${apptAId}/reschedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appointmentDate: TEST_WEDNESDAY,
          startTime: '11:00',
          reason: 'Cambio de turno convenido',
        })
        .expect(201);

      expect(res.body.startTime).toBe('11:00');

      // Verificamos que la cita anterior A ahora está cancelada
      const oldAppt = await request(app.getHttpServer())
        .get(`/api/appointments/${apptAId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(oldAppt.body.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  // ===========================================================================
  // 4. CICLO DE VIDA COMPLETO Y CONTROL DE ACCESO POR ROLES (RBAC)
  // ===========================================================================
  describe('4. Flujo de Estados de Citas y Permisos por Rol (RBAC)', () => {
    let flowApptId: string;

    beforeAll(async () => {
      // Creamos cita para el flujo de consulta a las 12:00
      const res = await request(app.getHttpServer())
        .post('/api/appointments/public-book')
        .send({
          professionalId: DOCTOR_CARLOS_ID,
          serviceId: SERVICE_30MIN_ID,
          appointmentDate: TEST_WEDNESDAY,
          startTime: '12:00',
          patientFirstName: 'Esteban',
          patientLastName: 'Díaz',
          patientDocNumber: '55667788',
        });
      flowApptId = res.body.id;
    });

    it('4.1 Recepcionista realiza el Check-in cuando el paciente llega a la clínica', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/check-in`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .expect(200);

      expect(res.body.status).toBe(AppointmentStatus.CHECKED_IN);
    });

    it('4.2 Paciente intenta iniciar la consulta -> RECHAZADO con 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/start`)
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);
    });

    it('4.3 Recepcionista intenta iniciar la consulta médica -> RECHAZADO con 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/start`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .expect(403);
    });

    it('4.4 Doctor inicia la consulta médica -> 200 OK (in_progress)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/start`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.status).toBe(AppointmentStatus.IN_PROGRESS);
    });

    it('4.5 Doctor finaliza la consulta médica -> 200 OK (completed)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.status).toBe(AppointmentStatus.COMPLETED);
    });

    it('4.6 Intento ilegal de cancelar una cita ya COMPLETADA -> RECHAZADO con 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/appointments/${flowApptId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Intento cancelar cita completada' })
        .expect(400);

      expect(res.body.message).toContain('No se puede transicionar de "completed" a "cancelled"');
    });

    it('4.7 Recepcionista intenta eliminar físicamente una cita -> RECHAZADO con 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/api/appointments/${flowApptId}`)
        .set('Authorization', `Bearer ${recepcionToken}`)
        .expect(403);
    });

    it('4.8 Administrador de Clínica realiza Soft-Delete de la cita -> 204 No Content', async () => {
      await request(app.getHttpServer())
        .delete(`/api/appointments/${flowApptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verificamos que ya no se encuentra activa
      await request(app.getHttpServer())
        .get(`/api/appointments/${flowApptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ===========================================================================
  // 5. AISLAMIENTO MULTI-TENANCY ENTRE CLÍNICAS
  // ===========================================================================
  describe('5. Seguridad Multi-Tenancy', () => {
    it('5.1 Bloquea acceso cruzado cuando un usuario intenta consultar datos con cabecera de otra clínica', async () => {
      const foreignClinicId = 'b9999999-9999-9999-9999-999999999999';

      const res = await request(app.getHttpServer())
        .get('/api/appointments')
        .set('Authorization', `Bearer ${recepcionToken}`)
        .set('x-clinic-id', foreignClinicId)
        .expect(403);

      expect(res.body.message).toContain('Acceso inter-clínica denegado');
    });
  });
});
