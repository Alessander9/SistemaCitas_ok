import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessWebhookDto } from './dto/process-webhook.dto';
import { Public, CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { DatabaseService } from '../../database/database.service';
import { assertPatientOwnership } from '../../common/security/patient-ownership.util';
import { AuthenticatedUser, Payment, PaymentStatus, UserRole } from '@citassistema/shared-types';

@Controller('payments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly db: DatabaseService,
  ) { }

  @Post()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION, UserRole.PACIENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() clinicId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.create(clinicId, dto, userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION, UserRole.PACIENTE)
  async findOne(
    @CurrentTenant() clinicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Payment> {
    const payment = await this.paymentsService.findOne(clinicId, id);
    await assertPatientOwnership(this.db, clinicId, user, payment.patientId);
    return payment;
  }

  @Get()
  @Roles(UserRole.ADMIN_CLINIC, UserRole.RECEPCION)
  async findAll(
    @CurrentTenant() clinicId: string,
    @Query('patientId') patientId?: string,
    @Query('appointmentId') appointmentId?: string,
    @Query('status') status?: PaymentStatus,
  ): Promise<Payment[]> {
    return this.paymentsService.findAll(clinicId, { patientId, appointmentId, status });
  }

  @Public()
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() dto: ProcessWebhookDto,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-secret') secret?: string,
  ): Promise<{ status: string; message: string }> {
    return this.paymentsService.processWebhook(
      provider,
      {
        ...dto,
        signature: signature || dto.signature,
      },
      secret,
    );
  }
}
