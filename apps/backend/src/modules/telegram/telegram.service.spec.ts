import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { DatabaseService } from '../../database/database.service';
import { TelegramBotProvider } from './providers/telegram-bot.provider';
import { AppointmentStatus } from '@citassistema/shared-types';

describe('TelegramService', () => {
  let service: TelegramService;
  let db: { query: jest.Mock };
  let botProvider: TelegramBotProvider;

  const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';
  const USER_ID = 'u0000000-0000-0000-0000-000000000001';
  const PROFESSIONAL_ID = 'p0000000-0000-0000-0000-000000000001';
  const TELEGRAM_USER_ID = 987654321;

  beforeEach(async () => {
    db = { query: jest.fn() };
    botProvider = new TelegramBotProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        { provide: DatabaseService, useValue: db },
        { provide: TelegramBotProvider, useValue: botProvider },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  // ===========================================================================
  // LINKING CODE GENERATION & REDEMPTION
  // ===========================================================================
  describe('generateLinkingCode & /start redemption', () => {
    it('should generate a 6-digit linking code with expiration', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const res = await service.generateLinkingCode(CLINIC_ID, USER_ID, PROFESSIONAL_ID);

      expect(res.code).toMatch(/^\d{6}$/);
      expect(res.botUsername).toBe('CitasSistemaBot');
      expect(res.deepLink).toContain(`start=${res.code}`);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO telegram_accounts'),
        expect.arrayContaining([CLINIC_ID, USER_ID, PROFESSIONAL_ID]),
      );
    });

    it('should link account on /start with valid code', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'acc-1',
              clinic_id: CLINIC_ID,
              user_id: USER_ID,
              professional_id: PROFESSIONAL_ID,
              linking_code: '123456',
            },
          ],
        }) // lookup linking code
        .mockResolvedValueOnce({ rowCount: 1 }); // update telegram_user_id

      const update = {
        update_id: 1,
        message: {
          message_id: 101,
          from: { id: TELEGRAM_USER_ID, is_bot: false, first_name: 'Dr. Torres', username: 'drtorres' },
          chat: { id: TELEGRAM_USER_ID, type: 'private' },
          text: '/start 123456',
          date: Date.now(),
        },
      };

      const result = await service.processWebhook(update);

      expect(result.action).toBe('account_linked');
      expect(botProvider.sentMessages).toHaveLength(1);
      expect(botProvider.sentMessages[0].text).toContain('¡Cuenta vinculada exitosamente!');
    });

    it('should reject invalid or expired linking code', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // no matching active code

      const update = {
        update_id: 2,
        message: {
          message_id: 102,
          from: { id: TELEGRAM_USER_ID, is_bot: false, first_name: 'Dr. Torres' },
          chat: { id: TELEGRAM_USER_ID, type: 'private' },
          text: '/start 999999',
          date: Date.now(),
        },
      };

      const result = await service.processWebhook(update);

      expect(result.action).toBe('invalid_linking_code');
      expect(botProvider.sentMessages[0].text).toContain('Código de vinculación inválido o expirado');
    });
  });

  // ===========================================================================
  // COMMAND ROUTING (/hoy, /pendientes)
  // ===========================================================================
  describe('Command Routing', () => {
    it('should return appointments for today matching the linked professional (/hoy)', async () => {
      // 1. Linked account lookup
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'acc-1',
              clinic_id: CLINIC_ID,
              professional_id: PROFESSIONAL_ID,
              telegram_user_id: TELEGRAM_USER_ID,
              is_active: true,
            },
          ],
        })
        // 2. Query today's appointments
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'appt-1',
              appointment_date: '2026-09-02',
              start_time: '09:00',
              end_time: '09:30',
              status: AppointmentStatus.CONFIRMED,
              patient_first_name: 'Lucía',
              patient_last_name: 'Ramos',
              service_name: 'Terapia Manual',
            },
          ],
        });

      const update = {
        update_id: 3,
        message: {
          message_id: 103,
          from: { id: TELEGRAM_USER_ID, is_bot: false, first_name: 'Dr. Torres' },
          chat: { id: TELEGRAM_USER_ID, type: 'private' },
          text: '/hoy',
          date: Date.now(),
        },
      };

      const result = await service.processWebhook(update);

      expect(result.action).toBe('appointments_list_sent');
      expect(botProvider.sentMessages).toHaveLength(1);
      expect(botProvider.sentMessages[0].text).toContain('Lucía Ramos');
      expect(botProvider.sentMessages[0].text).toContain('Terapia Manual');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('a.professional_id = $2'),
        [CLINIC_ID, PROFESSIONAL_ID],
      );
    });

    it('should send pending appointments with inline buttons (/pendientes)', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'acc-1',
              clinic_id: CLINIC_ID,
              professional_id: PROFESSIONAL_ID,
              telegram_user_id: TELEGRAM_USER_ID,
              is_active: true,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'appt-pending-1',
              appointment_date: '2026-09-03',
              start_time: '11:00',
              end_time: '11:30',
              status: AppointmentStatus.PENDING,
              patient_first_name: 'Esteban',
              patient_last_name: 'Quito',
              service_name: 'Evaluación Inicial',
            },
          ],
        });

      const update = {
        update_id: 4,
        message: {
          message_id: 104,
          from: { id: TELEGRAM_USER_ID, is_bot: false, first_name: 'Dr. Torres' },
          chat: { id: TELEGRAM_USER_ID, type: 'private' },
          text: '/pendientes',
          date: Date.now(),
        },
      };

      const result = await service.processWebhook(update);

      expect(result.action).toBe('pending_sent_with_buttons');
      expect(botProvider.sentMessages[0].inlineKeyboard).toBeDefined();
      expect(botProvider.sentMessages[0].inlineKeyboard![0][0].callback_data).toBe('accept_appt:appt-pending-1');
      expect(botProvider.sentMessages[0].inlineKeyboard![0][1].callback_data).toBe('reject_appt:appt-pending-1');
    });
  });

  // ===========================================================================
  // INTERACTIVE CALLBACK QUERIES
  // ===========================================================================
  describe('Interactive Callback Queries', () => {
    it('should confirm appointment in database and answer callback on accept_appt', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE appointments

      const update = {
        update_id: 5,
        callback_query: {
          id: 'cb_123',
          from: { id: TELEGRAM_USER_ID, first_name: 'Dr. Torres' },
          message: {
            message_id: 105,
            chat: { id: TELEGRAM_USER_ID },
            text: 'Solicitud de Cita Pendiente',
          },
          data: 'accept_appt:appt-pending-1',
        },
      };

      const result = await service.processWebhook(update);

      expect(result.action).toBe('appointment_confirmed_via_telegram');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE appointments SET status = 'confirmed'"),
        ['appt-pending-1'],
      );
      expect(botProvider.answeredCallbacks).toHaveLength(1);
      expect(botProvider.answeredCallbacks[0].text).toContain('Cita Confirmada');
    });
  });

  // ===========================================================================
  // 9 PM DAILY SUMMARY & NOTIFICATIONS
  // ===========================================================================
  describe('sendDailySummary9PM & notifyAppointmentEvent', () => {
    it('should format and send tomorrow schedule to all linked professionals', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              telegram_user_id: String(TELEGRAM_USER_ID),
              professional_id: PROFESSIONAL_ID,
              clinic_id: CLINIC_ID,
              first_name: 'Alejandro',
            },
          ],
        }) // linked doctors
        .mockResolvedValueOnce({
          rows: [
            {
              start_time: '08:30',
              patient_first_name: 'Valeria',
              patient_last_name: 'Paz',
              service_name: 'Kinesiología',
            },
          ],
        }); // doctor appointments

      const summaryResult = await service.sendDailySummary9PM(CLINIC_ID);

      expect(summaryResult.professionalsNotified).toBe(1);
      expect(botProvider.sentMessages).toHaveLength(1);
      expect(botProvider.sentMessages[0].text).toContain('Resumen de tu agenda para mañana');
      expect(botProvider.sentMessages[0].text).toContain('Valeria Paz');
    });

    it('should push real-time notification on new appointment creation', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            telegram_user_id: String(TELEGRAM_USER_ID),
            patient_name: 'Gonzalo Silva',
            service_name: 'Fisioterapia Deportiva',
            appointment_date: '2026-09-05',
            start_time: '14:00',
          },
        ],
      });

      const sent = await service.notifyAppointmentEvent(CLINIC_ID, 'appt-new-1', 'created');

      expect(sent).toBe(true);
      expect(botProvider.sentMessages).toHaveLength(1);
      expect(botProvider.sentMessages[0].text).toContain('Nueva Cita Agendada');
      expect(botProvider.sentMessages[0].text).toContain('Gonzalo Silva');
    });
  });
});
