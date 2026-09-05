import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiKnowledgeService } from './ai-knowledge.service';
import { AiChatQueryDto } from './dto/ai-chat-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeService: AiKnowledgeService,
  ) {}

  // POST /ai/chat — Consulta interactiva pública para pacientes y visitantes
  @Post('chat')
  @Public()
  chat(@Body() dto: AiChatQueryDto) {
    return this.aiService.answerQuery(dto);
  }

  // GET /ai/knowledge — Base de conocimiento de la clínica para auditoría
  @Get('knowledge')
  @Public()
  getKnowledge(@Query('clinicId') clinicId?: string) {
    return this.knowledgeService.getClinicKnowledge(clinicId);
  }
}
