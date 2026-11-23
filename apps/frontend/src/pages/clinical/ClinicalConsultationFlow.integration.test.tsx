import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClinicalConsultationView } from './ClinicalConsultationView';
import * as api from '../../services/api';

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../services/api')>('../../services/api');
  return {
    ...actual,
    processVoiceDictation: vi.fn(),
    generatePatientSummary: vi.fn(),
    deductConfirmedSupplies: vi.fn(),
    fetchPainMap: vi.fn().mockResolvedValue([]),
    savePainMap: vi.fn().mockResolvedValue([]),
  };
});

describe('Flujo Integrado: Consulta Clínica + Chanfainita + Kardex + Resumen WhatsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integra dictado de Chanfainita -> rellena ficha + pre-selecciona insumos -> descuenta Kardex solo al guardar', async () => {
    vi.mocked(api.processVoiceDictation).mockResolvedValueOnce({
      parsedData: {
        chiefComplaint: 'Lumbalgia aguda por esfuerzo',
        painScale: 6,
        diagnosis: 'M54.5 - Lumbalgia mecánica aguda',
      },
      missingFields: [],
      isComplete: true,
      spokenAlert: 'Anotado como lumbalgia mecánica aguda con dolor de 6.',
      providerUsed: 'Chanfainita · Test',
      rawTranscript: 'Chanfainita, apunta lumbalgia aguda con 2 agujas de punción seca',
      mode: 'active',
      wakeWordDetected: true,
      intent: 'DICTATE_OR_CORRECT',
      shouldSpeak: false,
      clinicalAlerts: [],
      suggestedSupplies: [{ productId: 'prod-1', name: 'Agujas de punción seca', quantity: 2, unit: 'unidad' }],
    });

    vi.mocked(api.deductConfirmedSupplies).mockResolvedValueOnce({
      deductedCount: 1,
      details: ['Agujas de punción seca × 2 descontado de Kardex'],
    });

    render(
      <ClinicalConsultationView
        onBack={vi.fn()}
        patientData={{ patientName: 'Rosa Morales Silva', dni: '09843211', evaLast: 8 }}
      />,
    );

    // 1. El médico abre el panel flotante de Chanfainita y dispara una macro rápida
    fireEvent.click(screen.getByRole('button', { name: /Botón de dictado por voz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Control Lumbar Favorable/i }));

    // 2. El usuario ve la ficha actualizada y el chip de insumo pre-seleccionado (sin haber descontado aún)
    expect(await screen.findByDisplayValue('Lumbalgia aguda por esfuerzo')).toBeInTheDocument();
    expect(await screen.findByText('Agujas de punción seca')).toBeInTheDocument();
    expect(api.deductConfirmedSupplies).not.toHaveBeenCalled();

    // 3. Al confirmar y guardar la ficha, se descuenta del Kardex y se muestra confirmación visible
    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha y Evolución/i }));

    await waitFor(() => {
      expect(api.deductConfirmedSupplies).toHaveBeenCalledWith(
        [{ productId: 'prod-1', name: 'Agujas de punción seca', quantity: 2 }],
        'CONSULTA-09843211',
      );
    });
    expect(await screen.findByText(/Kardex actualizado/i)).toBeInTheDocument();
  });

  it('muestra estado de carga cuando la API de resumen post-consulta tarda en responder', async () => {
    let resolveSummary!: (value: { whatsappMessage: string; portalSummary: string; provider: string }) => void;
    vi.mocked(api.generatePatientSummary).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSummary = resolve;
      }),
    );

    render(
      <ClinicalConsultationView
        onBack={vi.fn()}
        patientData={{ patientName: 'Rosa Morales Silva', dni: '09843211', evaLast: 6 }}
      />,
    );

    const genBtn = screen.getByRole('button', { name: /Generar Resumen Claro/i });
    fireEvent.click(genBtn);

    // Mientras la API tarda, el botón muestra estado de espera y queda deshabilitado
    expect(screen.getByRole('button', { name: /Generando/i })).toBeDisabled();

    // Al resolver la promesa, aparece el mensaje claro listo para WhatsApp
    resolveSummary({
      whatsappMessage: 'Hola Rosa Morales Silva, recuerda tus ejercicios suaves.',
      portalSummary: 'Recuerda tus ejercicios suaves.',
      provider: 'Chanfainita',
    });

    expect(await screen.findByDisplayValue(/recuerda tus ejercicios suaves/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Enviar por WhatsApp/i })).toBeInTheDocument();
  });

  it('mantiene operativa la consulta si la API falla con error de red (fallback seguro sin crashear)', async () => {
    vi.mocked(api.generatePatientSummary).mockRejectedValueOnce(new Error('Network Error 500'));
    vi.mocked(api.deductConfirmedSupplies).mockRejectedValueOnce(new Error('Database timeout'));

    render(
      <ClinicalConsultationView
        onBack={vi.fn()}
        patientData={{ patientName: 'Rosa Morales Silva', dni: '09843211', evaLast: 7 }}
      />,
    );

    // 1. Si falla el endpoint de resumen IA, el usuario igual recibe un resumen local limpio sin códigos CIE-10
    fireEvent.click(screen.getByRole('button', { name: /Generar Resumen Claro/i }));
    const summaryArea = (await screen.findByDisplayValue(/Hola Rosa Morales Silva/i)) as HTMLTextAreaElement;
    expect(summaryArea.value).not.toMatch(/M54\.4|CIE-?10/i);

    // 2. Si falla el descuento de Kardex al guardar, la ficha igualmente se guarda sin bloquear al médico
    fireEvent.click(screen.getByRole('button', { name: /\+ Agregar Insumo/i }));
    expect(screen.getByText('Agujas de punción seca')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha y Evolución/i }));

    await waitFor(() => {
      expect(api.deductConfirmedSupplies).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByText(/Atención médica y evolución registradas exitosamente/i),
    ).toBeInTheDocument();
  });
});
