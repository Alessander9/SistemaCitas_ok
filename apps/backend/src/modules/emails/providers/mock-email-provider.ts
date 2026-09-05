import { Injectable } from '@nestjs/common';
import { IEmailProvider, SendMailOptions, SendMailResult } from './email-provider.interface';

@Injectable()
export class MockEmailProvider implements IEmailProvider {
  public sentMessages: SendMailOptions[] = [];

  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    // Record message for testing inspection
    this.sentMessages.push(options);

    // Simulate potential failure if recipient contains "fail@"
    if (options.to.includes('fail@')) {
      return {
        messageId: '',
        success: false,
        error: 'Simulated SMTP connection timeout or invalid address',
      };
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      messageId,
      success: true,
    };
  }

  clear() {
    this.sentMessages = [];
  }
}
