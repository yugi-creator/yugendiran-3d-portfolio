import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export type AppDatabase = NodePgDatabase<typeof schema>;

let poolInstance: pg.Pool | null = null;
let dbInstance: AppDatabase | null = null;

export function getPool(): pg.Pool {
  if (!poolInstance) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }
    poolInstance = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    poolInstance.on('error', (err) => {
      // Never log connection string or credentials
      logger.error({ error: err.message }, 'Unexpected error on idle database client');
    });
  }
  return poolInstance;
}

export function getDb(): AppDatabase {
  if (!dbInstance) {
    const pool = getPool();
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    dbInstance = null;
  }
}

export async function checkDbHealth(): Promise<boolean> {
  try {
    if (!env.DATABASE_URL) return false;
    const pool = getPool();
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
