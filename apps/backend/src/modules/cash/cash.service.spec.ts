import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CashService } from './cash.service';
import { DatabaseService } from '../../database/database.service';

describe('CashService', () => {
  let service: CashService;
  let db: { query: jest.Mock; transaction: jest.Mock };

  const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';
  const USER_ID = 'f0000000-0000-0000-0000-000000000001';
  const REGISTER_ID = 'b0000000-0000-0000-0000-000000000001';

  const openRegisterRow = (overrides: Record<string, unknown> = {}) => ({
    id: REGISTER_ID,
    clinic_id: CLINIC_ID,
    name: 'Caja 2026-09-02',
    status: 'open',
    opening_amount: '100.00',
    closing_amount: null,
    difference: null,
    session_date: '2026-09-02',
    notes: null,
    opened_at: new Date().toISOString(),
    closed_at: null,
    opened_by: USER_ID,
    opened_by_name: 'Ana López',
    closed_by: null,
    closed_by_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    db = { query: jest.fn(), transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<CashService>(CashService);
  });

  // ===========================================================================
  // OPEN CASH REGISTER
  // ===========================================================================

  describe('openCashRegister', () => {
    it('should throw BadRequestException if a register is already open today', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing-register' }] });

      await expect(
        service.openCashRegister(CLINIC_ID, { openingAmount: 100 }, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new cash register when none is open today', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // no existing open register
        .mockResolvedValueOnce({ rows: [openRegisterRow()] }); // insert result

      const result = await service.openCashRegister(
        CLINIC_ID,
        { openingAmount: 100, name: 'Caja Mañana' },
        USER_ID,
      );

      expect(result.status).toBe('open');
      expect(result.openingAmount).toBe(100);
      expect(result.clinicId).toBe(CLINIC_ID);
    });
  });

  // ===========================================================================
  // CLOSE CASH REGISTER
  // ===========================================================================

  describe('closeCashRegister', () => {
    it('should throw NotFoundException when register does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // findRegisterOrThrow

      await expect(
        service.closeCashRegister(CLINIC_ID, REGISTER_ID, { closingAmount: 200 }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if register is already closed', async () => {
      db.query.mockResolvedValueOnce({ rows: [openRegisterRow({ status: 'closed' })] });

      await expect(
        service.closeCashRegister(CLINIC_ID, REGISTER_ID, { closingAmount: 200 }, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate difference correctly (positive surplus)', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [openRegisterRow()] }) // findRegisterOrThrow
        .mockResolvedValueOnce({ rows: [{ type: 'sale', total: '50.00' }] }) // movements aggregate
        .mockResolvedValueOnce({ rows: [openRegisterRow({ status: 'closed', closing_amount: '165.00', difference: '15.00' })] }); // UPDATE

      const result = await service.closeCashRegister(
        CLINIC_ID,
        REGISTER_ID,
        { closingAmount: 165 }, // expected = 100 + 50 = 150, so diff = +15
        USER_ID,
      );

      expect(result.status).toBe('closed');
      expect(result.closingAmount).toBe(165);
      expect(result.difference).toBe(15);
    });

    it('should calculate difference correctly (negative deficit)', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [openRegisterRow()] })
        .mockResolvedValueOnce({ rows: [] }) // no movements
        .mockResolvedValueOnce({ rows: [openRegisterRow({ status: 'closed', closing_amount: '80.00', difference: '-20.00' })] });

      const result = await service.closeCashRegister(
        CLINIC_ID,
        REGISTER_ID,
        { closingAmount: 80 }, // expected = 100, diff = -20
        USER_ID,
      );

      expect(result.difference).toBe(-20);
    });
  });

  // ===========================================================================
  // ADD MOVEMENT
  // ===========================================================================

  describe('addMovement', () => {
    it('should throw BadRequestException when adding movement to a closed register', async () => {
      db.query.mockResolvedValueOnce({ rows: [openRegisterRow({ status: 'closed' })] });

      await expect(
        service.addMovement(
          CLINIC_ID,
          REGISTER_ID,
          { type: 'sale', amount: 50, description: 'Pago cita' },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record a movement and return it when register is open', async () => {
      const movRow = {
        id: 'mov-1',
        clinic_id: CLINIC_ID,
        cash_register_id: REGISTER_ID,
        cash_session_id: REGISTER_ID,
        payment_id: null,
        type: 'sale',
        amount: '50.00',
        description: 'Pago cita',
        reference: null,
        created_by: USER_ID,
        created_by_name: null,
        created_at: new Date().toISOString(),
      };

      db.query
        .mockResolvedValueOnce({ rows: [openRegisterRow()] }) // findRegisterOrThrow
        .mockResolvedValueOnce({ rows: [movRow] }); // INSERT

      const result = await service.addMovement(
        CLINIC_ID,
        REGISTER_ID,
        { type: 'sale', amount: 50, description: 'Pago cita' },
        USER_ID,
      );

      expect(result.type).toBe('sale');
      expect(result.amount).toBe(50);
    });
  });

  // ===========================================================================
  // GET TODAY SUMMARY
  // ===========================================================================

  describe('getTodaySummary', () => {
    it('should return null when no register exists for today', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.getTodaySummary(CLINIC_ID);
      expect(result).toBeNull();
    });

    it('should compute totalIncome from sale movements', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [openRegisterRow()] }) // cash register
        .mockResolvedValueOnce({
          rows: [
            { id: 'm1', clinic_id: CLINIC_ID, cash_register_id: REGISTER_ID, cash_session_id: REGISTER_ID, type: 'sale', amount: '75.00', description: 'Consulta', reference: null, created_by: USER_ID, created_by_name: null, created_at: new Date().toISOString() },
            { id: 'm2', clinic_id: CLINIC_ID, cash_register_id: REGISTER_ID, cash_session_id: REGISTER_ID, type: 'purchase', amount: '25.00', description: 'Gasóleos', reference: null, created_by: USER_ID, created_by_name: null, created_at: new Date().toISOString() },
          ],
        }); // movements

      const result = await service.getTodaySummary(CLINIC_ID);

      expect(result).not.toBeNull();
      expect(result!.totalIncome).toBe(75);
      expect(result!.totalExpense).toBe(25);
      expect(result!.balance).toBe(150); // 100 opening + 75 income - 25 expense
    });
  });
});
