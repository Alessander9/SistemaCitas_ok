import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  VoiceConsultationAssistant,
  parseClinicalSpeech,
} from './VoiceConsultationAssistant';

describe('VoiceConsultationAssistant & Clinical NLP Parser', () => {
  it('parses chief complaint, EVA pain scale, diagnosis and prescription correctly from speech text', () => {
    const rawSpeech =
      'Motivo de consulta: Dolor lumbar severo. Escala de dolor EVA 8 sobre 10. Examen físico: Contractura paravertebral moderada. Diagnóstico: Lumbalgia mecánica aguda. Plan de tratamiento: 10 sesiones de fisioterapia. Técnicas: Terapia Manual y Ultrasonido. Recetar: Celecoxib 200mg cada 12 horas por 5 días.';

    const parsed = parseClinicalSpeech(rawSpeech);

    expect(parsed.chiefComplaint).toBe('Dolor lumbar severo');
    expect(parsed.painScale).toBe(8);
    expect(parsed.physicalExam).toBe('Contractura paravertebral moderada');
    expect(parsed.diagnosis).toBe('Lumbalgia mecánica aguda');
    expect(parsed.treatmentPlan).toBe('10 sesiones de fisioterapia');
    expect(parsed.techniques).toContain('Terapia Manual Ortopédica');
    expect(parsed.techniques).toContain('Ultrasonido Terapéutico');
    expect(parsed.medications).toBeDefined();
    expect(parsed.medications![0].medicationName).toContain('Celecoxib 200mg');
  });

  it('renders floating voice button and opens assistant drawer', () => {
    const onApply = vi.fn();
    render(<VoiceConsultationAssistant onApplyVoiceData={onApply} />);

    // FAB button should be visible
    const fabButton = screen.getByLabelText(/Botón de dictado por voz/i);
    expect(fabButton).toBeInTheDocument();

    // Click to open drawer
    fireEvent.click(fabButton);
    expect(screen.getByText(/Asistente Clínico Inteligente/i)).toBeInTheDocument();
  });

  it('applies quick preset dictation and triggers callback', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onApply = vi.fn();
    render(<VoiceConsultationAssistant onApplyVoiceData={onApply} isOpenInitial={true} />);

    // Open sample dictation list
    const showPresetsBtn = screen.getByText(/Ver Ejemplos \(1-Click\)/i);
    fireEvent.click(showPresetsBtn);

    // Click on Lumbalgia preset
    const lumbalgiaPreset = screen.getByText(/Consulta Completa: Lumbalgia/i);
    fireEvent.click(lumbalgiaPreset);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalled();
    });
    const calledData = onApply.mock.calls[0][0];
    expect(calledData.chiefComplaint).toBeDefined();
    expect(calledData.painScale).toBe(7);
    warnSpy.mockRestore();
  });
});
