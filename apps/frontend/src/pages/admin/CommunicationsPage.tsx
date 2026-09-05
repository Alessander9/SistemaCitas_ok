import { useState } from 'react';
import './CommunicationsPage.css';
import {
  IconMail,
  IconSearch,
  IconCheckCircle,
  IconAlert,
  IconCalendar,
  IconFileText,
  IconBot,
} from '../../components/ui/Icons';

interface EmailTemplate {
  id: string;
  name: string;
  displayName: string;
  category: 'Citas' | 'Recordatorios' | 'Cancelaciones' | 'Post-Atención';
  subject: string;
  description: string;
  htmlBody: string;
  variables: string[];
  isActive: boolean;
}

interface EmailLog {
  id: string;
  templateName?: string;
  toEmail: string;
  subject: string;
  status: 'sent' | 'queued' | 'failed';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: 't1',
    name: 'appointment_confirmation',
    displayName: 'Confirmación Inmediata de Cita',
    category: 'Citas',
    subject: 'Confirmación de tu cita — {{clinic_name}}',
    description: 'Enviado automáticamente al paciente en cuanto la cita es reservada o confirmada en recepción.',
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff;">
    <div style="font-size: 28px; margin-bottom: 6px;">🏥</div>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">{{clinic_name}}</h1>
    <p style="margin: 4px 0 0; font-size: 13px; color: #e0f2fe;">Comprobante Digital de Reserva</p>
  </div>
  <div style="padding: 24px; color: #1e293b;">
    <h2 style="color: #0284c7; font-size: 17px; margin-top: 0;">¡Hola {{patient_name}}! 👋</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu cita médica ha sido <strong>confirmada exitosamente</strong> en nuestro sistema.</p>
    
    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 18px 0;">
      <div style="display: flex; margin-bottom: 10px;">
        <span style="font-size: 13px; color: #64748b; width: 110px; font-weight: 600;">Especialidad:</span>
        <strong style="font-size: 13px; color: #0f172a;">{{service_name}}</strong>
      </div>
      <div style="display: flex; margin-bottom: 10px;">
        <span style="font-size: 13px; color: #64748b; width: 110px; font-weight: 600;">Especialista:</span>
        <strong style="font-size: 13px; color: #0f172a;">{{professional_name}}</strong>
      </div>
      <div style="display: flex; margin-bottom: 10px;">
        <span style="font-size: 13px; color: #64748b; width: 110px; font-weight: 600;">Fecha & Hora:</span>
        <strong style="font-size: 13px; color: #0284c7;">{{appointment_date}} a las {{start_time}}</strong>
      </div>
      <div style="display: flex;">
        <span style="font-size: 13px; color: #64748b; width: 110px; font-weight: 600;">Sede:</span>
        <span style="font-size: 13px; color: #334155;">{{clinic_name}} — Av. Javier Prado Este 2465</span>
      </div>
    </div>

    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 14px; border-radius: 6px; font-size: 13px; color: #166534; margin-bottom: 20px;">
      💡 <strong>Recomendación:</strong> Por favor preséntate 10 minutos antes con tu documento de identidad (DNI/CE).
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px; text-align: center;">
      ¿Necesitas reprogramar? Llámanos al <strong>{{clinic_phone}}</strong> o gestiona tu cita en el Portal del Paciente.
    </p>
  </div>
</div>`,
    variables: ['patient_name', 'service_name', 'professional_name', 'appointment_date', 'start_time', 'clinic_name', 'clinic_phone'],
    isActive: true,
  },
  {
    id: 't2',
    name: 'appointment_reminder_24h',
    displayName: 'Recordatorio Preventivo (24 Horas Antes)',
    category: 'Recordatorios',
    subject: 'Recordatorio: Tu cita es mañana — {{clinic_name}}',
    description: 'Disparado por el motor cron 24 horas antes de la hora pactada para maximizar la tasa de asistencia.',
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 22px; text-align: center; color: #ffffff;">
    <div style="font-size: 26px; margin-bottom: 4px;">⏰</div>
    <h1 style="margin: 0; font-size: 19px; font-weight: 700; color: #ffffff;">Recordatorio de Cita Médica</h1>
    <p style="margin: 3px 0 0; font-size: 13px; color: #ccfbf1;">Tu cita está programada para el día de mañana</p>
  </div>
  <div style="padding: 24px; color: #1e293b;">
    <h2 style="color: #0f766e; font-size: 16px; margin-top: 0;">Estimado(a) {{patient_name}},</h2>
    <p style="font-size: 14px; line-height: 1.5; color: #475569;">
      Te recordamos que tienes una cita programada para el <strong>{{appointment_date}}</strong> a las <strong style="color: #0f766e;">{{start_time}}</strong>.
    </p>
    
    <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 14px; margin: 16px 0;">
      <p style="margin: 0 0 6px; font-size: 13px;">🩺 <strong>Servicio:</strong> {{service_name}}</p>
      <p style="margin: 0; font-size: 13px;">👨‍⚕️ <strong>Médico:</strong> {{professional_name}}</p>
    </div>

    <div style="text-align: center; margin: 24px 0 10px;">
      <a href="#" style="display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-weight: 600; font-size: 13px;">
        Confirmar Asistencia en 1 Clic
      </a>
    </div>
  </div>
</div>`,
    variables: ['patient_name', 'service_name', 'professional_name', 'appointment_date', 'start_time', 'clinic_name'],
    isActive: true,
  },
  {
    id: 't3',
    name: 'appointment_cancelled',
    displayName: 'Notificación de Cancelación',
    category: 'Cancelaciones',
    subject: 'Cita cancelada — {{clinic_name}}',
    description: 'Aviso formal inmediato cuando una cita es anulada o cancelada por el paciente o la clínica.',
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #fee2e2;">
  <div style="background: #ef4444; padding: 20px; text-align: center; color: #ffffff;">
    <div style="font-size: 26px; margin-bottom: 4px;">⚠️</div>
    <h1 style="margin: 0; font-size: 19px; font-weight: 700; color: #ffffff;">Aviso de Cancelación de Cita</h1>
  </div>
  <div style="padding: 24px; color: #1e293b;">
    <p style="font-size: 14px; color: #475569;">Hola <strong>{{patient_name}}</strong>,</p>
    <p style="font-size: 14px; color: #475569;">Te informamos que tu cita médica programada para el <strong>{{appointment_date}}</strong> ha sido cancelada.</p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin: 16px 0;">
      <p style="margin: 0; font-size: 13px; color: #991b1b;">
        <strong>Motivo registrado:</strong> {{cancellation_reason}}
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">Si deseas agendar una nueva fecha, puedes hacerlo ingresando a nuestro portal o llamando al {{clinic_phone}}.</p>
  </div>
</div>`,
    variables: ['patient_name', 'appointment_date', 'cancellation_reason', 'clinic_name', 'clinic_phone'],
    isActive: true,
  },
  {
    id: 't4',
    name: 'post_care_followup',
    displayName: 'Encuesta de Satisfacción Post-Consulta',
    category: 'Post-Atención',
    subject: '¿Cómo te sentiste hoy en {{clinic_name}}?',
    description: 'Enviado 4 horas posteriores a la consulta para registrar métricas de satisfacción (NPS y feedback).',
    htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 22px; text-align: center; color: #ffffff;">
    <div style="font-size: 26px; margin-bottom: 4px;">🌟</div>
    <h1 style="margin: 0; font-size: 19px; font-weight: 700; color: #ffffff;">Seguimiento Post-Consulta</h1>
    <p style="margin: 3px 0 0; font-size: 13px; color: #ede9fe;">Tu bienestar y opinión nos importan</p>
  </div>
  <div style="padding: 24px; color: #1e293b;">
    <p style="font-size: 14px; color: #475569;">Hola <strong>{{patient_name}}</strong>, esperamos que te sientas muy bien tras tu atención en <strong>{{service_name}}</strong>.</p>
    <p style="font-size: 13.5px; color: #64748b;">¿Cómo calificarías la atención recibida por nuestro equipo médico?</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 24px; margin: 0 6px; cursor: pointer;">⭐</span>
      <span style="font-size: 24px; margin: 0 6px; cursor: pointer;">⭐</span>
      <span style="font-size: 24px; margin: 0 6px; cursor: pointer;">⭐</span>
      <span style="font-size: 24px; margin: 0 6px; cursor: pointer;">⭐</span>
      <span style="font-size: 24px; margin: 0 6px; cursor: pointer;">⭐</span>
    </div>
  </div>
</div>`,
    variables: ['patient_name', 'service_name', 'clinic_name'],
    isActive: true,
  },
];

