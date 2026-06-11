'use client';

import { useRef, useState } from 'react';
import styles from './ImportModal.module.css';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { parsePreview } from './parsePreview';
import { plotsApi } from '@/lib/api';

const cx = (...c) => c.filter(Boolean).join(' ');
const norm = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const UploadIcon = (
  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4M8 8l4-4 4 4" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);
const Check = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const TABS = [
  { id: 'single', label: 'Por talhão' },
  { id: 'multi', label: 'Vários talhões' },
  { id: 'create', label: 'Criar + importar' },
];

const STEPS = [
  'A planilha pode ter vários talhões — cada linha vai pro talhão certo pelo nome.',
  'Pode ter 2 linhas de cabeçalho (nome + unidade): o sistema entende.',
  'Use vírgula ou ponto nos decimais (3,5 ou 3.5) — tanto faz.',
  'Importar cria análises novas e atualiza as já existentes (mesmo ano/profundidade).',
  'Aceita .xlsx, .xls e .csv.',
];

const TEMPLATE = [
  'Talhao,Ano,Prof,pH em agua,pH CaCl2,M.O,V,CTC,m,P,K,Ca,Mg,S,Zn,Mn,Fe,Cu,B',
  'Talhao Sede,2025,20,5.6,5.1,32,60,7.5,0,16,0.35,4.2,1.3,8,1.6,18,40,1.2,0.5',
  'Talhao Sede,2025,40,5.4,4.9,28,54,6.8,0.2,12,0.28,3.5,1.0,6,1.2,15,36,1.0,0.4',
].join('\n');

export default function ImportModal({ plots = [], defaultPlotId, onClose, onComplete, onToast }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('single');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const defaultPlot = plots.find((p) => p.id === defaultPlotId) || plots[0];
  const [farm, setFarm] = useState(defaultPlot?.farmId);
  const [targetPlot, setTargetPlot] = useState(defaultPlot?.id);
  const [destFarm, setDestFarm] = useState(defaultPlot?.farmId);

  const farmOptions = [];
  const seenFarms = new Set();
  plots.forEach((p) => {
    if (!seenFarms.has(p.farmId)) {
      seenFarms.add(p.farmId);
      farmOptions.push({ value: p.farmId, label: `${p.farmName} · ${p.ownerName}` });
    }
  });
  const plotOptions = plots.filter((p) => p.farmId === farm).map((p) => ({ value: p.id, label: p.name }));

  function handleFarmChange(value) {
    setFarm(value);
    const first = plots.find((p) => p.farmId === value);
    setTargetPlot(first?.id);
  }

  // Casamento dos talhões da planilha com os cadastrados.
  const fileTalhoes = preview?.hasTalhao ? preview.talhoes : [];
  const multiMatched = fileTalhoes.map((name) => ({ name, plot: plots.find((p) => norm(p.name) === norm(name)) }));
  const multiUnmatched = multiMatched.filter((m) => !m.plot);
  const createMatched = fileTalhoes.map((name) => ({
    name,
    plot: plots.find((p) => p.farmId === destFarm && norm(p.name) === norm(name)),
  }));

  async function handleFile(picked) {
    if (!picked) return;
    setError('');
    setPreview(null);
    setFile(null);
    setBusy(true);
    try {
      const result = await parsePreview(picked);
      if (!result.ok) setError(result.error);
      else {
        setPreview(result);
        setFile(picked);
      }
    } catch {
      setError('Não foi possível ler este arquivo. Confira se é uma planilha válida.');
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_analises_solo.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmImport() {
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'single') {
        const r = await plotsApi.importSoil(targetPlot, file);
        onToast(`Importação concluída: ${r.inseridos} inseridos, ${r.atualizados} atualizados.`);
      } else if (mode === 'multi') {
        const targets = multiMatched.filter((m) => m.plot);
        let ins = 0;
        let upd = 0;
        for (const m of targets) {
          // eslint-disable-next-line no-await-in-loop
          const r = await plotsApi.importSoil(m.plot.id, file);
          ins += r.inseridos;
          upd += r.atualizados;
        }
        const skipped = multiUnmatched.map((m) => m.name);
        onToast(
          `Importado em ${targets.length} talhão(ões): ${ins} inseridos, ${upd} atualizados.` +
            (skipped.length ? ` Ignorados (não cadastrados): ${skipped.join(', ')}.` : '')
        );
      } else {
        let created = 0;
        let ins = 0;
        let upd = 0;
        for (const m of createMatched) {
          let plotId = m.plot?.id;
          if (!plotId) {
            // eslint-disable-next-line no-await-in-loop
            const np = await plotsApi.create({ farmId: destFarm, name: m.name });
            plotId = np.id;
            created += 1;
          }
          // eslint-disable-next-line no-await-in-loop
          const r = await plotsApi.importSoil(plotId, file);
          ins += r.inseridos;
          upd += r.atualizados;
        }
        onToast(`Importado em ${createMatched.length} talhão(ões) (${created} criados): ${ins} inseridos, ${upd} atualizados.`);
      }
      onComplete();
    } catch (err) {
      setError(err.message || 'Falha ao importar a planilha.');
    } finally {
      setSubmitting(false);
    }
  }

  const needsTalhaoCol = (mode === 'multi' || mode === 'create') && preview && !preview.hasTalhao;
  const canImport =
    preview &&
    preview.totalRows > 0 &&
    !needsTalhaoCol &&
    (mode === 'single'
      ? Boolean(targetPlot)
      : mode === 'multi'
        ? multiMatched.some((m) => m.plot)
        : Boolean(destFarm) && createMatched.length > 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Importar</p>
            <h2 className={styles.title}>Análises de solo</h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            {Close}
          </button>
        </header>

        <div className={styles.body}>
          <aside className={styles.guide}>
            <p className={styles.guideTitle}>Como funciona</p>
            <ul className={styles.guideList}>
              {STEPS.map((s) => (
                <li key={s}>
                  <span className={styles.bullet}>{Check}</span>
                  {s}
                </li>
              ))}
            </ul>
            <button type="button" className={styles.templateBtn} onClick={downloadTemplate}>
              Baixar modelo (CSV)
            </button>
          </aside>

          <div className={styles.main}>
            <div className={styles.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={cx(styles.tab, mode === t.id && styles.tabActive)}
                  onClick={() => setMode(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.target}>
              {mode === 'single' && (
                <>
                  <p className={styles.targetLabel}>1. Para qual talhão importar</p>
                  <div className={styles.targetRow}>
                    <Select options={farmOptions} value={farm} onChange={handleFarmChange} placeholder="Selecione a fazenda" />
                    <Select options={plotOptions} value={targetPlot} onChange={setTargetPlot} placeholder="Selecione o talhão" />
                  </div>
                </>
              )}
              {mode === 'multi' && (
                <>
                  <p className={styles.targetLabel}>1. Vários talhões pela planilha</p>
                  <p className={styles.hintText}>
                    Cada talhão da planilha é casado pelo <strong>nome</strong> com os já cadastrados. Os que não existirem são ignorados (veja abaixo).
                  </p>
                </>
              )}
              {mode === 'create' && (
                <>
                  <p className={styles.targetLabel}>1. Fazenda onde criar/importar</p>
                  <Select options={farmOptions} value={destFarm} onChange={setDestFarm} placeholder="Selecione a fazenda" />
                  <p className={styles.hintText}>
                    Os talhões da planilha que <strong>não existirem</strong> nessa fazenda serão <strong>criados</strong> automaticamente.
                  </p>
                </>
              )}
            </div>

            <p className={styles.stepLabel}>2. Envie a planilha</p>

            {!preview && (
              <label
                className={cx(styles.drop, dragging && styles.dropActive)}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className={styles.fileInput}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <span className={styles.dropIcon}>{UploadIcon}</span>
                <span className={styles.dropTitle}>{busy ? 'Lendo planilha…' : 'Arraste a planilha aqui'}</span>
                <span className={styles.dropHint}>ou clique para escolher · .xlsx, .xls, .csv</span>
              </label>
            )}

            {error && (
              <div className={styles.error}>
                <strong>Não deu pra importar.</strong> {error}
                <button type="button" className={styles.retry} onClick={() => { setError(''); inputRef.current?.click(); }}>
                  Escolher outro arquivo
                </button>
              </div>
            )}

            {preview && (
              <div className={styles.preview}>
                <div className={styles.fileChip}>
                  <span className={styles.fileName}>{preview.fileName}</span>
                  <span className={styles.fileMeta}>{preview.fileSizeKb} KB</span>
                  <button type="button" className={styles.change} onClick={() => { setPreview(null); inputRef.current && (inputRef.current.value = ''); }}>
                    Trocar
                  </button>
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{preview.totalRows}</span>
                    <span className={styles.statLabel}>linhas</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{preview.hasTalhao ? preview.talhoes.length : 1}</span>
                    <span className={styles.statLabel}>talhões</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{preview.anos.length}</span>
                    <span className={styles.statLabel}>anos</span>
                  </div>
                </div>

                {needsTalhaoCol && (
                  <p className={styles.warn}>Esta planilha não tem a coluna "Talhao" — use a aba "Por talhão".</p>
                )}

                {mode === 'single' && preview.hasTalhao && (
                  <p className={styles.hintText}>Serão importadas só as linhas do talhão selecionado acima.</p>
                )}

                {mode === 'multi' && preview.hasTalhao && (
                  <div className={styles.block}>
                    <p className={styles.blockLabel}>Casamento por nome</p>
                    <div className={styles.chips}>
                      {multiMatched.map((m) => (
                        <span key={m.name} className={cx(styles.chip, m.plot ? styles.chipOk : styles.chipWarn)}>
                          {m.plot && Check}{m.name}{m.plot ? '' : ' · não cadastrado'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'create' && preview.hasTalhao && (
                  <div className={styles.block}>
                    <p className={styles.blockLabel}>O que vai acontecer</p>
                    <div className={styles.chips}>
                      {createMatched.map((m) => (
                        <span key={m.name} className={cx(styles.chip, m.plot ? styles.chipOk : styles.chipNew)}>
                          {m.name} · {m.plot ? 'existe' : 'será criado'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.block}>
                  <p className={styles.blockLabel}>Colunas reconhecidas</p>
                  <div className={styles.chips}>
                    {preview.recognized.map((c) => (
                      <span key={c} className={cx(styles.chip, styles.chipOk)}>{Check}{c}</span>
                    ))}
                  </div>
                </div>

                {preview.warnings.map((w) => (
                  <p key={w} className={styles.warn}>{w}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button variant="primary" disabled={!canImport} loading={submitting} onClick={confirmImport}>
            Importar {preview ? `${preview.totalRows} linhas` : ''}
          </Button>
        </footer>
      </div>
    </div>
  );
}
