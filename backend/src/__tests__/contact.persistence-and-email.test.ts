import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createContactRouter } from '../modules/contact/contact.routes.js';
import { ContactController } from '../modules/contact/contact.controller.js';
import { ContactService } from '../modules/contact/contact.service.js';
import { InMemoryContactRepository } from '../modules/contact/contact.repository.js';
import { MockEmailService } from '../services/email/email.service.js';
import { InMemoryRateLimiter } from '../lib/redis.js';
import { hashIp } from '../lib/crypto.js';

describe('Contact Persistence & Email Error Handling', () => {
  it('stores HMAC-hashed IP and never stores raw IP in database', async () => {
    const repository = new InMemoryContactRepository();
    const emailService = new MockEmailService();
    const rateLimiter = new InMemoryRateLimiter();
    const service = new ContactService(repository, emailService, rateLimiter);
    const controller = new ContactController(service);
    const app = createApp({ contactRouter: createContactRouter(controller) });

    const rawTestIp = '198.51.100.42';
    const expectedHash = hashIp(rawTestIp);

    const response = await request(app)
      .post('/api/contact')
      .set('X-Forwarded-For', rawTestIp)
      .send({
        name: 'Privacy Test',
        email: 'privacy@example.com',
        message: 'Testing that client raw IP address is hashed with HMAC-SHA256.',
      });

    expect(response.status).toBe(200);
    expect(repository.records).toHaveLength(1);

    const stored = repository.records[0];
    expect(stored.ipHash).toBe(expectedHash);
    expect(stored.ipHash).toHaveLength(64); // 64 hex characters (256-bit SHA-256 HMAC)
    expect(stored.ipHash).not.toContain(rawTestIp);
    expect(JSON.stringify(stored)).not.toContain(rawTestIp);
  });

  it('handles database failure safely with 500 error without leaking credentials or message', async () => {
    const repository = new InMemoryContactRepository();
    repository.shouldFail = true; // Simulate database failure

    const emailService = new MockEmailService();
    const rateLimiter = new InMemoryRateLimiter();
    const service = new ContactService(repository, emailService, rateLimiter);
    const controller = new ContactController(service);
    const app = createApp({ contactRouter: createContactRouter(controller) });

    const response = await request(app).post('/api/contact').send({
      name: 'DB Test',
      email: 'dbtest@example.com',
      message: 'This should trigger a database failure.',
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Internal server error. Please try again later.');

    // Ensure error envelope contains no database connection strings or user content
    const responseText = JSON.stringify(response.body);
    expect(responseText).not.toContain('postgres');
    expect(responseText).not.toContain('dbtest@example.com');
    expect(responseText).not.toContain('password');

    // Email must NOT have been sent if DB failed
    expect(emailService.sentEmails).toHaveLength(0);
  });

  it('preserves DB record and safely returns 200 when email provider fails', async () => {
    const repository = new InMemoryContactRepository();
    const emailService = new MockEmailService();
    emailService.shouldFail = true; // Simulate Resend outage / provider failure

    const rateLimiter = new InMemoryRateLimiter();
    const service = new ContactService(repository, emailService, rateLimiter);
    const controller = new ContactController(service);
    const app = createApp({ contactRouter: createContactRouter(controller) });

    const response = await request(app).post('/api/contact').send({
      name: 'Resend Outage Tester',
      email: 'resend@example.com',
      message: 'Message should be safely preserved in database even if email fails.',
    });

    // The client gets a safe success because the message was safely persisted!
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Your message has been received.');

    // Database record was safely created and updated with 'failed' delivery status
    expect(repository.records).toHaveLength(1);
    expect(repository.records[0].name).toBe('Resend Outage Tester');
    expect(repository.records[0].deliveryStatus).toBe('failed');
  });
});
