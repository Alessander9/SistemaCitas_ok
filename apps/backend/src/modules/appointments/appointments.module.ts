import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [DatabaseModule, EmailsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
