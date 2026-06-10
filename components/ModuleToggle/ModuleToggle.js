'use client';

import styles from './ModuleToggle.module.css';

export default function ModuleToggle({ value, onChange, options }) {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div className={styles.toggle} role="tablist">
      <span
        className={[styles.indicator, activeIndex === 1 ? styles.right : ''].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={[styles.option, value === opt.value ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
