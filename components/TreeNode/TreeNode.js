'use client';

import { useState } from 'react';
import styles from './TreeNode.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

function Caret() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TreeNode({
  label,
  type = 'plot',
  icon,
  meta,
  badge,
  action,
  defaultExpanded = false,
  active = false,
  children,
}) {
  const hasChildren = Boolean(children);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.node} data-type={type}>
      <div className={cx(styles.row, active && styles.active)}>
        <button
          type="button"
          className={styles.rowBtn}
          onClick={() => hasChildren && setExpanded((prev) => !prev)}
        >
          {hasChildren ? (
            <span className={cx(styles.caret, expanded && styles.caretOpen)}>
              <Caret />
            </span>
          ) : (
            <span className={styles.caretSpacer} />
          )}

          {icon && <span className={styles.icon}>{icon}</span>}

          <span className={styles.label}>{label}</span>
          {meta && <span className={styles.meta}>{meta}</span>}
        </button>

        {badge && <span className={styles.badgeSlot}>{badge}</span>}
        {action && <span className={styles.action}>{action}</span>}
      </div>

      {hasChildren && (
        <div className={cx(styles.children, expanded && styles.childrenOpen)}>
          <div className={styles.childrenInner}>{children}</div>
        </div>
      )}
    </div>
  );
}
