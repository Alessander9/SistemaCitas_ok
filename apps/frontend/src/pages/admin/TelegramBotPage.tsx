import { useState } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import './TelegramBotPage.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  inlineButtons?: Array<{ text: string; action: string; apptId: string }>;
}

export function TelegramBotPage() {
  const [linkingCode, setLinkingCode] = useState<string | null>('482910');
  const [isLinked, setIsLinked] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '¡Hola Dr. Alejandro! Tu cuenta médica está vinculada al bot de CitasSistema.\n\nEscribe /hoy para consultar tu agenda del día o /pendientes para revisar solicitudes.',
      time: '08:00 AM',
    },
  ]);
  const [summaryNotification, setSummaryNotification] = useState<string | null>(null);

  const handleGenerateCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setLinkingCode(newCode);
    setIsLinked(false);
  };

  const handleSimulateLink = () => {
    setIsLinked(true);
    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        sender: 'bot',
        text: `*¡Cuenta vinculada exitosamente!*\n\nHola Dr. Alejandro, a partir de ahora recibirás notificaciones y el resumen diario a las 9:00 PM.`,
        time,
      },
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text, time };

    let botReply: ChatMessage;

    if (text === '/hoy') {
      botReply = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `*Citas de Hoy* (3):\n\n1. *09:00* — Lucía Ramos\n   _Terapia Manual_ [Confirmada]\n\n2. *11:30* — Roberto Vargas\n   _Evaluación Inicial_ [Confirmada]\n\n3. *16:00* — Carmen Morales\n   _Rehabilitación Lumbar_ [Pendiente]`,
        time,
      };
    } else if (text === '/manana') {
      botReply = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `*Citas para Mañana* (2):\n\n1. *08:30* — Valeria Paz\n   _Kinesiología Deportiva_ [Confirmada]\n\n2. *10:00* — Mario Duarte\n   _Descarga Muscular_ [Confirmada]`,
        time,
      };
    } else if (text === '/pendientes') {
      botReply = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `*Solicitud de Cita Pendiente*:\n\n*Paciente:* Esteban Quito\n*Servicio:* Terapia de Ondas de Choque\n*Fecha:* 04/09/2026 a las 15:00`,
        time,
        inlineButtons: [
          { text: 'Aceptar', action: 'accept', apptId: 'appt-101' },
          { text: 'Rechazar', action: 'reject', apptId: 'appt-101' },
        ],
      };
    } else if (text === '/ingresos') {
      botReply = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `*Resumen Financiero del Día*:\n\n• *Ingresos Totales:* S/ 850.00\n• *Pagos Procesados:* 6 transacciones`,
        time,
      };
    } else {
      botReply = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `*Comandos disponibles*:\n• /hoy — Tu agenda de hoy\n• /manana — Tu agenda de mañana\n• /pendientes — Citas pendientes con botones interactivos\n• /ingresos — Resumen de cobros del día`,
        time,
      };
    }

    setMessages(prev => [...prev, userMsg, botReply]);
    setChatInput('');
  };

  const handleInlineAction = (action: string, _apptId: string) => {
    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const replyText = action === 'accept'
      ? `*Cita confirmada exitosamente.* Se ha notificado al paciente.`
      : `*Cita rechazada.* Se ha liberado el horario.`;

    setMessages(prev => [
      ...prev,
      { id: `b_${Date.now()}`, sender: 'bot', text: replyText, time },
    ]);
  };

  const handleTrigger9PMSummary = () => {
    const time = '09:00 PM';
    const summaryMsg: ChatMessage = {
      id: `b_9pm_${Date.now()}`,
      sender: 'bot',
      text: `*Resumen de tu agenda para mañana (03/09/2026)*:\n\n1. *08:30* — Valeria Paz (Kinesiología Deportiva)\n2. *10:00* — Mario Duarte (Descarga Muscular)\n3. *14:30* — Sofía Delgado (Evaluación Postural)\n\n¡Que descanses!`,
      time,
    };
    setMessages(prev => [...prev, summaryMsg]);
    setSummaryNotification('Resumen 9:00 PM enviado al chat de Telegram del profesional');
    setTimeout(() => setSummaryNotification(null), 4000);
  };

  return (
    <div className="telegram-page">
      {/* Header */}
      <div className="telegram-header">
        <div>
          <h1 className="telegram-title">Integración con Telegram</h1>
          <p className="telegram-subtitle">Bot operativo para médicos · Agenda en tiempo real · Resumen diario 9:00 PM</p>
        </div>
        <div className="telegram-status">
          {isLinked ? (
            <span className="tg-badge linked" id="tg-status-badge">● Bot Conectado (@CitasSistemaBot)</span>
          ) : (
            <span className="tg-badge pending" id="tg-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <MaterialIcon name="warning" size={14} />
              <span>Pendiente de Vinculación</span>
            </span>
          )}
        </div>
      </div>

      <div className="telegram-grid">
        {/* Left Column: Linking & Controls */}
        <div className="telegram-controls-panel">
          {/* Card 1: Account Linking */}
          <div className="tg-card">
            <h3>Vinculación de Cuenta</h3>
            <p className="tg-desc">Vincula tu cuenta de Telegram para recibir alertas de citas y gestionar tu agenda por chat.</p>

            {linkingCode && (
              <div className="linking-box" id="linking-code-box">
                <span className="linking-label">Código de Vinculación:</span>
                <div className="code-display">
                  <span className="code-value">{linkingCode}</span>
                </div>
                <p className="linking-instructions">
                  1. Abre Telegram y busca <strong>@CitasSistemaBot</strong><br />
                  2. Envía el comando: <code>/start {linkingCode}</code>
                </p>
                <div className="linking-actions">
                  <button
                    id="btn-simulate-link"
                    className="tg-btn primary sm"
                    onClick={handleSimulateLink}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <MaterialIcon name="bolt" size={16} />
                    <span>Simular Vinculación Exitosa</span>
                  </button>
                  <button
                    id="btn-generate-code"
                    className="tg-btn ghost sm"
                    onClick={handleGenerateCode}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <MaterialIcon name="refresh" size={16} />
                    <span>Generar Nuevo Código</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: 9 PM Daily Summary */}
          <div className="tg-card">
            <h3>Resumen Automatizado 9:00 PM</h3>
            <p className="tg-desc">
              Cada noche a las 9:00 PM, el motor envía un resumen consolidado con la agenda de pacientes del día siguiente.
            </p>
            {summaryNotification && <div className="feedback-badge">{summaryNotification}</div>}
            <button
              id="btn-trigger-9pm"
              className="tg-btn secondary"
              onClick={handleTrigger9PMSummary}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <MaterialIcon name="nights_stay" size={16} />
              <span>Probar Envío Resumen 9 PM</span>
            </button>
          </div>
        </div>

        {/* Right Column: Telegram Interactive Simulator */}
        <div className="telegram-chat-mockup" id="telegram-chat-mockup">
          <div className="chat-top-bar">
            <div className="bot-avatar">
              <MaterialIcon name="smart_toy" size={20} />
            </div>
            <div className="bot-info">
              <span className="bot-name">CitasSistema Bot</span>
              <span className="bot-status">bot verificado</span>
            </div>
          </div>

          {/* Quick Command Chips */}
          <div className="quick-commands-bar">
            <button className="cmd-chip" onClick={() => handleSendMessage('/hoy')}>/hoy</button>
            <button className="cmd-chip" onClick={() => handleSendMessage('/manana')}>/manana</button>
            <button className="cmd-chip" onClick={() => handleSendMessage('/pendientes')}>/pendientes</button>
            <button className="cmd-chip" onClick={() => handleSendMessage('/ingresos')}>/ingresos</button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages-container" id="chat-messages-container">
            {messages.map(m => (
              <div key={m.id} className={`chat-bubble-wrapper ${m.sender}`}>
                <div className="chat-bubble">
                  <div className="bubble-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                  {m.inlineButtons && (
                    <div className="inline-buttons-grid">
                      {m.inlineButtons.map((btn, i) => (
                        <button
                          key={i}
                          className={`tg-inline-btn ${btn.action}`}
                          onClick={() => handleInlineAction(btn.action, btn.apptId)}
                        >
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="bubble-time">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            className="chat-input-bar"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              id="chat-input"
              type="text"
              placeholder="Escribe un comando (ej: /hoy)..."
              className="tg-chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button id="btn-send-msg" type="submit" className="tg-send-btn" aria-label="Enviar">
              <MaterialIcon name="send" size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TelegramBotPage;
