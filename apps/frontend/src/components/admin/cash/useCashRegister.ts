import { useState, useMemo, useCallback } from 'react';

export type CashMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';
export type CashFilter = 'all' | 'income' | 'expense';

export interface CashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface CashRegisterSession {
  id: string;
  name: string;
  status: 'open' | 'closed';
  openingAmount: number;
  closingAmount?: number;
  difference?: number;
  sessionDate: string;
  openedByName: string;
}

export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  sale: 'Ingreso – Venta',
  purchase: 'Egreso – Compra',
  return: 'Egreso – Devolución',
  waste: 'Egreso – Gasto menor',
  adjustment: 'Ajuste de caja',
};

const INITIAL_MOVEMENTS: CashMovement[] = [
  { id: '1', type: 'sale', amount: 120, description: 'Pago consulta Dr. Torres', createdAt: '2026-09-02T09:15:00Z' },
  { id: '2', type: 'purchase', amount: 45, description: 'Compra insumos / gasas', createdAt: '2026-09-02T10:30:00Z' },
  { id: '3', type: 'sale', amount: 85, description: 'Pago sesión fisioterapia', createdAt: '2026-09-02T11:00:00Z' },
];

const INITIAL_REGISTER: CashRegisterSession = {
  id: 'reg-1',
  name: 'Turno Mañana',
  status: 'open',
  openingAmount: 200,
  sessionDate: '2026-09-02',
  openedByName: 'Ana López',
};

export function isCashIncome(type: CashMovementType): boolean {
  return type === 'sale' || type === 'adjustment';
}

export function useCashRegister() {
  const [register, setRegister] = useState<CashRegisterSession | null>(INITIAL_REGISTER);
  const [movements, setMovements] = useState<CashMovement[]>(INITIAL_MOVEMENTS);
  const [filter, setFilter] = useState<CashFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Contabilidad exacta: devoluciones (return) son egresos reales
  const totals = useMemo(() => {
    const totalIncome = movements
      .filter((m) => isCashIncome(m.type))
      .reduce((sum, m) => sum + m.amount, 0);
    const totalExpense = movements
      .filter((m) => !isCashIncome(m.type))
      .reduce((sum, m) => sum + m.amount, 0);
    const expectedBalance = (register?.openingAmount ?? 0) + totalIncome - totalExpense;

    return { totalIncome, totalExpense, expectedBalance };
  }, [movements, register]);

  const filteredMovements = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return movements.filter((m) => {
      const income = isCashIncome(m.type);
      if (filter === 'income' && !income) return false;
      if (filter === 'expense' && income) return false;
      if (q && !m.description.toLowerCase().includes(q) && !CASH_MOVEMENT_LABELS[m.type].toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [movements, filter, searchTerm]);

  const addMovement = useCallback((type: CashMovementType, amount: number, description: string) => {
    if (!amount || amount <= 0 || !description.trim()) return false;
    const mov: CashMovement = {
      id: `mov-${Date.now()}`,
      type,
      amount,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    setMovements((prev) => [mov, ...prev]);
    return true;
  }, []);

  const closeRegister = useCallback(
    (countedCash: number) => {
      if (!register || Number.isNaN(countedCash) || countedCash < 0) return false;
      const difference = Number((countedCash - totals.expectedBalance).toFixed(2));
      setRegister({
        ...register,
        status: 'closed',
        closingAmount: countedCash,
        difference,
      });
      return true;
    },
    [register, totals.expectedBalance],
  );

  const openNewShift = useCallback((openingAmount = 200) => {
    const today = new Date().toISOString().split('T')[0];
    setRegister({
      id: `reg-${Date.now()}`,
      name: `Caja ${today}`,
      status: 'open',
      openingAmount,
      sessionDate: today,
      openedByName: 'Director de Sede',
    });
    setMovements([]);
    setFilter('all');
    setSearchTerm('');
  }, []);

  return {
    register,
    movements,
    filteredMovements,
    totals,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    addMovement,
    closeRegister,
    openNewShift,
  };
}
