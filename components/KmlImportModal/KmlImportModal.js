'use client';

import { useRef, useState } from 'react';
import styles from './KmlImportModal.module.css';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { plotsApi } from '@/lib/api';

const cx = (...c) => c.filter(Boolean).join(' ');

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const UploadIcon = (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export default function KmlImportModal({ plots = [], defaultPlotId, onClose, onComplete, onToast }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const defaultPlot = plots.find((p) => p.id === defaultPlotId) || plots[0];
  const [farm, setFarm] = useState(defaultPlot?.farmId);
  const [targetPlot, setTargetPlot] = useState(defaultPlot?.id);

  const farmOptions = [];
  const seen = new Set();
  plots.forEach((p) => {
    if (!seen.has(p.farmId)) {
      seen.add(p.farmId);
      farmOptions.push({ value: p.farmId, label: `${p.farmName} · ${p.ownerName}` });
    }
  });
  const plotOptions = plots.filter((p) => p.farmId === farm).map((p) => ({ value: p.id, label: p.name }));

  function handleFarmChange(value) {
    setFarm(value);
    const first = plots.find((p) => p.farmId === value);
    setTargetPlot(first?.id);
  }

  function pickFile(picked) {
    if (!picked) return;
    if (!/\.kml$/i.test(picked.name)) {
      setError('Selecione um arquivo .kml.');
      return;
    }
    setError('');
    setFile(picked);
  }

  async function confirm() {
    if (!targetPlot) return setError('Selecione o talhão.');
    if (!file) return setError('Selecione um arquivo .kml.');
    setError('');
    setSubmitting(true);
    try {
      const r = await plotsApi.uploadKml(targetPlot, file);
      const ha = r?.areaHa != null ? ` · ${Number(r.areaHa).toFixed(2)} ha` : '';
      onToast(`Contorno do KML aplicado ao talhão${ha}.`);
      onComplete();
    } catch (err) {
      setError(err.message || 'Não foi possível importar o KML.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Importar contorno</p>
            <h2 className={styles.title}>Subir KML</h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            {Close}
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>1. Para qual talhão</label>
            <div className={styles.row}>
              <Select options={farmOptions} value={farm} onChange={handleFarmChange} placeholder="Selecione a fazenda" />
              <Select options={plotOptions} value={targetPlot} onChange={setTargetPlot} placeholder="Selecione o talhão" />
            </div>
          </div>

          <p className={styles.stepLabel}>2. Arquivo .kml</p>
          {file ? (
            <div className={styles.fileChip}>
              <span className={styles.fileName}>{file.name}</span>
              <button type="button" className={styles.change} onClick={() => { setFile(null); inputRef.current && (inputRef.current.value = ''); }}>
                Trocar
              </button>
            </div>
          ) : (
            <label
              className={cx(styles.drop, dragging && styles.dropActive)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
            >
              <input ref={inputRef} type="file" accept=".kml" className={styles.fileInput} onChange={(e) => pickFile(e.target.files?.[0])} />
              <span className={styles.dropIcon}>{UploadIcon}</span>
              <span className={styles.dropTitle}>Arraste o .kml aqui</span>
              <span className={styles.dropHint}>ou clique para escolher</span>
            </label>
          )}

          <p className={styles.note}>
            O KML deve conter o <strong>polígono</strong> do talhão. O contorno e o centro são calculados automaticamente e <strong>substituem</strong> o contorno atual do talhão selecionado.
          </p>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button variant="primary" disabled={!file || !targetPlot} loading={submitting} onClick={confirm}>
            Aplicar contorno
          </Button>
        </footer>
      </div>
    </div>
  );
}
