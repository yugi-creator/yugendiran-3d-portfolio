export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string; // Honeypot field — expected to be empty
  subject?: string; // Optional field for backwards compatibility
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  ipHash: string;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}
