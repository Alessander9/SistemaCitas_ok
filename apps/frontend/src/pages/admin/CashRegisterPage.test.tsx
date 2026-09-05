import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CashRegisterPage } from './CashRegisterPage';

describe('CashRegisterPage', () => {
  it('should render without errors and show the page title', () => {
    render(<CashRegisterPage />);
    expect(screen.getByText('Caja Chica')).toBeTruthy();
  });

  it('should display open cash status badge when register is open', () => {
    render(<CashRegisterPage />);
    const badge = document.getElementById('cash-status-badge');
    expect(badge?.textContent).toContain('CAJA ABIERTA');
  });

  it('should display movements table with mock data', () => {
    render(<CashRegisterPage />);
    const table = document.getElementById('movements-table');
    expect(table).toBeTruthy();
    // Mock has 3 movements
    const rows = table?.querySelectorAll('tbody tr');
    expect(rows?.length).toBeGreaterThanOrEqual(3);
  });

  it('should show movement form when clicking Registrar Movimiento button', () => {
    render(<CashRegisterPage />);
    const btn = document.getElementById('btn-add-movement');
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(document.getElementById('movement-type')).toBeTruthy();
    expect(document.getElementById('movement-amount')).toBeTruthy();
  });

  it('should show close form when clicking Cerrar Caja button', () => {
    render(<CashRegisterPage />);
    const closeBtn = document.getElementById('btn-close-cash');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(document.getElementById('closing-amount')).toBeTruthy();
  });
});
