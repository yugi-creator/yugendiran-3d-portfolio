import pinoHttpModule from 'pino-http';
import { logger } from '../utils/logger.js';
import type { IncomingMessage, ServerResponse } from 'node:http';

// pino-http ESM default export compatibility
const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

/**
 * HTTP request logging middleware using pino-http.
 * Configured with strict serializers so raw IPs, authorization headers,
 * cookies, and request bodies are never written to logs.
 */
export const requestLogger = pinoHttp({
  logger,
  serializers: {
    req: (req: IncomingMessage) => ({
      method: req.method,
      url: req.url,
      // Intentionally omitting headers, remoteAddress, remotePort, and body
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
    }),
  },
  autoLogging: {
    ignore: (req: { url?: string }) =>
      req.url === '/api/v1/health' || req.url === '/health' || req.url === '/api/health',
  },
});
