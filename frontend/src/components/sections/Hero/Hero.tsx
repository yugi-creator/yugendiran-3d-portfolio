import { lazy, Suspense } from 'react';
import styles from './Hero.module.css';
import { Button } from '@/components/common/Button/Button';
import { ChevronDownIcon } from '@/components/common/Icon/Icon';
import { socialIconMap } from '@/components/common/Icon/iconMap';
import profileData from '@/data/profile.json';

const HeroScene = lazy(() => import('@/components/three/HeroScene/HeroScene'));

export function Hero() {
  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.greeting}>Hello, I'm</p>
          <h1 className={styles.name}>{profileData.name}</h1>
          <p className={styles.title}>{profileData.title}</p>
          <p className={styles.subtitle}>{profileData.subtitle}</p>

          <div className={styles.actions}>
            <Button href="#projects" size="lg">
              View Projects
            </Button>
            <Button
              href={profileData.resumeUrl}
              variant="secondary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Resume
            </Button>
          </div>

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
                  {IconComponent ? <IconComponent size={22} /> : link.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right side: 3D scene (Phase 3) */}
        <div id="hero-visual" className={styles.visual} aria-hidden="true">
          <Suspense fallback={<div className={styles.visualFallback} />}>
            <HeroScene />
          </Suspense>
        </div>
      </div>

      <a href="#about" className={styles.scrollHint} aria-label="Scroll to about section">
        <ChevronDownIcon size={28} />
      </a>
    </section>
  );
}
