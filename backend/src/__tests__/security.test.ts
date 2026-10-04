import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { env } from '../config/env.js';

const app = createApp();

describe('Security Hardening (CORS, Security Headers, Privacy)', () => {
  it('allows requests from configured allowed origin (https://yugendiran.in)', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://yugendiran.in');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://yugendiran.in');
    expect(response.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('rejects CORS requests from unauthorized origins with HTTP 403', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://malicious-attacker.com');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/cors/i);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sets secure defense-in-depth HTTP headers via Helmet', async () => {
    const response = await request(app).get('/api/v1/health');

    // X-Content-Type-Options
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    // X-Frame-Options (Clickjacking defense)
    expect(response.headers['x-frame-options']).toBe('DENY');
    // Referrer Policy
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    // Powered-By header should be removed
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('ensures environment configuration does not contain wildcards in allowed origins', () => {
    expect(env.allowedOrigins).not.toContain('*');
    for (const origin of env.allowedOrigins) {
      expect(origin).toMatch(/^https?:\/\//);
      expect(origin).not.toContain('*');
    }
  });
});
