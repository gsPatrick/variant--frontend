'use client';

import styles from './PasswordStrength.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

// Pontuação 0–4 com base em tamanho e variedade de caracteres.
function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 4);
}

const LABELS = ['Fraca', 'Fraca', 'Média', 'Boa', 'Forte'];
const COLORS = ['#ef4444', '#ef4444', '#eab308', '#22c55e', '#16a34a'];

export default function PasswordStrength({ value = '' }) {
  const s = scorePassword(value);
  const min6 = value.length >= 6;
  const lit = value ? Math.max(1, s) : 0;
  const color = COLORS[s];

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={styles.seg}
            style={{ background: i < lit ? color : undefined }}
          />
        ))}
      </div>
      <div className={styles.meta}>
        <span className={cx(styles.req, min6 && styles.reqOk)}>
          {min6 ? '✓' : '•'} mínimo 6 caracteres
        </span>
        {value && <span className={styles.label} style={{ color }}>{LABELS[s]}</span>}
      </div>
    </div>
  );
}
