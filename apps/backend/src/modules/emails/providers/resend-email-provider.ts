import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider, SendMailOptions, SendMailResult } from './email-provider.interface';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly apiKey: string | undefined;
  private readonly defaultFrom: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.defaultFrom =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      'Clínica VitalSalud <onboarding@resend.dev>';
  }

  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    if (!this.apiKey) {
      this.logger.warn(
        `[ResendEmailProvider] RESEND_API_KEY no configurada. Simulando envío a: ${options.to} con asunto: "${options.subject}"`,
      );
      return {
        messageId: `mock_resend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        success: true,
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.defaultFrom,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string; name?: string };

      if (!response.ok) {
        this.logger.error(
          `[ResendEmailProvider] Error al enviar correo vía Resend (${response.status}): ${JSON.stringify(data)}`,
        );
        return {
          messageId: '',
          success: false,
          error: data.message || `HTTP ${response.status} de la API de Resend`,
        };
      }

      this.logger.log(
        `[ResendEmailProvider] Correo enviado exitosamente con id: ${data.id} a ${options.to}`,
      );

      return {
        messageId: data.id || `resend_${Date.now()}`,
        success: true,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al contactar Resend API';
      this.logger.error(`[ResendEmailProvider] Excepción al enviar correo: ${errorMsg}`);
      return {
        messageId: '',
        success: false,
        error: errorMsg,
      };
    }
  }
}
