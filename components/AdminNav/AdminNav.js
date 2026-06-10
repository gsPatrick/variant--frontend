'use client';

import { useRouter } from 'next/navigation';
import styles from './AdminNav.module.css';
import Logo from '../Logo/Logo';
import { auth } from '@/lib/api';

const cx = (...c) => c.filter(Boolean).join(' ');

const LogoutIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12H4M8 8l-4 4 4 4" /><path d="M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
  </svg>
);

const MapIcon = (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
  </svg>
);
const CloudIcon = (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 3.5 3.5 0 0 1 17.5 18z" /><path d="M12 12v5M9.5 14.5L12 12l2.5 2.5" />
  </svg>
);
const CalendarIcon = (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
const UsersIcon = (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.2 2.6-5 5.5-5s5.5 1.8 5.5 5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 20c0-2.4-1-4-2.6-4.6" />
  </svg>
);
const ChevronLeft = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const ChevronRight = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const TABS = [
  { id: 'map', label: 'Mapa de Gestão', icon: MapIcon },
  { id: 'datadrive', label: 'DataDrive', icon: CloudIcon },
  { id: 'safras', label: 'Gestão de Safras', icon: CalendarIcon },
  { id: 'users', label: 'Gestão de Usuários', icon: UsersIcon },
];

export default function AdminNav({ active, onChange, collapsed, onToggle, children }) {
  const router = useRouter();
  async function handleLogout() {
    await auth.logout();
    router.replace('/login');
  }
  return (
    <aside className={cx(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.head}>
        <div className={styles.brand}>
          {collapsed ? <Logo variant="mark" size="sm" /> : <Logo variant="lockup" size="" className={styles.logo} />}
        </div>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? ChevronRight : ChevronLeft}
        </button>
      </div>

      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles.item, active === tab.id && styles.active)}
            onClick={() => onChange(tab.id)}
            aria-current={active === tab.id}
            title={collapsed ? tab.label : undefined}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
            <span className={styles.tip}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {!collapsed && children && <div className={styles.content}>{children}</div>}

      <footer className={styles.foot}>
        {!collapsed && <span className={styles.role}>Administrador</span>}
        <button type="button" className={styles.logout} onClick={handleLogout} aria-label="Sair" title="Sair">
          {LogoutIcon}
          {!collapsed && <span>Sair</span>}
        </button>
      </footer>
    </aside>
  );
}
