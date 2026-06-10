import styles from './Logo.module.css';

export default function Logo({
  size = 'md',
  variant = 'full',
  className = '',
  alt = 'Variant — Mapas e Consultoria',
}) {
  const classes = [
    styles.logo,
    variant === 'mark' ? styles.mark : '',
    variant === 'lockup' ? styles.lockup : '',
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <img src="/logo.png" alt={alt} className={styles.img} />
    </span>
  );
}
