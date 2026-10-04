import type { ReactNode } from 'react';
import styles from './SectionWrapper.module.css';
import { cn } from '@/utils/cn';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Consistent section layout with heading, subtitle, and contained content.
 * Provides accessible aria-labelledby linking heading to section.
 */
export function SectionWrapper({ id, title, subtitle, children, className }: SectionWrapperProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id={id}
      className={cn(styles.section, styles.reveal, isRevealed && styles.revealed, className)}
      aria-labelledby={`${id}-heading`}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id={`${id}-heading`} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
