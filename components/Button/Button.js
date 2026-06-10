'use client';

import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  ...rest
}) {
  const classes = [styles.btn, styles[variant], loading ? styles.isLoading : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
