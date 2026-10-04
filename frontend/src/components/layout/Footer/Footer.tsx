import styles from './Footer.module.css';
import profileData from '@/data/profile.json';
import { MailIcon } from '@/components/common/Icon/Icon';
import { socialIconMap } from '@/components/common/Icon/iconMap';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.social}>
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
                {IconComponent ? <IconComponent size={20} /> : link.label}
              </a>
            );
          })}
          <a href={`mailto:${profileData.email}`} className={styles.socialLink} aria-label="Email">
            <MailIcon size={20} />
          </a>
        </div>

        <p className={styles.copyright}>
          © {year} {profileData.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
