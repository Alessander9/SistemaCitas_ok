import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiKnowledgeService } from './ai-knowledge.service';
import { AiController } from './ai.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AiController],
  providers: [AiService, AiKnowledgeService],
  exports: [AiService, AiKnowledgeService],
})
export class AiAssistantModule {}
