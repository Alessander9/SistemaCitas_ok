import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingWizard } from './BookingWizard';

describe('BookingWizard (11-Step Booking Flow)', () => {
  it('renders Step 1 (Specialty selection) initially', () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    expect(screen.getByRole('heading', { name: /1\. Selecciona la Especialidad Médica/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 11/i)).toBeInTheDocument();
  });

  it('progresses through steps when selections are made and valid', () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    // Step 1: Select Specialty
    const firstSpecialty = screen.getByText('Fisioterapia y Rehabilitación');
    fireEvent.click(firstSpecialty);

    const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
    fireEvent.click(nextBtn);

    // Step 2: Select Service
    expect(screen.getByRole('heading', { name: /2\. Selecciona el Servicio/i })).toBeInTheDocument();
    const firstService = screen.getByText('Evaluación y Diagnóstico Físico Inicial');
    fireEvent.click(firstService);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 3: Select Professional
    expect(screen.getByRole('heading', { name: /3\. Elige a tu Profesional/i })).toBeInTheDocument();
    const autoProfessional = screen.getByText(/Cualquier Profesional Disponible/i);
    fireEvent.click(autoProfessional);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 4: Select Date
    expect(screen.getByRole('heading', { name: /4\. Selecciona el Día de tu Cita/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 5: Select Time Slot
    expect(screen.getByRole('heading', { name: /5\. Selecciona la Franja Horaria/i })).toBeInTheDocument();
    const timeSlot = screen.getByText('09:30');
    fireEvent.click(timeSlot);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 6: Patient Information
    expect(screen.getByRole('heading', { name: /6\. Datos del Paciente/i })).toBeInTheDocument();
  });

  it('validates required fields on Patient Info (Step 6)', () => {
    const onBackToHome = vi.fn();
    render(<BookingWizard onBackToHome={onBackToHome} />);

    // Fast-forward to step 6 by completing 1-5
    fireEvent.click(screen.getByText('Fisioterapia y Rehabilitación'));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fireEvent.click(screen.getByText('Evaluación y Diagnóstico Físico Inicial'));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fireEvent.click(screen.getByText(/Cualquier Profesional Disponible/i));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i })); // Date
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i })); // Time

    // In Step 6: Click Siguiente without filling data
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Por favor completa todos los campos obligatorios/i)).toBeInTheDocument();
  });
});
