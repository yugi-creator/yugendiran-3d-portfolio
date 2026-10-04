import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { MapPinIcon, MailIcon, CodeIcon } from '@/components/common/Icon/Icon';
import profileData from '@/data/profile.json';
import styles from './About.module.css';

export function About() {
  return (
    <SectionWrapper
      id="about"
      title="About Me"
      subtitle="Engineering robust software and intelligent systems"
    >
      <div className={styles.grid}>
        <div className={styles.bio}>
          {profileData.bio.map((paragraph, i) => (
            <p key={i} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className={styles.details}>
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>Key Information</h3>

            <div className={styles.detailItem}>
              <CodeIcon size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Role</span>
                <span className={styles.detailValue}>{profileData.title}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <MapPinIcon size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{profileData.location}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <MailIcon size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Direct Contact</span>
                <a href={`mailto:${profileData.email}`} className={styles.emailLink}>
                  {profileData.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
