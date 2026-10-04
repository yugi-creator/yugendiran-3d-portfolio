import { describe, it, expect } from 'vitest';
import { isValidIp, getClientIp } from '../lib/ip.js';
import type { Request } from 'express';

describe('Client IP Resolution & Validation (Cloudflare & Reverse Proxy)', () => {
  describe('isValidIp', () => {
    it('accepts standard IPv4 addresses', () => {
      expect(isValidIp('127.0.0.1')).toBe(true);
      expect(isValidIp('192.168.1.1')).toBe(true);
      expect(isValidIp('104.21.45.18')).toBe(true);
      expect(isValidIp('203.0.113.195')).toBe(true);
    });

    it('accepts valid IPv6 addresses', () => {
      expect(isValidIp('::1')).toBe(true);
      expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isValidIp('2606:4700:4700::1111')).toBe(true);
    });

    it('rejects malformed IP strings, header injection, and control characters', () => {
      expect(isValidIp('')).toBe(false);
      expect(isValidIp('not-an-ip')).toBe(false);
      expect(isValidIp('256.256.256.256')).toBe(false);
      expect(isValidIp('192.168.1.1\r\nX-Bad-Header: evil')).toBe(false);
      expect(isValidIp('192.168.1.1\n')).toBe(false);
      expect(isValidIp('<script>alert(1)</script>')).toBe(false);
      expect(isValidIp('127.0.0.1; DROP TABLE users;')).toBe(false);
    });
  });

  describe('getClientIp', () => {
    it('prioritizes CF-Connecting-IP header from Cloudflare edge when valid', () => {
      const mockReq = {
        headers: {
          'cf-connecting-ip': '203.0.113.50',
          'x-forwarded-for': '198.51.100.1, 192.168.1.1',
        },
        ip: '192.168.1.1',
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('203.0.113.50');
    });

    it('ignores invalid CF-Connecting-IP and falls back to trusted Express req.ip', () => {
      const mockReq = {
        headers: {
          'cf-connecting-ip': 'invalid-malicious-ip',
          'x-forwarded-for': '198.51.100.25',
        },
        ip: '198.51.100.25',
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('198.51.100.25');
    });

    it('falls back to X-Forwarded-For first hop if req.ip is absent', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '203.0.113.88, 10.0.0.1',
        },
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('203.0.113.88');
    });

    it('falls back to socket remoteAddress if headers are absent', () => {
      const mockReq = {
        headers: {},
        socket: { remoteAddress: '192.0.2.14' },
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('192.0.2.14');
    });

    it('falls back to 127.0.0.1 if no valid IP can be resolved', () => {
      const mockReq = {
        headers: {},
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('127.0.0.1');
    });
  });
});
