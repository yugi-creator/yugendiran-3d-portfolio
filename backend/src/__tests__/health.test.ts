import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Health & Readiness Endpoints', () => {
  describe('Liveness probe (GET /api/v1/health)', () => {
    it('returns 200 with process health status', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.meta).toHaveProperty('requestId');
    });

    it('returns consistent API envelope structure', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.error).toBeNull();
    });
  });

  describe('Readiness probe (GET /api/v1/health/ready)', () => {
    it('returns readiness status and checks object without leaking credentials', async () => {
      const response = await request(app).get('/api/v1/health/ready');

      // Without external DB/Redis running in CI/unit test, returns 503 degraded safely
      expect([200, 503]).toContain(response.status);
      expect(response.body.data).toHaveProperty('checks');
      expect(response.body.data.checks).toHaveProperty('database');
      expect(response.body.data.checks).toHaveProperty('redis');

      // Crucial: No credentials, hosts, or connection strings in response
      const responseBody = JSON.stringify(response.body);
      expect(responseBody).not.toContain('postgres://');
      expect(responseBody).not.toContain('redis://');
      expect(responseBody).not.toContain('password');
    });
  });
});
