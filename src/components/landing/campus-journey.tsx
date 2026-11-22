'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './campus-journey.module.css';

const locations = [
  { name: 'Berlin', query: 'Berlin' },
  { name: 'Aachen', query: 'Aachen' },
  { name: 'Freiburg', query: 'Freiburg' },
  { name: 'Heidelberg', query: 'Heidelberg' },
  { name: 'Munich', query: 'Munich' },
];

export function CampusJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeLocation, setActiveLocation] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      if (motionPreference.matches) return;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / scrollDistance));
        const reveal = Math.min(1, progress / 0.22);

        section.style.setProperty('--split-progress', String(reveal));
        section.style.setProperty('--photo-right-cut', `${50 * reveal}%`);
        section.style.setProperty('--photo-bottom-cut', `${28 * reveal}%`);
        section.style.setProperty('--photo-mobile-cut', `${53 * reveal}%`);
        section.style.setProperty('--panel-left-cut', `${100 * (1 - reveal)}%`);
        section.style.setProperty('--panel-top-cut', `${100 * (1 - reveal)}%`);
        section.style.setProperty('--caption-opacity', String(reveal));

        const listProgress = Math.max(0, (progress - 0.22) / 0.78);
        const nextLocation = Math.min(locations.length - 1, Math.floor(listProgress * locations.length));
        setActiveLocation((current) => current === nextLocation ? current : nextLocation);
      });
    };

    const syncMotion = () => {
      if (motionPreference.matches) {
        section.classList.remove(styles.enhanced);
        section.style.removeProperty('--split-progress');
        section.style.removeProperty('--photo-right-cut');
        section.style.removeProperty('--photo-bottom-cut');
        section.style.removeProperty('--photo-mobile-cut');
        section.style.removeProperty('--panel-left-cut');
        section.style.removeProperty('--caption-opacity');
        setActiveLocation(0);
        return;
      }
      section.classList.add(styles.enhanced);
      update();
    };

    syncMotion();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    motionPreference.addEventListener('change', syncMotion);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      motionPreference.removeEventListener('change', syncMotion);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.journey} aria-labelledby="journey-title">
      <div className={styles.stage}>
        <div className={styles.photoPane}>
          <Image
            className={styles.photo}
            src="/images/campus/berlin-university-engraving.jpg"
            alt="A complete nineteenth-century steel engraving of Berlin University’s main building."
            fill
            sizes="100vw"
            data-source="Wikimedia Commons"
            data-subject="Humboldt University of Berlin historic main building"
          />
          <div className={styles.counter} aria-live="polite" aria-label={`Location ${activeLocation + 1} of 5`}>
            <span>{String(activeLocation + 1).padStart(2, '0')}</span><i>/05</i>
          </div>
        </div>

        <div className={styles.photoCaption}>
          <h3>Humboldt-Universität zu Berlin</h3>
          <p>Historic main building · Berlin</p>
        </div>

        <div className={styles.contentPane}>
          <div className={styles.content}>
            <div className={styles.headingGroup}>
              <p className={styles.eyebrow}>Find your place</p>
              <h2 id="journey-title">Explore universities <span>by location</span></h2>
            </div>
            <nav aria-label="Browse programmes by university city" className={styles.locationList}>
              {locations.map((location, index) => (
                <Link
                  key={location.name}
                  href={`/programmes?search=${encodeURIComponent(location.query)}`}
                  className={index === activeLocation ? styles.locationActive : ''}
                  aria-current={index === activeLocation ? 'location' : undefined}
                >
                  <ArrowLeft aria-hidden="true" />
                  <span>{location.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
