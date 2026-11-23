import { useState, useMemo, useCallback } from 'react';

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

const INITIAL_PRODUCTS: InventoryProduct[] = [
  { id: 'p1', name: 'Alcohol Isopropílico 70%', sku: 'ALC-70', category: 'Antisépticos', unit: 'ml', currentStock: 450, minStock: 200, costPrice: 0.05, sellPrice: 0.08, isLowStock: false },
  { id: 'p2', name: 'Guantes Nitrilo M', sku: 'GLV-NIT-M', category: 'EPP', unit: 'par', currentStock: 30, minStock: 100, costPrice: 0.8, sellPrice: 1.5, isLowStock: true },
  { id: 'p3', name: 'Algodón Estéril', sku: 'ALG-EST', category: 'Insumos', unit: 'gr', currentStock: 80, minStock: 80, costPrice: 0.06, sellPrice: 0.1, isLowStock: true },
  { id: 'p4', name: 'Jeringa 5cc', sku: 'JER-5CC', category: 'Descartables', unit: 'unidad', currentStock: 500, minStock: 100, costPrice: 0.3, sellPrice: 0.8, isLowStock: false },
];

const INITIAL_MOVEMENTS: InventoryMovement[] = [
  { id: 'm1', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'purchase', quantity: 1000, notes: 'Pedido mensual', createdAt: '2026-09-01T08:00:00Z' },
  { id: 'm2', productId: 'p2', productName: 'Guantes Nitrilo M', type: 'sale', quantity: 70, notes: 'Sesión fisioterapia', createdAt: '2026-09-02T09:30:00Z' },
  { id: 'm3', productId: 'p1', productName: 'Alcohol Isopropílico 70%', type: 'waste', quantity: 50, notes: 'Vencimiento lote', createdAt: '2026-09-02T11:00:00Z' },
];

export function useInventoryKardex() {
  const [products, setProducts] = useState<InventoryProduct[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

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
      if (showLowStockOnly && !p.isLowStock) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, showLowStockOnly, filterCategory, searchTerm]);

  const recordMovement = useCallback(
    (productId: string, type: InventoryMovementType, quantity: number, notes?: string) => {
      const target = products.find((p) => p.id === productId);
      if (!target || !quantity || quantity <= 0) return false;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          let newStock = p.currentStock;
          if (type === 'purchase' || type === 'return') newStock += quantity;
          else if (type === 'adjustment') newStock = quantity;
          else newStock = Math.max(0, newStock - quantity);

          return {
            ...p,
            currentStock: newStock,
            isLowStock: newStock <= p.minStock,
          };
        }),
      );

      // Registrar en vivo en el historial del Kardex
      const newMov: InventoryMovement = {
        id: `m-${Date.now()}`,
        productId,
        productName: target.name,
        type,
        quantity,
        notes: notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setMovements((prev) => [newMov, ...prev]);
      return true;
    },
    [products],
  );

  return {
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
  };
}
