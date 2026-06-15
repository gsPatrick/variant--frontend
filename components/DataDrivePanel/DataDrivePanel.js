'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './DataDrivePanel.module.css';
import Button from '../Button/Button';
import Select from '../Select/Select';
import EmptyState from '../EmptyState/EmptyState';
import { plotsApi } from '@/lib/api';

const cx = (...c) => c.filter(Boolean).join(' ');

// Valores únicos (não nulos/vazios), preservando a ordem de aparição.
const uniq = (arr) => [...new Set(arr.filter((x) => x != null && x !== ''))];
// Monta opções de filtro com um "Todos…" no topo (value vazio).
const optsAll = (allLabel, vals) => [
  { value: '', label: allLabel },
  ...uniq(vals).map((vv) => ({ value: String(vv), label: String(vv) })),
];

const Sheet = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4M9 13h6M9 17h6M9 9h2" />
  </svg>
);
const MapPin = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" />
  </svg>
);
const EyeMap = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
  </svg>
);
const Trash = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);
const Globe = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
);

const hasContour = (p) =>
  Boolean(p.kmlFilename) || Boolean(p.geometry && (p.geometry.features?.length > 0 || p.geometry.type));

const fmtArea = (a) => (a == null ? '—' : `${Number(a).toFixed(2)} ha`);

// Extrai os anéis externos de polígonos de um GeoJSON (Polygon/MultiPolygon/FeatureCollection).
function outerRings(geo) {
  const rings = [];
  const fromGeom = (g) => {
    if (!g) return;
    if (g.type === 'Polygon') rings.push(g.coordinates[0]);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach((poly) => rings.push(poly[0]));
  };
  if (geo?.type === 'FeatureCollection') (geo.features || []).forEach((f) => fromGeom(f.geometry));
  else if (geo?.type === 'Feature') fromGeom(geo.geometry);
  else fromGeom(geo);
  return rings.filter((r) => Array.isArray(r) && r.length >= 3);
}

