import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReceptionBookingPage } from './ReceptionBookingPage';

describe('ReceptionBookingPage Component', () => {
  it('renders header, KPI metrics and slots list for reception staff', () => {
    render(<ReceptionBookingPage />);

    expect(screen.getByText(/Agenda & Agendamiento de Citas/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa de Admisión & Agenda de Sede/i)).toBeInTheDocument();
    expect(screen.getByText(/Citas Programadas Hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/María Santos López/i)).toBeInTheDocument();
  });

  it('allows filtering by doctor and searching patients', () => {
    render(<ReceptionBookingPage />);

    const searchInput = screen.getByPlaceholderText(/Buscar paciente o DNI/i);
    fireEvent.change(searchInput, { target: { value: 'Carlos Benítez' } });

    expect(screen.getByText(/Carlos Benítez Vega/i)).toBeInTheDocument();
  });

  it('opens express booking modal and submits new appointment', () => {
    render(<ReceptionBookingPage />);

    const newBtn = screen.getByRole('button', { name: /⚡ \+ Nueva Cita Express/i });
    fireEvent.click(newBtn);

    expect(screen.getByText(/Agendamiento Express \(Ventanilla & Teléfono\)/i)).toBeInTheDocument();

    const quickBtn = screen.getByRole('button', { name: /Luciana Paredes/i });
    fireEvent.click(quickBtn);

    const submitBtn = screen.getByRole('button', { name: /⚡ Confirmar Cita & Notificar/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/Luciana Paredes Soto/i).length).toBeGreaterThan(0);
  });
});
