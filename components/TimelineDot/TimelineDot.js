import styles from './TimelineDot.module.css';

export default function TimelineDot({
  icon,
  variant = 'default',
  active = false,
  pulse = false,
  className = '',
}) {
  const classes = [
    styles.dot,
    styles[variant],
    active ? styles.active : '',
    pulse ? styles.pulse : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {pulse && <span className={styles.ring} aria-hidden="true" />}
      <span className={styles.core}>{icon}</span>
    </span>
  );
}
