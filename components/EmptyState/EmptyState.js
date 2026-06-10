import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div className={`${styles.empty} ${compact ? styles.compact : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
