'use client';

import { useEffect } from 'react';
import styles from './Toast.module.css';

const Check = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export default function Toast({ message, onDone, duration = 3200 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [message, onDone, duration]);

  if (!message) return null;

  return (
    <div className={styles.toast} role="status">
      <span className={styles.icon}>{Check}</span>
      <span>{message}</span>
    </div>
  );
}
