import { useState } from 'react';
import './CashRegisterPage.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  IconCash,
  IconPlus,
  IconChart,
  IconAlert,
  IconCheckCircle,
  IconSearch,
} from '../../components/ui/Icons';
import {
  useCashRegister,
  CASH_MOVEMENT_LABELS,
  CashMovementType,
  CashFilter,
  isCashIncome,
} from '../../components/admin/cash/useCashRegister';

interface CashRegisterPageProps {
  onNavigateToInventory?: () => void;
  onNavigateToBooking?: () => void;
}

export function CashRegisterPage({
  onNavigateToInventory,
  onNavigateToBooking,
}: CashRegisterPageProps = {}) {
  const {
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
  } = useCashRegister();

  const [activePanel, setActivePanel] = useState<'none' | 'movement' | 'close'>('none');
  const [movType, setMovType] = useState<CashMovementType>('purchase');
  const [movAmount, setMovAmount] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [closingAmount, setClosingAmount] = useState('');

  const handleSaveMovement = () => {
    const parsed = parseFloat(movAmount);
    if (addMovement(movType, parsed, movDesc)) {
      setMovAmount('');
      setMovDesc('');
      setActivePanel('none');
    }
  };

  const handleConfirmClose = () => {
    const parsed = parseFloat(closingAmount);
    if (closeRegister(parsed)) {
      setClosingAmount('');
      setActivePanel('none');
    }
  };

  const liveClosingDiff =
    closingAmount.trim() !== '' && !Number.isNaN(parseFloat(closingAmount))
      ? Number((parseFloat(closingAmount) - totals.expectedBalance).toFixed(2))
      : null;

  return (
    <div className="cash-shell">
      {/* Header limpio */}
      <header className="cash-header">
        <div>
          <span className="cash-kicker">
            Arqueo diario · {register ? `Responsable: ${register.openedByName}` : 'Sin turno activo'}
          </span>
          <h1 className="cash-title">Caja Chica</h1>
        </div>

        <div className="cash-header-right">
          {onNavigateToBooking && (
            <button type="button" className="cash-btn ghost" onClick={onNavigateToBooking}>
              <MaterialIcon name="calendar_today" size={15} />
              <span>Citas</span>
            </button>
          )}
          {onNavigateToInventory && (
            <button type="button" className="cash-btn ghost" onClick={onNavigateToInventory}>
              <MaterialIcon name="inventory_2" size={15} />
              <span>Inventario</span>
            </button>
          )}
          {register && (
            <span
              id="cash-status-badge"
              className={`cash-status-badge ${register.status}`}
            >
              <span className="cash-dot" />
              {register.status === 'open' ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
            </span>
          )}
        </div>
      </header>

      {!register ? (
        <section className="cash-empty-card">
          <MaterialIcon name="point_of_sale" size={40} color="#0284c7" />
          <h2>No hay caja abierta en este turno</h2>
          <p>Inicia un turno de caja para registrar ingresos, gastos menores y arqueo final.</p>
          <button
            id="btn-open-cash"
            type="button"
            className="cash-btn primary"
            onClick={() => openNewShift(200)}
          >
            <IconPlus className="w-4 h-4" />
            <span>Abrir caja de turno</span>
          </button>
        </section>
      ) : (
        <>
          {/* 4 KPIs Financieros Exactos */}
          <section className="cash-kpi-grid" aria-label="Resumen de caja">
            <article className="cash-kpi-card">
              <div className="cash-kpi-top">
                <span>Monto Inicial</span>
                <span className="cash-kpi-icon emerald"><IconCash className="w-4 h-4" /></span>
              </div>
              <strong className="cash-kpi-val">S/ {register.openingAmount.toFixed(2)}</strong>
              <small>Fondo de apertura</small>
            </article>

            <article className="cash-kpi-card">
              <div className="cash-kpi-top">
                <span>Total Ingresos</span>
                <span className="cash-kpi-icon sky"><IconChart className="w-4 h-4" /></span>
              </div>
              <strong className="cash-kpi-val tone-income">+ S/ {totals.totalIncome.toFixed(2)}</strong>
              <small>Cobros y ventas en efectivo</small>
            </article>

            <article className="cash-kpi-card">
              <div className="cash-kpi-top">
                <span>Total Egresos</span>
                <span className="cash-kpi-icon amber"><IconAlert className="w-4 h-4" /></span>
              </div>
              <strong className="cash-kpi-val tone-expense">- S/ {totals.totalExpense.toFixed(2)}</strong>
              <small>Compras, gastos y devoluciones</small>
            </article>

            <article className="cash-kpi-card highlight">
              <div className="cash-kpi-top">
                <span>Balance Esperado</span>
                <span className="cash-kpi-icon violet"><IconCash className="w-4 h-4" /></span>
              </div>
              <strong className="cash-kpi-val">S/ {totals.expectedBalance.toFixed(2)}</strong>
              <small>Efectivo esperado en gaveta</small>
            </article>
          </section>

          {/* Resultado de arqueo si está cerrada */}
          {register.status === 'closed' && register.difference !== undefined && (
            <div className={`cash-diff-banner ${register.difference === 0 ? 'exact' : register.difference > 0 ? 'surplus' : 'deficit'}`}>
              <div className="cash-diff-info">
                <IconCheckCircle className="w-5 h-5" />
                <div>
                  <strong>
                    {register.difference === 0
                      ? 'Arqueo cuadrado exacto (S/ 0.00 de diferencia)'
                      : register.difference > 0
                        ? `Arqueo cerrado con sobrante de S/ ${register.difference.toFixed(2)}`
                        : `Arqueo cerrado con faltante de S/ ${Math.abs(register.difference).toFixed(2)}`}
                  </strong>
                  <span>
                    Contado físicamente: S/ {(register.closingAmount ?? 0).toFixed(2)} · Esperado: S/ {totals.expectedBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="cash-btn primary"
                onClick={() => openNewShift(200)}
              >
                Abrir nuevo turno
              </button>
            </div>
          )}

          {/* Barra de acciones (mutuamente excluyentes) */}
          {register.status === 'open' && (
            <div className="cash-actions-bar">
              <button
                id="btn-add-movement"
                type="button"
                className="cash-btn primary"
                onClick={() => setActivePanel(activePanel === 'movement' ? 'none' : 'movement')}
              >
                <IconPlus className="w-4 h-4" />
                <span>Registrar movimiento</span>
              </button>
              <button
                id="btn-close-cash"
                type="button"
                className="cash-btn danger"
                onClick={() => setActivePanel(activePanel === 'close' ? 'none' : 'close')}
              >
                <IconCheckCircle className="w-4 h-4" />
                <span>Cerrar caja y arquear</span>
              </button>
            </div>
          )}

          {/* Formulario de Nuevo Movimiento */}
          {activePanel === 'movement' && register.status === 'open' && (
            <section className="cash-form-card" aria-label="Nuevo movimiento de caja">
              <h3>Registrar movimiento</h3>
              <div className="cash-form-grid">
                <select
                  id="movement-type"
                  className="cash-input"
                  value={movType}
                  onChange={(e) => setMovType(e.target.value as CashMovementType)}
                >
                  {(Object.entries(CASH_MOVEMENT_LABELS) as [CashMovementType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <input
                  id="movement-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Monto (S/)"
                  className="cash-input"
                  value={movAmount}
                  onChange={(e) => setMovAmount(e.target.value)}
                />
              </div>
              <input
                id="movement-description"
                type="text"
                placeholder="Concepto (ej. Compra de gasas, Pago consulta)"
                className="cash-input"
                value={movDesc}
                onChange={(e) => setMovDesc(e.target.value)}
              />
              <div className="cash-form-actions">
                <button type="button" className="cash-btn ghost" onClick={() => setActivePanel('none')}>
                  Cancelar
                </button>
                <button id="btn-save-movement" type="button" className="cash-btn primary" onClick={handleSaveMovement}>
                  Guardar movimiento
                </button>
              </div>
            </section>
          )}

          {/* Formulario de Arqueo Asistido en Vivo */}
          {activePanel === 'close' && register.status === 'open' && (
            <section className="cash-form-card close-panel" aria-label="Arqueo de cierre">
              <h3>Arqueo de cierre de turno</h3>
              <p className="cash-helper">
                Efectivo esperado según sistema: <strong>S/ {totals.expectedBalance.toFixed(2)}</strong>
              </p>

              <input
                id="closing-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Efectivo contado físicamente en gaveta (S/)"
                className="cash-input"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />

              {liveClosingDiff !== null && (
                <div className={`cash-live-diff ${liveClosingDiff === 0 ? 'exact' : liveClosingDiff > 0 ? 'surplus' : 'deficit'}`}>
                  {liveClosingDiff === 0
                    ? '✓ Cuadra exacto (diferencia S/ 0.00)'
                    : liveClosingDiff > 0
                      ? `↑ Sobrante detectado: + S/ ${liveClosingDiff.toFixed(2)}`
                      : `↓ Faltante detectado: - S/ ${Math.abs(liveClosingDiff).toFixed(2)}`}
                </div>
              )}

              <div className="cash-form-actions">
                <button type="button" className="cash-btn ghost" onClick={() => setActivePanel('none')}>
                  Cancelar
                </button>
                <button id="btn-confirm-close" type="button" className="cash-btn danger" onClick={handleConfirmClose}>
                  Confirmar arqueo y cerrar
                </button>
              </div>
            </section>
          )}

          {/* Tabla de Movimientos Filtrable */}
          <section className="cash-panel">
            <div className="cash-panel-toolbar">
              <div className="cash-filter-pills" role="tablist">
                {(
                  [
                    { id: 'all', label: `Todos (${movements.length})` },
                    { id: 'income', label: 'Ingresos' },
                    { id: 'expense', label: 'Egresos' },
                  ] as Array<{ id: CashFilter; label: string }>
                ).map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === pill.id}
                    className={`cash-pill ${filter === pill.id ? 'active' : ''}`}
                    onClick={() => setFilter(pill.id)}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <div className="cash-search-box">
                <span className="cash-search-icon"><IconSearch className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Buscar concepto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <p className="cash-no-data">No hay movimientos para mostrar con este filtro.</p>
            ) : (
              <div className="cash-table-wrap">
                <table className="cash-table" id="movements-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((m) => {
                      const income = isCashIncome(m.type);
                      return (
                        <tr key={m.id}>
                          <td>
                            <span className={`cash-mov-chip ${income ? 'income' : 'expense'}`}>
                              {income ? '↑' : '↓'} {CASH_MOVEMENT_LABELS[m.type]}
                            </span>
                          </td>
                          <td className="cash-cell-desc">{m.description}</td>
                          <td className={income ? 'cash-amt income' : 'cash-amt expense'}>
                            {income ? '+' : '-'} S/ {m.amount.toFixed(2)}
                          </td>
                          <td>
                            <span className="cash-time-chip">
                              {new Date(m.createdAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default CashRegisterPage;
