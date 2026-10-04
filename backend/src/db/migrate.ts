import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDb, closeDb } from './client.js';
import { logger } from '../utils/logger.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes pending database migrations using Drizzle ORM.
 * Migrations are tracked in PostgreSQL in the `__drizzle_migrations` schema table.
 * Operations are additive and non-destructive.
 */
export async function runMigrations(): Promise<void> {
  logger.info('Starting PostgreSQL schema migrations...');

  // Search for migrations folder in both src and dist layouts
  let migrationsFolder = path.resolve(__dirname, 'migrations');
  if (!fs.existsSync(migrationsFolder)) {
    migrationsFolder = path.resolve(__dirname, '../src/db/migrations');
  }

  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(`Migrations directory not found at: ${migrationsFolder}`);
  }

  const db = getDb();

  try {
    await migrate(db, { migrationsFolder });
    logger.info({ migrationsFolder }, 'PostgreSQL database migrations applied successfully');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown migration error';
    logger.error({ error: errorMsg }, 'Database migration failed');
    throw error;
  } finally {
    await closeDb();
  }
}

// Support direct execution via CLI (e.g. `node dist/db/migrate.js`)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then(() => {
      logger.info('Migration runner exiting with code 0');
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ error: (err as Error).message }, 'Migration runner exiting with code 1');
      process.exit(1);
    });
}
