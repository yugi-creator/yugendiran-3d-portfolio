import { logger } from '../../utils/logger.js';
import type {
  ContactRepository,
  ContactServiceInput,
  ContactServiceResult,
} from './contact.types.js';
import { RateLimitError } from './contact.types.js';
import type { EmailService } from '../../services/email/email.service.js';
import type { RateLimiter } from '../../lib/redis.js';

export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly emailService: EmailService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  async submitContact(input: ContactServiceInput): Promise<ContactServiceResult> {
    // 1. Honeypot check: If the hidden "website" field has any value, silently drop spam
    if (input.website && input.website.trim().length > 0) {
      // Never log user content or email; log only the security outcome
      logger.info(
        { outcome: 'honeypot_triggered', ipHash: input.ipHash },
        'Honeypot field populated; dropping submission silently',
      );
      return {
        success: true,
        message: 'Your message has been received.',
        isSpam: true,
      };
    }

    // 2. Rate limiting check via Redis
    const rateLimit = await this.rateLimiter.checkLimit(input.ipHash);
    if (!rateLimit.allowed) {
      logger.warn(
        { outcome: 'rate_limited', retryAfterSeconds: rateLimit.retryAfterSeconds },
        'Rate limit exceeded for contact submission',
      );
      throw new RateLimitError(rateLimit.retryAfterSeconds);
    }

    // 3. PostgreSQL persistence via Drizzle repository
    let record;
    try {
      record = await this.contactRepository.createContactMessage({
        name: input.name,
        email: input.email,
        message: input.message,
        ipHash: input.ipHash,
        deliveryStatus: 'pending',
      });
      logger.info(
        { outcome: 'db_persisted', recordId: record.id },
        'Contact message persisted to database',
      );
    } catch (dbError: unknown) {
      const errorMsg = dbError instanceof Error ? dbError.message : 'Database error';
      // Never log message/email/name
      logger.error({ error: errorMsg }, 'Failed to persist contact message to database');
      throw dbError;
    }

    // 4. Resend email notification
    try {
      const emailResult = await this.emailService.sendContactNotification({
        name: input.name,
        email: input.email,
        message: input.message,
        submittedAt: record.createdAt,
      });

      if (emailResult.success) {
        await this.contactRepository.updateDeliveryStatus(record.id, 'sent');
        logger.info(
          { outcome: 'email_sent', recordId: record.id },
          'Notification email sent successfully',
        );
      } else {
        await this.contactRepository.updateDeliveryStatus(record.id, 'failed');
        // As per Phase 5 requirement 17: Log safely without credentials or user content,
        // keep persisted message, and do not fail the client request.
        logger.error(
          { outcome: 'email_failed', recordId: record.id, error: emailResult.error },
          'Notification email delivery failed; message preserved in database',
        );
      }
    } catch (emailErr: unknown) {
      const errorMsg = emailErr instanceof Error ? emailErr.message : 'Email service error';
      await this.contactRepository.updateDeliveryStatus(record.id, 'failed');
      logger.error(
        { outcome: 'email_exception', recordId: record.id, error: errorMsg },
        'Exception during notification email delivery; message preserved in database',
      );
    }

    // 5. Safe success acknowledgement
    return {
      success: true,
      message: 'Your message has been received.',
      persistedRecordId: record.id,
    };
  }
}
