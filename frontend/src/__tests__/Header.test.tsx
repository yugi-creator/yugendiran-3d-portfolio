import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../components/layout/Header/Header';

// Mock IntersectionObserver for scroll spy
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});

describe('Header', () => {
  it('renders the navigation with all links', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();

    const links = nav.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders the logo linking to home', () => {
    render(<Header />);
    const logo = screen.getByLabelText('Go to top');
    expect(logo).toHaveAttribute('href', '#home');
  });

  it('renders navigation links matching navigation data', () => {
    render(<Header />);
    // Check some expected nav labels from navigation.json
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();

    const navLinks = screen
      .getByRole('navigation', { name: 'Main navigation' })
      .querySelectorAll('a');
    const labels = Array.from(navLinks).map((a) => a.textContent);
    expect(labels).toContain('Home');
    expect(labels).toContain('About');
    expect(labels).toContain('Projects');
    expect(labels).toContain('Contact');
  });

  it('renders the hamburger button', () => {
    render(<Header />);
    const hamburger = screen.getByLabelText(/open menu|close menu/i);
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles aria-expanded on hamburger click', async () => {
    // Simulate mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 767px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<Header />);
    const hamburger = screen.getByLabelText(/open menu/i);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  });
});
