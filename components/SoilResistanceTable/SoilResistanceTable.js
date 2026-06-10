'use client';

import { useState } from 'react';
import styles from './SoilResistanceTable.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

const Close = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Trash = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);

// Níveis de compactação (faixas agronômicas de resistência à penetração).
function levelInfo(mpa) {
  const v = Number(mpa);
  if (!Number.isFinite(v)) return { cls: styles.neutral, label: '—', desc: 'Informe a resistência em MPa.' };
  if (v < 1.2) return { cls: styles.low, label: 'Baixa', desc: 'Solo descompactado — boa estrutura para as raízes (abaixo de 1,2 MPa).' };
  if (v < 2) return { cls: styles.mid, label: 'Moderada', desc: 'Compactação moderada — atenção ao manejo do solo (1,2 a 2,0 MPa).' };
  if (v < 2.8) return { cls: styles.high, label: 'Alta', desc: 'Compactação alta — pode restringir o crescimento das raízes (2,0 a 2,8 MPa).' };
  return { cls: styles.critical, label: 'Crítica', desc: 'Compactação crítica — recomenda-se descompactação/escarificação (acima de 2,8 MPa).' };
}

const LEGEND = [
  { cls: styles.low, label: 'Baixa', desc: levelInfo(0.5).desc },
  { cls: styles.mid, label: 'Moderada', desc: levelInfo(1.5).desc },
  { cls: styles.high, label: 'Alta', desc: levelInfo(2.4).desc },
  { cls: styles.critical, label: 'Crítica', desc: levelInfo(3).desc },
];

function Legend() {
  return (
    <div className={styles.legend}>
      {LEGEND.map((l) => (
        <span key={l.label} className={styles.legendItem} title={l.desc}>
          <span className={cx(styles.dot, l.cls)} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

export default function SoilResistanceTable({
  readings = [],
  activeDepth,
  onSelect,
  onSave,
  onClose,
  saving,
  canEdit,
  embedded = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);

  function startEdit() {
    setDraft(
      readings.length
        ? readings.map((r) => ({ depthCm: String(r.depthCm), mpa: String(r.mpa) }))
        : [{ depthCm: '', mpa: '' }]
    );
    setEditing(true);
  }
  function setRow(i, key, val) {
    setDraft((d) => d.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  }
  function addRow() {
    setDraft((d) => [...d, { depthCm: '', mpa: '' }]);
  }
  function removeRow(i) {
    setDraft((d) => d.filter((_, idx) => idx !== i));
  }
  async function save() {
    const rows = draft
      .map((r) => ({ depthCm: Number.parseInt(r.depthCm, 10), mpa: Number(r.mpa) }))
      .filter((r) => Number.isInteger(r.depthCm) && r.depthCm > 0 && Number.isFinite(r.mpa));
    await onSave(rows);
    setEditing(false);
  }

  return (
    <div className={cx(styles.panel, embedded && styles.embedded)}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Compactação</p>
          <h4 className={styles.title}>Resistência do Solo</h4>
        </div>
        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar tabela">
            {Close}
          </button>
        )}
      </header>

      {editing ? (
        <div className={styles.editor}>
          <div className={styles.editHead}>
            <span>Prof. (cm)</span>
            <span>MPa</span>
            <span />
            <span />
          </div>
          {draft.map((r, i) => {
            const info = levelInfo(r.mpa);
            return (
              <div key={i} className={styles.editRow}>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="10"
                  value={r.depthCm}
                  onChange={(e) => setRow(i, 'depthCm', e.target.value)}
                />
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  placeholder="1.4"
                  value={r.mpa}
                  onChange={(e) => setRow(i, 'mpa', e.target.value)}
                />
                <span className={cx(styles.dot, info.cls)} title={`${info.label} — ${info.desc}`} />
                <button type="button" className={styles.del} onClick={() => removeRow(i)} aria-label="Remover linha">
                  {Trash}
                </button>
              </div>
            );
          })}
          <button type="button" className={styles.addRow} onClick={addRow}>
            + Adicionar profundidade
          </button>
          <Legend />
          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className={styles.primary} onClick={save} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      ) : readings.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {canEdit
              ? 'Nenhuma leitura de resistência para este talhão.'
              : 'O agrônomo ainda não cadastrou a resistência do solo deste talhão.'}
          </p>
          {canEdit && (
            <button type="button" className={styles.primary} onClick={startEdit}>
              Adicionar leituras
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {readings.map((row) => {
              const info = levelInfo(row.mpa);
              const clickable = Boolean(onSelect);
              const pct = Math.max(4, Math.min(100, (row.mpa / 4) * 100));
              return (
                <div
                  key={row.depthCm}
                  className={cx(styles.row, clickable && styles.clickable, activeDepth === row.depthCm && styles.active)}
                  onClick={clickable ? () => onSelect(row.depthCm) : undefined}
                  role={clickable ? 'button' : undefined}
                  title={`${info.label} — ${info.desc}`}
                >
                  <span className={styles.depth}>
                    <span className={cx(styles.dot, info.cls)} />
                    {row.depthCm} cm
                  </span>
                  <span className={styles.bar}>
                    <span className={cx(styles.barFill, info.cls)} style={{ width: `${pct}%` }} />
                  </span>
                  <span className={styles.value}>
                    {row.mpa.toFixed(1)} <small>MPa</small>
                  </span>
                  <span className={cx(styles.levelTag, info.cls)}>{info.label}</span>
                </div>
              );
            })}
          </div>
          <Legend />
          {canEdit && (
            <div className={styles.actions}>
              <button type="button" className={styles.ghost} onClick={startEdit}>
                Editar leituras
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
