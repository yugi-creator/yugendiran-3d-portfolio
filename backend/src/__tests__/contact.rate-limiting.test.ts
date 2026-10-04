import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createContactRouter } from '../modules/contact/contact.routes.js';
import { ContactController } from '../modules/contact/contact.controller.js';
import { ContactService } from '../modules/contact/contact.service.js';
import { InMemoryContactRepository } from '../modules/contact/contact.repository.js';
import { MockEmailService } from '../services/email/email.service.js';
import { InMemoryRateLimiter, RateLimiter } from '../lib/redis.js';

describe('Contact API Rate Limiting (O(1) Redis / IP Hashed)', () => {
  it('allows requests up to configured limit, then blocks with HTTP 429 and Retry-After', async () => {
    const repository = new InMemoryContactRepository();
    const emailService = new MockEmailService();
    // Configure rate limit of 2 requests per 60 seconds
    const rateLimiter = new InMemoryRateLimiter({ maxLimit: 2, windowSeconds: 60 });
    const service = new ContactService(repository, emailService, rateLimiter);
    const controller = new ContactController(service);
    const contactRouter = createContactRouter(controller);
    const app = createApp({ contactRouter });

    const payload = {
      name: 'Rate Limit Tester',
      email: 'ratelimit@example.com',
      message: 'This is request message number test.',
    };

    // Request 1: Allowed (remaining 1)
    const res1 = await request(app).post('/api/contact').send(payload);
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Request 2: Allowed (remaining 0)
    const res2 = await request(app).post('/api/contact').send(payload);
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);

    // Request 3: Blocked (rate limit exceeded)
    const res3 = await request(app).post('/api/contact').send(payload);
    expect(res3.status).toBe(429);
    expect(res3.body.success).toBe(false);
    expect(res3.body.message).toBe('Too many requests. Please try again later.');
    expect(res3.headers).toHaveProperty('retry-after');
    const retryAfter = parseInt(res3.headers['retry-after'], 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);

    // Database should only contain the 2 allowed requests
    expect(repository.records).toHaveLength(2);
  });

  it('fails safely with HTTP 503 when rate limit service is unavailable (fail closed)', async () => {
    const repository = new InMemoryContactRepository();
    const emailService = new MockEmailService();

    // Failing rate limiter simulating Redis downtime
    const failingRateLimiter: RateLimiter = {
      async checkLimit() {
        throw new Error('RATE_LIMIT_SERVICE_UNAVAILABLE');
      },
    };

    const service = new ContactService(repository, emailService, failingRateLimiter);
    const controller = new ContactController(service);
    const contactRouter = createContactRouter(controller);
    const app = createApp({ contactRouter });

    const response = await request(app).post('/api/contact').send({
      name: 'Fail Closed Tester',
      email: 'test@example.com',
      message: 'This should fail closed for security.',
    });

    // Fails closed with safe 503 error — does NOT silently bypass rate limits
    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/temporarily unavailable/i);

    // Message is NOT saved
    expect(repository.records).toHaveLength(0);
  });
});
