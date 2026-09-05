export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendMailResult {
  messageId: string;
  success: boolean;
  error?: string;
}

export interface IEmailProvider {
  sendMail(options: SendMailOptions): Promise<SendMailResult>;
}
