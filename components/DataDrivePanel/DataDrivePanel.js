'use client';

import styles from './DataDrivePanel.module.css';
import Button from '../Button/Button';
import EmptyState from '../EmptyState/EmptyState';

const cx = (...c) => c.filter(Boolean).join(' ');

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
  const contourRows = plots.filter(hasContour).map((p) => ({
    id: p.id,
    name: p.name,
    origin: p.kmlFilename || 'Desenhado no mapa',
    isKml: Boolean(p.kmlFilename),
    plot: `${p.name} · ${p.farmName}`,
    area: p.areaHa,
    geometry: p.geometry,
  }));

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
              <p className={styles.cardSub}>Planilhas XLSX / CSV processadas</p>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <EmptyState
              compact
              icon={Sheet}
              title="Importe a primeira planilha"
              description="As análises de solo importadas vão aparecer aqui por talhão e ano."
              action={<Button variant="secondary" onClick={onOpenImport}>Importar análises</Button>}
            />
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
          <div className={styles.tableWrap}>
            {contourRows.length === 0 ? (
              <EmptyState
                compact
                icon={MapPin}
                title="Nenhum contorno ainda"
                description="Suba um arquivo KML ou desenhe o contorno no Mapa de Gestão."
                action={<Button variant="secondary" onClick={onImportKml}>Importar KML</Button>}
              />
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Talhão</th><th>Origem</th><th>Área</th><th className={styles.right}>Ações</th></tr>
                </thead>
                <tbody>
                  {contourRows.map((r) => (
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
