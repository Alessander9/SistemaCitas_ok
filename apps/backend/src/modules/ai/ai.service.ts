import { Injectable } from '@nestjs/common';
import { AiKnowledgeService } from './ai-knowledge.service';
import { AiChatQueryDto } from './dto/ai-chat-query.dto';
import {
  AiChatResponse,
  AiSuggestedAction,
} from '@citassistema/shared-types';

@Injectable()
export class AiService {
  constructor(private readonly knowledgeService: AiKnowledgeService) {}

  async answerQuery(dto: AiChatQueryDto): Promise<AiChatResponse> {
    const knowledge = await this.knowledgeService.getClinicKnowledge(dto.clinicId);
    const message = dto.message.toLowerCase().trim();

    // -------------------------------------------------------------------------
    // 1. GUARDRAIL: Contención Médica Estricta (No diagnósticos / No recetas)
    // -------------------------------------------------------------------------
    const medicalKeywords = [
      'dolor', 'duele', 'síntoma', 'sintomas', 'fiebre', 'mareo', 'inflamación',
      'medicamento', 'pastilla', 'remedio', 'diagnostico', 'diagnóstico',
      'lesión', 'lesion', 'esguince', 'fractura', 'tos', 'gripe', 'molestia',
      'espalda', 'rodilla', 'hombro', 'lumbar', 'cervical', 'enfermedad',
    ];

    const isMedicalQuery = medicalKeywords.some((kw) => message.includes(kw));

    if (isMedicalQuery) {
      // Find suitable matching service / specialty
      let matchedService = knowledge.services[0];
      if (message.includes('espalda') || message.includes('lumbar') || message.includes('rodilla') || message.includes('lesion') || message.includes('dolor')) {
        const fisio = knowledge.services.find((s) => s.name.toLowerCase().includes('fisio') || s.specialtyName.toLowerCase().includes('fisio'));
        if (fisio) matchedService = fisio;
      }

      const actions: AiSuggestedAction[] = [];
      if (matchedService) {
        actions.push({
          label: `📅 Agendar ${matchedService.name}`,
          actionType: 'book_service',
          payload: {
            specialtyId: matchedService.specialtyId,
            serviceId: matchedService.id,
            serviceName: matchedService.name,
          },
        });
      }

      actions.push({
        label: '💬 Consultar por WhatsApp',
        actionType: 'escalate_whatsapp',
        payload: { phone: knowledge.whatsapp },
      });

      return {
        reply: `Como asistente virtual de ${knowledge.clinicName}, por tu seguridad y cumplimiento médico normativo **no puedo emitir diagnósticos clínicos ni recetar medicamentos**.\n\nTe sugerimos agendar una evaluación médica presencial con nuestros especialistas${matchedService ? ` en **${matchedService.specialtyName}**` : ''} para diagnosticar adecuadamente tu condición.`,
        suggestedActions: actions,
        intent: 'medical_inquiry',
      };
    }

    // -------------------------------------------------------------------------
    // 2. GUARDRAIL: Veracidad de Precios, Tarifas y Duración de Servicios
    // -------------------------------------------------------------------------
    const pricingKeywords = ['precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'cuánto cuesta', 'tarifa', 'valor', 'cuanto vale', 'cuánto vale', 'duracion', 'duración'];
    const isPricingQuery = pricingKeywords.some((kw) => message.includes(kw));

    if (isPricingQuery) {
      // Check if user asked about a specific service
      const specificService = knowledge.services.find((s) => message.includes(s.name.toLowerCase()) || message.includes(s.specialtyName.toLowerCase()));

      if (specificService) {
        return {
          reply: `El servicio de **${specificService.name}** (${specificService.specialtyName}) tiene un costo de **${specificService.currency} ${specificService.price.toFixed(2)}** con una duración estimada de **${specificService.durationMinutes} minutos**.\n\n¿Deseas reservar tu horario ahora?`,
          suggestedActions: [
            {
              label: `📅 Agendar ${specificService.name}`,
              actionType: 'book_service',
              payload: {
                specialtyId: specificService.specialtyId,
                serviceId: specificService.id,
                serviceName: specificService.name,
              },
            },
            {
              label: '💬 Consultar por WhatsApp',
              actionType: 'escalate_whatsapp',
              payload: { phone: knowledge.whatsapp },
            },
          ],
          intent: 'pricing',
        };
      }

      // General pricing list
      const servicesList = knowledge.services
        .slice(0, 4)
        .map((s) => `• **${s.name}**: ${s.currency} ${s.price.toFixed(2)} (${s.durationMinutes} min)`)
        .join('\n');

      return {
        reply: `Aquí tienes los precios y tiempos de nuestros principales servicios en ${knowledge.clinicName}:\n\n${servicesList}\n\nPuedes seleccionar cualquiera de ellos para reservar en línea.`,
        suggestedActions: knowledge.services.slice(0, 2).map((s) => ({
          label: `📅 Agendar ${s.name}`,
          actionType: 'book_service',
          payload: {
            specialtyId: s.specialtyId,
            serviceId: s.id,
            serviceName: s.name,
          },
        })),
        intent: 'pricing',
      };
    }

    // -------------------------------------------------------------------------
    // 3. Catálogo de Especialidades y Profesionales
    // -------------------------------------------------------------------------
    const catalogKeywords = ['especialidad', 'especialidades', 'medicos', 'médicos', 'doctores', 'doctor', 'profesional', 'quienes atienden', 'quiénes atienden'];
    const isCatalogQuery = catalogKeywords.some((kw) => message.includes(kw));

    if (isCatalogQuery) {
      const specList = knowledge.specialties.map((sp) => `• **${sp.name}**`).join('\n');
      const docList = knowledge.professionals.slice(0, 3).map((p) => `• Dr(a). ${p.name} — _${p.specialtyName}_`).join('\n');

      return {
        reply: `En **${knowledge.clinicName}** contamos con las siguientes especialidades médicas:\n\n${specList}\n\n👨‍⚕️ **Staff destacado**:\n${docList}`,
        suggestedActions: [
          {
            label: '📅 Reservar Cita',
            actionType: 'book_service',
          },
          {
            label: '💬 Contactar por WhatsApp',
            actionType: 'escalate_whatsapp',
            payload: { phone: knowledge.whatsapp },
          },
        ],
        intent: 'faq',
      };
    }

    // -------------------------------------------------------------------------
    // 4. Contacto, Ubicación y Escalamiento Humano
    // -------------------------------------------------------------------------
    const contactKeywords = ['contacto', 'telefono', 'teléfono', 'whatsapp', 'ubicacion', 'ubicación', 'donde estan', 'dónde están', 'direccion', 'dirección', 'horario', 'horarios', 'humano', 'hablar'];
    const isContactQuery = contactKeywords.some((kw) => message.includes(kw));

    if (isContactQuery) {
      return {
        reply: `📍 **Ubicación:** ${knowledge.address ?? 'Av. Principal 123'}\n📞 **Teléfono:** ${knowledge.phone ?? '+51 987 654 321'}\n💬 **WhatsApp:** ${knowledge.whatsapp ?? '+51 987 654 321'}\n⏰ **Atención:** Lunes a Sábado de 8:00 AM a 8:00 PM.\n\n¿En qué más te podemos ayudar?`,
        suggestedActions: [
          {
            label: '💬 Abrir WhatsApp',
            actionType: 'escalate_whatsapp',
            payload: { phone: knowledge.whatsapp },
          },
          {
            label: '📞 Llamar a Recepción',
            actionType: 'call_phone',
            payload: { phone: knowledge.phone },
          },
        ],
        intent: 'escalation',
      };
    }

    // -------------------------------------------------------------------------
    // 5. Reserva o Saludo General
    // -------------------------------------------------------------------------
    return {
      reply: `¡Hola! Soy el asistente virtual de **${knowledge.clinicName}** 🩺.\n\nPuedo orientarte con información sobre nuestros servicios médicos, precios, horarios y guiarte para reservar tu cita 100% en línea en solo 2 minutos.\n\n¿Qué consulta tienes hoy?`,
      suggestedActions: [
        {
          label: '📅 Reservar una Cita',
          actionType: 'book_service',
        },
        {
          label: '💰 Consultar Precios',
          actionType: 'view_faq',
        },
        {
          label: '💬 Chat de WhatsApp',
          actionType: 'escalate_whatsapp',
          payload: { phone: knowledge.whatsapp },
        },
      ],
      intent: 'general',
    };
  }
}
