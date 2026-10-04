import { useState, useEffect, useCallback } from 'react';
import styles from './Header.module.css';
import { cn } from '@/utils/cn';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MenuIcon, XIcon } from '@/components/common/Icon/Icon';
import navItems from '@/data/navigation.json';
import profileData from '@/data/profile.json';

const sectionIds = navItems.map((item) => item.id);

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(sectionIds);
  const isMobile = useMediaQuery('(max-width: 767px)');

  /* Track scroll position for header shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* Close menu on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  /* Close mobile menu on desktop resize */
  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  const handleNavClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled)} role="banner">
      <div className={styles.container}>
        <a href="#home" className={styles.logo} aria-label="Go to top">
          {profileData.name}
        </a>

        {/* Desktop navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(styles.navLink, activeSection === item.id && styles.active)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobile && (
        <>
          <div
            className={cn(styles.overlay, menuOpen && styles.overlayVisible)}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-menu"
            className={cn(styles.mobileNav, menuOpen && styles.mobileNavOpen)}
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={cn(styles.mobileNavLink, activeSection === item.id && styles.active)}
                onClick={handleNavClick}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
