import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectModal } from '../components/sections/Projects/ProjectModal';
import type { Project } from '@portfolio/shared';

const mockProject: Project = {
  id: 'test-project',
  title: 'Autonomous AI Orchestrator',
  category: 'AI / Machine Learning',
  description: 'Scalable multi-agent coordination framework.',
  longDescription:
    'A production-grade distributed agent orchestration engine with fault tolerance and deterministic state recovery.',
  technologies: ['Python', 'FastAPI', 'Redis', 'Docker'],
  imageUrl: '/images/projects/orchestrator.webp',
  githubUrl: 'https://github.com/example/orchestrator',
  liveUrl: 'https://orchestrator.example.com',
  featured: true,
};

describe('ProjectModal', () => {
  it('returns null when no project is provided', () => {
    const { container } = render(<ProjectModal project={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal with project details and accessible dialog attributes', () => {
    render(<ProjectModal project={mockProject} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'project-modal-title');

    expect(screen.getByText('Autonomous AI Orchestrator')).toBeInTheDocument();
    expect(screen.getByText('AI / Machine Learning')).toBeInTheDocument();
    expect(
      screen.getByText(/production-grade distributed agent orchestration/i),
    ).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ProjectModal project={mockProject} onClose={onClose} />);

    const closeBtn = screen.getByLabelText(/close project details/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ProjectModal project={mockProject} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal on backdrop', () => {
    const onClose = vi.fn();
    render(<ProjectModal project={mockProject} onClose={onClose} />);

    const backdrop = screen.getByTestId('project-modal-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
