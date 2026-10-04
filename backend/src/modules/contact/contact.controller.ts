import type { Request, Response, NextFunction } from 'express';
import { contactSchema } from './contact.schema.js';
import { ContactService } from './contact.service.js';
import { RateLimitError } from './contact.types.js';
import { hashIp } from '../../lib/crypto.js';
import { getClientIp } from '../../lib/ip.js';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate request body with Zod
      const parseResult = contactSchema.safeParse(req.body);
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parseResult.error.issues) {
          const field = issue.path[0]?.toString() || 'field';
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }

        res.status(400).json({
          success: false,
          message: 'Please check the submitted fields.',
          errors: fieldErrors,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please check the submitted fields.',
            details: Object.entries(fieldErrors).map(([field, message]) => ({ field, message })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        });
        return;
      }

      // 2. Resolve client IP and compute irreversible HMAC hash
      const clientIp = getClientIp(req);
      const ipHash = hashIp(clientIp);

      // 3. Delegate to business logic in ContactService
      const result = await this.contactService.submitContact({
        ...parseResult.data,
        ipHash,
      });

      // 4. Return safe client response — never return internal IDs, DB records, or Redis/Resend details
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      });
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        res.setHeader('Retry-After', err.retryAfterSeconds.toString());
        res.status(429).json({
          success: false,
          message: err.message,
          data: null,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: err.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        });
        return;
      }

      if (err instanceof Error && err.message === 'RATE_LIMIT_SERVICE_UNAVAILABLE') {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
          data: null,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable. Please try again later.',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        });
        return;
      }

      next(err);
    }
  };
}
