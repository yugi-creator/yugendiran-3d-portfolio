import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Creates an irreversible cryptographic HMAC-SHA256 hash of a client IP address
 * using a server-side secret key.
 *
 * Raw IP addresses are NEVER stored in the database, Redis, or application logs.
 * The resulting 64-character hex string acts as an anonymous, pseudonymous identifier
 * for rate limiting and spam tracking.
 */
export function hashIp(ip: string, secret: string = env.IP_HASH_SECRET): string {
  const normalizedIp = (ip || 'unknown').trim().toLowerCase();
  return crypto.createHmac('sha256', secret).update(normalizedIp).digest('hex');
}
