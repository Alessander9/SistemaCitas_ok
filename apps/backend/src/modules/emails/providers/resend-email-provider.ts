import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider, SendMailOptions, SendMailResult } from './email-provider.interface';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly apiKey: string | undefined;
  private readonly brevoApiKey: string | undefined;
  private readonly defaultFrom: string;
  private readonly brevoSenderEmail: string;
  private readonly brevoSenderName: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.brevoApiKey = process.env.BREVO_API_KEY;
    this.defaultFrom =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      'Clínica VitalSalud <onboarding@resend.dev>';
    this.brevoSenderEmail =
      process.env.BREVO_SENDER_EMAIL || 'emaautomatizacion22@gmail.com';
    this.brevoSenderName =
      process.env.BREVO_SENDER_NAME || 'Clínica VitalSalud';
  }

  private async sendViaBrevo(options: SendMailOptions): Promise<SendMailResult | null> {
    if (!this.brevoApiKey) return null;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.brevoSenderName,
            email: this.brevoSenderEmail,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        messageId?: string;
        message?: string;
      };

      if (response.ok) {
        this.logger.log(
          `[ResendEmailProvider/Brevo] Correo enviado exitosamente a cualquier destinatario (${options.to}) con id: ${data.messageId}`,
        );
        return {
          messageId: data.messageId || `brevo_${Date.now()}`,
          success: true,
        };
      }

      this.logger.warn(
        `[ResendEmailProvider/Brevo] Error HTTP ${response.status}: ${JSON.stringify(data)}. Continuando con Resend...`,
      );
      return null;
    } catch (err) {
      this.logger.warn(
        `[ResendEmailProvider/Brevo] Excepción: ${(err as Error).message}. Continuando con Resend...`,
      );
      return null;
    }
  }

  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    // 1. Si BREVO_API_KEY está configurada, usar Brevo primero (no requiere dominio propio para enviar a cualquier correo)
    const brevoResult = await this.sendViaBrevo(options);
    if (brevoResult) {
      return brevoResult;
    }

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
        const msg = data.message || '';
        // Detectar restricción Sandbox de Resend (403: "You can only send testing emails to your own email address (xxx@gmail.com)")
        const sandboxMatch = msg.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
        const fallbackInbox =
          sandboxMatch?.[1] || process.env.RESEND_SANDBOX_FALLBACK_EMAIL;

        if (
          response.status === 403 &&
          fallbackInbox &&
          fallbackInbox.toLowerCase() !== options.to.toLowerCase()
        ) {
          this.logger.warn(
            `[ResendEmailProvider] Modo Sandbox detectado para ${options.to}. Redirigiendo entrega real al buzón verificado: ${fallbackInbox}`,
          );

          const redirectBanner = `
            <div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-family:Arial,sans-serif;font-size:13px;">
              <strong>📬 Modo Sandbox Resend:</strong> Este correo estaba dirigido originalmente a <strong>${options.to}</strong> y fue entregado en tu buzón autorizado (<strong>${fallbackInbox}</strong>).
            </div>
          `;

          const retryRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: this.defaultFrom,
              to: [fallbackInbox],
              subject: `[Para: ${options.to}] ${options.subject}`,
              html: `${redirectBanner}${options.html}`,
            }),
          });

          const retryData = (await retryRes.json()) as { id?: string; message?: string };
          if (retryRes.ok) {
            this.logger.log(
              `[ResendEmailProvider] Correo entregado exitosamente vía Sandbox Fallback (${fallbackInbox}) con id: ${retryData.id}`,
            );
            return {
              messageId: retryData.id || `resend_sandbox_${Date.now()}`,
              success: true,
            };
          }
        }

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
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido al contactar Resend API';
      this.logger.error(`[ResendEmailProvider] Excepción al enviar correo: ${errorMsg}`);
      return {
        messageId: '',
        success: false,
        error: errorMsg,
      };
    }
  }
}
