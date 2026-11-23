import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClinicalKnowledgeAdminPage } from './ClinicalKnowledgeAdminPage';
import * as api from '../../services/api';

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../services/api')>('../../services/api');
  return {
    ...actual,
    fetchClinicalKnowledgeOverview: vi.fn(),
    createClinicalProtocol: vi.fn(),
    deleteClinicalProtocol: vi.fn(),
    createVademecumItem: vi.fn(),
    deleteVademecumItem: vi.fn(),
    createVoiceMacro: vi.fn(),
    deleteVoiceMacro: vi.fn(),
    updateClinicVoiceSettings: vi.fn(),
  };
});

describe('ClinicalKnowledgeAdminPage (Panel de Conocimiento Médico IA)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchClinicalKnowledgeOverview).mockResolvedValue({
      protocols: [
        {
          id: 'proto-1',
          pathology: 'Lumbalgia mecánica aguda',
          phase: 'Fase 1 · Control del Dolor',
          recommendedTechniques: ['Terapia Manual Ortopédica'],
          homeExercises: 'Compresas tibias 15 min',
          durationSessions: 10,
        },
      ],
      vademecum: [
        {
          id: 'vad-1',
          medicationName: 'Ibuprofeno 400mg',
          activeIngredient: 'Ibuprofeno',
          drugClass: 'AINE',
          defaultDose: '1 comprimido',
          defaultFrequency: 'Cada 8 horas',
          defaultDuration: 'Por 3 días',
          allergyKeywords: ['ibuprofeno', 'aine'],
        },
      ],
      macros: [
        {
          id: 'mac-1',
          triggerPhrase: 'control lumbar favorable',
          title: 'Control Lumbar Favorable',
          templateData: { anamnesis: 'Evolución favorable' },
        },
      ],
      voiceSettings: {
        wakeWord: 'Chanfainita',
        wakeAliases: ['chanfainita', 'chanfa'],
        defaultMode: 'ambient',
        privacyModeDefault: false,
      },
      alertsAudit: [
        {
          id: 'aud-1',
          alertType: 'allergy',
          severity: 'critical',
          title: 'Conflicto de Alergia: Ibuprofeno 400mg',
          detail: 'Paciente alérgico a AINEs.',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });

  it('renders all 4 tabs and loads protocols from backend overview', async () => {
    render(<ClinicalKnowledgeAdminPage />);

    expect(await screen.findByText(/Lumbalgia mecánica aguda/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1\. Protocolos Clínicos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\. Vademécum & Alergias/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. Macros & Nombre de Invocación/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. Auditoría de Alertas/i })).toBeInTheDocument();
  });

  it('creates a new clinical protocol and displays instant confirmation', async () => {
    vi.mocked(api.createClinicalProtocol).mockResolvedValueOnce({
      id: 'proto-2',
      pathology: 'Fascitis plantar',
      phase: 'Fase 1 · Control del Dolor',
      recommendedTechniques: ['Crioterapia'],
      homeExercises: 'Estiramiento de fascia con botella fría',
      durationSessions: 10,
    });

    render(<ClinicalKnowledgeAdminPage />);
    await screen.findByText(/Lumbalgia mecánica aguda/i);

    fireEvent.change(screen.getByPlaceholderText(/Ej\. Tendinitis rotuliana/i), {
      target: { value: 'Fascitis plantar' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Crioterapia 15 min/i), {
      target: { value: 'Estiramiento de fascia con botella fría' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Protocolo/i }));

    await waitFor(() => {
      expect(api.createClinicalProtocol).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Fascitis plantar')).toBeInTheDocument();
  });

  it('switches across Vademecum, Macros/Wake-Word and Alerts Audit tabs', async () => {
    vi.mocked(api.updateClinicVoiceSettings).mockResolvedValueOnce({
      wakeWord: 'Chanfainita',
      wakeAliases: ['chanfainita', 'chanfa'],
      defaultMode: 'ambient',
      privacyModeDefault: true,
    });

    render(<ClinicalKnowledgeAdminPage />);
    await screen.findByText(/Lumbalgia mecánica aguda/i);

    // Tab 2: Vademecum
    fireEvent.click(screen.getByRole('button', { name: /2\. Vademécum & Alergias/i }));
    expect(screen.getByText(/Ibuprofeno 400mg/i)).toBeInTheDocument();

    // Tab 3: Macros & Wake-Word
    fireEvent.click(screen.getByRole('button', { name: /3\. Macros & Nombre de Invocación/i }));
    expect(screen.getAllByText(/Control Lumbar Favorable/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Guardar Configuración de Voz/i }));
    await waitFor(() => {
      expect(api.updateClinicVoiceSettings).toHaveBeenCalledTimes(1);
    });

    // Tab 4: Alerts Audit
    fireEvent.click(screen.getByRole('button', { name: /4\. Auditoría de Alertas/i }));
    expect(screen.getByText(/Conflicto de Alergia: Ibuprofeno 400mg/i)).toBeInTheDocument();
  });
});
