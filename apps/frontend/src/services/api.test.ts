import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchDayAvailability,
  processVoiceDictation,
  saveVoiceConsultation,
  generatePatientSummary,
  fetchPatientBriefing,
  deductConfirmedSupplies,
  fetchClinicalKnowledgeOverview,
  createClinicalProtocol,
  updateClinicVoiceSettings,
} from './api';

describe('Frontend API Contract Tests (JWT, URLs, Payloads & Error Handling)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vitalsalud_access_token', 'jwt-token-test-123');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends JWT Authorization header and bilateral payload in processVoiceDictation', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          parsedData: { painScale: 6 },
          missingFields: [],
          isComplete: true,
          spokenAlert: 'Anotado.',
          providerUsed: 'Chanfainita',
          rawTranscript: 'Chanfainita, apunta dolor 6',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const res = await processVoiceDictation('Chanfainita, apunta dolor 6', { chiefComplaint: 'Lumbalgia' }, {
      mode: 'ambient',
      patientId: 'pat-1',
      patientAllergies: 'Ibuprofeno',
      privacyMode: true,
    });

    expect(res.isComplete).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/clinical/voice-assistant/process');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer jwt-token-test-123');
    expect(JSON.parse(init.body)).toMatchObject({
      transcript: 'Chanfainita, apunta dolor 6',
      mode: 'ambient',
      patientId: 'pat-1',
      patientAllergies: 'Ibuprofeno',
      privacyMode: true,
    });
  });

  it('propagates HTTP 401/403 errors cleanly in saveVoiceConsultation', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Forbidden resource' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      saveVoiceConsultation({
        patientId: 'pat-1',
        clinicalData: { chiefComplaint: 'Dolor lumbar' },
      }),
    ).rejects.toThrow('Forbidden resource');
  });

  it('calls patient-summary, briefing and deduct-supplies with expected routes and payloads', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ whatsappMessage: 'Hola Rosa', portalSummary: 'Hola Rosa', provider: 'Local' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ lines: ['A', 'B', 'C'], spokenBriefing: 'Resumen', allergies: 'Ninguna' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ deductedCount: 1, details: ['Agujas × 2 descontado'] }), {
          status: 200,
        }),
      );

    const summary = await generatePatientSummary({ diagnosis: 'Lumbalgia' }, 'Rosa');
    expect(summary.whatsappMessage).toBe('Hola Rosa');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/clinical/voice-assistant/patient-summary');

    const briefing = await fetchPatientBriefing('pat-1', { patientName: 'Rosa', evaLast: 6 });
    expect(briefing.lines).toHaveLength(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/api/clinical/voice-assistant/briefing/pat-1');
    expect(fetchMock.mock.calls[1][0]).toContain('evaLast=6');

    const deduct = await deductConfirmedSupplies([{ name: 'Agujas', quantity: 2 }], 'CONSULTA-1');
    expect(deduct.deductedCount).toBe(1);
    expect(fetchMock.mock.calls[2][0]).toBe('/api/clinical/voice-assistant/deduct-supplies');
  });

  it('calls clinical knowledge admin endpoints with JWT headers', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ protocols: [], vademecum: [], macros: [], alertsAudit: [], voiceSettings: { wakeWord: 'Chanfainita', wakeAliases: ['chanfainita'], defaultMode: 'ambient', privacyModeDefault: false } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'p-1', pathology: 'Hombro' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ wakeWord: 'Chanfainita', wakeAliases: ['chanfainita'], defaultMode: 'ambient', privacyModeDefault: true }), { status: 200 }));

    const overview = await fetchClinicalKnowledgeOverview();
    expect(overview.voiceSettings.wakeWord).toBe('Chanfainita');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/clinical/knowledge/overview');

    const created = await createClinicalProtocol({
      pathology: 'Hombro',
      phase: 'Fase 1',
      recommendedTechniques: ['Crioterapia'],
      homeExercises: 'Pendulares',
    });
    expect(created.id).toBe('p-1');
    expect(fetchMock.mock.calls[1][1].method).toBe('POST');

    const updated = await updateClinicVoiceSettings({ privacyModeDefault: true });
    expect(updated.privacyModeDefault).toBe(true);
    expect(fetchMock.mock.calls[2][1].method).toBe('PUT');
  });

  it('calls the real backend /api/appointments/availability route with date, serviceId and professionalId', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          { startTime: '09:00', endTime: '09:30', available: true },
          { startTime: '09:30', endTime: '10:00', available: false },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const slots = await fetchDayAvailability({
      startDate: '2026-11-25',
      durationMinutes: 30,
      serviceId: 'srv-1',
      professionalId: 'prof-1',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('/api/appointments/availability?');
    expect(calledUrl).toContain('date=2026-11-25');
    expect(calledUrl).toContain('serviceId=srv-1');
    expect(calledUrl).toContain('professionalId=prof-1');
    expect(slots).toHaveLength(2);
    expect(slots[0].available).toBe(true);
    expect(slots[1].available).toBe(false);
  });
});