const mockLogs: EmailLog[] = [
  {
    id: 'l1',
    templateName: 'appointment_confirmation',
    toEmail: 'elena.gomez@example.com',
    subject: 'Confirmación de tu cita — CitasSistema San Isidro',
    status: 'sent',
    sentAt: '2026-09-02T10:15:00Z',
    createdAt: '2026-09-02T10:15:00Z',
  },
  {
    id: 'l2',
    templateName: 'appointment_reminder_24h',
    toEmail: 'roberto.v@example.com',
    subject: 'Recordatorio: Tu cita es mañana — CitasSistema San Isidro',
    status: 'sent',
    sentAt: '2026-09-02T09:00:00Z',
    createdAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'l3',
    templateName: 'appointment_cancelled',
    toEmail: 'fail.test@domain.invalid',
    subject: 'Cita cancelada — CitasSistema San Isidro',
    status: 'failed',
    errorMessage: 'SMTP 550 Mailbox not found or rejected',
    createdAt: '2026-09-02T08:30:00Z',
  },
  {
    id: 'l4',
    templateName: 'appointment_reminder_24h',
    toEmail: 'carlos.mendoza@clinica.pe',
    subject: 'Recordatorio: Tu cita es mañana — San Isidro',
    status: 'sent',
    sentAt: '2026-09-02T08:15:00Z',
    createdAt: '2026-09-02T08:15:00Z',
  },
  {
    id: 'l5',
    templateName: 'post_care_followup',
    toEmail: 'maria.reyes@gmail.com',
    subject: '¿Cómo te sentiste hoy en CitasSistema San Isidro?',
    status: 'queued',
    createdAt: '2026-09-02T07:45:00Z',
  },
];

