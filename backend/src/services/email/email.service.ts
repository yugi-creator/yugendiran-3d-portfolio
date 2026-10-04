import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface ContactNotificationPayload {
  name: string;
  email: string;
  message: string;
  submittedAt: Date;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailService {
  sendContactNotification(payload: ContactNotificationPayload): Promise<EmailSendResult>;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class ResendEmailService implements EmailService {
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly recipientEmail: string;

  constructor(options?: { apiKey?: string; fromEmail?: string; recipientEmail?: string }) {
    const key = options?.apiKey ?? env.RESEND_API_KEY;
    if (key) {
      this.resend = new Resend(key);
    }
    this.fromEmail =
      options?.fromEmail ?? env.CONTACT_FROM_EMAIL ?? 'Portfolio Contact <onboarding@resend.dev>';
    this.recipientEmail =
      options?.recipientEmail ?? env.CONTACT_RECIPIENT_EMAIL ?? 'recipient@example.com';
  }

  async sendContactNotification(payload: ContactNotificationPayload): Promise<EmailSendResult> {
    if (!this.resend) {
      // In development/test mode without an API key, record outcome safely without crashing
      logger.info('Resend API key not configured; skipping real email transmission');
      return { success: true, id: 'simulated-dev-id' };
    }

    try {
      const sanitizedName = payload.name.replace(/[\r\n]/g, ' ').trim();
      const sanitizedEmail = payload.email.replace(/[\r\n]/g, ' ').trim();

      const textContent = [
        'New Contact Message from Portfolio Website',
        '==========================================',
        `Sender Name: ${sanitizedName}`,
        `Sender Email: ${sanitizedEmail}`,
        `Submitted At: ${payload.submittedAt.toISOString()}`,
        '',
        'Message Content:',
        '------------------------------------------',
        payload.message,
        '------------------------------------------',
      ].join('\n');

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Contact Notification</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 8px;">
      New Contact Form Message
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 600;">Sender:</td>
        <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(sanitizedName)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
        <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${escapeHtml(sanitizedEmail)}">${escapeHtml(sanitizedEmail)}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Received:</td>
        <td style="padding: 6px 0; color: #0f172a;">${payload.submittedAt.toUTCString()}</td>
      </tr>
    </table>
    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
      Message:
    </h3>
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; white-space: pre-wrap; font-family: inherit; font-size: 15px;">
      ${escapeHtml(payload.message)}
    </div>
  </div>
</body>
</html>
      `.trim();

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: this.recipientEmail,
        replyTo: sanitizedEmail,
        subject: `Portfolio Contact: ${sanitizedName}`,
        text: textContent,
        html: htmlContent,
      });

      if (response.error) {
        // Never log message text, sender name, or credentials
        logger.error({ error: response.error.message }, 'Resend email notification failed');
        return { success: false, error: response.error.message };
      }

      logger.info({ emailId: response.data?.id }, 'Resend email notification sent successfully');
      return { success: true, id: response.data?.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown email sending error';
      // Never log message content or email address
      logger.error({ error: errorMsg }, 'Exception occurred while sending Resend notification');
      return { success: false, error: errorMsg };
    }
  }
}

/**
 * In-memory Mock Email Service for unit and integration testing.
 */
export class MockEmailService implements EmailService {
  public sentEmails: ContactNotificationPayload[] = [];
  public shouldFail = false;
  public failureMessage = 'Simulated email provider failure';

  async sendContactNotification(payload: ContactNotificationPayload): Promise<EmailSendResult> {
    if (this.shouldFail) {
      return { success: false, error: this.failureMessage };
    }
    this.sentEmails.push({ ...payload });
    return { success: true, id: `mock-${this.sentEmails.length}` };
  }

  reset(): void {
    this.sentEmails = [];
    this.shouldFail = false;
  }
}
