import express, { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';
import { contactRouter } from './modules/contact/contact.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { securityHeaders, corsMiddleware } from './middleware/security.js';
import { env } from './config/env.js';

export interface AppOptions {
  contactRouter?: Router;
}

/**
 * Creates and configures the Express application.
 * Factory pattern enables full testability — tests can inject routers or run in isolation.
 */
export function createApp(options?: AppOptions) {
  const app = express();

  // Configure reverse proxy trust count (e.g. Nginx reverse proxy)
  app.set('trust proxy', env.TRUST_PROXY);

  // Security headers (Helmet with R3F / Three.js WebGL compatibility)
  app.use(securityHeaders);

  // Strict CORS policy
  app.use(corsMiddleware);

  // Parse JSON bodies with strict size limit (16KB comfortably handles 1000-char message)
  app.use(express.json({ limit: '16kb' }));

  // Structured request logging with sensitive data redaction
  app.use(requestLogger);

  // Health check routes (both root and versioned for orchestrator flexibility)
  app.use('/health', healthRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/v1/health', healthRouter);

  // Contact API routes
  const activeContactRouter = options?.contactRouter ?? contactRouter;
  app.use('/api/contact', activeContactRouter);
  app.use('/api/v1/contact', activeContactRouter);

  // 404 handler for unmatched routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Not found',
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  });

  // Global centralized error handler (must be registered last)
  app.use(errorHandler);

  return app;
}
