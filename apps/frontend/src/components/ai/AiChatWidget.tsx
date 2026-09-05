import React, { useState, useRef, useEffect } from 'react';
import './AiChatWidget.css';

export interface AiSuggestedAction {
  label: string;
  actionType: 'book_service' | 'escalate_whatsapp' | 'call_phone' | 'view_faq';
  payload?: {
    specialtyId?: string;
    serviceId?: string;
    serviceName?: string;
    phone?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  suggestedActions?: AiSuggestedAction[];
}

interface AiChatWidgetProps {
  onStartBooking?: (specialtyId?: string, serviceId?: string) => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ onStartBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: '¡Hola! 👋 Soy tu asistente médico virtual de CitasSistema.\n\nPuedo orientarte con respecto a nuestros servicios, precios, especialistas y ayudarte a agendar tu cita en solo 2 minutos.',
      time: 'Justo ahora',
      suggestedActions: [
        { label: '💰 Ver Precios y Servicios', actionType: 'view_faq' },
        {
          label: '📅 Reservar una Cita',
          actionType: 'book_service',
          payload: { specialtyId: 'spec-fisioterapia' },
        },
        { label: '💬 WhatsApp de la Clínica', actionType: 'escalate_whatsapp' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Dynamic Intelligent Rule-based parsing simulation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let botReply: ChatMessage;

      if (
        lower.includes('dolor') ||
        lower.includes('duele') ||
        lower.includes('sintoma') ||
        lower.includes('síntoma') ||
        lower.includes('lesion') ||
        lower.includes('lesión') ||
        lower.includes('medicamento') ||
        lower.includes('fiebre') ||
        lower.includes('pastilla')
      ) {
        botReply = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: 'Como asistente virtual, por tu seguridad y cumplimiento médico **no puedo emitir diagnósticos clínicos ni recetar medicamentos**.\n\nTe sugerimos agendar una evaluación médica presencial en **Fisioterapia y Rehabilitación** para diagnosticar adecuadamente tu condición.',
          time,
          suggestedActions: [
            {
              label: '📅 Agendar Evaluación en Fisioterapia',
              actionType: 'book_service',
              payload: { specialtyId: 'spec-fisioterapia', serviceId: 'svc-fisioterapia' },
            },
            {
              label: '💬 Consultar con Recepción (WhatsApp)',
              actionType: 'escalate_whatsapp',
              payload: { phone: '+51987654321' },
            },
          ],
        };
      } else if (
        lower.includes('precio') ||
        lower.includes('costo') ||
        lower.includes('cuanto cuesta') ||
        lower.includes('cuánto cuesta') ||
        lower.includes('tarifa')
      ) {
        botReply = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: 'Nuestras tarifas principales y duraciones son:\n\n• **Terapia Manual Ortopédica**: S/ 80.00 (45 min)\n• **Rehabilitación Deportiva**: S/ 100.00 (50 min)\n• **Descarga Muscular**: S/ 70.00 (30 min)\n• **Consulta Médica Especializada**: S/ 120.00 (30 min)',
          time,
          suggestedActions: [
            {
              label: '📅 Agendar Terapia Manual (S/ 80)',
              actionType: 'book_service',
              payload: { specialtyId: 'spec-fisioterapia', serviceId: 'svc-terapia-manual' },
            },
            {
              label: '📅 Agendar Rehabilitación (S/ 100)',
              actionType: 'book_service',
              payload: { specialtyId: 'spec-rehabilitacion', serviceId: 'svc-rehab-deportiva' },
            },
          ],
        };
      } else if (lower.includes('ubicacion') || lower.includes('ubicación') || lower.includes('donde') || lower.includes('dónde') || lower.includes('telefono') || lower.includes('teléfono') || lower.includes('contacto')) {
        botReply = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: '📍 **Ubicación:** Av. Javier Prado Este 1234, San Isidro, Lima\n📞 **Teléfono:** +51 987 654 321\n💬 **WhatsApp:** +51 987 654 321\n⏰ **Horario:** Lunes a Sábado de 8:00 AM a 8:00 PM.',
          time,
          suggestedActions: [
            { label: '💬 Abrir WhatsApp', actionType: 'escalate_whatsapp', payload: { phone: '+51987654321' } },
            { label: '📞 Llamar a Recepción', actionType: 'call_phone', payload: { phone: '+51987654321' } },
          ],
        };
      } else {
        botReply = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: '¡Con gusto te ayudo! Puedes reservar tu cita médica en línea en solo 2 minutos seleccionando tu especialista y hora preferida.',
          time,
          suggestedActions: [
            { label: '📅 Iniciar Reserva Online', actionType: 'book_service' },
            { label: '💬 WhatsApp de Ayuda', actionType: 'escalate_whatsapp' },
          ],
        };
      }

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 500);
  };

  const handleActionClick = (action: AiSuggestedAction) => {
    if (action.actionType === 'book_service') {
      if (onStartBooking) {
        onStartBooking(action.payload?.specialtyId, action.payload?.serviceId);
      }
    } else if (action.actionType === 'escalate_whatsapp') {
      window.open('https://wa.me/51987654321?text=Hola,%20deseo%20consultar%20sobre%20una%20cita', '_blank');
    } else if (action.actionType === 'call_phone') {
      window.location.href = 'tel:+51987654321';
    } else if (action.actionType === 'view_faq') {
      handleSendMessage('¿Cuáles son los precios de los servicios?');
    }
  };

  return (
    <div className="ai-widget-container" id="ai-widget-root">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          className="ai-fab-button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir Asistente Virtual"
        >
          <span className="fab-icon">🤖</span>
          <span className="fab-badge">Asistente IA</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="ai-chat-window" id="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-bot-avatar">🤖</div>
              <div>
                <span className="ai-bot-name">Asistente Médico IA</span>
                <span className="ai-online-status">● En línea · CitasSistema</span>
              </div>
            </div>
            <button
              id="btn-close-ai-chat"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar Asistente"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-messages-area" id="ai-messages-area">
            {messages.map((m) => (
              <div key={m.id} className={`ai-message-row ${m.sender}`}>
                <div className="ai-bubble">
                  <div className="ai-bubble-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                  {/* Action Buttons */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="ai-actions-grid">
                      {m.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          className={`ai-action-btn ${act.actionType}`}
                          onClick={() => handleActionClick(act)}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="ai-bubble-time">{m.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message-row bot">
                <div className="ai-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="ai-quick-chips">
            <button className="ai-chip" onClick={() => handleSendMessage('¿Cuáles son los precios?')}>
              💰 Precios
            </button>
            <button className="ai-chip" onClick={() => handleSendMessage('Tengo dolor de espalda')}>
              🩺 Dolor muscular
            </button>
            <button className="ai-chip" onClick={() => handleSendMessage('¿Dónde están ubicados?')}>
              📍 Ubicación
            </button>
          </div>

          {/* Input Bar */}
          <form
            className="ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              id="ai-chat-input"
              type="text"
              placeholder="Escribe tu consulta aquí..."
              className="ai-chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button id="btn-ai-send" type="submit" className="ai-send-button" aria-label="Enviar Mensaje">
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiChatWidget;
