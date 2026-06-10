'use client';

import styles from './Input.module.css';

export default function Input({
  icon,
  trailing,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  ...rest
}) {
  const classes = [styles.wrapper, icon ? styles.hasIcon : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </label>
  );
}
