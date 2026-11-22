'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './marketing-nav.module.css';

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setIsAuthenticated(Boolean(user));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="UniMatch home" onClick={closeMenu}>
        UniMatch
      </Link>

      <nav className={styles.desktopNav} aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <Link href="/programmes">Programmes</Link>
        <Link href={isAuthenticated ? '/onboarding' : '/login'}>{isAuthenticated ? 'My profile' : 'Sign in'}</Link>
      </nav>

      <button
        className={styles.menuButton}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="landing-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <nav
        id="landing-menu"
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
        inert={!open}
      >
        <a href="#how-it-works" onClick={closeMenu}>How it works</a>
        <Link href="/programmes" onClick={closeMenu}>Browse programmes</Link>
        <Link href={isAuthenticated ? '/onboarding' : '/login'} onClick={closeMenu}>{isAuthenticated ? 'My profile' : 'Sign in'}</Link>
        <Link className={styles.menuAction} href="/onboarding" onClick={closeMenu}>Start eligibility check</Link>
      </nav>
    </header>
  );
}
