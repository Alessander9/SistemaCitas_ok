import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';

interface WhatsAppAppointmentData {
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  specialty?: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  serviceType?: string;
}

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhatsAppAppointmentData;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [phone, setPhone] = useState(data.patientPhone || '51987654321');
  const [template, setTemplate] = useState<'reminder' | 'confirm' | 'prescription'>('reminder');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getMessageText = () => {
    const loc = data.location || 'Clínica Médica Central - Sede Principal (Av. Javier Prado Este 1234)';
    const doc = data.doctorName ? `Dr(a). ${data.doctorName}` : 'nuestro equipo médico';
    const spec = data.specialty ? ` (${data.specialty})` : '';
    const dt = data.dateStr ? `${data.dateStr} a las ${data.timeStr || '10:00 AM'}` : 'su horario reservado';

    if (template === 'reminder') {
      return (
`👋 *¡Hola ${data.patientName}!*

Le recordamos su próxima cita médica en *Clínica VitalSalud*:

👨‍⚕️ *Especialista:* ${doc}${spec}
📅 *Fecha y Hora:* ${dt}
📍 *Ubicación:* ${loc}

⚠️ *Recomendaciones:*
• Llegar 15 minutos antes con su DNI.
• Si requiere cancelar o reprogramar, responda a este mensaje con anticipación.

¡Cuidamos de su salud con la mejor atención!`
      );
    }

    if (template === 'confirm') {
      return (
`✅ *¡Cita Confirmada, ${data.patientName}!*

Su consulta con ${doc}${spec} ha sido validada con éxito.

🗓 *Cita programada:* ${dt}
🏥 *Consultorio:* Box 102 - Piso 1
🎫 *Código de Triage:* #${Math.floor(1000 + Math.random() * 9000)}

Por favor presente este mensaje en el counter de recepción al llegar.`
      );
    }

    return (
`📋 *Receta Médica y Plan de Tratamiento*

Estimado(a) *${data.patientName}*,
El ${doc} ha emitido su receta médica electrónica y resumen de consulta.

🔗 *Ver Receta Oficial con QR:*
https://vitalsalud.pe/receta-digital/consulta-${Math.floor(100000 + Math.random() * 900000)}

🏥 *Farmacia Institucional:* Puede reclamar sus medicamentos con su DNI directamente en nuestra farmacia con 15% de descuento.`
    );
  };

  const currentMessage = getMessageText();

  const handleSendWhatsApp = () => {
    soundEffects.playPop();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(currentMessage);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    soundEffects.playPop();
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
              📱
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Enviar Mensaje WhatsApp</h3>
              <p className="text-xs text-emerald-100">Notificación directa y personalizada al paciente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Template Selectors */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Tipo de Plantilla
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('reminder')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  template === 'reminder'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                ⏰ Recordatorio
              </button>
              <button
                type="button"
                onClick={() => setTemplate('confirm')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  template === 'confirm'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                ✅ Confirmación
              </button>
              <button
                type="button"
                onClick={() => setTemplate('prescription')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  template === 'prescription'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                💊 Receta/Link
              </button>
            </div>
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Teléfono WhatsApp del Paciente
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400">📞</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 51999888777"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Incluir código de país (Ej: 51 para Perú).</p>
          </div>

          {/* Preview Box Styled like WhatsApp Bubble */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Vista Previa del Mensaje
            </label>
            <div className="p-4 rounded-xl bg-[#e5ddd5] dark:bg-[#0b141a] border border-slate-300 dark:border-slate-800 shadow-inner">
              <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3.5 rounded-lg rounded-tr-none shadow-sm text-xs font-sans whitespace-pre-wrap leading-relaxed">
                {currentMessage}
                <div className="text-[10px] text-right text-slate-500 dark:text-slate-300 mt-2 flex items-center justify-end gap-1">
                  <span>Ahora</span>
                  <span>✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? '✅ Copiado' : '📋 Copiar Texto'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <span>📲</span>
              <span>Abrir WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
