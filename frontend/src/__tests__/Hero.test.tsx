import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Hero } from '../components/sections/Hero/Hero';

// Mock IntersectionObserver
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

describe('Hero', () => {
  it('renders the name as h1', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the professional title', () => {
    render(<Hero />);
    // Profile data has "AI Developer & Senior Software Developer"
    expect(screen.getByText(/AI Developer/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText('View Projects')).toBeInTheDocument();
    expect(screen.getByText('Download Resume')).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Hero />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('has the 3D visual area mount point', () => {
    render(<Hero />);
    const visual = document.getElementById('hero-visual');
    expect(visual).toBeInTheDocument();
    expect(visual).toHaveAttribute('aria-hidden', 'true');
  });
});
