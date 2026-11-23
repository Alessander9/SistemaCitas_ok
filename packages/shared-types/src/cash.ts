// =============================================================================
// CitasSistema — Shared Types: Caja Chica (Cash Register)
// =============================================================================

// ---------------------------------------------------------------------------
// Enums & Status
// ---------------------------------------------------------------------------
export type CashMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';
export type CashRegisterStatus = 'open' | 'closed';

export const CASH_REGISTER_TRANSITIONS: Record<CashRegisterStatus, CashRegisterStatus[]> = {
  open: ['closed'],
  closed: [],
};

export function canTransitionCashRegister(
  current: CashRegisterStatus,
  next: CashRegisterStatus,
): boolean {
  const allowed = CASH_REGISTER_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

// ---------------------------------------------------------------------------
// Cash Register (Sesión de caja diaria)
// ---------------------------------------------------------------------------
export interface CashRegister {
  id: string;
  clinicId: string;
  name: string;
  status: CashRegisterStatus;
  openingAmount: number;
  closingAmount?: number;
  difference?: number;
  sessionDate?: string;    // 'YYYY-MM-DD'
  notes?: string;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  openedByName?: string;
  closedBy?: string;
  closedByName?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Cash Movement (Ingreso / Egreso registrado)
// ---------------------------------------------------------------------------
export interface CashMovement {
  id: string;
  clinicId: string;
  cashRegisterId: string;
  cashSessionId?: string;
  paymentId?: string;
  type: CashMovementType;
  amount: number;
  description: string;
  reference?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cash Summary (Resumen del día)
// ---------------------------------------------------------------------------
export interface CashSummary {
  register: CashRegister;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expectedBalance: number;
  movements: CashMovement[];
}
