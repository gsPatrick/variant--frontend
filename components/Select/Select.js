'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Select.module.css';

function Chevron() {
  return (
    <svg className={styles.chevron} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const stripAccents = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Selecione',
  className = '',
  compact = false,
  searchable = false,
  disabled = false,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function handleEsc(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const selected = options.find((opt) => opt.value === value);
  const isDisabled = disabled || loading;
  const filtered =
    searchable && query.trim()
      ? options.filter((opt) => stripAccents(opt.label).includes(stripAccents(query)))
      : options;

  function toggle() {
    if (isDisabled) return;
    setQuery('');
    setOpen((prev) => !prev);
  }

  return (
    <div className={[styles.select, className].filter(Boolean).join(' ')} ref={ref}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.open : '', compact ? styles.compact : '', isDisabled ? styles.disabled : '']
          .filter(Boolean)
          .join(' ')}
        onClick={toggle}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {loading ? 'Carregando…' : selected ? selected.label : placeholder}
        </span>
        <Chevron />
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {searchable && (
            <li className={styles.searchWrap}>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                className={styles.search}
                type="text"
                value={query}
                autoFocus
                placeholder="Buscar…"
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          )}
          {filtered.length === 0 && <li className={styles.noResult}>Nenhum resultado</li>}
          {filtered.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={[styles.option, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  if (onChange) onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
