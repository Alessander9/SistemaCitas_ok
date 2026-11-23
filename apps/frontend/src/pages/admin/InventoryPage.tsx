import { useState, Fragment } from 'react';
import './InventoryPage.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { IconSearch } from '../../components/ui/Icons';
import {
  useInventoryKardex,
  INV_MOVEMENT_LABELS,
  InventoryMovementType,
} from '../../components/admin/inventory/useInventoryKardex';

interface InventoryPageProps {
  onNavigateToCash?: () => void;
}

export function InventoryPage({ onNavigateToCash }: InventoryPageProps = {}) {
  const {
    products,
    filteredProducts,
    lowStockProducts,
    categories,
    movements,
    totalInventoryValue,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    showLowStockOnly,
    setShowLowStockOnly,
    recordMovement,
  } = useInventoryKardex();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<InventoryMovementType>('purchase');
  const [movQty, setMovQty] = useState('');
  const [movNotes, setMovNotes] = useState('');

  const handleOpenRestock = (productId: string) => {
    setMovProductId(productId);
    setMovType('purchase');
    setMovQty('');
    setMovNotes('Reposición de stock bajo');
    setShowMovementForm(true);
  };

  const handleSaveMovement = () => {
    const qty = parseInt(movQty, 10);
    if (recordMovement(movProductId, movType, qty, movNotes)) {
      setSelectedProductId(movProductId);
      setMovProductId('');
      setMovQty('');
      setMovNotes('');
      setShowMovementForm(false);
    }
  };

  return (
    <div className="inv-shell">
      {/* Header */}
      <header className="inv-header">
        <div>
          <span className="inv-kicker">Control de insumos médicos · Stock y trazabilidad</span>
          <h1 className="inv-title">Inventario & Kardex</h1>
        </div>

        <div className="inv-header-actions">
          {onNavigateToCash && (
            <button type="button" className="inv-btn ghost" onClick={onNavigateToCash}>
              <MaterialIcon name="payments" size={16} />
              <span>Caja Chica</span>
            </button>
          )}
          {lowStockProducts.length > 0 && (
            <span className="low-stock-badge" id="low-stock-badge">
              <MaterialIcon name="warning" size={14} />
              <span>
                {lowStockProducts.length} alerta{lowStockProducts.length > 1 ? 's' : ''}
              </span>
            </span>
          )}
          <button
            id="btn-new-movement"
            type="button"
            className="inv-btn primary"
            onClick={() => setShowMovementForm((v) => !v)}
          >
            <MaterialIcon name="add" size={17} />
            <span>Ajustar stock</span>
          </button>
        </div>
      </header>

      {/* 3 KPIs Ejecutivos */}
      <section className="inv-kpi-grid" aria-label="Resumen de inventario">
        <article className="inv-kpi-card">
          <span className="inv-kpi-label">Insumos activos</span>
          <strong className="inv-kpi-val">{products.length}</strong>
          <small>{categories.length} categorías registradas</small>
        </article>

        <button
          type="button"
          className={`inv-kpi-card clickable ${lowStockProducts.length > 0 ? 'tone-danger' : ''} ${showLowStockOnly ? 'active' : ''}`}
          onClick={() => setShowLowStockOnly((v) => !v)}
        >
          <span className="inv-kpi-label">Stock crítico</span>
          <strong className="inv-kpi-val danger-text">{lowStockProducts.length}</strong>
          <small>{showLowStockOnly ? 'Mostrando solo críticos' : 'Clic para filtrar críticos'}</small>
        </button>

        <article className="inv-kpi-card">
          <span className="inv-kpi-label">Valorización en stock</span>
          <strong className="inv-kpi-val">
            S/ {totalInventoryValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <small>Costo acumulado en almacén</small>
        </article>
      </section>

      {/* Panel de Alertas Accionables */}
      {lowStockProducts.length > 0 && (
        <section className="inv-alerts-panel" id="alerts-panel" aria-label="Insumos con stock bajo">
          <div className="inv-alerts-head">
            <MaterialIcon name="warning" size={18} color="#dc2626" />
            <h2>Stock bajo — requiere reposición</h2>
          </div>
          <div className="inv-alerts-grid">
            {lowStockProducts.map((p) => {
              const pct = Math.min(100, Math.round((p.currentStock / Math.max(1, p.minStock)) * 100));
              return (
                <div className="inv-alert-card" key={p.id}>
                  <div className="inv-alert-card-top">
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        Quedan <strong>{p.currentStock}</strong> / mín. {p.minStock} {p.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="inv-btn-restock"
                      onClick={() => handleOpenRestock(p.id)}
                    >
                      + Reponer
                    </button>
                  </div>
                  <div className="inv-alert-bar">
                    <div className="inv-alert-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Formulario de Movimiento de Stock */}
      {showMovementForm && (
        <section className="inv-form-card" aria-label="Registrar movimiento de stock">
          <h3>Registrar movimiento en Kardex</h3>
          <div className="inv-form-grid">
            <select
              id="mov-product"
              className="inv-input"
              value={movProductId}
              onChange={(e) => setMovProductId(e.target.value)}
            >
              <option value="">Seleccionar producto…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (actual: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>

            <select
              id="mov-type"
              className="inv-input"
              value={movType}
              onChange={(e) => setMovType(e.target.value as InventoryMovementType)}
            >
              {(Object.entries(INV_MOVEMENT_LABELS) as [InventoryMovementType, string][]).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <input
              id="mov-quantity"
              type="number"
              min="1"
              placeholder="Cantidad"
              className="inv-input"
              value={movQty}
              onChange={(e) => setMovQty(e.target.value)}
            />
          </div>

          <input
            id="mov-notes"
            type="text"
            placeholder="Nota o referencia (ej. Factura proveedor, sesión clínica)"
            className="inv-input"
            value={movNotes}
            onChange={(e) => setMovNotes(e.target.value)}
          />

          <div className="inv-form-actions">
            <button type="button" className="inv-btn ghost" onClick={() => setShowMovementForm(false)}>
              Cancelar
            </button>
            <button id="btn-save-movement" type="button" className="inv-btn primary" onClick={handleSaveMovement}>
              Guardar en Kardex
            </button>
          </div>
        </section>
      )}

      {/* Catálogo y Kardex Expandible */}
      <section className="inv-panel" id="products-table-wrapper">
        <div className="inv-toolbar">
          <div className="inv-search-box">
            <span className="inv-search-icon"><IconSearch className="w-4 h-4" /></span>
            <input
              type="text"
              placeholder="Buscar insumo o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="inv-filter-controls">
            <select
              id="filter-category"
              className="inv-input sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="inv-toggle" htmlFor="filter-low-stock">
              <input
                id="filter-low-stock"
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              <span>Solo stock bajo</span>
            </label>
          </div>
        </div>

        <div className="inv-table-wrap">
          <table className="inv-table" id="products-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th className="inv-th-right">Kardex</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="inv-no-data">
                    Sin insumos encontrados con el filtro actual.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOpen = selectedProductId === p.id;
                  const productMovements = movements.filter((m) => m.productId === p.id);

                  return (
                    <Fragment key={p.id}>
                      <tr
                        className={`inv-row ${isOpen ? 'selected' : ''}`}
                        onClick={() => setSelectedProductId(isOpen ? null : p.id)}
                      >
                        <td>
                          <strong className="inv-prod-name">{p.name}</strong>
                          <span className="inv-prod-sku">{p.sku}</span>
                        </td>
                        <td>
                          <span className="inv-cat-chip">{p.category}</span>
                        </td>
                        <td>
                          <strong className={p.isLowStock ? 'stock-low' : 'stock-ok'}>
                            {p.currentStock} {p.unit}
                          </strong>
                        </td>
                        <td className="inv-min-cell">
                          {p.minStock} {p.unit}
                        </td>
                        <td>
                          {p.isLowStock ? (
                            <span className="inv-status-chip danger">Bajo</span>
                          ) : (
                            <span className="inv-status-chip ok">OK</span>
                          )}
                        </td>
                        <td className="inv-cell-right">
                          <span className="inv-kardex-toggle">
                            <span>{productMovements.length} mov.</span>
                            <MaterialIcon name={isOpen ? 'expand_less' : 'expand_more'} size={18} />
                          </span>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="kardex-row">
                          <td colSpan={6}>
                            <div className="kardex-panel">
                              <div className="kardex-head">
                                <h4>Kardex — {p.name}</h4>
                                <button
                                  type="button"
                                  className="inv-btn-restock"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenRestock(p.id);
                                  }}
                                >
                                  + Registrar movimiento
                                </button>
                              </div>

                              <table className="kardex-table">
                                <thead>
                                  <tr>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Nota</th>
                                    <th>Fecha</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productMovements.length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="inv-no-data">
                                        Sin movimientos registrados aún.
                                      </td>
                                    </tr>
                                  ) : (
                                    productMovements.map((m) => {
                                      const isEntry = m.type === 'purchase' || m.type === 'return';
                                      return (
                                        <tr key={m.id}>
                                          <td>
                                            <span className={`inv-mov-chip ${isEntry ? 'entry' : 'exit'}`}>
                                              {INV_MOVEMENT_LABELS[m.type]}
                                            </span>
                                          </td>
                                          <td className={isEntry ? 'qty-pos' : 'qty-neg'}>
                                            {isEntry ? '+' : '-'}
                                            {m.quantity} {p.unit}
                                          </td>
                                          <td>{m.notes || '—'}</td>
                                          <td>
                                            {new Date(m.createdAt).toLocaleString('es-PE', {
                                              dateStyle: 'short',
                                              timeStyle: 'short',
                                            })}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default InventoryPage;
