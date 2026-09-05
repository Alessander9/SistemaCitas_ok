import { useState, Fragment } from 'react';
import './InventoryPage.css';

type MovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';

interface InventoryProduct {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
  isLowStock: boolean;
}

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  createdAt: string;
}

const MOVEMENT_LABELS: Record<MovementType, string> = {
  sale: 'Salida – Venta',
  purchase: 'Entrada – Compra',
  adjustment: 'Ajuste de inventario',
  return: 'Devolución',
  waste: 'Merma',
};

const mockProducts: InventoryProduct[] = [
  { id: 'p1', name: 'Alcohol Isopropílico 70%', sku: 'ALC-70', category: 'Antisépticos', unit: 'ml', currentStock: 450, minStock: 200, costPrice: 5.0, sellPrice: 8.0, isActive: true, isLowStock: false },
  { id: 'p2', name: 'Guantes Nitrilo M', sku: 'GLV-NIT-M', category: 'EPP', unit: 'par', currentStock: 30, minStock: 100, costPrice: 0.8, sellPrice: 1.5, isActive: true, isLowStock: true },
  { id: 'p3', name: 'Algodón Estéril', sku: 'ALG-EST', category: 'Insumos', unit: 'gr', currentStock: 80, minStock: 80, costPrice: 3.0, sellPrice: 5.0, isActive: true, isLowStock: true },
  { id: 'p4', name: 'Jeringa 5cc', sku: 'JER-5CC', category: 'Descartables', unit: 'unidad', currentStock: 500, minStock: 100, costPrice: 0.3, sellPrice: 0.8, isActive: true, isLowStock: false },
];

const mockMovements: InventoryMovement[] = [
  { id: 'm1', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'purchase', quantity: 1000, notes: 'Pedido mensual', createdAt: '2026-09-01T08:00:00Z' },
  { id: 'm2', productId: 'p2', productName: 'Guantes Nitrilo M', type: 'sale', quantity: 70, notes: 'Sesión fisioterapia', createdAt: '2026-09-02T09:30:00Z' },
  { id: 'm3', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'waste', quantity: 50, notes: 'Vencimiento lote', createdAt: '2026-09-02T11:00:00Z' },
];

const MOVEMENT_COLORS: Record<MovementType, string> = {
  purchase: '#10b981',
  return: '#10b981',
  sale: '#ef4444',
  waste: '#f97316',
  adjustment: '#f59e0b',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Antisépticos': '#6366f1',
  'EPP': '#f59e0b',
  'Insumos': '#10b981',
  'Descartables': '#3b82f6',
};

interface InventoryPageProps {
  onNavigateToCash?: () => void;
}

