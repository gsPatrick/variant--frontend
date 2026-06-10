import styles from './Badge.module.css';

export default function Badge({ variant = 'default', children, dot = false, className = '' }) {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
