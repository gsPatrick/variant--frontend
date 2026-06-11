'use client';

import { useEffect, useState } from 'react';
import styles from './ParametersPanel.module.css';
import Button from '../Button/Button';
import { settingsApi } from '@/lib/api';

// Metadados dos nutrientes do radar (rótulo + unidade) — só para exibição.
const NUTRIENTS = [
  { key: 'P', label: 'Fósforo (P)', unit: 'mg/dm³' },
  { key: 'K', label: 'Potássio (K)', unit: 'cmolc/dm³' },
  { key: 'Ca', label: 'Cálcio (Ca)', unit: 'cmolc/dm³' },
  { key: 'Mg', label: 'Magnésio (Mg)', unit: 'cmolc/dm³' },
  { key: 'S', label: 'Enxofre (S)', unit: 'mg/dm³' },
  { key: 'Zn', label: 'Zinco (Zn)', unit: 'mg/dm³' },
  { key: 'Mn', label: 'Manganês (Mn)', unit: 'mg/dm³' },
  { key: 'Fe', label: 'Ferro (Fe)', unit: 'mg/dm³' },
  { key: 'Cu', label: 'Cobre (Cu)', unit: 'mg/dm³' },
  { key: 'B', label: 'Boro (B)', unit: 'mg/dm³' },
];

const Info = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" />
  </svg>
);

export default function ParametersPanel({ onToast }) {
  const [ideals, setIdeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsApi.getRadarIdeals();
        setIdeals(data.ideals || {});
      } catch {
        setIdeals({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setVal(key, value) {
    setIdeals((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {};
      NUTRIENTS.forEach((n) => { payload[n.key] = ideals[n.key]; });
      const data = await settingsApi.saveRadarIdeals(payload);
      setIdeals(data.ideals || {});
      onToast('Valores ideais salvos! O radar do produtor já usa esses números.');
    } catch (err) {
      onToast(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Configuração</p>
          <h1 className={styles.title}>Parâmetros do Radar</h1>
        </div>
        <Button variant="primary" loading={saving} onClick={save} disabled={loading}>
          Salvar valores
        </Button>
      </header>

      <div className={styles.explain}>
        <span className={styles.explainIcon}>{Info}</span>
        <div>
          <p className={styles.explainTitle}>Como funciona o gráfico de radar</p>
          <p className={styles.explainText}>
            Para cada nutriente, o radar mostra o <strong>nível (%)</strong> = (valor medido na análise ÷ valor ideal) × 100.
            Ou seja: o <strong>valor ideal</strong> que você define abaixo é a <strong>referência</strong> (100%). Se a análise
            der o valor ideal, o ponto vai até a borda; se der metade, vai até 50%; acima do ideal, fica no máximo (100%).
            Defina aqui os valores ideais da sua recomendação agronômica — eles valem para todos os talhões.
          </p>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Carregando…</p>
      ) : (
        <div className={styles.grid}>
          {NUTRIENTS.map((n) => (
            <div key={n.key} className={styles.card}>
              <label className={styles.cardLabel} htmlFor={`ideal-${n.key}`}>{n.label}</label>
              <div className={styles.inputRow}>
                <input
                  id={`ideal-${n.key}`}
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={ideals[n.key] ?? ''}
                  onChange={(e) => setVal(n.key, e.target.value)}
                />
                <span className={styles.unit}>{n.unit}</span>
              </div>
              <p className={styles.cardHint}>valor ideal (100% no radar)</p>
            </div>
          ))}
        </div>
      )}

      <p className={styles.foot}>
        Dica: esses valores são a referência de “teor ideal”. Se a sua recomendação muda por cultura ou tipo de solo,
        me avise que evoluímos para permitir conjuntos diferentes por cultura.
      </p>
    </div>
  );
}
