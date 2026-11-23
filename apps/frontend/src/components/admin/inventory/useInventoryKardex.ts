import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '../../../services/api/http';

export type InventoryMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'waste';

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  isLowStock: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: InventoryMovementType;
  quantity: number;
  notes?: string;
  createdAt: string;
}

export const INV_MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  purchase: 'Entrada – Compra',
  sale: 'Salida – Consumo / Venta',
  adjustment: 'Ajuste exacto',
  return: 'Entrada – Devolución',
  waste: 'Salida – Merma / Vencido',
};

const INITIAL_FALLBACK_PRODUCTS: InventoryProduct[] = [
  { id: 'p1', name: 'Alcohol Isopropílico 70%', sku: 'ALC-70', category: 'Antisépticos', unit: 'ml', currentStock: 450, minStock: 200, costPrice: 0.05, sellPrice: 0.08, isLowStock: false },
  { id: 'p2', name: 'Guantes Nitrilo M', sku: 'GLV-NIT-M', category: 'EPP', unit: 'par', currentStock: 30, minStock: 100, costPrice: 0.8, sellPrice: 1.5, isLowStock: true },
  { id: 'p3', name: 'Algodón Estéril', sku: 'ALG-EST', category: 'Insumos', unit: 'gr', currentStock: 80, minStock: 80, costPrice: 0.06, sellPrice: 0.1, isLowStock: true },
  { id: 'p4', name: 'Jeringa 5cc', sku: 'JER-5CC', category: 'Descartables', unit: 'unidad', currentStock: 500, minStock: 100, costPrice: 0.3, sellPrice: 0.8, isLowStock: false },
];

const INITIAL_FALLBACK_MOVEMENTS: InventoryMovement[] = [
  { id: 'm1', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'purchase', quantity: 1000, notes: 'Pedido mensual', createdAt: '2026-09-01T08:00:00Z' },
  { id: 'm2', productId: 'p2', productName: 'Guantes Nitrilo M', type: 'sale', quantity: 70, notes: 'Sesión fisioterapia', createdAt: '2026-09-02T09:30:00Z' },
  { id: 'm3', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'waste', quantity: 50, notes: 'Vencimiento lote', createdAt: '2026-09-02T11:00:00Z' },
];

export function useInventoryKardex() {
  const [products, setProducts] = useState<InventoryProduct[]>(INITIAL_FALLBACK_PRODUCTS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_FALLBACK_MOVEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/inventory', { headers: getAuthHeaders() }),
        fetch('/api/inventory/movements', { headers: getAuthHeaders() }),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          const mapped: InventoryProduct[] = prodData.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || 'SKU-SN',
            category: p.category || 'General',
            unit: p.unit || 'unidad',
            currentStock: Number(p.currentStock) || 0,
            minStock: Number(p.minStock) || 0,
            costPrice: Number(p.costPrice) || 0,
            sellPrice: Number(p.sellPrice) || 0,
            isLowStock: Boolean(p.isLowStock || Number(p.currentStock) <= Number(p.minStock)),
          }));
          setProducts(mapped);
        } else {
          setProducts(INITIAL_FALLBACK_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_FALLBACK_PRODUCTS);
      }

      if (movRes.ok) {
        const movData = await movRes.json();
        if (Array.isArray(movData)) {
          const mappedMovs: InventoryMovement[] = movData.map((m) => ({
            id: m.id,
            productId: m.productId,
            productName: m.productName || 'Insumo',
            type: (m.type || 'purchase') as InventoryMovementType,
            quantity: Number(m.quantity) || 0,
            notes: m.notes,
            createdAt: m.createdAt,
          }));
          setMovements(mappedMovs);
        }
      }
    } catch {
      setProducts(INITIAL_FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const lowStockProducts = useMemo(() => products.filter((p) => p.isLowStock), [products]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const totalInventoryValue = useMemo(
    () => products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCategory && p.category !== filterCategory) return false;
      if (showLowStockOnly && !p.isLowStock) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, filterCategory, showLowStockOnly, searchTerm]);

  const registerMovement = useCallback(
    async (productId: string, type: InventoryMovementType, quantity: number, notes?: string): Promise<boolean> => {
      if (!productId || quantity <= 0) return false;
      const targetProd = products.find((p) => p.id === productId);
      if (!targetProd) return false;

      try {
        const res = await fetch('/api/inventory/movements', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productId,
            type,
            quantity,
            notes: notes?.trim() || undefined,
          }),
        });
        if (res.ok) {
          await fetchInventory();
          return true;
        }
      } catch {
        // Fallback local
      }

      // Cálculo local
      const isIngreso = type === 'purchase' || type === 'return';
      const isAjuste = type === 'adjustment';
      const delta = isAjuste ? quantity - targetProd.currentStock : isIngreso ? quantity : -quantity;
      const newStock = Math.max(0, targetProd.currentStock + delta);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, currentStock: newStock, isLowStock: newStock <= p.minStock }
            : p,
        ),
      );

      const newMov: InventoryMovement = {
        id: `m-${Date.now()}`,
        productId,
        productName: targetProd.name,
        type,
        quantity,
        notes: notes?.trim(),
        createdAt: new Date().toISOString(),
      };
      setMovements((prev) => [newMov, ...prev]);
      return true;
    },
    [products, fetchInventory],
  );

  return {
    products,
    movements,
    lowStockProducts,
    categories,
    totalInventoryValue,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    showLowStockOnly,
    setShowLowStockOnly,
    registerMovement,
    recordMovement: registerMovement,
    isLoading,
    refreshInventory: fetchInventory,
  };
}
