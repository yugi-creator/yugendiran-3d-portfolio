import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { CalendarIcon, MapPinIcon } from '@/components/common/Icon/Icon';
import { formatDateRange } from '@/utils/formatDate';
import experienceData from '@/data/experience.json';
import type { ExperienceEntry } from '@portfolio/shared';
import styles from './Experience.module.css';

const entries = experienceData as ExperienceEntry[];

export function Experience() {
  if (entries.length === 0) {
    return (
      <SectionWrapper id="experience" title="Experience" subtitle="My professional journey">
        <p className={styles.empty}>Experience details coming soon.</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="experience"
      title="Experience"
      subtitle="My professional engineering journey"
    >
      <div className={styles.timeline}>
        {entries.map((entry) => (
          <article key={entry.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.role}>{entry.role}</h3>
            </div>
            <span className={styles.company}>{entry.company}</span>

            <div className={styles.meta}>
              <span className={styles.dateBadge}>
                <CalendarIcon size={14} />
                {formatDateRange(entry.startDate, entry.endDate)}
              </span>
              <span className={styles.locationBadge}>
                <MapPinIcon size={14} />
                {entry.location}
              </span>
            </div>

            <ul className={styles.description}>
              {entry.description.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <div className={styles.tags}>
              {entry.technologies.map((tech) => (
                <span key={tech} className={styles.tag}>
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
