'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AdminFloating.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

const Upload = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V4M8 8l4-4 4 4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);
const Pencil = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M13.5 6.5l3 3" />
  </svg>
);
const Plus = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Chevron = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" />
  </svg>
);

export default function AdminFloating({ plotOptions, plotId, onSelectPlot, onImport, onEdit, onAdd, belowSlot }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const selected = plotOptions.find((o) => o.value === plotId);

  return (
    <div className={cx(styles.bar, (open || belowSlot) && styles.barOpen)} ref={ref}>
      <div className={styles.row}>
        <button
          type="button"
          className={cx(styles.talhao, open && styles.talhaoOpen)}
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={styles.talhaoIcon}>{Pin}</span>
          <span className={styles.talhaoLabel}>{selected ? selected.label : 'Selecionar talhão'}</span>
          <span className={cx(styles.chevron, open && styles.chevronOpen)}>{Chevron}</span>
        </button>

        <button type="button" className={styles.importBtn} onClick={onImport}>
          {Upload}
          <span>Importar análises</span>
        </button>

        <span className={styles.divider} />

        <button type="button" className={styles.action} onClick={onEdit} title="Editar contorno" aria-label="Editar contorno">
          {Pencil}
        </button>
        <button type="button" className={styles.action} onClick={onAdd} title="Adicionar proprietário" aria-label="Adicionar">
          {Plus}
        </button>
      </div>

      {open && (
        <ul className={styles.list} role="listbox">
          {plotOptions.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === plotId}
              className={cx(styles.option, opt.value === plotId && styles.optionActive)}
              onClick={() => {
                onSelectPlot(opt.value);
                setOpen(false);
              }}
            >
              <span className={styles.optionIcon}>{Pin}</span>
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {belowSlot && <div className={styles.belowSlot}>{belowSlot}</div>}
    </div>
  );
}
