import { eq } from 'drizzle-orm';
import {
  contactMessages,
  ContactMessageRecord,
  NewContactMessage,
} from '../../db/schema/contact.table.js';
import { getDb, AppDatabase } from '../../db/client.js';
import type { ContactRepository } from './contact.types.js';
import crypto from 'node:crypto';

export class DrizzleContactRepository implements ContactRepository {
  private customDb?: AppDatabase;

  constructor(customDb?: AppDatabase) {
    this.customDb = customDb;
  }

  private get db(): AppDatabase {
    return this.customDb ?? getDb();
  }

  async createContactMessage(data: {
    name: string;
    email: string;
    message: string;
    ipHash: string;
    deliveryStatus?: string;
  }): Promise<ContactMessageRecord> {
    const insertData: NewContactMessage = {
      name: data.name,
      email: data.email,
      message: data.message,
      ipHash: data.ipHash,
      deliveryStatus: data.deliveryStatus ?? 'pending',
    };

    // Parameterized Drizzle insert query — no raw SQL concatenation
    const [record] = await this.db.insert(contactMessages).values(insertData).returning();

    return record;
  }

  async updateDeliveryStatus(id: string, status: 'sent' | 'failed'): Promise<void> {
    await this.db
      .update(contactMessages)
      .set({ deliveryStatus: status })
      .where(eq(contactMessages.id, id));
  }
}

export class InMemoryContactRepository implements ContactRepository {
  public records: ContactMessageRecord[] = [];
  public shouldFail = false;

  async createContactMessage(data: {
    name: string;
    email: string;
    message: string;
    ipHash: string;
    deliveryStatus?: string;
  }): Promise<ContactMessageRecord> {
    if (this.shouldFail) {
      throw new Error('Database connection failed');
    }

    const record: ContactMessageRecord = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      message: data.message,
      ipHash: data.ipHash,
      deliveryStatus: data.deliveryStatus ?? 'pending',
      createdAt: new Date(),
    };

    this.records.push(record);
    return record;
  }

  async updateDeliveryStatus(id: string, status: 'sent' | 'failed'): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Database update failed');
    }

    const record = this.records.find((r) => r.id === id);
    if (record) {
      record.deliveryStatus = status;
    }
  }

  reset(): void {
    this.records = [];
    this.shouldFail = false;
  }
}
