import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import {
  CashRegister,
  CashMovement,
  CashSummary,
} from '@citassistema/shared-types';

// ---------------------------------------------------------------------------
// DB row interfaces
// ---------------------------------------------------------------------------

interface CashRegisterDbRow {
  id: string;
  clinic_id: string;
  name: string;
  status: string;
  opening_amount: string;
  closing_amount?: string;
  difference?: string;
  session_date?: string;
  notes?: string;
  opened_at?: string;
  closed_at?: string;
  opened_by?: string;
  opened_by_name?: string;
  closed_by?: string;
  closed_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface CashMovementDbRow {
  id: string;
  clinic_id: string;
  cash_register_id: string;
  cash_session_id?: string;
  payment_id?: string;
  type: string;
  amount: string;
  description: string;
  reference?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class CashService {
  constructor(private readonly db: DatabaseService) {}

  // =========================================================================
  // Mappers
  // =========================================================================

  private mapRegisterRow(r: CashRegisterDbRow): CashRegister {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      name: r.name,
      status: r.status as 'open' | 'closed',
      openingAmount: parseFloat(r.opening_amount),
      closingAmount: r.closing_amount != null ? parseFloat(r.closing_amount) : undefined,
      difference: r.difference != null ? parseFloat(r.difference) : undefined,
      sessionDate: r.session_date ? String(r.session_date).split('T')[0] : undefined,
      notes: r.notes ?? undefined,
      openedAt: r.opened_at ?? undefined,
      closedAt: r.closed_at ?? undefined,
      openedBy: r.opened_by ?? undefined,
      openedByName: r.opened_by_name ?? undefined,
      closedBy: r.closed_by ?? undefined,
      closedByName: r.closed_by_name ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  private mapMovementRow(r: CashMovementDbRow): CashMovement {
    return {
      id: r.id,
      clinicId: r.clinic_id,
      cashRegisterId: r.cash_register_id,
      cashSessionId: r.cash_session_id ?? undefined,
      paymentId: r.payment_id ?? undefined,
      type: r.type as CashMovement['type'],
      amount: parseFloat(r.amount),
      description: r.description,
      reference: r.reference ?? undefined,
      createdBy: r.created_by,
      createdByName: r.created_by_name ?? undefined,
      createdAt: r.created_at,
    };
  }

  // =========================================================================
  // 9.1.1 — Apertura de caja
  // =========================================================================

  async openCashRegister(
    clinicId: string,
    dto: OpenCashRegisterDto,
    userId: string,
  ): Promise<CashRegister> {
    const today = new Date().toISOString().split('T')[0];

    // Verify no register is already open today for this clinic
    const { rows: existing } = await this.db.query<{ id: string }>(
      `SELECT id FROM cash_registers
       WHERE clinic_id = $1 AND session_date = $2 AND status = 'open' AND is_active = true`,
      [clinicId, today],
    );

    if (existing.length > 0) {
      throw new BadRequestException(
        'Ya existe una caja abierta para el día de hoy. Ciérrela antes de abrir una nueva.',
      );
    }

    const name = dto.name ?? `Caja ${today}`;

    const { rows } = await this.db.query<CashRegisterDbRow>(
      `INSERT INTO cash_registers (
         clinic_id, name, status, opening_amount, session_date,
         opened_at, opened_by, notes, is_active
       ) VALUES ($1, $2, 'open', $3, $4, NOW(), $5, $6, true)
       RETURNING *`,
      [clinicId, name, dto.openingAmount, today, userId, dto.notes ?? null],
    );

    return this.mapRegisterRow(rows[0]);
  }

  // =========================================================================
  // 9.1.2 — Cierre de caja con arqueo
  // =========================================================================

  async closeCashRegister(
    clinicId: string,
    registerId: string,
    dto: CloseCashRegisterDto,
    userId: string,
  ): Promise<CashRegister> {
    const register = await this.findRegisterOrThrow(clinicId, registerId);

    if (register.status !== 'open') {
      throw new BadRequestException('La caja ya está cerrada.');
    }

    // Calculate expected balance: opening + incomes - expenses
    const { rows: movRows } = await this.db.query<{ type: string; total: string }>(
      `SELECT type, SUM(amount) AS total
       FROM cash_movements
       WHERE cash_session_id = $1
       GROUP BY type`,
      [registerId],
    );

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of movRows) {
      const amount = parseFloat(row.total);
      if (row.type === 'sale' || row.type === 'return') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    }

    const expectedBalance = register.openingAmount + totalIncome - totalExpense;
    const difference = dto.closingAmount - expectedBalance;

    const { rows } = await this.db.query<CashRegisterDbRow>(
      `UPDATE cash_registers
       SET status = 'closed',
           closing_amount = $3,
           difference = $4,
           closed_at = NOW(),
           closed_by = $5,
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $1 AND clinic_id = $2
       RETURNING *`,
      [registerId, clinicId, dto.closingAmount, difference, userId, dto.notes ?? null],
    );

    return this.mapRegisterRow(rows[0]);
  }

  // =========================================================================
  // 9.1.3 — Registrar movimiento de caja
  // =========================================================================

  async addMovement(
    clinicId: string,
    registerId: string,
    dto: CreateCashMovementDto,
    userId: string,
  ): Promise<CashMovement> {
    const register = await this.findRegisterOrThrow(clinicId, registerId);

    if (register.status !== 'open') {
      throw new BadRequestException(
        'No se puede registrar movimientos en una caja cerrada.',
      );
    }

    const { rows } = await this.db.query<CashMovementDbRow>(
      `INSERT INTO cash_movements (
         clinic_id, cash_register_id, cash_session_id,
         payment_id, type, amount, description, reference, created_by
       ) VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        clinicId,
        registerId,
        dto.paymentId ?? null,
        dto.type,
        dto.amount,
        dto.description,
        dto.reference ?? null,
        userId,
      ],
    );

    return this.mapMovementRow(rows[0]);
  }

  // =========================================================================
  // 9.1.4 — Resumen del día
  // =========================================================================

  async getTodaySummary(clinicId: string): Promise<CashSummary | null> {
    const today = new Date().toISOString().split('T')[0];

    const { rows: regRows } = await this.db.query<CashRegisterDbRow>(
      `SELECT cr.*,
              uo.first_name || ' ' || uo.last_name AS opened_by_name,
              uc.first_name || ' ' || uc.last_name AS closed_by_name
       FROM cash_registers cr
       LEFT JOIN users uo ON uo.id = cr.opened_by
       LEFT JOIN users uc ON uc.id = cr.closed_by
       WHERE cr.clinic_id = $1 AND cr.session_date = $2
       ORDER BY cr.opened_at DESC
       LIMIT 1`,
      [clinicId, today],
    );

    if (regRows.length === 0) return null;

    const register = this.mapRegisterRow(regRows[0]);

    const { rows: movRows } = await this.db.query<CashMovementDbRow>(
      `SELECT cm.*,
              u.first_name || ' ' || u.last_name AS created_by_name
       FROM cash_movements cm
       LEFT JOIN users u ON u.id = cm.created_by
       WHERE cm.cash_session_id = $1
       ORDER BY cm.created_at ASC`,
      [register.id],
    );

    const movements = movRows.map((r) => this.mapMovementRow(r));

    let totalIncome = 0;
    let totalExpense = 0;
    for (const m of movements) {
      if (m.type === 'sale' || m.type === 'return') {
        totalIncome += m.amount;
      } else {
        totalExpense += m.amount;
      }
    }

    const expectedBalance = register.openingAmount + totalIncome - totalExpense;

    return {
      register,
      totalIncome,
      totalExpense,
      balance: expectedBalance,
      expectedBalance,
      movements,
    };
  }

  // =========================================================================
  // 9.1.5 — Historial de sesiones de caja
  // =========================================================================

  async getHistory(
    clinicId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<CashRegister[]> {
    const conditions = ['cr.clinic_id = $1'];
    const params: unknown[] = [clinicId];
    let paramIndex = 2;

    if (dateFrom) {
      conditions.push(`cr.session_date >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`cr.session_date <= $${paramIndex++}`);
      params.push(dateTo);
    }

    const { rows } = await this.db.query<CashRegisterDbRow>(
      `SELECT cr.*,
              uo.first_name || ' ' || uo.last_name AS opened_by_name,
              uc.first_name || ' ' || uc.last_name AS closed_by_name
       FROM cash_registers cr
       LEFT JOIN users uo ON uo.id = cr.opened_by
       LEFT JOIN users uc ON uc.id = cr.closed_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY cr.session_date DESC, cr.opened_at DESC`,
      params,
    );

    return rows.map((r) => this.mapRegisterRow(r));
  }

  // =========================================================================
  // Helper
  // =========================================================================

  private async findRegisterOrThrow(clinicId: string, registerId: string): Promise<CashRegister> {
    const { rows } = await this.db.query<CashRegisterDbRow>(
      `SELECT * FROM cash_registers WHERE id = $1 AND clinic_id = $2`,
      [registerId, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Caja no encontrada');
    }

    return this.mapRegisterRow(rows[0]);
  }
}
