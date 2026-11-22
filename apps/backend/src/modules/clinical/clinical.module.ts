import { Module } from '@nestjs/common';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
import { ClinicalVoiceAssistantService } from './clinical-voice-assistant.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClinicalController],
  providers: [ClinicalService, ClinicalVoiceAssistantService],
  exports: [ClinicalService, ClinicalVoiceAssistantService],
})
export class ClinicalModule {}
