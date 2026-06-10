import styles from './GlassCard.module.css';

export default function GlassCard({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}