// Converte o contorno (GeoJSON) em KML — formato que abre no Google Earth.
function geojsonToKml(geo, name) {
  const placemarks = outerRings(geo)
    .map((ring) => {
      const coords = ring.map(([lng, lat]) => `${lng},${lat},0`).join(' ');
      return `<Placemark><name>${name}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${name}</name>${placemarks}</Document></kml>`;
}

export default function DataDrivePanel({ plots = [], onOpenImport, onImportKml, onViewOnMap, onToast }) {
  const [analysisRows, setAnalysisRows] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  // Filtros das listagens
  const [aPlot, setAPlot] = useState('');
  const [aYear, setAYear] = useState('');
  const [aDepth, setADepth] = useState('');
  const [cPlot, setCPlot] = useState('');
  const [cOrigin, setCOrigin] = useState('');

  const plotsKey = plots.map((p) => p.id).join(',');

  const loadAnalyses = useCallback(async () => {
    if (plots.length === 0) {
      setAnalysisRows([]);
      setLoadingAnalyses(false);
      return;
    }
    setLoadingAnalyses(true);
    try {
      const results = await Promise.all(
        plots.map((p) =>
          plotsApi
            .listAnalyses(p.id)
            .then((d) => (d.analyses || []).map((a) => ({ ...a, plotId: p.id, plot: `${p.name} · ${p.farmName}` })))
            .catch(() => [])
        )
      );
      setAnalysisRows(results.flat());
    } finally {
      setLoadingAnalyses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotsKey]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  async function deleteAnalysis(row) {
    try {
      await plotsApi.removeAnalysis(row.plotId, row.id);
      setConfirmId(null);
      onToast('Análise excluída.');
      await loadAnalyses();
    } catch (err) {
      onToast(err.message || 'Falha ao excluir a análise.');
    }
  }

  const contourRows = plots.filter(hasContour).map((p) => ({
    id: p.id,
    name: p.name,
    origin: p.kmlFilename || 'Desenhado no mapa',
    isKml: Boolean(p.kmlFilename),
    plot: `${p.name} · ${p.farmName}`,
    area: p.areaHa,
    geometry: p.geometry,
  }));

  // Opções e linhas filtradas — Análises Químicas
  const aPlotOpts = optsAll('Todos os talhões', analysisRows.map((r) => r.plot));
  const aYearOpts = optsAll('Todos os anos', analysisRows.map((r) => r.year));
  const aDepthOpts = optsAll('Todas as profundidades', analysisRows.map((r) => r.depth));
  const filteredAnalyses = analysisRows.filter(
    (r) =>
      (!aPlot || r.plot === aPlot) &&
      (!aYear || String(r.year) === aYear) &&
      (!aDepth || (r.depth || '') === aDepth)
  );

  // Opções e linhas filtradas — Contornos Geográficos
  const cPlotOpts = optsAll('Todos os talhões', contourRows.map((r) => r.plot));
  const cOriginOpts = [
    { value: '', label: 'Todas as origens' },
    { value: 'kml', label: 'KML' },
    { value: 'draw', label: 'Desenho' },
  ];
  const filteredContours = contourRows.filter(
    (r) => (!cPlot || r.plot === cPlot) && (!cOrigin || (cOrigin === 'kml' ? r.isKml : !r.isKml))
  );

  function downloadKml(row) {
    if (!outerRings(row.geometry).length) {
      onToast('Este talhão não tem contorno disponível para exportar.');
      return;
    }
    const blob = new Blob([geojsonToKml(row.geometry, row.name || 'Talhão')], {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(row.name || 'talhao').replace(/\s+/g, '_')}.kml`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Contorno exportado em KML (abre no Google Earth).');
  }

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>DataDrive</p>
          <h1 className={styles.title}>Histórico de Importações</h1>
        </div>
        <Button variant="primary" onClick={onOpenImport}>+ Importar análises</Button>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon}>{Sheet}</span>
            <div>
              <h2 className={styles.cardTitle}>Análises Químicas</h2>
              <p className={styles.cardSub}>Análises importadas por talhão, ano e profundidade</p>
            </div>
            <Button variant="secondary" className={styles.headBtn} onClick={onOpenImport}>+ Importar análises</Button>
          </div>
          {!loadingAnalyses && analysisRows.length > 0 && (
            <div className={styles.filters}>
              <Select className={styles.filter} compact searchable options={aPlotOpts} value={aPlot} onChange={setAPlot} />
              <Select className={styles.filter} compact options={aYearOpts} value={aYear} onChange={setAYear} />
              <Select className={styles.filter} compact options={aDepthOpts} value={aDepth} onChange={setADepth} />
              {(aPlot || aYear || aDepth) && (
                <button type="button" className={styles.clearFilters} onClick={() => { setAPlot(''); setAYear(''); setADepth(''); }}>Limpar</button>
              )}
            </div>
          )}
          <div className={styles.tableWrap}>
            {loadingAnalyses ? (
              <p className={styles.empty}>Carregando…</p>
            ) : analysisRows.length === 0 ? (
              <EmptyState
                compact
                icon={Sheet}
                title="Nenhuma análise importada"
                description="Importe uma planilha para ver as análises por talhão, ano e profundidade."
                action={<Button variant="secondary" onClick={onOpenImport}>Importar análises</Button>}
              />
            ) : filteredAnalyses.length === 0 ? (
              <p className={styles.empty}>Nenhuma análise para esse filtro.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Talhão</th><th>Ano</th><th>Profundidade</th><th className={styles.right}>Ação</th></tr>
                </thead>
                <tbody>
                  {filteredAnalyses.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.file}>{r.plot}</td>
                      <td className={styles.muted}>{r.year}</td>
                      <td className={styles.muted}>{r.depth || '—'}</td>
                      <td className={styles.right}>
                        {confirmId === r.id ? (
                          <span className={styles.confirmRow}>
                            <button type="button" className={styles.confirmDanger} onClick={() => deleteAnalysis(r)}>Excluir</button>
                            <button type="button" className={styles.confirmCancel} onClick={() => setConfirmId(null)}>Não</button>
                          </span>
                        ) : (
                          <button type="button" className={cx(styles.action, styles.danger)} onClick={() => setConfirmId(r.id)} title="Excluir análise" aria-label="Excluir análise">
                            {Trash}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon}>{MapPin}</span>
            <div>
              <h2 className={styles.cardTitle}>Contornos Geográficos</h2>
              <p className={styles.cardSub}>Talhões com contorno definido</p>
            </div>
            <Button variant="secondary" className={styles.headBtn} onClick={onImportKml}>+ Importar KML</Button>
          </div>
          {contourRows.length > 0 && (
            <div className={styles.filters}>
              <Select className={styles.filter} compact searchable options={cPlotOpts} value={cPlot} onChange={setCPlot} />
              <Select className={styles.filter} compact options={cOriginOpts} value={cOrigin} onChange={setCOrigin} />
              {(cPlot || cOrigin) && (
                <button type="button" className={styles.clearFilters} onClick={() => { setCPlot(''); setCOrigin(''); }}>Limpar</button>
              )}
            </div>
          )}
          <div className={styles.tableWrap}>
            {contourRows.length === 0 ? (
              <EmptyState
                compact
                icon={MapPin}
                title="Nenhum contorno ainda"
                description="Suba um arquivo KML ou desenhe o contorno no Mapa de Gestão."
                action={<Button variant="secondary" onClick={onImportKml}>Importar KML</Button>}
              />
            ) : filteredContours.length === 0 ? (
              <p className={styles.empty}>Nenhum contorno para esse filtro.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Talhão</th><th>Origem</th><th>Área</th><th className={styles.right}>Ações</th></tr>
                </thead>
                <tbody>
                  {filteredContours.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.file}>{r.plot}</td>
                      <td>
                        <span className={cx(styles.tag, r.isKml ? styles.tagKml : styles.tagDraw)}>
                          {r.isKml ? 'KML' : 'Desenho'}
                        </span>
                      </td>
                      <td className={styles.muted}>{fmtArea(r.area)}</td>
                      <td className={styles.right}>
                        <div className={styles.rowActions}>
                          <button type="button" className={styles.viewBtn} onClick={() => onViewOnMap && onViewOnMap(r.id)} title="Ver no Mapa de Gestão">
                            {EyeMap} Ver no mapa
                          </button>
                          <button type="button" className={styles.action} onClick={() => downloadKml(r)} title="Baixar KML (Google Earth)" aria-label="Baixar KML">
                            {Globe}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
