'use client';

import { useRef, useState } from 'react';
import styles from './FloatingControls.module.css';
import Select from '../Select/Select';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const CORNERS = [
  { key: 'tl', sx: -1, sy: -1, cls: 'tl' },
  { key: 'tr', sx: 1, sy: -1, cls: 'tr' },
  { key: 'bl', sx: -1, sy: 1, cls: 'bl' },
  { key: 'br', sx: 1, sy: 1, cls: 'br' },
];

export default function FloatingControls({
  talhaoOptions,
  talhao,
  onTalhaoChange,
  safraOptions,
  safra,
  onSafraChange,
  showSafra,
}) {
  const [pos, setPos] = useState({ x: 100, y: 22 });
  const [scale, setScale] = useState(1);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  function onPillDown(e) {
    if (e.target.closest('[data-nodrag]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  }
  function onPillMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.px;
    const dy = e.clientY - dragRef.current.py;
    setPos({
      x: clamp(dragRef.current.x + dx, 0, window.innerWidth - 120),
      y: clamp(dragRef.current.y + dy, 0, window.innerHeight - 70),
    });
  }
  function onPillUp(e) {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  function onResizeDown(e, corner) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { px: e.clientX, py: e.clientY, s: scale, corner };
  }
  function onResizeMove(e) {
    if (!resizeRef.current) return;
    const { px, py, s, corner } = resizeRef.current;
    const delta = ((e.clientX - px) * corner.sx + (e.clientY - py) * corner.sy) / 2;
    setScale(clamp(s + delta / 320, 0.75, 1.7));
  }
  function onResizeUp(e) {
    resizeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  const vars = { '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--s': scale };

  return (
    <div
      className={styles.pill}
      style={vars}
      onPointerDown={onPillDown}
      onPointerMove={onPillMove}
      onPointerUp={onPillUp}
    >
      <div className={styles.field} data-nodrag>
        <Select options={talhaoOptions} value={talhao} onChange={onTalhaoChange} placeholder="Talhão" compact />
      </div>

      {showSafra && (
        <div className={styles.field} data-nodrag>
          <Select options={safraOptions} value={safra} onChange={onSafraChange} placeholder="Safra" compact />
        </div>
      )}

      {CORNERS.map((c) => (
        <span
          key={c.key}
          data-nodrag
          className={`${styles.resize} ${styles[c.cls]}`}
          onPointerDown={(e) => onResizeDown(e, c)}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeUp}
          role="slider"
          aria-label="Redimensionar painel"
          tabIndex={0}
        />
      ))}
    </div>
  );
}
