import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ManualPaymentProvider } from './providers/manual-payment.provider';
import { GatewayPaymentProvider } from './providers/gateway-payment.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ManualPaymentProvider, GatewayPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
