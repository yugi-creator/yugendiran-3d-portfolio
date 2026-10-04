import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../db/schema/index.js';
import { DrizzleContactRepository } from '../modules/contact/contact.repository.js';
import { contactMessages } from '../db/schema/contact.table.js';
import { eq } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';

describe('Drizzle ORM & PostgreSQL Persistence (PGlite in-memory engine)', () => {
  let pglite: PGlite;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  let repository: DrizzleContactRepository;

  beforeAll(async () => {
    pglite = new PGlite();
    db = drizzle(pglite, { schema });

    // Read and execute the generated migration file against in-memory PostgreSQL engine
    const migrationPath = path.resolve(__dirname, '../db/migrations/0000_nasty_surge.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    await pglite.exec(migrationSql);

    repository = new DrizzleContactRepository(db);
  });

  afterAll(async () => {
    if (pglite) {
      await pglite.close();
    }
  });

  it('persists a new contact message and returns the created record', async () => {
    const newRecord = await repository.createContactMessage({
      name: 'Integration Tester',
      email: 'tester@example.com',
      message: 'Testing real PostgreSQL execution with Drizzle ORM and PGlite.',
      ipHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      deliveryStatus: 'pending',
    });

    expect(newRecord).toBeDefined();
    expect(newRecord.id).toBeDefined();
    expect(newRecord.name).toBe('Integration Tester');
    expect(newRecord.email).toBe('tester@example.com');
    expect(newRecord.deliveryStatus).toBe('pending');
    expect(newRecord.createdAt).toBeInstanceOf(Date);

    // Verify row directly in database
    const rows = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, newRecord.id));

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(newRecord.id);
    expect(rows[0].ipHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('updates delivery status to "sent" or "failed" cleanly', async () => {
    const record = await repository.createContactMessage({
      name: 'Status Test',
      email: 'status@example.com',
      message: 'Status update verification message.',
      ipHash: 'abc123hash',
      deliveryStatus: 'pending',
    });

    await repository.updateDeliveryStatus(record.id, 'sent');

    const [updated] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, record.id));

    expect(updated.deliveryStatus).toBe('sent');
  });
});
