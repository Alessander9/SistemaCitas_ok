import { useState } from 'react';
import './CashRegisterPage.css';
import {
  IconCash,
  IconPlus,
  IconChart,
  IconAlert,
  IconCheckCircle,
} from '../../components/ui/Icons';

type MovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';

interface CashMovement {
  id: string;
  type: MovementType;
  amount: number;
  description: string;
  createdAt: string;
}

interface CashRegister {
  id: string;
  name: string;
  status: 'open' | 'closed';
  openingAmount: number;
  closingAmount?: number;
  difference?: number;
  sessionDate?: string;
  openedByName?: string;
}

const MOVEMENT_LABELS: Record<MovementType, string> = {
  sale: 'Ingreso – Venta',
  purchase: 'Egreso – Compra',
  adjustment: 'Ajuste de Caja',
  return: 'Devolución',
  waste: 'Merma / Gasto',
};

const mockMovements: CashMovement[] = [
  { id: '1', type: 'sale', amount: 120, description: 'Pago consulta Dr. Torres', createdAt: '2026-09-02T09:15:00Z' },
  { id: '2', type: 'purchase', amount: 45, description: 'Compra insumos / gasas', createdAt: '2026-09-02T10:30:00Z' },
  { id: '3', type: 'sale', amount: 85, description: 'Pago sesión fisioterapia', createdAt: '2026-09-02T11:00:00Z' },
];

const mockRegister: CashRegister = {
  id: 'reg-1',
  name: 'Caja 2026-09-02',
  status: 'open',
  openingAmount: 200,
  sessionDate: '2026-09-02',
  openedByName: 'Ana López',
};

interface CashRegisterPageProps {
  onNavigateToInventory?: () => void;
  onNavigateToBooking?: () => void;
}

