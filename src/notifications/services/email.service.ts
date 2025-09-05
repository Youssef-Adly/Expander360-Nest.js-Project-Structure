import { Injectable, Logger } from '@nestjs/common';

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(options: SendEmailOptions): Promise<void> {
    // Mock email sender (replace with real SMTP/mailer later)
    this.logger.log(
      `Sending email to ${options.to} | subject="${options.subject}" | hasHtml=${!!options.html} hasText=${!!options.text}`,
    );
  }
}


