import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/common/Button/Button';
import { submitContact } from '@/lib/api/contact';
import styles from './ContactForm.module.css';

interface FormState {
  name: string;
  email: string;
  message: string;
  website: string; // Honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Please provide your name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please provide your email address.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@domain.com).';
    } else if (trimmedEmail.length > 100) {
      newErrors.email = 'Email address cannot exceed 100 characters.';
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = 'Please provide a message.';
    } else if (trimmedMessage.length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    } else if (trimmedMessage.length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change if present
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiErrorMessage) {
      setApiErrorMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setApiErrorMessage(null);

    try {
      const response = await submitContact(formData);

      if (response.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '', website: '' });
      } else {
        if (response.errors) {
          setErrors((prev) => ({ ...prev, ...response.errors }));
        }
        setApiErrorMessage(response.message || 'Unable to send message. Please try again.');
      }
    } catch {
      setApiErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrors({});
    setApiErrorMessage(null);
  };

  if (isSubmitted) {
    return (
      <div className={styles.form} role="region" aria-label="Submission confirmation">
        <div className={styles.successBox}>
          <h3 className={styles.successTitle}>Message Sent!</h3>
          <p className={styles.successText}>
            Thank you for reaching out. Your message has been received. I will get back to you as
            soon as possible.
          </p>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {/* Honeypot field to trap automated spam bots — hidden from real users & screen readers */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Global API error notification */}
      {apiErrorMessage && (
        <div className={styles.apiErrorBox} role="alert">
          <p className={styles.apiErrorText}>{apiErrorMessage}</p>
        </div>
      )}

      {/* Name Field */}
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          Your Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.hasError : ''}`}
          placeholder="e.g., Alex Johnson"
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <span id="contact-name-error" role="alert" className={styles.errorText}>
            {errors.name}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          Your Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.hasError : ''}`}
          placeholder="e.g., alex@company.com"
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span id="contact-email-error" role="alert" className={styles.errorText}>
            {errors.email}
          </span>
        )}
      </div>

      {/* Message Field */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="contact-message" className={styles.label}>
            Message <span aria-hidden="true">*</span>
          </label>
          <span className={styles.charCount} aria-live="polite">
            {formData.message.length}/1000
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={`${styles.textarea} ${errors.message ? styles.hasError : ''}`}
          placeholder="How can we collaborate?"
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          disabled={isSubmitting}
          maxLength={1000}
        />
        {errors.message && (
          <span id="contact-message-error" role="alert" className={styles.errorText}>
            {errors.message}
          </span>
        )}
      </div>

      <div className={styles.submitBtn}>
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
}
