import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MockEmailProvider } from './providers/mock-email-provider';
import { ResendEmailProvider } from './providers/resend-email-provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmailsController],
  providers: [EmailsService, MockEmailProvider, ResendEmailProvider],
  exports: [EmailsService, MockEmailProvider, ResendEmailProvider],
})
export class EmailsModule {}
