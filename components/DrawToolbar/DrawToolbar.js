'use client';

import styles from './DrawToolbar.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

const Icon = {
  polygon: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 5-3 11H7L4 8z" /></svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /></svg>
  ),
  move: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" /></svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><circle cx="6" cy="18" r="2" /><path d="M8 6h8M6 8v8M18 8v8M8 18h8" /></svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
  ),
  cancel: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
};

export default function DrawToolbar({ plotName, tool, mode, area, onTool, onMode, onClear, onSave, onCancel, attached }) {
  return (
    <div className={cx(styles.bar, attached && styles.attached)}>
      {plotName && !attached && (
        <>
          <span className={styles.name}>{plotName}</span>
          <span className={styles.divider} />
        </>
      )}

      <button type="button" className={cx(styles.tool, tool === 'polygon' && styles.active)} onClick={() => onTool('polygon')} title="Polígono" aria-label="Polígono">{Icon.polygon}</button>
      <button type="button" className={cx(styles.tool, tool === 'circle' && styles.active)} onClick={() => onTool('circle')} title="Círculo / Pivô" aria-label="Círculo">{Icon.circle}</button>

      <span className={styles.divider} />

      <button type="button" className={cx(styles.tool, mode === 'drag' && styles.active)} onClick={() => onMode('drag')} title="Mover desenho" aria-label="Mover">{Icon.move}</button>
      <button type="button" className={cx(styles.tool, mode === 'edit' && styles.active)} onClick={() => onMode('edit')} title="Editar vértices" aria-label="Editar vértices">{Icon.edit}</button>
      <button type="button" className={styles.tool} onClick={onClear} title="Limpar" aria-label="Limpar">{Icon.trash}</button>

      {area > 0 && <span className={styles.area}><b>{area.toFixed(2)}</b> ha</span>}

      <span className={styles.divider} />

      <button type="button" className={cx(styles.tool, styles.save)} onClick={onSave} title="Salvar" aria-label="Salvar">{Icon.save}</button>
      <button type="button" className={cx(styles.tool, styles.cancelBtn)} onClick={onCancel} title="Cancelar" aria-label="Cancelar">{Icon.cancel}</button>
    </div>
  );
}
