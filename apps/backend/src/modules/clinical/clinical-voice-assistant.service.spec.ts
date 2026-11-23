import { ClinicalKnowledgeService } from './clinical-knowledge.service';
import { ClinicalVoiceAssistantService } from './clinical-voice-assistant.service';
import { DatabaseService } from '../../database/database.service';

describe('ClinicalVoiceAssistantService ("Chanfainita" Ambient + Bilateral)', () => {
  let knowledge: ClinicalKnowledgeService;
  let service: ClinicalVoiceAssistantService;

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    const mockDb = {
      query: jest.fn().mockRejectedValue(new Error('use deterministic fallback')),
    } as unknown as DatabaseService;

    knowledge = new ClinicalKnowledgeService(mockDb);
    service = new ClinicalVoiceAssistantService(mockDb, knowledge);
  });

  it('stays completely silent in ambient mode while silently coding CIE-10 into diagnosis', async () => {
    const res = await service.processDictation(
      'Paciente refiere dolor lumbar agudo de espalda baja con dolor 7 sobre 10.',
      {},
      { mode: 'ambient' },
    );

    expect(res.mode).toBe('ambient');
    expect(res.wakeWordDetected).toBe(false);
    expect(res.shouldSpeak).toBe(false);
    expect(res.spokenAlert).toBe('');
    expect(res.parsedData.painScale).toBe(7);
    expect(res.parsedData.diagnosis).toContain('M54.5');
  });

  it('activates on wake-word "Chanfainita" and speaks in human language without reciting CIE-10 codes', async () => {
    const res = await service.processDictation(
      'Oye Chanfainita, apunta dolor lumbar agudo con dolor 6 sobre 10.',
      {},
      { mode: 'ambient' },
    );

    expect(res.mode).toBe('active');
    expect(res.wakeWordDetected).toBe(true);
    expect(res.shouldSpeak).toBe(true);
    expect(res.parsedData.diagnosis).toContain('M54.5');
    // Regla de Doble Canal: la voz NUNCA recita códigos CIE-10
    expect(res.spokenAlert).not.toMatch(/M54\.5|CIE-?10/i);
    expect(res.spokenAlert.toLowerCase()).toContain('lumbalgia');
  });

  it('answers patient allergy questions without modifying clinical form fields', async () => {
    const existing = { chiefComplaint: 'Dolor de hombro', painScale: 5 };
    const res = await service.processDictation(
      'Chanfainita, ¿qué alergias tiene este paciente?',
      existing,
      { mode: 'ambient', patientAllergies: 'Alergia a AINEs (Ibuprofeno)' },
    );

    expect(res.intent).toBe('ASK_PATIENT_HISTORY');
    expect(res.shouldSpeak).toBe(true);
    expect(res.spokenAlert).toContain('Ibuprofeno');
    expect(res.parsedData).toEqual(existing);
  });

  it('answers clinical protocol questions from the knowledge base without modifying the form', async () => {
    const res = await service.processDictation(
      'Chanfainita, ¿qué ejercicios recomendamos para el protocolo de hombro?',
      {},
      { mode: 'ambient' },
    );

    expect(res.intent).toBe('ASK_CLINICAL_PROTOCOL');
    expect(res.shouldSpeak).toBe(true);
    expect(res.spokenAlert.toLowerCase()).toContain('codman');
  });

  it('triggers critical allergy guardrail when Ibuprofeno is mentioned for an AINE-allergic patient', async () => {
    const res = await service.processDictation(
      'Chanfainita, apunta recetar Ibuprofeno 400mg cada 8 horas.',
      {},
      { mode: 'ambient', patientAllergies: 'AINEs' },
    );

    expect(res.clinicalAlerts.length).toBeGreaterThan(0);
    expect(res.clinicalAlerts[0].type).toBe('allergy');
    expect(res.spokenAlert.toLowerCase()).toContain('paracetamol');
  });

  it('detects red flags and respects privacyMode by keeping shouldSpeak false', async () => {
    const res = await service.processDictation(
      'Chanfainita, apunta anestesia en silla de montar e incontinencia urinaria.',
      {},
      { mode: 'ambient', privacyMode: true },
    );

    expect(res.clinicalAlerts.some((a) => a.type === 'red_flag')).toBe(true);
    expect(res.shouldSpeak).toBe(false);
  });

  it('recognizes undo command ("Chanfainita, deshaz lo último")', async () => {
    const res = await service.processDictation(
      'Chanfainita, deshaz lo último',
      { painScale: 8 },
      { mode: 'ambient' },
    );

    expect(res.intent).toBe('UNDO');
    expect(res.shouldSpeak).toBe(true);
  });

  it('pre-selects mentioned clinical supplies for Kardex confirmation', async () => {
    const res = await service.processDictation(
      'Usamos 2 agujas de punción seca y cinta kinesiotape en la zona lumbar.',
      {},
      { mode: 'ambient' },
    );

    expect(res.suggestedSupplies).toBeDefined();
    expect(res.suggestedSupplies!.some((s) => s.name.toLowerCase().includes('aguja') && s.quantity === 2)).toBe(true);
    expect(res.suggestedSupplies!.some((s) => s.name.toLowerCase().includes('kinesiotape'))).toBe(true);
  });

  it('generates patient-friendly post-consultation summary without CIE-10 codes', async () => {
    const summary = await service.generatePatientSummary(
      {
        diagnosis: 'M54.5 - Lumbalgia mecánica aguda',
        techniques: ['Terapia Manual Ortopédica'],
        medications: [
          {
            medicationName: 'Paracetamol 500mg',
            dose: '1 tableta',
            route: 'Oral',
            frequency: 'Cada 8 horas',
            duration: 'Por 3 días',
          },
        ],
        homeRecommendations: 'Compresas tibias 15 minutos antes de dormir.',
      },
      'Rosa Morales',
    );

    expect(summary.whatsappMessage).toContain('Rosa Morales');
    expect(summary.whatsappMessage).toContain('Paracetamol 500mg');
    expect(summary.whatsappMessage).not.toMatch(/M54\.5|CIE-?10/i);
  });

  it('builds a concise 10-second on-demand patient briefing without technical codes', async () => {
    const briefing = await service.getPatientBriefing('clinic-1', 'non-uuid', {
      patientName: 'Rosa Morales',
      allergies: 'Ibuprofeno',
      diagnosis: 'M54.4 - Lumbago con ciática',
      evaLast: 6,
      sessionLabel: 'Sesión 3 de 10',
    });

    expect(briefing.lines.length).toBe(3);
    expect(briefing.spokenBriefing).toContain('Rosa Morales');
    expect(briefing.spokenBriefing).toContain('Ibuprofeno');
    expect(briefing.spokenBriefing).not.toMatch(/M54\.4/i);
  });
});
