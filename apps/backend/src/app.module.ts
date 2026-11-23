import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
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
import { AdminModule } from './modules/admin/admin.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        const isTest = process.env.NODE_ENV === 'test';
        return [
          {
            ttl: 60000,
            limit: isTest ? 10000 : 120,
          },
        ];
      },
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
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

