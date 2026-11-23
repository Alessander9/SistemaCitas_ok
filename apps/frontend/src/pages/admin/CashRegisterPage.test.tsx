import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CashRegisterPage } from './CashRegisterPage';

describe('CashRegisterPage (Pruebas de comportamiento accesibles)', () => {
  it('muestra el encabezado de Caja Chica y el estado de caja abierta', () => {
    render(<CashRegisterPage />);
    expect(screen.getByRole('heading', { name: /Caja Chica/i })).toBeInTheDocument();
    expect(screen.getByText(/CAJA ABIERTA/i)).toBeInTheDocument();
  });

  it('muestra la tabla de movimientos del turno con al menos 3 registros', () => {
    render(<CashRegisterPage />);
    const rows = screen.getAllByRole('row');
    // 1 fila de cabecera + al menos 3 filas de movimientos
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it('permite abrir el formulario de registro de movimiento desde el botón visible', () => {
    render(<CashRegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /Registrar Movimiento/i }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('permite abrir el formulario de arqueo y cierre de caja desde el botón visible', () => {
    render(<CashRegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Caja/i }));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });
});
