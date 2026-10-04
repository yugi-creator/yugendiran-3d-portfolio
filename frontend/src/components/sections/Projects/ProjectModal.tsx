import { useEffect, useRef } from 'react';
import type { Project } from '@portfolio/shared';
import { ExternalLinkIcon, GitHubIcon } from '@/components/common/Icon/Icon';
import { Button } from '@/components/common/Button/Button';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      data-testid="project-modal-backdrop"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className={styles.modal}
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            {project.category && <span className={styles.category}>{project.category}</span>}
            <h3 id="project-modal-title" className={styles.title}>
              {project.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close project details"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.longDesc}>{project.longDescription || project.description}</p>

          <div>
            <p className={styles.tagsLabel}>Technologies Used</p>
            <div className={styles.tags}>
              {project.technologies.map((tech) => (
                <span key={tech} className={styles.tag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {project.githubUrl && (
            <Button
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
            >
              <GitHubIcon size={16} />
              View Source
            </Button>
          )}
          {project.liveUrl && (
            <Button
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              <ExternalLinkIcon size={16} />
              Live Demo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
