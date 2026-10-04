import type { ContactFormData, ContactApiResponse } from '@portfolio/shared';

export interface SubmitContactOptions {
  signal?: AbortSignal;
}

/**
 * Submits contact form data to the backend API (POST /api/contact).
 * Uses native fetch without external dependencies.
 * Sanitizes response parsing so internal errors or details are never exposed to the UI.
 */
export async function submitContact(
  data: ContactFormData,
  options?: SubmitContactOptions,
): Promise<ContactApiResponse> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
        website: data.website || '',
      }),
      signal: options?.signal,
    });

    let json: (Partial<ContactApiResponse> & { errors?: Record<string, string> }) | null = null;
    try {
      json = (await response.json()) as Partial<ContactApiResponse>;
    } catch {
      json = null;
    }

    if (response.ok && json?.success) {
      return {
        success: true,
        message: json.message || 'Your message has been received.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        message: json?.message || 'Too many requests. Please try again later.',
      };
    }

    if (response.status === 400 && json?.errors) {
      return {
        success: false,
        message: json.message || 'Please check the submitted fields.',
        errors: json.errors,
      };
    }

    return {
      success: false,
      message: json?.message || 'Unable to send message. Please try again later.',
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}
