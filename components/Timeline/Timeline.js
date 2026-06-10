'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Timeline.module.css';
import TimelineDot from '../TimelineDot/TimelineDot';

const cx = (...c) => c.filter(Boolean).join(' ');

const TYPE_VARIANT = {
  plantio: 'plantio',
  adubacao: 'adubacao',
  aplicacao: 'defensivo',
  aplicacao_defensivos: 'defensivo',
  irrigacao: 'adubacao',
  colheita: 'colheita',
};

const ICONS = {
  plantio: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V9" />
      <path d="M12 9c0-4 3-6 7-6 0 4-3 6-7 6z" />
      <path d="M12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
    </svg>
  ),
  adubacao: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  ),
  aplicacao: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <path d="M9 8V5h3V3" />
      <path d="M18 5h2M18 8h2" />
    </svg>
  ),
  aplicacao_defensivos: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <path d="M9 8V5h3V3" />
      <path d="M18 5h2M18 8h2" />
    </svg>
  ),
  irrigacao: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  ),
  colheita: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c4 0 6-3 6-8M20 20c-4 0-6-3-6-8" />
      <path d="M10 12c0-5 1-8 2-9 1 1 2 4 2 9" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
};

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'left' ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
  </svg>
);

export default function Timeline({ events, selectedId, onSelect }) {
  const viewportRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function update() {
    const el = viewportRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    update();
    const el = viewportRef.current;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [events]);

  function scroll(dir) {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  }

  return (
    <div className={styles.timeline}>
      <button
        type="button"
        className={cx(styles.arrow, styles.arrowLeft, !canLeft && styles.arrowHidden)}
        onClick={() => scroll(-1)}
        aria-label="Eventos anteriores"
      >
        <Chevron dir="left" />
      </button>

      <div className={styles.viewport} ref={viewportRef} onScroll={update}>
        <ul className={styles.items}>
          {events.map((ev) => (
            <li key={ev.id} className={styles.item}>
              <button
                type="button"
                className={cx(styles.dotBtn, selectedId === ev.id && styles.selected)}
                onClick={() => onSelect(ev.id)}
                aria-label={`${ev.title} — ${ev.date}`}
              >
                <TimelineDot
                  variant={TYPE_VARIANT[ev.type] || 'default'}
                  icon={ICONS[ev.type] || ICONS.default}
                  active={selectedId === ev.id}
                />
              </button>
              <span className={styles.date}>{ev.date}</span>
              <span className={styles.title}>{ev.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className={cx(styles.arrow, styles.arrowRight, !canRight && styles.arrowHidden)}
        onClick={() => scroll(1)}
        aria-label="Próximos eventos"
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}
