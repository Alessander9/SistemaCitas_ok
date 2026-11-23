export interface DefaultEmailTemplate {
  name: string;
  subject: string;
  htmlBody: string;
  variables: string[];
}

interface EmailLayoutOptions {
  accentColor: string;
  accentGradient: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  footerNote?: string;
}

function buildEmailLayout(opts: EmailLayoutOptions): string {
  const footerNote =
    opts.footerNote ??
    'Este correo fue enviado automáticamente por {{clinic_name}}. Por favor no respondas directamente a este mensaje.';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: ${opts.accentColor}; background: ${opts.accentGradient}; padding: 32px 36px 28px 36px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 36px; height: 36px; background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; text-align: center; vertical-align: middle; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 36px;">
                          +
                        </td>
                        <td style="padding-left: 12px;">
                          <div style="font-size: 19px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2;">
                            {{clinic_name}}
                          </div>
                          <div style="font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px;">
                            Centro Médico Especializado
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: ${opts.badgeBg}; color: ${opts.badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; padding: 6px 12px; border-radius: 999px;">
                      ${opts.badgeText}
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 24px 0 6px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.25; letter-spacing: -0.4px;">
                ${opts.title}
              </h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.5;">
                ${opts.subtitle}
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 36px;">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #334155;">
                {{clinic_name}}
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                ${footerNote}
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 {{clinic_name}} · Atención Médica de Calidad
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    name: 'appointment_confirmation',
    subject: '✓ Confirmación de tu cita {{booking_code}} — {{clinic_name}}',
    htmlBody: buildEmailLayout({
      accentColor: '#0d9488',
      accentGradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)',
      badgeText: '✓ Confirmada',
      badgeBg: 'rgba(255, 255, 255, 0.22)',
      badgeColor: '#ffffff',
      title: '¡Tu cita ha sido confirmada!',
      subtitle: 'Hola {{patient_name}}, te compartimos el comprobante y los detalles de tu próxima atención.',
      bodyHtml: `
        <!-- Booking Code Ticket -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdfa; border: 1.5px dashed #14b8a6; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0f766e; margin-bottom: 6px;">
                Código de Reserva
              </div>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 800; color: #0f766e; letter-spacing: 2px;">
                {{booking_code}}
              </div>
            </td>
          </tr>
        </table>

        <!-- Date & Time Highlight Bar -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td width="50%" style="padding: 16px 20px; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; margin-bottom: 4px;">
                📅 Fecha
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                {{appointment_date}}
              </div>
            </td>
            <td width="50%" style="padding: 16px 20px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; margin-bottom: 4px;">
                ⏰ Hora de atención
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #0d9488;">
                {{start_time}} hrs
              </div>
            </td>
          </tr>
        </table>

        <!-- Details Table -->
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 12px;">
          Resumen de tu atención
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 38%;">Servicio</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">{{service_name}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Especialidad</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">{{specialty_name}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Especialista</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">Dr(a). {{professional_name}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Sede de atención</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500; color: #0f172a;">{{clinic_address}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Método de pago</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500; color: #0f172a;">{{payment_method}}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 14px 18px; font-size: 13px; font-weight: 700; color: #334155;">Monto de la consulta</td>
            <td style="padding: 14px 18px; font-size: 16px; font-weight: 800; color: #0f766e;">S/. {{amount}}</td>
          </tr>
        </table>

        <!-- Preparation Callout -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #0d9488; border-radius: 0 10px 10px 0;">
          <tr>
            <td style="padding: 16px 18px;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                Recomendaciones antes de tu visita
              </div>
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                • Preséntate <strong>10 minutos antes</strong> de tu horario reservado.<br />
                • Lleva tu documento de identidad (DNI o CE) y tu código de reserva.<br />
                • ¿Necesitas reprogramar o cancelar? Contáctanos al <strong>{{clinic_phone}}</strong>.
              </p>
            </td>
          </tr>
        </table>
      `,
      footerNote: 'Sede: {{clinic_address}} · Central Telefónica: {{clinic_phone}}',
    }),
    variables: [
      'patient_name',
      'booking_code',
      'service_name',
      'specialty_name',
      'professional_name',
      'appointment_date',
      'start_time',
      'clinic_name',
      'clinic_address',
      'clinic_phone',
      'amount',
      'payment_method',
    ],
  },
  {
    name: 'appointment_clinic_notification',
    subject: '📋 [Nueva Cita] {{service_name}} — {{patient_name}} ({{appointment_date}} {{start_time}})',
    htmlBody: buildEmailLayout({
      accentColor: '#0f172a',
      accentGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f766e 100%)',
      badgeText: 'Nueva Reserva',
      badgeBg: 'rgba(20, 184, 166, 0.25)',
      badgeColor: '#5eead4',
      title: 'Nueva cita registrada en agenda',
      subtitle: 'Se ha confirmado una nueva reserva médica para {{clinic_name}}.',
      bodyHtml: `
        <!-- Quick Summary Strip -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #0f766e;">Código</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">{{booking_code}}</div>
                  </td>
                  <td align="right">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #0f766e;">Turno Asignado</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">{{appointment_date}} · {{start_time}} hrs</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Patient Information -->
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 10px;">
          Datos del Paciente
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 22px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 35%;">Nombre completo</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">{{patient_name}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Documento</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500; color: #0f172a;">{{patient_doc}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Teléfono</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500; color: #0f172a;">{{patient_phone}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Correo electrónico</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 500; color: #0d9488;">{{patient_email}}</td>
          </tr>
        </table>

        <!-- Clinical Details -->
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 10px;">
          Detalles de la Atención
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 22px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 35%;">Servicio</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">{{service_name}} ({{specialty_name}})</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Profesional</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">Dr(a). {{professional_name}}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Facturación</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f766e;">S/. {{amount}} · {{payment_method}}</td>
          </tr>
        </table>

        <!-- Notes Box -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #334155; border-radius: 0 10px 10px 0;">
          <tr>
            <td style="padding: 14px 18px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #334155; margin-bottom: 4px;">
                Motivo / Notas del paciente
              </div>
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.55;">
                {{notes}}
              </p>
            </td>
          </tr>
        </table>
      `,
      footerNote: 'Notificación interna generada automáticamente para recepción y equipo clínico de {{clinic_name}}.',
    }),
    variables: [
      'booking_code',
      'patient_name',
      'patient_doc',
      'patient_phone',
      'patient_email',
      'service_name',
      'specialty_name',
      'professional_name',
      'appointment_date',
      'start_time',
      'clinic_name',
      'amount',
      'payment_method',
      'notes',
    ],
  },
  {
    name: 'password_reset',
    subject: '🔐 Restablece tu contraseña — {{clinic_name}}',
    htmlBody: buildEmailLayout({
      accentColor: '#0f766e',
      accentGradient: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
      badgeText: 'Seguridad',
      badgeBg: 'rgba(255, 255, 255, 0.18)',
      badgeColor: '#ffffff',
      title: 'Solicitud de recuperación de contraseña',
      subtitle: 'Protegemos tu cuenta en {{clinic_name}} con verificación segura.',
      bodyHtml: `
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Estimado(a) <strong>{{user_name}}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el portal de <strong>{{clinic_name}}</strong>. Haz clic en el siguiente botón para crear una nueva contraseña segura:
        </p>

        <!-- Primary CTA -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
          <tr>
            <td align="center">
              <a href="{{reset_url}}" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.28);">
                Restablecer mi contraseña
              </a>
            </td>
          </tr>
        </table>

        <!-- Security Alert -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px 18px; font-size: 13px; color: #92400e; line-height: 1.5;">
              ⏳ <strong>Este enlace expirará en 60 minutos.</strong> Si no solicitaste este cambio, puedes ignorar este mensaje; tu cuenta permanecerá protegida.
            </td>
          </tr>
        </table>

        <!-- Fallback Link -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; margin-bottom: 6px;">
            Si el botón no funciona, copia y pega este enlace:
          </div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #0f766e; word-break: break-all;">
            {{reset_url}}
          </div>
        </div>
      `,
    }),
    variables: ['user_name', 'reset_url', 'clinic_name'],
  },
  {
    name: 'appointment_reminder_24h',
    subject: '⏰ Recordatorio: tu cita es mañana a las {{start_time}} — {{clinic_name}}',
    htmlBody: buildEmailLayout({
      accentColor: '#1d4ed8',
      accentGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
      badgeText: 'Recordatorio 24h',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeColor: '#ffffff',
      title: '¡Te esperamos mañana en tu cita!',
      subtitle: 'Hola {{patient_name}}, te recordamos los datos de tu consulta programada.',
      bodyHtml: `
        <!-- Highlight Date/Time -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #1d4ed8; margin-bottom: 6px;">
                Tu horario programado
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #1e3a8a;">
                {{appointment_date}} · {{start_time}} hrs
              </div>
            </td>
          </tr>
        </table>

        <!-- Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 35%;">Servicio</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">{{service_name}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Especialista</td>
            <td style="padding: 13px 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">Dr(a). {{professional_name}}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; font-size: 13px; color: #64748b;">Clínica</td>
            <td style="padding: 13px 18px; font-size: 14px; font-weight: 600; color: #0f172a;">{{clinic_name}}</td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 10px 10px 0;">
          <tr>
            <td style="padding: 14px 18px; font-size: 13px; color: #475569; line-height: 1.6;">
              Te sugerimos llegar <strong>10 minutos antes</strong> con tu documento de identidad y resultados previos si corresponde. ¡Será un gusto atenderte!
            </td>
          </tr>
        </table>
      `,
    }),
    variables: ['patient_name', 'service_name', 'professional_name', 'appointment_date', 'start_time', 'clinic_name'],
  },
  {
    name: 'appointment_cancelled',
    subject: 'Notificación de cancelación de cita — {{clinic_name}}',
    htmlBody: buildEmailLayout({
      accentColor: '#dc2626',
      accentGradient: 'linear-gradient(135deg, #991b1b 0%, #dc2626 60%, #ef4444 100%)',
      badgeText: 'Cita Cancelada',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeColor: '#ffffff',
      title: 'Tu cita ha sido cancelada',
      subtitle: 'Hola {{patient_name}}, confirmamos que tu turno programado quedó sin efecto.',
      bodyHtml: `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #991b1b; margin-bottom: 6px;">
                Fecha afectada
              </div>
              <div style="font-size: 17px; font-weight: 700; color: #7f1d1d; margin-bottom: 12px;">
                {{appointment_date}}
              </div>
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #991b1b; margin-bottom: 4px;">
                Motivo registrado
              </div>
              <div style="font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                {{cancellation_reason}}
              </div>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
          Cuando desees agendar una nueva fecha, puedes hacerlo directamente desde nuestro portal de reservas en línea o llamándonos al <strong>{{clinic_phone}}</strong>. Estamos para ayudarte.
        </p>
      `,
      footerNote: 'Central de atención de {{clinic_name}}: {{clinic_phone}}',
    }),
    variables: ['patient_name', 'appointment_date', 'cancellation_reason', 'clinic_name', 'clinic_phone'],
  },
  {
    name: 'post_care_followup',
    subject: '💚 ¿Cómo te encuentras después de tu atención? — {{clinic_name}}',
    htmlBody: buildEmailLayout({
      accentColor: '#059669',
      accentGradient: 'linear-gradient(135deg, #047857 0%, #059669 55%, #10b981 100%)',
      badgeText: 'Seguimiento',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeColor: '#ffffff',
      title: '¡Gracias por confiar en nosotros!',
      subtitle: 'Tu bienestar y recuperación son nuestra mayor prioridad.',
      bodyHtml: `
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Hola <strong>{{patient_name}}</strong>,
        </p>
        <p style="margin: 0 0 22px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          Esperamos que tu atención de <strong>{{service_name}}</strong> en <strong>{{clinic_name}}</strong> haya cumplido con todas tus expectativas.
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 18px 20px;">
              <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
                Recomendaciones de cuidado
              </div>
              <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.6;">
                • Sigue al pie de la letra las indicaciones y receta médica entregadas por tu especialista.<br />
                • Ante cualquier síntoma inesperado o consulta adicional, no dudes en comunicarte con nuestra clínica.<br />
                • Recuerda agendar tu cita de control si tu médico lo recomendó.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
          ¡Te deseamos una pronta y excelente recuperación!
        </p>
      `,
    }),
    variables: ['patient_name', 'service_name', 'clinic_name'],
  },
];
