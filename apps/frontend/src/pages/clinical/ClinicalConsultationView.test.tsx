import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClinicalConsultationView } from './ClinicalConsultationView';

describe('ClinicalConsultationView Component', () => {
  it('renders active patient sidebar info and initial medical record tab', () => {
    const onBack = vi.fn();
    render(<ClinicalConsultationView onBack={onBack} />);

    expect(screen.getByText('Carlos Benítez Vega')).toBeInTheDocument();
    expect(screen.getByText(/DNI: 72109845/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo de Consulta/i)).toBeInTheDocument();
    expect(screen.getByText(/Escala Analógica Visual de Dolor \(EVA\)/i)).toBeInTheDocument();
  });

  it('correctly loads called patient data when passed via props', () => {
    const onBack = vi.fn();
    render(
      <ClinicalConsultationView
        onBack={onBack}
        patientData={{
          patientName: 'Rosa Morales Silva',
          dni: '09843211',
          age: '48 años',
          reason: 'Lumbalgia aguda con irradiación ciática',
          service: 'Terapia Manual Ortopédica',
          evaLast: 8,
        }}
      />
    );

    expect(screen.getByText('Rosa Morales Silva')).toBeInTheDocument();
    expect(screen.getByText(/DNI: 09843211/i)).toBeInTheDocument();
    expect(screen.getByText(/48 años/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Lumbalgia aguda con irradiación ciática/i)).toBeInTheDocument();
    expect(screen.getByText(/Nivel Seleccionado: 8\/10/i)).toBeInTheDocument();
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
    expect(screen.getByDisplayValue('Ibuprofeno 400mg')).toBeInTheDocument();
  });

  it('submits form and displays success message', () => {
    const onBack = vi.fn();
    render(<ClinicalConsultationView onBack={onBack} />);

    const saveBtn = screen.getByRole('button', { name: /Guardar Ficha y Evolución/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Atención médica y evolución registradas exitosamente/i)).toBeInTheDocument();
  });

  it('supports on-demand 10s briefing, Kardex supply chips, and patient-friendly WhatsApp summary', async () => {
    const onBack = vi.fn();
    render(
      <ClinicalConsultationView
        onBack={onBack}
        patientData={{
          patientName: 'Rosa Morales Silva',
          dni: '09843211',
          reason: 'Lumbalgia aguda',
          evaLast: 7,
        }}
      />,
    );

    // 1. Briefing rápido visible con botón bajo demanda
    expect(screen.getByText(/Briefing Rápido \(10s\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Escuchar resumen \(10s\)/i })).toBeInTheDocument();

    // 2. Pre-selección de insumos para Kardex con incremento de cantidad
    fireEvent.click(screen.getByRole('button', { name: /\+ Agregar Insumo/i }));
    expect(screen.getByText('Agujas de punción seca')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('×3')).toBeInTheDocument();

    // 3. Traductor a lenguaje de paciente post-consulta (sin códigos CIE-10)
    fireEvent.click(screen.getByRole('button', { name: /Generar Resumen Claro/i }));
    const textarea = (await screen.findByDisplayValue(/Hola Rosa Morales Silva/i)) as HTMLTextAreaElement;
    expect(textarea.value).not.toMatch(/M54\.4|CIE-?10/i);
    expect(screen.getByRole('link', { name: /Enviar por WhatsApp/i })).toBeInTheDocument();
  });
});
