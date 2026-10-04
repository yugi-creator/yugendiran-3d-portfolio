import { z } from 'zod';

const hasControlChars = (str: string): boolean => {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 31 || code === 127) return true;
  }
  return false;
};

export const contactSchema = z.object({
  name: z
    .string({
      required_error: 'Please provide your name.',
      invalid_type_error: 'Name must be a string.',
    })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.')
    .refine((val) => !hasControlChars(val), 'Name contains invalid characters.'),

  email: z
    .string({
      required_error: 'Please provide your email address.',
      invalid_type_error: 'Email must be a string.',
    })
    .trim()
    .max(100, 'Email address cannot exceed 100 characters.')
    .email('Please enter a valid email address (e.g., name@domain.com).')
    .refine((val) => !/[\r\n]/.test(val), 'Email contains invalid characters.'),

  message: z
    .string({
      required_error: 'Please provide a message.',
      invalid_type_error: 'Message must be a string.',
    })
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(1000, 'Message cannot exceed 1000 characters.'),

  // Honeypot field — expected to be absent or empty
  website: z.string().optional(),

  // Optional subject for backwards compatibility
  subject: z.string().max(150).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