export function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'test' | 'reminders'>('templates');
  const [templates] = useState<EmailTemplate[]>(mockTemplates);
  const [logs, setLogs] = useState<EmailLog[]>(mockLogs);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(mockTemplates[0]);
  const [previewViewMode, setPreviewViewMode] = useState<'visual' | 'code'>('visual');

  // Logs search & filter
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'sent' | 'queued' | 'failed'>('all');

  // Test send state
  const [testTo, setTestTo] = useState('paciente.demo@gmail.com');
  const [testPatientName, setTestPatientName] = useState('María Mercedes');
  const [testServiceName, setTestServiceName] = useState('Consulta Cardiológica');
  const [testDoctorName, setTestDoctorName] = useState('Dr. Alejandro Morales');
  const [testClinicName, setTestClinicName] = useState('CitasSistema San Isidro');
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reminder sweep simulation state
  const [sweepResult, setSweepResult] = useState<{ scanned: number; sent: number; failed: number; channel: string } | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);

  const handleSendTest = () => {
    if (!testTo) return;
    const newLog: EmailLog = {
      id: `l_${Date.now()}`,
      templateName: selectedTemplate.name,
      toEmail: testTo,
      subject: selectedTemplate.subject.replace('{{clinic_name}}', testClinicName),
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
    setTestFeedback({
      type: 'success',
      message: `Correo de prueba despachado a ${testTo} exitosamente con plantilla "${selectedTemplate.name}".`,
    });
    setTimeout(() => setTestFeedback(null), 5000);
  };

  const handleTriggerSweep = () => {
    setIsSweeping(true);
    setTimeout(() => {
      setSweepResult({
        scanned: 18,
        sent: 16,
        failed: 0,
        channel: 'SMTP AWS SES + WhatsApp API',
      });
      setIsSweeping(false);
    }, 900);
  };

  const renderCompiledPreview = (html: string) => {
    return html
      .replace(/\{\{\s*patient_name\s*\}\}/g, testPatientName)
      .replace(/\{\{\s*service_name\s*\}\}/g, testServiceName)
      .replace(/\{\{\s*professional_name\s*\}\}/g, testDoctorName)
      .replace(/\{\{\s*appointment_date\s*\}\}/g, '03/09/2026')
      .replace(/\{\{\s*start_time\s*\}\}/g, '15:30')
      .replace(/\{\{\s*clinic_name\s*\}\}/g, testClinicName)
      .replace(/\{\{\s*clinic_phone\s*\}\}/g, '+51 (01) 456-7890')
      .replace(/\{\{\s*cancellation_reason\s*\}\}/g, 'Reprogramación solicitada por el paciente');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.toEmail.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.subject.toLowerCase().includes(logSearch.toLowerCase()) ||
      (l.templateName && l.templateName.toLowerCase().includes(logSearch.toLowerCase()));

    const matchesStatus = logStatusFilter === 'all' || l.status === logStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div className="comms-page">
      {/* Top Banner & KPI Cards */}
      <div className="comms-top-hero">
        <div className="comms-hero-header">
          <div className="comms-hero-info">
            <div className="comms-badge-kicker">
              <span className="live-pulse-dot" />
              <span>Plataforma de Notificaciones Clínicas</span>
            </div>
            <h1 className="comms-title">Comunicaciones & Correos</h1>
            <p className="comms-subtitle">
              Plantillas dinámicas · Recordatorios automáticos 24h · Auditoría de envíos transaccionales
            </p>
          </div>

          <div className="comms-top-badges">
            <div className="engine-status-pill online">
              <span className="pulse-indicator" />
              <div className="pill-text">
                <span className="pill-title">SMTP Motor Activo</span>
                <span className="pill-desc">AWS SES / TLS 1.3</span>
              </div>
            </div>
            <div className="engine-status-pill info">
              <IconMail className="pill-icon" />
              <div className="pill-text">
                <span className="pill-title">{sentCount} Enviados hoy</span>
                <span className="pill-desc">Tasa entrega 98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI summary bar */}
        <div className="comms-metrics-summary">
          <div className="summary-card">
            <div className="summary-icon blue">
              <IconFileText size={18} />
            </div>
            <div className="summary-content">
              <span className="summary-number">{templates.length}</span>
              <span className="summary-label">Plantillas Activas</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">
              <IconCheckCircle size={18} />
            </div>
            <div className="summary-content">
              <span className="summary-number">{sentCount}</span>
              <span className="summary-label">Entregas Exitosas</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon purple">
              <IconCalendar size={18} />
            </div>
            <div className="summary-content">
              <span className="summary-number">24h / 2h</span>
              <span className="summary-label">Reglas Cron Automáticas</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon orange">
              <IconAlert size={18} />
            </div>
            <div className="summary-content">
              <span className="summary-number">{failedCount}</span>
              <span className="summary-label">Alertas de Rebote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="comms-tabs-container">
        <div className="comms-tabs" role="tablist">
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
            id="tab-templates"
          >
            <span className="tab-icon">📄</span>
            <span>Plantillas</span>
            <span className="tab-count">{templates.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
            id="tab-logs"
          >
            <span className="tab-icon">📊</span>
            <span>Auditoría de Envíos</span>
            <span className="tab-count">{logs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
            id="tab-test"
          >
            <span className="tab-icon">✉️</span>
            <span>Probador / Enviar Test</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
            id="tab-reminders"
          >
            <span className="tab-icon">⏰</span>
            <span>Recordatorios Automatizados</span>
            <span className="tab-badge-auto">Cron Activo</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PLANTILLAS & RENDER PREVIEW */}
      {activeTab === 'templates' && (
        <div className="comms-layout">
          {/* Templates list sidebar */}
          <div className="templates-list-col">
            <div className="templates-list-header">
              <div>
                <h3 className="section-heading">Plantillas del Sistema</h3>
                <p className="section-subtext">Selecciona una plantilla para previsualizar su contenido o probar variables.</p>
              </div>
            </div>

            <div className="templates-cards-stack">
              {templates.map(t => {
                const isSelected = selectedTemplate.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`template-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(t)}
                  >
                    <div className="card-top">
                      <div className="template-meta-title">
                        <span className="template-badge-cat">{t.category}</span>
                        <code className="template-name">{t.name}</code>
                      </div>
                      <span className="status-dot active">
                        <span className="dot-pulse-mini" /> Activa
                      </span>
                    </div>

                    <h4 className="template-card-title">{t.displayName}</h4>
                    <p className="template-subject">
                      <strong>Asunto:</strong> {t.subject}
                    </p>

                    <p className="template-card-desc">{t.description}</p>

                    <div className="template-vars-row">
                      <span className="vars-label">Variables:</span>
                      <div className="template-vars">
                        {t.variables.slice(0, 3).map(v => (
                          <span key={v} className="var-chip">{`{{${v}}}`}</span>
                        ))}
                        {t.variables.length > 3 && (
                          <span className="var-more">+{t.variables.length - 3} más</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Preview Panel (Email Client Mockup) */}
          <div className="template-preview-panel">
            <div className="preview-window-frame">
              {/* Window Header */}
              <div className="preview-window-bar">
                <div className="window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="window-title">
                  <span>Previsualizador Clínico — {selectedTemplate.displayName}</span>
                </div>
                <div className="view-mode-toggle">
                  <button
                    className={`toggle-mode-btn ${previewViewMode === 'visual' ? 'active' : ''}`}
                    onClick={() => setPreviewViewMode('visual')}
                  >
                    Visual
                  </button>
                  <button
                    className={`toggle-mode-btn ${previewViewMode === 'code' ? 'active' : ''}`}
                    onClick={() => setPreviewViewMode('code')}
                  >
                    HTML
                  </button>
                </div>
              </div>

              {/* Email Client Metadata Bar */}
              <div className="preview-client-meta">
                <div className="meta-row">
                  <span className="meta-label">De:</span>
                  <span className="meta-val highlight">
                    <strong>{testClinicName}</strong> &lt;notificaciones@citassistema.pe&gt;
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Para:</span>
                  <span className="meta-val">
                    {testPatientName} &lt;{testTo}&gt;
                  </span>
                </div>
                <div className="meta-row subject-row">
                  <span className="meta-label">Asunto:</span>
                  <span className="meta-val subject-text">
                    {selectedTemplate.subject.replace('{{clinic_name}}', testClinicName)}
                  </span>
                </div>
              </div>

              {/* Email Content Box */}
              <div className="preview-body-container">
                {previewViewMode === 'visual' ? (
                  <div className="email-rendered-wrapper">
                    <div
                      className="email-rendered-box"
                      dangerouslySetInnerHTML={{ __html: renderCompiledPreview(selectedTemplate.htmlBody) }}
                    />
                  </div>
                ) : (
                  <div className="email-code-viewer">
                    <pre className="code-block">
                      <code>{renderCompiledPreview(selectedTemplate.htmlBody)}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Dynamic Sample Variable Quick Customizer */}
              <div className="preview-variable-controls">
                <div className="var-controls-header">
                  <span>🛠️ Variables de Simulación en Vivo:</span>
                </div>
                <div className="var-controls-grid">
                  <div className="var-input-group">
                    <label>Paciente:</label>
                    <input
                      type="text"
                      className="comms-input-sm"
                      value={testPatientName}
                      onChange={e => setTestPatientName(e.target.value)}
                    />
                  </div>
                  <div className="var-input-group">
                    <label>Servicio:</label>
                    <input
                      type="text"
                      className="comms-input-sm"
                      value={testServiceName}
                      onChange={e => setTestServiceName(e.target.value)}
                    />
                  </div>
                  <div className="var-input-group">
                    <label>Especialista:</label>
                    <input
                      type="text"
                      className="comms-input-sm"
                      value={testDoctorName}
                      onChange={e => setTestDoctorName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITORÍA DE ENVÍOS (LOGS) */}
      {activeTab === 'logs' && (
        <div className="comms-card logs-panel-card">
          <div className="logs-toolbar">
            <div className="logs-heading-wrap">
              <h3 className="comms-card-title">Registro de Auditoría de Correos (email_logs)</h3>
              <p className="helper-text">
                Historial transaccional en tiempo real de todos los correos procesados y despachados por el sistema.
              </p>
            </div>

            <div className="logs-filters">
              <div className="search-input-wrap">
                <IconSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por correo, asunto o plantilla..."
                  className="logs-search-input"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                />
              </div>

              <div className="filter-pill-group">
                <button
                  className={`filter-pill ${logStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLogStatusFilter('all')}
                >
                  Todos ({logs.length})
                </button>
                <button
                  className={`filter-pill ${logStatusFilter === 'sent' ? 'active' : ''}`}
                  onClick={() => setLogStatusFilter('sent')}
                >
                  ✅ Enviados ({logs.filter(l => l.status === 'sent').length})
                </button>
                <button
                  className={`filter-pill ${logStatusFilter === 'queued' ? 'active' : ''}`}
                  onClick={() => setLogStatusFilter('queued')}
                >
                  ⏳ En Cola ({logs.filter(l => l.status === 'queued').length})
                </button>
                <button
                  className={`filter-pill ${logStatusFilter === 'failed' ? 'active' : ''}`}
                  onClick={() => setLogStatusFilter('failed')}
                >
                  ❌ Fallidos ({logs.filter(l => l.status === 'failed').length})
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="logs-table" id="logs-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Destinatario</th>
                  <th>Asunto del Correo</th>
                  <th>Plantilla Utilizada</th>
                  <th>Fecha de Envío</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-logs-cell">
                      <div className="empty-state-box">
                        <IconMail size={28} />
                        <p>No se encontraron registros de auditoría que coincidan con la búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr key={l.id}>
                      <td>
                        <span className={`log-badge ${l.status}`}>
                          {l.status === 'sent' && (
                            <>
                              <IconCheckCircle size={12} /> Enviado
                            </>
                          )}
                          {l.status === 'queued' && (
                            <>
                              <span className="dot-mini amber" /> En cola
                            </>
                          )}
                          {l.status === 'failed' && (
                            <>
                              <IconAlert size={12} /> Fallido
                            </>
                          )}
                        </span>
                      </td>
                      <td className="email-cell">
                        <div className="email-row-content">
                          <span className="avatar-chip">{l.toEmail.charAt(0).toUpperCase()}</span>
                          <span className="email-text">{l.toEmail}</span>
                        </div>
                      </td>
                      <td className="subject-cell">
                        <span className="subject-title">{l.subject}</span>
                        {l.errorMessage && <span className="error-note">{l.errorMessage}</span>}
                      </td>
                      <td>
                        <code className="tpl-code">{l.templateName ?? 'Directo'}</code>
                      </td>
                      <td className="date-cell">
                        <span className="date-primary">
                          {l.sentAt
                            ? new Date(l.sentAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </span>
                        <span className="date-time">
                          {l.sentAt
                            ? new Date(l.sentAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                            : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="table-action-btn"
                          title="Reenviar prueba"
                          onClick={() => {
                            setTestTo(l.toEmail);
                            setActiveTab('test');
                          }}
                        >
                          Reenviar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROBADOR / ENVIAR TEST */}
      {activeTab === 'test' && (
        <div className="comms-card test-form-card">
          <div className="test-form-header">
            <div className="test-icon-badge">
              <IconMail size={24} />
            </div>
            <div>
              <h3 className="comms-card-title">Enviar Correo de Prueba en Vivo</h3>
              <p className="helper-text">
                Despacha una simulación con variables personalizadas para comprobar el renderizado exacto y la entrega SMTP en tu bandeja.
              </p>
            </div>
          </div>

          <div className="test-form-grid">
            <div className="test-inputs-column">
              <div className="form-group">
                <label htmlFor="test-template-select">Plantilla a Despachar:</label>
                <select
                  id="test-template-select"
                  className="comms-input comms-select"
                  value={selectedTemplate.id}
                  onChange={e => {
                    const found = templates.find(t => t.id === e.target.value);
                    if (found) setSelectedTemplate(found);
                  }}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.displayName} ({t.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="test-recipient">Correo Destinatario de Prueba:</label>
                <div className="input-with-icon">
                  <IconMail className="input-icon" />
                  <input
                    id="test-recipient"
                    type="email"
                    className="comms-input with-icon"
                    value={testTo}
                    onChange={e => setTestTo(e.target.value)}
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="test-patient-name">Nombre del Paciente:</label>
                  <input
                    id="test-patient-name"
                    type="text"
                    className="comms-input"
                    value={testPatientName}
                    onChange={e => setTestPatientName(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="test-service-name">Especialidad / Servicio:</label>
                  <input
                    id="test-service-name"
                    type="text"
                    className="comms-input"
                    value={testServiceName}
                    onChange={e => setTestServiceName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="test-doctor-name">Médico Tratante:</label>
                  <input
                    id="test-doctor-name"
                    type="text"
                    className="comms-input"
                    value={testDoctorName}
                    onChange={e => setTestDoctorName(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="test-clinic-name">Nombre de Sede Clínica:</label>
                  <input
                    id="test-clinic-name"
                    type="text"
                    className="comms-input"
                    value={testClinicName}
                    onChange={e => setTestClinicName(e.target.value)}
                  />
                </div>
              </div>

              {testFeedback && (
                <div className={`feedback-banner ${testFeedback.type}`}>
                  <IconCheckCircle size={18} />
                  <span>{testFeedback.message}</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  id="btn-dispatch-test"
                  className="comms-btn primary lg"
                  onClick={handleSendTest}
                  disabled={!testTo}
                >
                  🚀 Despachar Correo de Prueba
                </button>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="test-info-column">
              <div className="test-guide-card">
                <h4 className="guide-title">
                  <IconBot size={18} /> Verificación de Seguridad
                </h4>
                <ul className="guide-list">
                  <li>
                    ✅ <strong>Protección Antispam:</strong> Headers DKIM y SPF configurados con firma RSA 2048-bit.
                  </li>
                  <li>
                    ✅ <strong>Sanitización HTML:</strong> El motor previene inyección de scripts externos.
                  </li>
                  <li>
                    ✅ <strong>Auditoría Inmediata:</strong> Cada despacho se registrará en la pestaña de Auditoría.
                  </li>
                </ul>

                <div className="guide-callout">
                  <span className="callout-icon">💡</span>
                  <div className="callout-text">
                    <strong>Tip Clínico:</strong> Puedes configurar webhooks en tu proveedor para recibir notificaciones de aperturas y clics de pacientes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="comms-card reminders-panel-card">
          <div className="reminders-header-box">
            <div className="reminders-header-left">
              <span className="cron-status-badge">
                <span className="pulse-dot green" /> Cron Engine Activo
              </span>
              <h3 className="comms-card-title">Motor de Recordatorios Programados (24h / 2h Cron)</h3>
              <p className="helper-text">
                El motor cron analiza continuamente la base de datos de citas y despacha recordatorios preventivos con control transaccional estricto y garantía de cero duplicidad.
              </p>
            </div>

            <div className="reminders-controls">
              <button
                id="btn-trigger-sweep"
                className="comms-btn primary"
                onClick={handleTriggerSweep}
                disabled={isSweeping}
              >
                {isSweeping ? '⏳ Ejecutando barrido...' : '🔄 Ejecutar Barrido Manual Ahora'}
              </button>
            </div>
          </div>

          {/* Workflow Cards */}
          <div className="cron-rules-grid">
            <div className="cron-rule-card">
              <div className="rule-badge blue">Alerta 24h</div>
              <h4 className="rule-title">Recordatorio Preventivo</h4>
              <p className="rule-desc">Busca citas de mañana donde <code>reminder_24h_sent = false</code>. Incluye botón de confirmación.</p>
              <div className="rule-footer">
                <span className="rule-freq">Frecuencia: Cada 30 min</span>
                <span className="rule-status ok">Activo</span>
              </div>
            </div>

            <div className="cron-rule-card">
              <div className="rule-badge amber">Alerta 2h</div>
              <h4 className="rule-title">Recordatorio Inmediato</h4>
              <p className="rule-desc">Envía SMS / WhatsApp urgente a citas del día con detalles de consultorio y sala de espera.</p>
              <div className="rule-footer">
                <span className="rule-freq">Frecuencia: Cada 15 min</span>
                <span className="rule-status ok">Activo</span>
              </div>
            </div>

            <div className="cron-rule-card">
              <div className="rule-badge purple">Post-Atención</div>
              <h4 className="rule-title">Encuesta de Calidad NPS</h4>
              <p className="rule-desc">Disparado 4h tras marcar la cita como <em>Atendida</em> para medir satisfacción médica.</p>
              <div className="rule-footer">
                <span className="rule-freq">Frecuencia: Cada 1 hora</span>
                <span className="rule-status ok">Activo</span>
              </div>
            </div>
          </div>

          {sweepResult && (
            <div className="sweep-results" id="sweep-results">
              <div className="sweep-results-header">
                <div className="sweep-title-wrap">
                  <IconCheckCircle className="sweep-ok-icon" size={20} />
                  <h4>Resultado del Último Barrido Transaccional:</h4>
                </div>
                <span className="sweep-timestamp">Hace unos segundos · {sweepResult.channel}</span>
              </div>

              <div className="sweep-grid">
                <div className="metric-box">
                  <span className="metric-val">{sweepResult.scanned}</span>
                  <span className="metric-label">Citas Escaneadas</span>
                </div>
                <div className="metric-box green">
                  <span className="metric-val">+{sweepResult.sent}</span>
                  <span className="metric-label">Recordatorios Despachados</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">{sweepResult.failed}</span>
                  <span className="metric-label">Fallidos / Omitidos</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommunicationsPage;