export function InventoryPage({ onNavigateToCash }: InventoryPageProps = {}) {
  const [products, setProducts] = useState<InventoryProduct[]>(mockProducts);
  const [movements] = useState<InventoryMovement[]>(mockMovements);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movForm, setMovForm] = useState<{ productId: string; type: MovementType; quantity: string; notes: string }>({
    productId: '',
    type: 'purchase',
    quantity: '',
    notes: '',
  });
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const lowStockProducts = products.filter(p => p.isLowStock);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter(p => {
    if (showLowStockOnly && !p.isLowStock) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const handleMovementSubmit = () => {
    if (!movForm.productId || !movForm.quantity) return;
    const qty = parseInt(movForm.quantity);
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== movForm.productId) return p;
        let newStock = p.currentStock;
        if (movForm.type === 'purchase' || movForm.type === 'return') newStock += qty;
        else if (movForm.type === 'adjustment') newStock = qty;
        else newStock = Math.max(0, newStock - qty);
        return { ...p, currentStock: newStock, isLowStock: newStock <= p.minStock };
      }),
    );
    setMovForm({ productId: '', type: 'purchase', quantity: '', notes: '' });
    setShowMovementForm(false);
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Inventario & Kardex</h1>
          <p className="inv-subtitle">Catálogo de insumos · Control de stock · Movimientos</p>
        </div>
        <div className="inv-header-actions">
          {onNavigateToCash && (
            <button
              type="button"
              className="inv-btn ghost"
              onClick={onNavigateToCash}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
              title="Ir a arqueo y movimientos de caja chica"
            >
              🏦 Ver Caja Chica ↗
            </button>
          )}
          {lowStockProducts.length > 0 && (
            <span className="low-stock-badge" id="low-stock-badge">
              ⚠️ {lowStockProducts.length} alerta{lowStockProducts.length > 1 ? 's' : ''}
            </span>
          )}
          <button id="btn-new-movement" className="inv-btn primary" onClick={() => setShowMovementForm(v => !v)}>
            + Ajustar Stock
          </button>
        </div>
      </div>

      {/* Low stock alerts panel */}
      {lowStockProducts.length > 0 && (
        <div className="alerts-panel" id="alerts-panel">
          <h3 className="alerts-title">🚨 Stock Bajo — Requiere Atención</h3>
          <div className="alerts-grid">
            {lowStockProducts.map(p => (
              <div className="alert-card" key={p.id}>
                <span className="alert-name">{p.name}</span>
                <span className="alert-stock">
                  <strong>{p.currentStock}</strong> / {p.minStock} {p.unit}
                </span>
                <div className="alert-bar">
                  <div className="alert-fill" style={{ width: `${Math.min(100, (p.currentStock / p.minStock) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement form */}
      {showMovementForm && (
        <div className="inv-form-card">
          <h3>Registrar Movimiento de Stock</h3>
          <div className="inv-form-row">
            <select
              id="mov-product"
              className="inv-input"
              value={movForm.productId}
              onChange={e => setMovForm(p => ({ ...p, productId: e.target.value }))}
            >
              <option value="">Seleccionar producto…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.currentStock})</option>)}
            </select>
            <select
              id="mov-type"
              className="inv-input"
              value={movForm.type}
              onChange={e => setMovForm(p => ({ ...p, type: e.target.value as MovementType }))}
            >
              {(Object.entries(MOVEMENT_LABELS) as [MovementType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              id="mov-quantity"
              type="number"
              min="1"
              placeholder="Cantidad"
              className="inv-input"
              value={movForm.quantity}
              onChange={e => setMovForm(p => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          <input
            id="mov-notes"
            type="text"
            placeholder="Notas (opcional)"
            className="inv-input full"
            value={movForm.notes}
            onChange={e => setMovForm(p => ({ ...p, notes: e.target.value }))}
          />
          <div className="form-actions">
            <button id="btn-save-movement" className="inv-btn primary" onClick={handleMovementSubmit}>Guardar Movimiento</button>
            <button className="inv-btn ghost" onClick={() => setShowMovementForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="inv-filters">
        <select className="inv-input sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} id="filter-category">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="inv-toggle" htmlFor="filter-low-stock">
          <input
            id="filter-low-stock"
            type="checkbox"
            checked={showLowStockOnly}
            onChange={e => setShowLowStockOnly(e.target.checked)}
          />
          Solo stock bajo
        </label>
      </div>

      {/* Products table */}
      <div className="inv-table-wrapper" id="products-table-wrapper">
        <h3 className="table-title">Productos ({filteredProducts.length})</h3>
        <table className="inv-table" id="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Mín.</th>
              <th>Unidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="no-data">Sin productos encontrados</td></tr>
            ) : filteredProducts.map(p => (
              <Fragment key={p.id}>
                <tr className={`inv-row ${selectedProduct === p.id ? 'selected' : ''}`} onClick={() => setSelectedProduct(selectedProduct === p.id ? null : p.id)}>
                  <td className="product-name-cell">
                    <span>{p.name}</span>
                  </td>
                  <td><span className="sku-chip">{p.sku ?? '—'}</span></td>
                  <td>
                    {p.category && (
                      <span className="category-chip" style={{ background: (CATEGORY_COLORS[p.category] ?? '#6366f1') + '22', color: CATEGORY_COLORS[p.category] ?? '#6366f1', borderColor: (CATEGORY_COLORS[p.category] ?? '#6366f1') + '55' }}>
                        {p.category}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={p.isLowStock ? 'stock-low' : 'stock-ok'}>{p.currentStock}</span>
                  </td>
                  <td>{p.minStock}</td>
                  <td>{p.unit}</td>
                  <td>
                    {p.isLowStock
                      ? <span className="status-chip danger">⚠️ Bajo</span>
                      : <span className="status-chip ok">✅ OK</span>}
                  </td>
                </tr>
                {/* Expandable Kardex */}
                {selectedProduct === p.id && (
                  <tr className="kardex-row">
                    <td colSpan={7}>
                      <div className="kardex-panel">
                        <h4>Kardex — {p.name}</h4>
                        <table className="kardex-table">
                          <thead>
                            <tr><th>Tipo</th><th>Cantidad</th><th>Notas</th><th>Fecha</th></tr>
                          </thead>
                          <tbody>
                            {movements.filter(m => m.productId === p.id).length === 0 ? (
                              <tr><td colSpan={4} className="no-data">Sin movimientos</td></tr>
                            ) : movements.filter(m => m.productId === p.id).map(m => (
                              <tr key={m.id}>
                                <td>
                                  <span className="movement-chip" style={{ color: MOVEMENT_COLORS[m.type], background: MOVEMENT_COLORS[m.type] + '15', borderColor: MOVEMENT_COLORS[m.type] + '40', border: '1px solid' }}>
                                    {MOVEMENT_LABELS[m.type]}
                                  </span>
                                </td>
                                <td className={m.type === 'purchase' || m.type === 'return' ? 'qty-positive' : 'qty-negative'}>
                                  {m.type === 'purchase' || m.type === 'return' ? '+' : '-'}{m.quantity}
                                </td>
                                <td>{m.notes ?? '—'}</td>
                                <td>{new Date(m.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryPage;
