'use client';

import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import Logo from '../Logo/Logo';
import Select from '../Select/Select';
import ModuleToggle from '../ModuleToggle/ModuleToggle';
import { auth } from '@/lib/api';

const LogoutIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12H4M8 8l-4 4 4 4" /><path d="M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
  </svg>
);

const MODULES = [
  { value: 'solos', label: 'SOLOS' },
  { value: 'safras', label: 'SAFRAS' },
];

const cx = (...c) => c.filter(Boolean).join(' ');

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
const SolosIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 16.5l9 5 9-5" />
  </svg>
);
const SafrasIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);
const Instagram = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
const WhatsApp = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 20.5l1.3-4.2A8 8 0 1 1 8.2 19.2L3.5 20.5z" />
  </svg>
);

export default function Sidebar({
  collapsed,
  onToggle,
  module,
  onModuleChange,
  farms,
  farm,
  onFarmChange,
  plots,
  plot,
  onPlotChange,
  safraYears,
  safraYear,
  onSafraYearChange,
}) {
  const router = useRouter();
  async function handleLogout() {
    await auth.logout();
    router.replace('/login');
  }
  return (
    <aside className={cx(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.head}>
        <div className={styles.brand}>
          {collapsed ? (
            <Logo variant="mark" size="sm" />
          ) : (
            <Logo variant="lockup" size="" className={styles.brandLogo} />
          )}
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

      {collapsed ? (
        <div className={styles.rail}>
          <button
            type="button"
            className={cx(styles.railBtn, module === 'solos' && styles.railActive)}
            onClick={() => onModuleChange('solos')}
            aria-label="Módulo SOLOS"
            title="SOLOS"
          >
            {SolosIcon}
          </button>
          <button
            type="button"
            className={cx(styles.railBtn, module === 'safras' && styles.railActive)}
            onClick={() => onModuleChange('safras')}
            aria-label="Módulo SAFRAS"
            title="SAFRAS"
          >
            {SafrasIcon}
          </button>
        </div>
      ) : (
        <>
          <ModuleToggle value={module} onChange={onModuleChange} options={MODULES} />

          <div className={styles.section}>
            <label className={styles.label}>Fazenda</label>
            <Select options={farms} value={farm} onChange={onFarmChange} placeholder="Selecione a fazenda" />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Talhão</label>
            <Select options={plots} value={plot} onChange={onPlotChange} placeholder="Selecione o talhão" />
          </div>

          {module === 'safras' && safraYears.length > 0 && (
            <div className={styles.section}>
              <label className={styles.label}>Ano Agrícola</label>
              <Select
                options={safraYears}
                value={safraYear}
                onChange={onSafraYearChange}
                placeholder="Selecione o ano agrícola"
              />
            </div>
          )}
        </>
      )}

      <div className={styles.spacer} />

      <button
        type="button"
        className={cx(styles.logout, collapsed && styles.logoutRail)}
        onClick={handleLogout}
        aria-label="Sair"
        title="Sair"
      >
        {LogoutIcon}
        {!collapsed && <span>Sair</span>}
      </button>

      <footer className={cx(styles.social, collapsed && styles.socialRail)}>
        {!collapsed && <span className={styles.socialLabel}>Siga a Variant</span>}
        <div className={styles.socialRow}>
          <a
            className={styles.socialBtn}
            href="https://instagram.com/variantmapas"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Variant"
          >
            {Instagram}
          </a>
          <a
            className={styles.socialBtn}
            href="https://wa.me/5566999999999"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp da Variant"
          >
            {WhatsApp}
          </a>
        </div>
      </footer>
    </aside>
  );
}
