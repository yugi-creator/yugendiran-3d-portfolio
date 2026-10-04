import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  message: text('message').notNull(),
  ipHash: varchar('ip_hash', { length: 64 }).notNull(),
  deliveryStatus: varchar('delivery_status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ContactMessageRecord = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
