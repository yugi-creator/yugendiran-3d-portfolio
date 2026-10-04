import type { Request } from 'express';
import net from 'node:net';

/**
 * Validates whether an IP address is a strictly syntactically valid IPv4 or IPv6 address.
 * Disallows whitespace, CRLF, control characters, and header injection attempts.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  // Strictly reject if string contains any whitespace, newlines, or control characters
  for (let i = 0; i < ip.length; i++) {
    const code = ip.charCodeAt(i);
    if (code <= 32 || code === 127) return false;
  }
  return net.isIP(ip) !== 0;
}

/**
 * Resolves the genuine client IP address for rate limiting and audit logging.
 *
 * Trust Hierarchy:
 * 1. Cloudflare Edge: If `cf-connecting-ip` is provided by Cloudflare and valid, it represents
 *    the true client IP as terminated by Cloudflare edge.
 * 2. Express `req.ip`: Express resolves this based on `app.set('trust proxy', TRUST_PROXY)`.
 *    When behind Nginx reverse proxy, Express trusts Nginx's hop.
 * 3. Forwarded Header: First IP in `x-forwarded-for` if valid.
 * 4. Socket Remote Address: Direct TCP socket IP address.
 * 5. Fallback: '127.0.0.1'
 */
export function getClientIp(req: Request): string {
  // 1. Check Cloudflare verified client IP header
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string') {
    const trimmed = cfConnectingIp.trim();
    if (isValidIp(trimmed)) {
      return trimmed;
    }
  }

  // 2. Express req.ip (traverses trusted proxy hops configured via TRUST_PROXY)
  if (req.ip && isValidIp(req.ip)) {
    return req.ip;
  }

  // 3. Fallback to X-Forwarded-For if available
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop && isValidIp(firstHop)) {
      return firstHop;
    }
  }

  // 4. Fallback to socket remoteAddress
  if (req.socket?.remoteAddress && isValidIp(req.socket.remoteAddress)) {
    return req.socket.remoteAddress;
  }

  return '127.0.0.1';
}
