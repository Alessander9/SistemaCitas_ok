import { useState, useMemo } from 'react';
import './CommunicationsPage.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { IconSearch } from '../../components/ui/Icons';
import {
  INITIAL_EMAIL_LOGS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_REMINDER_RULES,
  EmailLogItem,
  EmailTemplateItem,
  ReminderRuleItem,
} from '../../components/admin/communications/emailTemplatesData';

type CommsTab = 'templates' | 'reminders' | 'logs';

export function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<CommsTab>('templates');
  const [templates, setTemplates] = useState<EmailTemplateItem[]>(INITIAL_EMAIL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(INITIAL_EMAIL_TEMPLATES[0].id);
  const [rules, setRules] = useState<ReminderRuleItem[]>(INITIAL_REMINDER_RULES);
  const [logs, setLogs] = useState<EmailLogItem[]>(INITIAL_EMAIL_LOGS);

  // Prueba rápida integrada en Plantillas
  const [testRecipient, setTestRecipient] = useState('paciente.demo@gmail.com');
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  // Envío manual de recordatorios
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<{ scanned: number; sent: number; failed: number } | null>(null);

  // Filtros de historial
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'queued' | 'failed'>('all');

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId],
  );

  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const activeTemplatesCount = templates.filter((t) => t.isActive).length;
  const activeRulesCount = rules.filter((r) => r.enabled).length;

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return logs.filter((l) => {
      if (logFilter !== 'all' && l.status !== logFilter) return false;
      if (
        q &&
        !l.toEmail.toLowerCase().includes(q) &&
        !l.subject.toLowerCase().includes(q) &&
        !l.templateName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [logs, logSearch, logFilter]);

  const toggleTemplateActive = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  const toggleRuleEnabled = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleDispatchTest = () => {
    const email = testRecipient.trim();
    if (!email) return;
    const subject = selectedTemplate.subject.replace('{{clinic_name}}', 'Clínica Sanitas');
    const newLog: EmailLogItem = {
      id: `l-${Date.now()}`,
      templateName: selectedTemplate.displayName,
      toEmail: email,
      subject,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    setTestFeedback(`Correo de prueba despachado a ${email} con "${selectedTemplate.displayName}".`);
    setTimeout(() => setTestFeedback(null), 4500);
  };

  const handleRetryLog = (log: EmailLogItem) => {
    setLogs((prev) =>
      prev.map((item) =>
        item.id === log.id
          ? { ...item, status: 'sent', errorMessage: undefined, sentAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const handleTriggerSweep = () => {
    setIsSweeping(true);
    setTimeout(() => {
      setSweepResult({ scanned: 18, sent: 16, failed: 0 });
      setIsSweeping(false);
    }, 600);
  };

  const sanitizeEmailHtml = (rawHtml: string): string =>
    rawHtml
      .replace(/<(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '');

  const compiledPreview = sanitizeEmailHtml(
    selectedTemplate.htmlBody
      .replace(/\{\{\s*patient_name\s*\}\}/g, 'María Mercedes')
      .replace(/\{\{\s*service_name\s*\}\}/g, 'Terapia Manual Ortopédica')
      .replace(/\{\{\s*professional_name\s*\}\}/g, 'Dra. María González')
      .replace(/\{\{\s*appointment_date\s*\}\}/g, 'Jueves 10 de Septiembre')
      .replace(/\{\{\s*start_time\s*\}\}/g, '10:00 AM')
      .replace(/\{\{\s*clinic_name\s*\}\}/g, 'Clínica Sanitas'),
  );

  return (
    <div className="cm-shell">
      {/* Header limpio sin jerga DevOps */}
      <header className="cm-header">
        <div>
          <span className="cm-kicker">Notificaciones automáticas a pacientes · Servicio activo</span>
          <h1 className="cm-title">Comunicaciones & Correos</h1>
        </div>
        <span className="cm-service-pill">
          <span className="cm-dot-live" />
          Envíos activos · 98.4% entrega
        </span>
      </header>

      {/* 4 KPIs claros para Dirección */}
      <section className="cm-kpi-grid" aria-label="Resumen de envíos">
        <article className="cm-kpi-card">
          <span>Recordatorios activos</span>
          <strong>{activeRulesCount} de {rules.length}</strong>
          <small>Reglas automáticas encendidas</small>
        </article>
        <article className="cm-kpi-card">
          <span>Plantillas activas</span>
          <strong>{activeTemplatesCount} de {templates.length}</strong>
          <small>Mensajes listos para pacientes</small>
        </article>
        <article className="cm-kpi-card">
          <span>Enviados recientes</span>
          <strong className="tone-ok">{sentCount}</strong>
          <small>Entregados correctamente</small>
        </article>
        <article className={`cm-kpi-card ${failedCount > 0 ? 'tone-alert' : ''}`}>
          <span>Correos fallidos</span>
          <strong className={failedCount > 0 ? 'tone-err' : ''}>{failedCount}</strong>
          <small>{failedCount > 0 ? 'Requieren revisión' : 'Sin rebotes pendientes'}</small>
        </article>
      </section>

      {/* 3 Pestañas Claras */}
      <div className="cm-tabs" role="tablist" aria-label="Secciones de comunicaciones">
        <button
          id="tab-templates"
          type="button"
          role="tab"
          aria-selected={activeTab === 'templates'}
          className={`cm-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <MaterialIcon name="description" size={17} />
          <span>Plantillas y prueba ({templates.length})</span>
        </button>

        <button
          id="tab-reminders"
          type="button"
          role="tab"
          aria-selected={activeTab === 'reminders'}
          className={`cm-tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          <MaterialIcon name="notifications_active" size={17} />
          <span>Recordatorios automáticos</span>
        </button>

        <button
          id="tab-logs"
          type="button"
          role="tab"
          aria-selected={activeTab === 'logs'}
          className={`cm-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <MaterialIcon name="history" size={17} />
          <span>Historial de envíos ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: PLANTILLAS + PRUEBA INTEGRADA */}
      {activeTab === 'templates' && (
        <section className="cm-templates-grid" aria-label="Plantillas de correo">
          <div className="cm-template-list">
            {templates.map((t) => {
              const isSelected = t.id === selectedTemplate.id;
              return (
                <article
                  key={t.id}
                  className={`cm-tpl-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplateId(t.id)}
                >
                  <div className="cm-tpl-top">
                    <span className="cm-tpl-cat">{t.category}</span>
                    <button
                      type="button"
                      className={`cm-toggle-chip ${t.isActive ? 'on' : 'off'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTemplateActive(t.id);
                      }}
                    >
                      {t.isActive ? 'Activa' : 'Pausada'}
                    </button>
                  </div>
                  <h3>{t.displayName}</h3>
                  <p>{t.description}</p>
                </article>
              );
            })}
          </div>

          <div className="cm-preview-col">
            <div className="cm-preview-card">
              <div className="cm-preview-head">
                <div>
                  <h3>Vista previa · {selectedTemplate.displayName}</h3>
                  <span>Asunto: {selectedTemplate.subject.replace('{{clinic_name}}', 'Clínica Sanitas')}</span>
                </div>
              </div>

              <div
                className="cm-preview-body"
                dangerouslySetInnerHTML={{ __html: compiledPreview }}
              />

              {/* Envío rápido de prueba integrado */}
              <div className="cm-quick-test">
                <label htmlFor="test-recipient">Enviar prueba rápida de esta plantilla</label>
                <div className="cm-quick-test-row">
                  <input
                    id="test-recipient"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                  />
                  <button
                    id="btn-dispatch-test"
                    type="button"
                    className="cm-btn-primary"
                    disabled={!testRecipient.trim()}
                    onClick={handleDispatchTest}
                  >
                    <MaterialIcon name="send" size={15} />
                    <span>Enviar prueba</span>
                  </button>
                </div>
                {testFeedback && <div className="cm-feedback-ok">{testFeedback}</div>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: RECORDATORIOS AUTOMÁTICOS */}
      {activeTab === 'reminders' && (
        <section className="cm-panel" aria-label="Reglas de recordatorios">
          <div className="cm-reminders-top">
            <div>
              <h2>Recordatorios automáticos a pacientes</h2>
              <p>Activa o pausa los avisos automáticos para reducir inasistencias en la sede.</p>
            </div>
            <button
              id="btn-trigger-sweep"
              type="button"
              className="cm-btn-primary"
              disabled={isSweeping}
              onClick={handleTriggerSweep}
            >
              <MaterialIcon name="refresh" size={16} />
              <span>{isSweeping ? 'Enviando...' : 'Enviar recordatorios ahora'}</span>
            </button>
          </div>

          {sweepResult && (
            <div className="cm-sweep-banner" id="sweep-results">
              <strong>Envío completado:</strong> {sweepResult.sent} recordatorios enviados de {sweepResult.scanned} citas revisadas ({sweepResult.failed} fallidos).
            </div>
          )}

          <div className="cm-rules-grid">
            {rules.map((rule) => (
              <article key={rule.id} className={`cm-rule-card ${rule.enabled ? 'on' : 'off'}`}>
                <div className="cm-rule-top">
                  <span className="cm-rule-timing">{rule.timing}</span>
                  <button
                    type="button"
                    className={`cm-toggle-chip ${rule.enabled ? 'on' : 'off'}`}
                    onClick={() => toggleRuleEnabled(rule.id)}
                  >
                    {rule.enabled ? 'Activo' : 'Pausado'}
                  </button>
                </div>
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
                <span className="cm-rule-channel">Canal: {rule.channel}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: HISTORIAL DE ENVÍOS */}
      {activeTab === 'logs' && (
        <section className="cm-panel" aria-label="Historial de envíos">
          <div className="cm-logs-toolbar">
            <div className="cm-filter-pills">
              {(
                [
                  { id: 'all', label: `Todos (${logs.length})` },
                  { id: 'sent', label: `Enviados (${sentCount})` },
                  { id: 'failed', label: `Fallidos (${failedCount})` },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`cm-pill ${logFilter === p.id ? 'active' : ''}`}
                  onClick={() => setLogFilter(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="cm-search-box">
              <span className="cm-search-icon"><IconSearch className="w-4 h-4" /></span>
              <input
                type="text"
                placeholder="Buscar correo o asunto..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="cm-table-wrap">
            <table className="cm-table" id="logs-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Destinatario</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                  <th className="cm-th-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="cm-empty-cell">
                      No hay correos que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <span className={`cm-status-chip ${l.status}`}>
                          {l.status === 'sent' ? 'Enviado' : l.status === 'queued' ? 'En cola' : 'Fallido'}
                        </span>
                      </td>
                      <td className="cm-cell-email">{l.toEmail}</td>
                      <td>
                        <strong className="cm-cell-subj">{l.subject}</strong>
                        <span className="cm-cell-sub">
                          {l.errorMessage || l.templateName}
                        </span>
                      </td>
                      <td className="cm-cell-date">
                        {l.sentAt
                          ? new Date(l.sentAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
                          : 'Pendiente'}
                      </td>
                      <td className="cm-cell-right">
                        {l.status === 'failed' ? (
                          <button
                            type="button"
                            className="cm-retry-btn"
                            onClick={() => handleRetryLog(l)}
                          >
                            Reintentar
                          </button>
                        ) : (
                          <span className="cm-ok-text">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default CommunicationsPage;
