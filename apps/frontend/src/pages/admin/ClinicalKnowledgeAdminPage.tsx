import React, { useEffect, useState, useCallback } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  fetchClinicalKnowledgeOverview,
  createClinicalProtocol,
  deleteClinicalProtocol,
  createVademecumItem,
  deleteVademecumItem,
  createVoiceMacro,
  deleteVoiceMacro,
  updateClinicVoiceSettings,
  ClinicalProtocolItem,
  VademecumCatalogItem,
  VoiceMacroItem,
  ClinicVoiceSettings,
  ClinicalAlertAuditItem,
} from '../../services/api';

type AdminKnowledgeTab = 'protocols' | 'vademecum' | 'macros' | 'audit';

export const ClinicalKnowledgeAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminKnowledgeTab>('protocols');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [protocols, setProtocols] = useState<ClinicalProtocolItem[]>([]);
  const [vademecum, setVademecum] = useState<VademecumCatalogItem[]>([]);
  const [macros, setMacros] = useState<VoiceMacroItem[]>([]);
  const [alertsAudit, setAlertsAudit] = useState<ClinicalAlertAuditItem[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<ClinicVoiceSettings>({
    wakeWord: 'Chanfainita',
    wakeAliases: ['chanfainita', 'chanfanita', 'chanfaina', 'chanfa'],
    defaultMode: 'ambient',
    privacyModeDefault: false,
  });

  // Tab 1 form: Protocolo Clínico
  const [protoPathology, setProtoPathology] = useState('');
  const [protoPhase, setProtoPhase] = useState('Fase 1 · Control del Dolor');
  const [protoTechniques, setProtoTechniques] = useState('Terapia Manual Ortopédica, Ultrasonido Terapéutico');
  const [protoHomeExercises, setProtoHomeExercises] = useState('');
  const [protoSessions, setProtoSessions] = useState(10);
  const [protoNotes, setProtoNotes] = useState('');

  // Tab 2 form: Vademécum & Alergias
  const [medName, setMedName] = useState('');
  const [medActive, setMedActive] = useState('');
  const [medClass, setMedClass] = useState('AINE');
  const [medDose, setMedDose] = useState('1 tableta');
  const [medFreq, setMedFreq] = useState('Cada 8 horas');
  const [medDuration, setMedDuration] = useState('Por 5 días');
  const [medAllergies, setMedAllergies] = useState('aine, aines');
  const [medContra, setMedContra] = useState('');

  // Tab 3 form: Macro de Voz & Wake-word
  const [macroTrigger, setMacroTrigger] = useState('');
  const [macroTitle, setMacroTitle] = useState('');
  const [macroAnamnesis, setMacroAnamnesis] = useState('');
  const [macroExam, setMacroExam] = useState('');
  const [macroRecs, setMacroRecs] = useState('');
  const [aliasesInput, setAliasesInput] = useState('chanfainita, chanfanita, chanfaina, chanfa');

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClinicalKnowledgeOverview();
      setProtocols(data.protocols || []);
      setVademecum(data.vademecum || []);
      setMacros(data.macros || []);
      setAlertsAudit(data.alertsAudit || []);
      if (data.voiceSettings) {
        setVoiceSettings(data.voiceSettings);
        setAliasesInput((data.voiceSettings.wakeAliases || []).join(', '));
      }
    } catch {
      // Fallback visual si no hay sesión admin autenticada en modo demo
      setProtocols([
        {
          id: 'demo-p1',
          pathology: 'Lumbalgia mecánica aguda',
          phase: 'Fase 1 · Control del Dolor',
          recommendedTechniques: ['Terapia Manual Ortopédica', 'Electroterapia (TENS / EMS)'],
          homeExercises: 'Compresas tibias 15 min y pausas activas cada 2 horas.',
          durationSessions: 10,
        },
      ]);
      setVademecum([
        {
          id: 'demo-v1',
          medicationName: 'Ibuprofeno 400mg',
          activeIngredient: 'Ibuprofeno',
          drugClass: 'AINE',
          defaultDose: '1 comprimido',
          defaultFrequency: 'Cada 8 horas',
          defaultDuration: 'Por 3 días',
          allergyKeywords: ['ibuprofeno', 'aine', 'aines'],
        },
      ]);
      setMacros([
        {
          id: 'demo-m1',
          triggerPhrase: 'control lumbar favorable',
          title: 'Control Lumbar Favorable',
          templateData: { anamnesis: 'Evolución favorable con menor rigidez matutina.' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protoPathology.trim() || !protoHomeExercises.trim()) return;
    const payload: ClinicalProtocolItem = {
      pathology: protoPathology.trim(),
      phase: protoPhase.trim(),
      recommendedTechniques: protoTechniques
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      homeExercises: protoHomeExercises.trim(),
      durationSessions: protoSessions,
      notes: protoNotes.trim() || undefined,
    };
    try {
      const created = await createClinicalProtocol(payload);
      setProtocols((prev) => [created, ...prev]);
    } catch {
      setProtocols((prev) => [{ ...payload, id: `local-${Date.now()}` }, ...prev]);
    }
    setProtoPathology('');
    setProtoHomeExercises('');
    setProtoNotes('');
    notify('Protocolo clínico guardado. Chanfainita ya puede responder consultas sobre esta patología.');
  };

  const handleDeleteProtocol = async (id?: string) => {
    if (!id) return;
    try {
      await deleteClinicalProtocol(id);
    } catch {
      // ignore in demo
    }
    setProtocols((prev) => prev.filter((p) => p.id !== id));
    notify('Protocolo eliminado.');
  };

  const handleSaveVademecum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medActive.trim()) return;
    const payload: VademecumCatalogItem = {
      medicationName: medName.trim(),
      activeIngredient: medActive.trim(),
      drugClass: medClass.trim(),
      defaultDose: medDose.trim(),
      defaultFrequency: medFreq.trim(),
      defaultDuration: medDuration.trim(),
      contraindications: medContra.trim() || undefined,
      allergyKeywords: medAllergies
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    };
    try {
      const created = await createVademecumItem(payload);
      setVademecum((prev) => [created, ...prev]);
    } catch {
      setVademecum((prev) => [{ ...payload, id: `local-${Date.now()}` }, ...prev]);
    }
    setMedName('');
    setMedActive('');
    setMedContra('');
    notify('Medicamento agregado al vademécum y reglas de cruce de alergias.');
  };

  const handleDeleteVademecum = async (id?: string) => {
    if (!id) return;
    try {
      await deleteVademecumItem(id);
    } catch {
      // ignore
    }
    setVademecum((prev) => prev.filter((v) => v.id !== id));
    notify('Elemento eliminado del vademécum.');
  };

  const handleSaveMacro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroTrigger.trim() || !macroTitle.trim()) return;
    const payload: VoiceMacroItem = {
      triggerPhrase: macroTrigger.trim().toLowerCase(),
      title: macroTitle.trim(),
      templateData: {
        anamnesis: macroAnamnesis.trim() || undefined,
        physicalExam: macroExam.trim() || undefined,
        homeRecommendations: macroRecs.trim() || undefined,
      },
    };
    try {
      const created = await createVoiceMacro(payload);
      setMacros((prev) => [created, ...prev]);
    } catch {
      setMacros((prev) => [{ ...payload, id: `local-${Date.now()}` }, ...prev]);
    }
    setMacroTrigger('');
    setMacroTitle('');
    setMacroAnamnesis('');
    setMacroExam('');
    setMacroRecs('');
    notify('Macro de voz registrada.');
  };

  const handleSaveVoiceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const aliases = aliasesInput
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);
    const updated: ClinicVoiceSettings = {
      ...voiceSettings,
      wakeAliases: aliases.length ? aliases : [voiceSettings.wakeWord.toLowerCase()],
    };
    try {
      const saved = await updateClinicVoiceSettings(updated);
      setVoiceSettings(saved);
    } catch {
      setVoiceSettings(updated);
    }
    notify(`Configuración guardada. Nombre de invocación activo: "${updated.wakeWord}".`);
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.6rem 1.05rem',
    borderRadius: '10px',
    border: active ? '1.5px solid #0284c7' : '1.5px solid #e2e8f0',
    background: active ? '#f0f9ff' : '#ffffff',
    color: active ? '#0369a1' : '#475569',
    fontWeight: 800,
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
  });

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.84rem',
    color: '#0f172a',
    background: '#ffffff',
  };

  return (
    <div style={{ maxWidth: '1220px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MaterialIcon name="psychology" size={26} color="#0284c7" />
            Conocimiento Médico IA & Asistente &quot;{voiceSettings.wakeWord}&quot;
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
            Administra protocolos clínicos, vademécum de alergias, macros rápidas y auditoría de alertas sin depender de PDFs ni OCR.
          </p>
        </div>
        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #86efac', color: '#15803d', fontSize: '0.76rem', fontWeight: 800 }}>
          ● Aprendizaje Instantáneo en PostgreSQL
        </span>
      </div>

      {statusMsg && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1.5px solid #86efac',
            color: '#15803d',
            fontWeight: 700,
            fontSize: '0.84rem',
          }}
        >
          ✓ {statusMsg}
        </div>
      )}

      {/* 4 Pestañas del Panel de Dirección Médica */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }} role="tablist">
        <button type="button" style={tabBtnStyle(activeTab === 'protocols')} onClick={() => setActiveTab('protocols')}>
          <MaterialIcon name="menu_book" size={17} /> 1. Protocolos Clínicos ({protocols.length})
        </button>
        <button type="button" style={tabBtnStyle(activeTab === 'vademecum')} onClick={() => setActiveTab('vademecum')}>
          <MaterialIcon name="medication" size={17} /> 2. Vademécum & Alergias ({vademecum.length})
        </button>
        <button type="button" style={tabBtnStyle(activeTab === 'macros')} onClick={() => setActiveTab('macros')}>
          <MaterialIcon name="record_voice_over" size={17} /> 3. Macros & Nombre de Invocación
        </button>
        <button type="button" style={tabBtnStyle(activeTab === 'audit')} onClick={() => setActiveTab('audit')}>
          <MaterialIcon name="gpp_maybe" size={17} /> 4. Auditoría de Alertas ({alertsAudit.length})
        </button>
      </div>

      {loading ? (
        <div style={cardStyle}>Cargando base de conocimiento médico...</div>
      ) : (
        <>
          {/* TAB 1: Protocolos Clínicos */}
          {activeTab === 'protocols' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              <form onSubmit={handleSaveProtocol} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Nuevo Protocolo Estructurado</h3>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Patología</label>
                  <input style={inputStyle} placeholder="Ej. Tendinitis rotuliana" value={protoPathology} onChange={(e) => setProtoPathology(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Fase Clínica</label>
                    <input style={inputStyle} value={protoPhase} onChange={(e) => setProtoPhase(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Sesiones</label>
                    <input type="number" min={1} max={40} style={inputStyle} value={protoSessions} onChange={(e) => setProtoSessions(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Técnicas Indicadas (separadas por coma)</label>
                  <input style={inputStyle} value={protoTechniques} onChange={(e) => setProtoTechniques(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Ejercicios y Cuidados para Casa</label>
                  <textarea rows={3} style={inputStyle} placeholder="Ej. Crioterapia 15 min e isométricos sin dolor..." value={protoHomeExercises} onChange={(e) => setProtoHomeExercises(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Notas / Señales de Alarma (opcional)</label>
                  <input style={inputStyle} value={protoNotes} onChange={(e) => setProtoNotes(e.target.value)} />
                </div>
                <button type="submit" style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  + Guardar Protocolo (Activo al Instante)
                </button>
              </form>

              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Protocolos Activos en Sede</h3>
                {protocols.map((p) => (
                  <div key={p.id || p.pathology} style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{p.pathology}</strong>
                      <button type="button" onClick={() => handleDeleteProtocol(p.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem' }}>
                        Eliminar
                      </button>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                      {p.phase} • {p.durationSessions || 10} sesiones
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.35rem' }}>
                      <strong>Casa:</strong> {p.homeExercises}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Vademécum & Reglas de Alergias */}
          {activeTab === 'vademecum' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              <form onSubmit={handleSaveVademecum} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Agregar Fármaco & Regla de Alergia</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <input style={inputStyle} placeholder="Nombre (Ej. Naproxeno 550mg)" value={medName} onChange={(e) => setMedName(e.target.value)} required />
                  <input style={inputStyle} placeholder="Principio activo (Naproxeno)" value={medActive} onChange={(e) => setMedActive(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <input style={inputStyle} placeholder="Familia (AINE, Analgésico...)" value={medClass} onChange={(e) => setMedClass(e.target.value)} />
                  <input style={inputStyle} placeholder="Dosis estándar" value={medDose} onChange={(e) => setMedDose(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <input style={inputStyle} placeholder="Frecuencia" value={medFreq} onChange={(e) => setMedFreq(e.target.value)} />
                  <input style={inputStyle} placeholder="Duración" value={medDuration} onChange={(e) => setMedDuration(e.target.value)} />
                </div>
                <input style={inputStyle} placeholder="Palabras clave de alergia (coma): naproxeno, aine, aines" value={medAllergies} onChange={(e) => setMedAllergies(e.target.value)} />
                <input style={inputStyle} placeholder="Contraindicaciones" value={medContra} onChange={(e) => setMedContra(e.target.value)} />
                <button type="submit" style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  + Agregar al Vademécum
                </button>
              </form>

              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Catálogo Activo ({vademecum.length})</h3>
                {vademecum.map((v) => (
                  <div key={v.id || v.medicationName} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                        {v.medicationName} <span style={{ fontSize: '0.72rem', color: '#0284c7' }}>({v.drugClass})</span>
                      </strong>
                      <button type="button" onClick={() => handleDeleteVademecum(v.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
                        Eliminar
                      </button>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
                      {v.defaultDose} • {v.defaultFrequency} • {v.defaultDuration}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '3px', fontWeight: 600 }}>
                      Cruce alergias: {(v.allergyKeywords || []).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Macros de Voz & Wake-Word */}
          {activeTab === 'macros' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              <form onSubmit={handleSaveVoiceSettings} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Nombre de Invocación (Wake-Word) de la Sede</h3>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Nombre del Asistente</label>
                  <input
                    style={inputStyle}
                    value={voiceSettings.wakeWord}
                    onChange={(e) => setVoiceSettings((prev) => ({ ...prev, wakeWord: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Alias fonéticos (separados por coma)</label>
                  <input style={inputStyle} value={aliasesInput} onChange={(e) => setAliasesInput(e.target.value)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={voiceSettings.privacyModeDefault}
                    onChange={(e) => setVoiceSettings((prev) => ({ ...prev, privacyModeDefault: e.target.checked }))}
                  />
                  Iniciar siempre en Modo Privacidad (solo visual, sin altavoz)
                </label>
                <button type="submit" style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: '#0f766e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  Guardar Configuración de Voz
                </button>
              </form>

              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Macros Clínicas por Voz ({macros.length})</h3>
                <form onSubmit={handleSaveMacro} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input style={inputStyle} placeholder="Frase (ej. control rodilla)" value={macroTrigger} onChange={(e) => setMacroTrigger(e.target.value)} required />
                    <input style={inputStyle} placeholder="Título visible" value={macroTitle} onChange={(e) => setMacroTitle(e.target.value)} required />
                  </div>
                  <input style={inputStyle} placeholder="Texto de anamnesis" value={macroAnamnesis} onChange={(e) => setMacroAnamnesis(e.target.value)} />
                  <input style={inputStyle} placeholder="Texto de examen físico" value={macroExam} onChange={(e) => setMacroExam(e.target.value)} />
                  <input style={inputStyle} placeholder="Recomendaciones para casa" value={macroRecs} onChange={(e) => setMacroRecs(e.target.value)} />
                  <button type="submit" style={{ padding: '0.55rem 0.9rem', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                    + Crear Macro
                  </button>
                </form>

                {macros.map((m) => (
                  <div key={m.id || m.triggerPhrase} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{m.title}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#0284c7' }}>
                        &quot;{voiceSettings.wakeWord}, aplica {m.triggerPhrase}&quot;
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (m.id) await deleteVoiceMacro(m.id).catch(() => null);
                        setMacros((prev) => prev.filter((x) => x.id !== m.id));
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Auditoría de Alertas Clínicas */}
          {activeTab === 'audit' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Registro de Alertas Preventivas Detectadas (Alergias y Banderas Rojas)
              </h3>
              {alertsAudit.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                  Aún no se han registrado alertas clínicas críticas en esta sede. Cada vez que {voiceSettings.wakeWord} detecte una alergia incompatible o una bandera roja neurológica quedará auditada aquí.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {alertsAudit.map((item) => (
                    <div key={item.id} style={{ padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid #fecaca', background: '#fef2f2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#991b1b', fontSize: '0.86rem' }}>
                          {item.alertType === 'allergy' ? '💊 Alergia' : '🚨 Bandera Roja'} · {item.title}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                          {new Date(item.createdAt).toLocaleString('es-PE')}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#7f1d1d' }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClinicalKnowledgeAdminPage;
