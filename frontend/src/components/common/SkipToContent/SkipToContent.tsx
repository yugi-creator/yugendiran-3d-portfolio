import styles from './SkipToContent.module.css';

/**
 * Hidden skip-to-content link that becomes visible on keyboard focus.
 * Provides accessibility shortcut to bypass navigation.
 */
export function SkipToContent() {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Skip to main content
    </a>
  );
}
