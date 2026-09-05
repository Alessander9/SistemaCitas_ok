import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { AiKnowledgeService } from './ai-knowledge.service';
import { ClinicKnowledgeSnapshot } from '@citassistema/shared-types';

describe('AiService', () => {
  let service: AiService;
  let knowledgeService: { getClinicKnowledge: jest.Mock };

  const mockKnowledge: ClinicKnowledgeSnapshot = {
    clinicName: 'Clínica Sanitas Lima',
    phone: '+51 987 654 321',
    whatsapp: '+51 987 654 321',
    address: 'Av. Javier Prado Este 1234, San Isidro',
    specialties: [
      { id: 'spec-1', name: 'Fisioterapia y Rehabilitación' },
      { id: 'spec-2', name: 'Traumatología' },
    ],
    services: [
      {
        id: 'svc-1',
        specialtyId: 'spec-1',
        specialtyName: 'Fisioterapia y Rehabilitación',
        name: 'Terapia Manual Ortopédica',
        durationMinutes: 45,
        price: 80.0,
        currency: 'S/',
      },
      {
        id: 'svc-2',
        specialtyId: 'spec-2',
        specialtyName: 'Traumatología',
        name: 'Consulta Traumatológica',
        durationMinutes: 30,
        price: 120.0,
        currency: 'S/',
      },
    ],
    professionals: [
      { id: 'prof-1', name: 'Dr. Alejandro Morales', specialtyName: 'Traumatología' },
    ],
  };

  beforeEach(async () => {
    knowledgeService = {
      getClinicKnowledge: jest.fn().mockResolvedValue(mockKnowledge),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: AiKnowledgeService, useValue: knowledgeService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  // ===========================================================================
  // 1. GUARDRAIL: CONTENCIÓN MÉDICA
  // ===========================================================================
  describe('Medical Containment Guardrail', () => {
    it('should refuse to give diagnosis or prescribe medication and recommend booking an evaluation', async () => {
      const response = await service.answerQuery({
        message: 'Tengo un dolor muy fuerte en la espalda baja y mareos, ¿qué pastilla me tomo?',
      });

      expect(response.intent).toBe('medical_inquiry');
      expect(response.reply).toContain('no puedo emitir diagnósticos clínicos ni recetar medicamentos');
      expect(response.reply).toContain('evaluación médica presencial');
      expect(response.suggestedActions).toBeDefined();

      const bookingAction = response.suggestedActions?.find((a) => a.actionType === 'book_service');
      expect(bookingAction).toBeDefined();
      expect(bookingAction?.payload?.serviceId).toBe('svc-1');
    });

    it('should contain escalation action to WhatsApp on medical inquiries', async () => {
      const response = await service.answerQuery({
        message: 'Me caí jugando fútbol y me duele la rodilla, creo que es un esguince',
      });

      const whatsappAction = response.suggestedActions?.find((a) => a.actionType === 'escalate_whatsapp');
      expect(whatsappAction).toBeDefined();
      expect(whatsappAction?.payload?.phone).toBe('+51 987 654 321');
    });
  });

  // ===========================================================================
  // 2. GUARDRAIL: VERACIDAD DE PRECIOS Y SERVICIOS
  // ===========================================================================
  describe('Pricing and Service Verifiability', () => {
    it('should return exact price and duration configured in database for a specific service', async () => {
      const response = await service.answerQuery({
        message: '¿Cuánto cuesta la terapia manual ortopédica?',
      });

      expect(response.intent).toBe('pricing');
      expect(response.reply).toContain('Terapia Manual Ortopédica');
      expect(response.reply).toContain('S/ 80.00');
      expect(response.reply).toContain('45 minutos');

      const action = response.suggestedActions?.find((a) => a.actionType === 'book_service');
      expect(action?.payload?.serviceId).toBe('svc-1');
      expect(action?.payload?.specialtyId).toBe('spec-1');
    });

    it('should list all major services with exact prices when general pricing is requested', async () => {
      const response = await service.answerQuery({
        message: '¿Cuáles son los precios de sus consultas?',
      });

      expect(response.intent).toBe('pricing');
      expect(response.reply).toContain('S/ 80.00');
      expect(response.reply).toContain('S/ 120.00');
    });
  });

  // ===========================================================================
  // 3. HUMAN ESCALATION & GENERAL ASSISTANCE
  // ===========================================================================
  describe('Human Escalation & Contact', () => {
    it('should return phone, whatsapp and address when asked for contact info', async () => {
      const response = await service.answerQuery({
        message: '¿Dónde están ubicados y cuál es su número de teléfono o whatsapp?',
      });

      expect(response.intent).toBe('escalation');
      expect(response.reply).toContain('Av. Javier Prado Este 1234');
      expect(response.reply).toContain('+51 987 654 321');

      const callAction = response.suggestedActions?.find((a) => a.actionType === 'call_phone');
      expect(callAction).toBeDefined();
    });

    it('should return helpful welcoming message on general greetings', async () => {
      const response = await service.answerQuery({
        message: 'Hola, buenos días',
      });

      expect(response.intent).toBe('general');
      expect(response.reply).toContain('Clínica Sanitas Lima');
      expect(response.suggestedActions?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
