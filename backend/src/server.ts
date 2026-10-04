import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { closeDb } from './db/client.js';
import { closeRedis } from './lib/redis.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
});

let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown signal received');

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error({ error: err.message }, 'Error closing HTTP server');
    } else {
      logger.info('HTTP server closed cleanly');
    }

    try {
      await closeDb();
      logger.info('Database pool closed');
    } catch (dbErr: unknown) {
      logger.error({ error: (dbErr as Error).message }, 'Error closing database pool');
    }

    try {
      await closeRedis();
      logger.info('Redis connection closed');
    } catch (redisErr: unknown) {
      logger.error({ error: (redisErr as Error).message }, 'Error closing Redis connection');
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Watchdog timeout to prevent hanging connections indefinitely
  setTimeout(() => {
    logger.error('Graceful shutdown timed out after 10s; forcing exit');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
