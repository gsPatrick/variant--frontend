'use client';

import styles from './EventModal.module.css';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function EventModal({ event, onClose }) {
  if (!event) return null;

  return (
    <aside className={styles.panel}>
      <header className={styles.head}>
        <div>
          <span className={styles.date}>{event.dateFull}</span>
          <h3 className={styles.title}>{event.title}</h3>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
          {Close}
        </button>
      </header>

      <p className={styles.desc}>{event.description}</p>

      <p className={styles.galleryLabel}>Fotos do evento</p>
      <div className={styles.gallery}>
        {event.photos.map((src, i) => (
          <div key={src} className={styles.photoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${event.title} — foto ${i + 1}`} className={styles.photo} loading="lazy" />
          </div>
        ))}
      </div>
    </aside>
  );
}
