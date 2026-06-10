'use client';

import styles from './SlimSidebar.module.css';
import Logo from '../Logo/Logo';

const cx = (...c) => c.filter(Boolean).join(' ');

const MapIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);
const CloudIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 3.5 3.5 0 0 1 17.5 18z" />
    <path d="M12 12v5M9.5 14.5L12 12l2.5 2.5" />
  </svg>
);
const CalendarIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M8 3v4M16 3v4" />
    <path d="M12 13c0-2 1.5-3 3-3 0 2-1.5 3-3 3z" />
  </svg>
);
const UsersIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c0-3.2 2.6-5 5.5-5s5.5 1.8 5.5 5" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M18 20c0-2.4-1-4-2.6-4.6" />
  </svg>
);

const TABS = [
  { id: 'map', label: 'Mapa de Gestão', icon: MapIcon },
  { id: 'datadrive', label: 'DataDrive', icon: CloudIcon },
  { id: 'safras', label: 'Gestão de Safras', icon: CalendarIcon },
  { id: 'users', label: 'Gestão de Usuários', icon: UsersIcon },
];

export default function SlimSidebar({ active, onChange }) {
  return (
    <aside className={styles.slim}>
      <div className={styles.brand}>
        <Logo variant="mark" size="sm" />
      </div>

      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles.item, active === tab.id && styles.active)}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            aria-current={active === tab.id}
          >
            {tab.icon}
            <span className={styles.tip}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
