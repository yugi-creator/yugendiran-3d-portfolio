import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Defence-in-depth redaction. Application code must never pass contact
 * content, raw IPs or credentials to the logger in the first place; these
 * paths catch accidental inclusion (e.g. a raw request object).
 */
export const LOG_REDACT_PATHS = [
  'req.headers',
  'req.remoteAddress',
  'req.remotePort',
  'req.body',
  'body',
  'headers',
  'email',
  'ip',
  '*.email',
  '*.ip',
];

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : env.NODE_ENV === 'test' ? 'silent' : 'debug',
  redact: { paths: LOG_REDACT_PATHS, censor: '[REDACTED]' },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export type Logger = pino.Logger;
