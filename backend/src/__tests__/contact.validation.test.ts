import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createContactRouter } from '../modules/contact/contact.routes.js';
import { ContactController } from '../modules/contact/contact.controller.js';
import { ContactService } from '../modules/contact/contact.service.js';
import { InMemoryContactRepository } from '../modules/contact/contact.repository.js';
import { MockEmailService } from '../services/email/email.service.js';
import { InMemoryRateLimiter } from '../lib/redis.js';

function createTestApp() {
  const repository = new InMemoryContactRepository();
  const emailService = new MockEmailService();
  const rateLimiter = new InMemoryRateLimiter({ maxLimit: 10, windowSeconds: 60 });
  const service = new ContactService(repository, emailService, rateLimiter);
  const controller = new ContactController(service);
  const contactRouter = createContactRouter(controller);

  const app = createApp({ contactRouter });
  return { app, repository, emailService, rateLimiter };
}

describe('Contact API Validation & Honeypot (POST /api/contact)', () => {
  it('accepts valid contact submission and returns safe 200 response', async () => {
    const { app, repository, emailService } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      message: 'Hello, I would like to discuss a project collaboration.',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Your message has been received.');
    expect(response.body).not.toHaveProperty('recordId');
    expect(response.body).not.toHaveProperty('id');

    expect(repository.records).toHaveLength(1);
    expect(repository.records[0].name).toBe('Alex Johnson');
    expect(repository.records[0].email).toBe('alex@example.com');
    expect(repository.records[0].message).toBe(
      'Hello, I would like to discuss a project collaboration.',
    );
    expect(repository.records[0].deliveryStatus).toBe('sent');

    expect(emailService.sentEmails).toHaveLength(1);
  });

  it('rejects request with missing name', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      email: 'alex@example.com',
      message: 'Valid message content for testing.',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Please check the submitted fields.');
    expect(response.body.errors).toHaveProperty('name');
  });

  it('rejects request with name shorter than 2 characters', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      name: 'A',
      email: 'alex@example.com',
      message: 'Valid message content for testing.',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.name).toMatch(/at least 2 characters/i);
  });

  it('rejects request with name longer than 100 characters', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/contact')
      .send({
        name: 'A'.repeat(101),
        email: 'alex@example.com',
        message: 'Valid message content for testing.',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.name).toMatch(/cannot exceed 100 characters/i);
  });

  it('rejects request with invalid email format', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      name: 'Alex Johnson',
      email: 'not-an-email',
      message: 'Valid message content for testing.',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.email).toMatch(/valid email address/i);
  });

  it('rejects request with email exceeding 100 characters', async () => {
    const { app } = createTestApp();

    const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 chars
    const response = await request(app).post('/api/contact').send({
      name: 'Alex Johnson',
      email: longEmail,
      message: 'Valid message content for testing.',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.email).toMatch(/cannot exceed 100 characters/i);
  });

  it('rejects request with message shorter than 10 characters', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      message: 'Short',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.message).toMatch(/at least 10 characters/i);
  });

  it('rejects request with message exceeding 1000 characters', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/contact')
      .send({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        message: 'M'.repeat(1001),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors?.message).toMatch(/cannot exceed 1000 characters/i);
  });

  it('drops spam silently when honeypot field is populated (no DB write, no email sent)', async () => {
    const { app, repository, emailService } = createTestApp();

    const response = await request(app).post('/api/contact').send({
      name: 'Spam Bot',
      email: 'spammer@botnet.org',
      message: 'Buy our products now! Visit https://spam.com',
      website: 'https://spam.com', // Honeypot populated
    });

    // Returns generic success response — never reveals detection to bot
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Your message has been received.');

    // Crucial: Must NOT persist in DB and must NOT send email
    expect(repository.records).toHaveLength(0);
    expect(emailService.sentEmails).toHaveLength(0);
  });

  it('rejects malformed JSON payload safely', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name": "broken json');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid json payload/i);
  });

  it('rejects oversized request payload exceeding 16KB with HTTP 413', async () => {
    const { app } = createTestApp();

    // Create a payload larger than 16KB
    const largePayload = {
      name: 'Test',
      email: 'test@example.com',
      message: 'x'.repeat(20 * 1024), // 20KB
    };

    const response = await request(app).post('/api/contact').send(largePayload);

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/payload too large/i);
  });
});
