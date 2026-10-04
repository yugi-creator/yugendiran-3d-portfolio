import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { MailIcon, MapPinIcon } from '@/components/common/Icon/Icon';
import { socialIconMap } from '@/components/common/Icon/iconMap';
import { ContactForm } from './ContactForm';
import profileData from '@/data/profile.json';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <SectionWrapper
      id="contact"
      title="Get In Touch"
      subtitle="Let's build something exceptional together"
    >
      <div className={styles.content}>
        <p className={styles.message}>
          I'm always open to discussing technical architecture, AI systems development, or
          engineering opportunities. Send a direct message below or reach out via email.
        </p>

        <div className={styles.methods}>
          <a
            href={`mailto:${profileData.email}`}
            className={styles.card}
            aria-label={`Send direct email to ${profileData.email}`}
          >
            <MailIcon size={26} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Direct Email</span>
            <span className={styles.cardValue}>{profileData.email}</span>
          </a>

          <div className={styles.card}>
            <MapPinIcon size={26} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Location</span>
            <span className={styles.cardValue}>{profileData.location}</span>
          </div>
        </div>

        {/* Frontend Contact Form */}
        <ContactForm />

        <div className={styles.social}>
          <p className={styles.socialLabel}>Professional Networks</p>
          <div className={styles.socialLinks}>
            {profileData.socialLinks.map((link) => {
              const IconComponent = socialIconMap[link.platform];
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={link.label}
                >
                  {IconComponent && <IconComponent size={20} />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
