import helmet from 'helmet';
import cors from 'cors';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

/**
 * Helmet security middleware.
 * Configured with defense-in-depth security headers compatible with R3F / WebGL assets.
 */
export const securityHeaders: RequestHandler = helmet({
  // Frame protection to prevent clickjacking
  frameguard: { action: 'deny' },
  // Prevent MIME-type sniffing
  noSniff: true,
  // Strict Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Hide Powered-By Express header
  hidePoweredBy: true,
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Content Security Policy - configured to support Three.js/WebGL and Google Fonts
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", ...env.allowedOrigins],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
});

/**
 * Strict CORS policy.
 * Only allows requests from explicitly configured origins (e.g. https://yugendiran.in).
 * Never uses wildcard `*` in production.
 */
export const corsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (same-origin, curl, server-to-server) where origin header is undefined
    if (!origin) {
      return callback(null, true);
    }

    if (env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject disallowed origins
    return callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400,
});
