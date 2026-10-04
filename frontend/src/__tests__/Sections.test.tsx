import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { About } from '../components/sections/About/About';
import { Experience } from '../components/sections/Experience/Experience';
import { Skills } from '../components/sections/Skills/Skills';
import { Projects } from '../components/sections/Projects/Projects';
import { Certifications } from '../components/sections/Certifications/Certifications';
import { Contact } from '../components/sections/Contact/Contact';

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

describe('About', () => {
  it('renders the section with heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /about me/i })).toBeInTheDocument();
  });

  it('renders bio content from data', () => {
    render(<About />);
    // profile.json bio should be rendered as paragraphs
    expect(screen.getByText(/scalable.*production/i)).toBeInTheDocument();
  });

  it('renders location and email', () => {
    render(<About />);
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('contact@yugendiran.in')).toBeInTheDocument();
  });
});

describe('Experience', () => {
  it('renders the section with heading', () => {
    render(<Experience />);
    expect(screen.getByRole('heading', { name: /experience/i })).toBeInTheDocument();
  });

  it('renders experience entries from data', () => {
    render(<Experience />);
    // experience.json has "Senior Software Developer" role
    expect(screen.getByText('Senior Software Developer')).toBeInTheDocument();
  });

  it('renders technology tags', () => {
    render(<Experience />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});

describe('Skills', () => {
  it('renders the section with heading', () => {
    render(<Skills />);
    expect(screen.getByRole('heading', { name: /skills/i })).toBeInTheDocument();
  });

  it('renders skill categories and filter tabs', () => {
    render(<Skills />);
    expect(screen.getByRole('tab', { name: /all disciplines/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /frontend development/i })).toBeInTheDocument();
  });

  it('filters visible category when tab is clicked', () => {
    render(<Skills />);
    const backendTab = screen.getByRole('tab', { name: /backend development/i });
    fireEvent.click(backendTab);
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders skill bars with progress', () => {
    render(<Skills />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});

describe('Projects', () => {
  it('renders the section with heading', () => {
    render(<Projects />);
    expect(screen.getByRole('heading', { level: 2, name: /^projects$/i })).toBeInTheDocument();
  });

  it('renders empty state with github link when projects array is empty', () => {
    render(<Projects />);
    expect(screen.getByText(/projects in development/i)).toBeInTheDocument();
    expect(screen.getByText(/explore github profile/i)).toBeInTheDocument();
  });
});

describe('Certifications', () => {
  it('renders the section with heading', () => {
    render(<Certifications />);
    expect(screen.getByRole('heading', { name: /certifications/i })).toBeInTheDocument();
  });

  it('renders certification entries from data', () => {
    render(<Certifications />);
    expect(screen.getByText('Certification Name')).toBeInTheDocument();
  });
});

describe('Contact', () => {
  it('renders the section with heading', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
  });

  it('renders email from profile data', () => {
    render(<Contact />);
    expect(screen.getByText('contact@yugendiran.in')).toBeInTheDocument();
  });

  it('renders contact form fields', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Contact />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });
});
