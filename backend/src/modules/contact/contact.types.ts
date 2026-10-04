import type { ContactInput } from './contact.schema.js';
import type { ContactMessageRecord } from '../../db/schema/contact.table.js';

export type { ContactInput };

export interface ContactServiceInput extends ContactInput {
  ipHash: string;
}

export interface ContactServiceResult {
  success: boolean;
  message: string;
  isSpam?: boolean;
  persistedRecordId?: string;
}

export class RateLimitError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('Too many requests. Please try again later.');
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface ContactRepository {
  createContactMessage(data: {
    name: string;
    email: string;
    message: string;
    ipHash: string;
    deliveryStatus?: string;
  }): Promise<ContactMessageRecord>;

  updateDeliveryStatus(id: string, status: 'sent' | 'failed'): Promise<void>;
}
