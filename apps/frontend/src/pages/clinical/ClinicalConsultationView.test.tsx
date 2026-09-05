import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClinicalConsultationView } from './ClinicalConsultationView';

describe('ClinicalConsultationView Component', () => {
  it('renders patient sidebar info and initial medical record tab', () => {
    const onBack = vi.fn();
    render(<ClinicalConsultationView onBack={onBack} />);

    expect(screen.getByText('Juan Pérez Gómez')).toBeInTheDocument();
    expect(screen.getByText(/DNI: 73829104/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo de Consulta/i)).toBeInTheDocument();
    expect(screen.getByText(/Escala Analógica Visual de Dolor \(EVA\)/i)).toBeInTheDocument();
  });

  it('allows interacting with EVA pain scale and tab switching', () => {
    const onBack = vi.fn();
    render(<ClinicalConsultationView onBack={onBack} />);

    // Click on EVA scale button 9
    const painBtn9 = screen.getByRole('button', { name: '9' });
    fireEvent.click(painBtn9);
    expect(screen.getByText(/Nivel Seleccionado: 9\/10/i)).toBeInTheDocument();

    // Switch to Evolución de Sesión Terapéutica
    const sessionTab = screen.getByRole('button', { name: /Evolución de Sesión Terapéutica/i });
    fireEvent.click(sessionTab);
    expect(screen.getByText(/Técnicas y Procedimientos Aplicados en la Sesión/i)).toBeInTheDocument();

    // Switch to Receta Médica
    const rxTab = screen.getByRole('button', { name: /Receta Médica Digital/i });
    fireEvent.click(rxTab);
    expect(screen.getByText(/Medicamentos Prescritos/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Celecoxib 200mg')).toBeInTheDocument();
  });

  it('submits form and displays success message', () => {
    const onBack = vi.fn();
    render(<ClinicalConsultationView onBack={onBack} />);

    const saveBtn = screen.getByRole('button', { name: /Guardar Ficha y Evolución/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Atención médica y evolución registradas exitosamente/i)).toBeInTheDocument();
  });
});
