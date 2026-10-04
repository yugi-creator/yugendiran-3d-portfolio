import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { ExternalLinkIcon, CalendarIcon, AwardIcon } from '@/components/common/Icon/Icon';
import { formatDate } from '@/utils/formatDate';
import certificationsData from '@/data/certifications.json';
import type { Certification } from '@portfolio/shared';
import styles from './Certifications.module.css';

const certifications = certificationsData as Certification[];

export function Certifications() {
  if (certifications.length === 0) {
    return (
      <SectionWrapper
        id="certifications"
        title="Certifications"
        subtitle="Professional credentials and specialized certifications"
      >
        <p className={styles.empty}>Certifications coming soon.</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="certifications"
      title="Certifications"
      subtitle="Professional credentials and continuous technical advancement"
    >
      <div className={styles.grid}>
        {certifications.map((cert) => (
          <article key={cert.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.certName}>{cert.name}</h3>
              <AwardIcon size={20} className={styles.issuer} />
            </div>
            <p className={styles.issuer}>{cert.issuer}</p>

            <div className={styles.meta}>
              <span className={styles.date}>
                <CalendarIcon size={14} />
                {formatDate(cert.date)}
              </span>
              {cert.credentialId && (
                <span className={styles.credId} title="Credential ID">
                  ID: {cert.credentialId}
                </span>
              )}
            </div>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.credLink}
                aria-label={`Verify ${cert.name} credential issued by ${cert.issuer}`}
              >
                <ExternalLinkIcon size={15} />
                Verify Credential
              </a>
            )}
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
