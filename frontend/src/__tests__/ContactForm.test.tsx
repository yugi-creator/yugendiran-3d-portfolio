import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContactForm } from '../components/sections/Contact/ContactForm';
import * as contactApi from '../lib/api/contact';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all form fields, hidden honeypot, and submit button', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();

    // Verify honeypot field is rendered with aria-hidden
    const honeypotInput = screen.getByLabelText('Website');
    expect(honeypotInput).toBeInTheDocument();
    expect(honeypotInput.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(honeypotInput).toHaveAttribute('tabIndex', '-1');
  });

  it('validates required fields on empty submit', async () => {
    render(<ContactForm />);

    const submitBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/please provide your name/i)).toBeInTheDocument();
    expect(screen.getByText(/please provide your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please provide a message/i)).toBeInTheDocument();
  });

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), 'Alex Doe');
    await user.type(screen.getByLabelText(/your email/i), 'not-an-email');
    await user.type(
      screen.getByLabelText(/message/i),
      'Hello, this is a valid test message with sufficient length.',
    );

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('displays character counter updating as user types message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    expect(screen.getByText('0/1000')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/message/i), 'Testing character counter');
    expect(screen.getByText('25/1000')).toBeInTheDocument();
  });

  it('handles successful API submission, disables button during submission, and shows confirmation banner', async () => {
    const submitSpy = vi.spyOn(contactApi, 'submitContact').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: 'Your message has been received.',
              }),
            50,
          ),
        ),
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), 'Sarah Connor');
    await user.type(screen.getByLabelText(/your email/i), 'sarah@skynet-resistance.org');
    await user.type(
      screen.getByLabelText(/message/i),
      'Looking forward to building resilient systems together.',
    );

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Verify submitting state and disabled button
    expect(screen.getByRole('button', { name: /sending.../i })).toBeDisabled();

    // Verify successful submission confirmation appears
    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you for reaching out/i)).toBeInTheDocument();
    });

    expect(submitSpy).toHaveBeenCalledWith({
      name: 'Sarah Connor',
      email: 'sarah@skynet-resistance.org',
      message: 'Looking forward to building resilient systems together.',
      website: '',
    });

    // Verify reset button works
    const resetBtn = screen.getByRole('button', { name: /send another message/i });
    fireEvent.click(resetBtn);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
  });

  it('handles API error without losing user input, displaying accessible alert and enabling retry', async () => {
    const submitSpy = vi.spyOn(contactApi, 'submitContact').mockResolvedValueOnce({
      success: false,
      message: 'Too many requests. Please try again later.',
    });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), 'Sarah Connor');
    await user.type(screen.getByLabelText(/your email/i), 'sarah@skynet-resistance.org');
    await user.type(
      screen.getByLabelText(/message/i),
      'Looking forward to building resilient systems together.',
    );

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Error alert should be displayed with role="alert"
    const alertBox = await screen.findByRole('alert');
    expect(alertBox).toHaveTextContent(/too many requests/i);

    // Form fields should preserve user message
    expect(screen.getByLabelText(/your name/i)).toHaveValue('Sarah Connor');
    expect(screen.getByLabelText(/your email/i)).toHaveValue('sarah@skynet-resistance.org');
    expect(screen.getByLabelText(/message/i)).toHaveValue(
      'Looking forward to building resilient systems together.',
    );

    // Submit button should be enabled again for retry
    const submitBtn = screen.getByRole('button', { name: /send message/i });
    expect(submitBtn).not.toBeDisabled();

    // Mock success for second attempt
    submitSpy.mockResolvedValueOnce({
      success: true,
      message: 'Your message has been received.',
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
    });
  });

  it('handles network failure gracefully', async () => {
    vi.spyOn(contactApi, 'submitContact').mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), 'Alex Doe');
    await user.type(screen.getByLabelText(/your email/i), 'alex@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Test network failure handling.');

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/network error/i);
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
  });
});
