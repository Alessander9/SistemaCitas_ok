import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryPage } from './InventoryPage';

describe('InventoryPage', () => {
  it('should render without errors and show the page title', () => {
    render(<InventoryPage />);
    expect(screen.getByText('Inventario & Kardex')).toBeTruthy();
  });

  it('should display low stock alert badge when products are below minimum', () => {
    render(<InventoryPage />);
    // mockProducts has 2 low-stock products
    const badge = document.getElementById('low-stock-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('2');
  });

  it('should display alerts panel for low stock products', () => {
    render(<InventoryPage />);
    const panel = document.getElementById('alerts-panel');
    expect(panel).toBeTruthy();
  });

  it('should render products table with mock data', () => {
    render(<InventoryPage />);
    const table = document.getElementById('products-table');
    expect(table).toBeTruthy();
    const rows = table?.querySelectorAll('tbody tr');
    expect(rows?.length).toBeGreaterThanOrEqual(4); // 4 mock products
  });

  it('should expand Kardex panel when clicking a product row', () => {
    render(<InventoryPage />);
    const table = document.getElementById('products-table');
    const firstRow = table?.querySelector('tbody tr.inv-row') as HTMLElement;
    expect(firstRow).toBeTruthy();
    fireEvent.click(firstRow);
    // Kardex panel should appear
    const kardexPanels = document.querySelectorAll('.kardex-panel');
    expect(kardexPanels.length).toBe(1);
  });

  it('should show movement form when clicking Ajustar Stock button', () => {
    render(<InventoryPage />);
    const btn = document.getElementById('btn-new-movement');
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(document.getElementById('mov-product')).toBeTruthy();
    expect(document.getElementById('mov-type')).toBeTruthy();
    expect(document.getElementById('mov-quantity')).toBeTruthy();
  });
});
