import { Router } from 'express';
import type { Request, Response } from 'express';
import { checkDbHealth } from '../../db/client.js';
import { checkRedisHealth } from '../../lib/redis.js';

const healthRouter = Router();

/**
 * GET /health or /api/v1/health
 * Liveness check for container orchestrators (e.g., Docker, Kubernetes).
 * Returns 200 if the Node.js Express process is up and running.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
});

/**
 * GET /health/ready or /api/v1/health/ready
 * Readiness check for deployment orchestration.
 * Verifies live connectivity to PostgreSQL and Redis without exposing credentials or internal topology.
 */
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  const dbOk = await checkDbHealth();
  const redisOk = await checkRedisHealth();

  const isReady = dbOk && redisOk;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    data: {
      status: isReady ? 'ready' : 'degraded',
      checks: {
        database: dbOk ? 'up' : 'down',
        redis: redisOk ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    error: isReady
      ? null
      : {
          code: 'DEPENDENCY_UNAVAILABLE',
          message: 'One or more required infrastructure dependencies are unavailable.',
        },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
});

export { healthRouter };
