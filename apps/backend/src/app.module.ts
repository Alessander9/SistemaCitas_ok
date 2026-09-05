import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { ServicesModule } from './modules/services/services.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { CashModule } from './modules/cash/cash.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EmailsModule } from './modules/emails/emails.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { AiAssistantModule } from './modules/ai/ai.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    SpecialtiesModule,
    ServicesModule,
    ProfessionalsModule,
    SchedulesModule,
    AppointmentsModule,
    PaymentsModule,
    PatientsModule,
    ClinicalModule,
    CashModule,
    InventoryModule,
    EmailsModule,
    TelegramModule,
    AiAssistantModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
