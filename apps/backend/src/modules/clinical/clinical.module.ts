import { Module } from '@nestjs/common';
import { ClinicalController } from './clinical.controller';
import { ClinicalKnowledgeController } from './clinical-knowledge.controller';
import { ClinicalService } from './clinical.service';
import { ClinicalKnowledgeService } from './clinical-knowledge.service';
import { ClinicalVoiceAssistantService } from './clinical-voice-assistant.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClinicalController, ClinicalKnowledgeController],
  providers: [ClinicalService, ClinicalKnowledgeService, ClinicalVoiceAssistantService],
  exports: [ClinicalService, ClinicalKnowledgeService, ClinicalVoiceAssistantService],
})
export class ClinicalModule {}