export function CashRegisterPage({
  onNavigateToInventory,
  onNavigateToBooking,
}: CashRegisterPageProps = {}) {
  const [register, setRegister] = useState<CashRegister | null>(mockRegister);
  const [movements, setMovements] = useState<CashMovement[]>(mockMovements);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [newMovement, setNewMovement] = useState<{ type: MovementType; amount: string; description: string }>({
    type: 'purchase',
    amount: '',
    description: '',
  });
  const [closingAmount, setClosingAmount] = useState('');

  const totalIncome = movements.filter(m => m.type === 'sale' || m.type === 'return').reduce((s, m) => s + m.amount, 0);
  const totalExpense = movements.filter(m => m.type === 'purchase' || m.type === 'waste').reduce((s, m) => s + m.amount, 0);
  const balance = (register?.openingAmount ?? 0) + totalIncome - totalExpense;

  const handleAddMovement = () => {
    if (!newMovement.amount || !newMovement.description) return;
    const mov: CashMovement = {
      id: Date.now().toString(),
      type: newMovement.type,
      amount: parseFloat(newMovement.amount),
      description: newMovement.description,
      createdAt: new Date().toISOString(),
    };
    setMovements(prev => [...prev, mov]);
    setNewMovement({ type: 'purchase', amount: '', description: '' });
    setShowMovementForm(false);
  };

  const handleClose = () => {
    if (!closingAmount || !register) return;
    const expected = balance;
    const difference = parseFloat(closingAmount) - expected;
    setRegister({ ...register, status: 'closed', closingAmount: parseFloat(closingAmount), difference });
    setShowCloseForm(false);
  };

  return (
    <div className="cash-page">
      {/* Header with Clinic Medical Badge */}
      <div className="cash-header">
        <div>
          <div className="clinic-badge" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669', marginBottom: '0.45rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#10b981', display: 'inline-block' }} />
            Gestión Financiera · Arqueo de Caja Chica
          </div>
          <h1 className="cash-title">Caja Chica</h1>
          <p className="cash-subtitle">Arqueo diario · Movimientos de efectivo en tiempo real</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {onNavigateToBooking && (
            <button
              type="button"
              className="cash-btn ghost"
              onClick={onNavigateToBooking}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              title="Ir a agenda de citas y cobros pendientes"
            >
              📅 Ver Citas & Cobros ↗
            </button>
          )}
          {onNavigateToInventory && (
            <button
              type="button"
              className="cash-btn ghost"
              onClick={onNavigateToInventory}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              title="Ir a kardex de inventario médico"
            >
              📦 Ver Inventario ↗
            </button>
          )}
          {register && (
            <span className={`cash-status-badge ${register.status === 'open' ? 'open' : 'closed'}`} id="cash-status-badge">
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: register.status === 'open' ? '#16a34a' : '#64748b', display: 'inline-block' }} />
              {register.status === 'open' ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
            </span>
          )}
        </div>
      </div>

      {!register && (
        <div className="cash-no-session">
          <div className="no-session-icon">🏦</div>
          <h2>No hay caja abierta en este turno</h2>
          <p>Abre la caja para comenzar a registrar los cobros y movimientos del día.</p>
          <button
            id="btn-open-cash"
            className="cash-btn primary"
            onClick={() => setRegister({ id: 'new', name: 'Caja ' + new Date().toISOString().split('T')[0], status: 'open', openingAmount: 200, sessionDate: new Date().toISOString().split('T')[0], openedByName: 'Usuario' })}
          >
            <IconPlus className="w-4 h-4" />
            <span>Abrir Caja de Turno</span>
          </button>
        </div>
      )}

      {register && (
        <>
          {/* Summary KPI Cards with Icon Wrappers */}
          <div className="cash-summary-grid">
            {/* Card 1: Monto Inicial */}
            <div className="cash-card green">
              <div className="kpi-header">
                <span className="card-label">Monto Inicial</span>
                <div className="kpi-icon-wrap kpi-icon-emerald">
                  <IconCash className="w-4 h-4" />
                </div>
              </div>
              <span className="card-value">S/ {register.openingAmount.toFixed(2)}</span>
              <span className="card-hint">● Apertura de turno</span>
            </div>

            {/* Card 2: Total Ingresos */}
            <div className="cash-card blue">
              <div className="kpi-header">
                <span className="card-label">Total Ingresos</span>
                <div className="kpi-icon-wrap kpi-icon-sky">
                  <IconChart className="w-4 h-4" />
                </div>
              </div>
              <span className="card-value">+ S/ {totalIncome.toFixed(2)}</span>
              <span className="card-hint" style={{ color: '#0284c7' }}>↑ Cobros y ventas del día</span>
            </div>

            {/* Card 3: Total Egresos */}
            <div className="cash-card red">
              <div className="kpi-header">
                <span className="card-label">Total Egresos</span>
                <div className="kpi-icon-wrap kpi-icon-amber">
                  <IconAlert className="w-4 h-4" />
                </div>
              </div>
              <span className="card-value">- S/ {totalExpense.toFixed(2)}</span>
              <span className="card-hint" style={{ color: '#dc2626' }}>↓ Compras y gastos menores</span>
            </div>

            {/* Card 4: Balance Esperado */}
            <div className="cash-card purple">
              <div className="kpi-header">
                <span className="card-label">Balance Esperado</span>
                <div className="kpi-icon-wrap kpi-icon-purple">
                  <IconCash className="w-4 h-4" />
                </div>
              </div>
              <span className="card-value">S/ {balance.toFixed(2)}</span>
              <span className="card-hint" style={{ color: '#7c3aed' }}>● Efectivo en gaveta física</span>
            </div>
          </div>

          {/* Closing difference alert */}
          {register.status === 'closed' && register.difference !== undefined && (
            <div className={`cash-difference-alert ${register.difference >= 0 ? 'surplus' : 'deficit'}`}>
              <IconCheckCircle className="w-5 h-5" />
              <span>
                {register.difference >= 0
                  ? `Arqueo Cuadrado / Sobrante: S/ ${register.difference.toFixed(2)}`
                  : `Diferencia de Caja (Faltante): S/ ${Math.abs(register.difference).toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Action buttons with modern icons */}
          {register.status === 'open' && (
            <div className="cash-actions">
              <button id="btn-add-movement" className="cash-btn primary" onClick={() => setShowMovementForm(v => !v)}>
                <IconPlus className="w-4 h-4" />
                <span>+ Registrar Movimiento</span>
              </button>
              <button id="btn-close-cash" className="cash-btn danger" onClick={() => setShowCloseForm(v => !v)}>
                <IconCheckCircle className="w-4 h-4" />
                <span>Cerrar Caja & Arqueo</span>
              </button>
            </div>
          )}

          {/* Movement form */}
          {showMovementForm && (
            <div className="cash-form-card">
              <h3>Registrar Nuevo Movimiento de Caja</h3>
              <div className="form-row">
                <select
                  id="movement-type"
                  value={newMovement.type}
                  onChange={e => setNewMovement(p => ({ ...p, type: e.target.value as MovementType }))}
                  className="cash-input"
                >
                  {(Object.entries(MOVEMENT_LABELS) as [MovementType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <input
                  id="movement-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Monto (S/)"
                  className="cash-input"
                  value={newMovement.amount}
                  onChange={e => setNewMovement(p => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <input
                id="movement-description"
                type="text"
                placeholder="Descripción del gasto o ingreso (ej. Compra de gasas, Pago cita Dra. González)"
                className="cash-input full"
                value={newMovement.description}
                onChange={e => setNewMovement(p => ({ ...p, description: e.target.value }))}
              />
              <div className="form-actions">
                <button id="btn-save-movement" className="cash-btn primary" onClick={handleAddMovement}>
                  Guardar Movimiento
                </button>
                <button className="cash-btn ghost" onClick={() => setShowMovementForm(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Close form */}
          {showCloseForm && (
            <div className="cash-form-card">
              <h3>Arqueo de Cierre de Turno</h3>
              <p className="form-helper">
                Balance calculado por el sistema: <strong style={{ color: '#0f172a' }}>S/ {balance.toFixed(2)}</strong>
              </p>
              <input
                id="closing-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ingresa el monto contado físicamente en efectivo (S/)"
                className="cash-input full"
                value={closingAmount}
                onChange={e => setClosingAmount(e.target.value)}
              />
              <div className="form-actions">
                <button id="btn-confirm-close" className="cash-btn danger" onClick={handleClose}>
                  Confirmar Arqueo y Cerrar Caja
                </button>
                <button className="cash-btn ghost" onClick={() => setShowCloseForm(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Movements table */}
          <div className="cash-table-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 className="table-title" style={{ margin: 0 }}>
                Movimientos del Día ({movements.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Trazabilidad financiera inmutable
              </span>
            </div>

            {movements.length === 0 ? (
              <p className="no-data">Sin movimientos registrados aún en este turno.</p>
            ) : (
              <table className="cash-table" id="movements-table">
                <thead>
                  <tr>
                    <th>Tipo de Movimiento</th>
                    <th>Concepto / Descripción</th>
                    <th>Monto en Efectivo</th>
                    <th>Hora de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(m => {
                    const isIncome = m.type === 'sale' || m.type === 'return';
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className={`movement-chip ${isIncome ? 'income' : 'expense'}`}>
                            <span>{isIncome ? '↑' : '↓'}</span> {MOVEMENT_LABELS[m.type]}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{m.description}</td>
                        <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                          {isIncome ? '+' : '-'} S/ {m.amount.toFixed(2)}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                            {new Date(m.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CashRegisterPage;
