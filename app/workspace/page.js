'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

import Sidebar from '@/components/Sidebar/Sidebar';
import GlassCard from '@/components/GlassCard/GlassCard';
import Select from '@/components/Select/Select';
import Badge from '@/components/Badge/Badge';
import EvolutionChart from '@/components/EvolutionChart/EvolutionChart';
import RadarTeores from '@/components/RadarTeores/RadarTeores';
import Timeline from '@/components/Timeline/Timeline';
import EventModal from '@/components/EventModal/EventModal';
import FloatingControls from '@/components/FloatingControls/FloatingControls';
import EmptyState from '@/components/EmptyState/EmptyState';
import SoilResistanceTable from '@/components/SoilResistanceTable/SoilResistanceTable';

import { farmsApi, plotsApi, seasonsApi, settingsApi, mediaUrl } from '@/lib/api';

const SafrasMap = dynamic(() => import('@/components/SafrasMap/SafrasMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Carregando mapa…</div>,
});

const cx = (...c) => c.filter(Boolean).join(' ');

const BAR_NUTRIENTS = [
  { value: 'calcio', label: 'Cálcio', unit: 'cmolc/dm³' },
  { value: 'magnesio', label: 'Magnésio', unit: 'cmolc/dm³' },
  { value: 'potassio', label: 'Potássio', unit: 'mg/dm³' },
  { value: 'fosforo', label: 'Fósforo', unit: 'mg/dm³' },
  { value: 'enxofre', label: 'Enxofre', unit: 'mg/dm³' },
  { value: 'materia_organica', label: 'Matéria Orgânica', unit: 'g/dm³' },
  { value: 'saturacao', label: 'Saturação (V%)', unit: '%' },
];
const RADAR_IDEAL = { P: 18, Zn: 2.2, Mn: 22, Fe: 50, Cu: 1.8, B: 0.6, Mg: 2, Ca: 6, S: 12, K: 120, V: 70, pH: 5.5 };

const num = (v) => (v == null || v === '' ? null : Number(v));
const normSeries = (s) => (s || []).map((p) => ({ year: Number(p.year), valor: num(p.valor) }));

function adaptEvent(e) {
  const [y, m, d] = String(e.eventDate || '').split('-');
  return {
    id: e.id,
    type: e.eventType,
    date: d && m ? `${d}/${m}` : e.eventDate,
    dateFull: d ? `${d}/${m}/${y}` : e.eventDate,
    title: e.title,
    description: e.description,
    photos: (e.photos || []).map((p) => mediaUrl(p.url)),
  };
}

export default function WorkspacePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [module, setModule] = useState('solos');

  const [farms, setFarms] = useState([]);
  const [plotsByFarm, setPlotsByFarm] = useState({});
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState('');
  const [plot, setPlot] = useState('');

  // SOLOS
  const [nutrient, setNutrient] = useState('calcio');
  const [year, setYear] = useState(null);
  const [depth, setDepth] = useState(null);
  const [depths, setDepths] = useState([]);
  const [evolution, setEvolution] = useState(null);
  const [satSeries, setSatSeries] = useState([]);
  const [phSeries, setPhSeries] = useState([]);
  const [radar, setRadar] = useState(null);
  const [radarIdeals, setRadarIdeals] = useState(RADAR_IDEAL);
  const [resistance, setResistance] = useState([]);

  // SAFRAS
  const [mapData, setMapData] = useState(null);
  const [safraEvents, setSafraEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const isSafras = module === 'safras';

  // ----- Carrega fazendas + talhões do produtor -----
  useEffect(() => {
    (async () => {
      try {
        const [fs, ps] = await Promise.all([farmsApi.list(), plotsApi.list()]);
        const byFarm = {};
        (ps || []).forEach((p) => {
          (byFarm[p.farmId] = byFarm[p.farmId] || []).push(p);
        });
        setFarms(fs || []);
        setPlotsByFarm(byFarm);
        const firstFarm = (fs || [])[0];
        if (firstFarm) {
          setFarm(firstFarm.id);
          const firstPlot = (byFarm[firstFarm.id] || [])[0];
          if (firstPlot) setPlot(firstPlot.id);
        }
      } catch {
        setFarms([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const farmOptions = farms.map((f) => ({ value: f.id, label: f.name }));
  const plots = plotsByFarm[farm] || [];
  const plotOptions = plots.map((p) => ({ value: p.id, label: p.name }));

  function handleFarmChange(value) {
    setFarm(value);
    const first = (plotsByFarm[value] || [])[0];
    setPlot(first ? first.id : '');
  }

  // ----- SOLOS: profundidades disponíveis (20 cm / 40 cm) -----
  useEffect(() => {
    if (!plot) {
      setDepths([]);
      setDepth(null);
      return undefined;
    }
    let cancel = false;
    (async () => {
      try {
        const data = await plotsApi.depths(plot);
        const list = data.depths || [];
        if (!cancel) {
          setDepths(list);
          setDepth(list.length ? list[0] : null);
        }
      } catch {
        if (!cancel) {
          setDepths([]);
          setDepth(null);
        }
      }
    })();
    return () => { cancel = true; };
  }, [plot]);

  // ----- SOLOS: evolução (barras + KPIs) -----
  useEffect(() => {
    if (!plot) {
      setEvolution(null);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const data = await plotsApi.evolution(plot, nutrient, depth);
        if (!cancel) {
          const series = normSeries(data.series);
          setEvolution({ ...data, series });
          const years = series.filter((s) => s.valor != null).map((s) => s.year);
          if (years.length && (year == null || !years.includes(year))) setYear(years[years.length - 1]);
        }
      } catch {
        if (!cancel) setEvolution(null);
      }
    })();
    return () => { cancel = true; };
  }, [plot, nutrient, depth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!plot) return undefined;
    let cancel = false;
    (async () => {
      try {
        const [sat, ph] = await Promise.all([
          plotsApi.evolution(plot, 'saturacao', depth),
          plotsApi.evolution(plot, 'ph_cacl2', depth),
        ]);
        if (!cancel) {
          setSatSeries(normSeries(sat.series));
          setPhSeries(normSeries(ph.series));
        }
      } catch {
        if (!cancel) {
          setSatSeries([]);
          setPhSeries([]);
        }
      }
    })();
    return () => { cancel = true; };
  }, [plot, depth]);

  // ----- SOLOS: radar (teores do ano) -----
  useEffect(() => {
    if (!plot || year == null) {
      setRadar(null);
      return undefined;
    }
    let cancel = false;
    (async () => {
      try {
        const data = await plotsApi.radar(plot, year, depth);
        // Guarda só o teor bruto; o nível (%) é calculado no render com os
        // ideais configurados pelo agrônomo (settingsApi).
        if (!cancel) setRadar((data.teores || []).map((t) => ({ nutriente: t.nutriente, teor: num(t.valor) })));
      } catch {
        if (!cancel) setRadar(null);
      }
    })();
    return () => { cancel = true; };
  }, [plot, year, depth]);

  // ----- Ideais do radar (referência agronômica configurada pelo admin) -----
  useEffect(() => {
    (async () => {
      try {
        const data = await settingsApi.getRadarIdeals();
        if (data?.ideals) setRadarIdeals(data.ideals);
      } catch {
        /* mantém os padrões */
      }
    })();
  }, []);

  // ----- SOLOS: resistência do solo (compactação) -----
  useEffect(() => {
    if (!plot) {
      setResistance([]);
      return undefined;
    }
    let cancel = false;
    (async () => {
      try {
        const data = await plotsApi.resistance(plot);
        if (!cancel) setResistance((data.readings || []).map((r) => ({ depthCm: r.depthCm, mpa: Number(r.mpa) })));
      } catch {
        if (!cancel) setResistance([]);
      }
    })();
    return () => { cancel = true; };
  }, [plot]);

  // ----- SAFRAS: mapa + timeline -----
  useEffect(() => {
    setSelectedEventId(null);
    if (!isSafras || !plot) {
      setMapData(null);
      setSafraEvents([]);
      return undefined;
    }
    let cancel = false;
    (async () => {
      try {
        const md = await plotsApi.map(plot);
        if (!cancel) setMapData(md);
      } catch {
        if (!cancel) setMapData(null);
      }
      try {
        const seasons = await seasonsApi.list(plot);
        if (seasons && seasons.length) {
          const events = await seasonsApi.events(seasons[0].id);
          if (!cancel) setSafraEvents((events || []).map(adaptEvent));
        } else if (!cancel) {
          setSafraEvents([]);
        }
      } catch {
        if (!cancel) setSafraEvents([]);
      }
    })();
    return () => { cancel = true; };
  }, [isSafras, plot]);

  // ----- Derivados -----
  const nutrientMeta = BAR_NUTRIENTS.find((n) => n.value === nutrient) || BAR_NUTRIENTS[0];
  const barData = (evolution?.series || []).map((s) => ({ year: String(s.year), valor: s.valor }));
  const hasSoil = barData.some((b) => b.valor != null);
  const yearOptions = useMemo(
    () => Array.from(new Set((evolution?.series || []).filter((s) => s.valor != null).map((s) => s.year)))
      .map((y) => ({ value: String(y), label: String(y) })),
    [evolution]
  );
  const valueAt = (series, y) => series.find((s) => s.year === y)?.valor;
  const curVal = valueAt(evolution?.series || [], year);
  const series = evolution?.series || [];
  const yIdx = series.findIndex((s) => s.year === year);
  const prevVal = yIdx > 0 ? series[yIdx - 1]?.valor : null;
  const deltaPct = curVal != null && prevVal ? Math.round(((curVal - prevVal) / prevVal) * 100) : null;
  const fmt = (v) => (v == null ? '—' : v);

  const radarData = (radar || []).map((t) => ({
    nutriente: t.nutriente,
    teor: t.teor,
    nivel: t.teor == null ? 0 : Math.min(100, Math.round((t.teor / (radarIdeals[t.nutriente] || 1)) * 100)),
  }));

  const selectedEvent = safraEvents.find((e) => e.id === selectedEventId) || null;
  const safraCrop = mapData?.safraAtiva?.crop || '';
  const isSoja = safraCrop.toLowerCase().includes('soja');
  const safraColor = isSoja ? '#22c55e' : '#f97316';
  const cropLabel = safraCrop ? safraCrop.charAt(0).toUpperCase() + safraCrop.slice(1) : '';
  const hasGeometry = mapData?.talhao?.geometry?.features?.length > 0;
  const resistancePeak = resistance.length ? Math.max(...resistance.map((r) => r.mpa)) : null;
  const mapInfo = {
    name: mapData?.talhao?.name,
    areaHa: mapData?.talhao?.areaHa,
    cropLabel,
    variety: mapData?.safraAtiva?.variety,
    resistancePeak,
  };

  const noData = !loading && farms.length === 0;

  return (
    <main className={`${styles.workspace} ${collapsed ? styles.collapsed : ''} ${isSafras ? styles.safrasMode : ''} ${collapsed && isSafras ? styles.floating : ''}`}>
      <div className={styles.sidebarSlot}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((p) => !p)}
          module={module}
          onModuleChange={setModule}
          farms={farmOptions}
          farm={farm}
          onFarmChange={handleFarmChange}
          plots={plotOptions}
          plot={plot}
          onPlotChange={setPlot}
          safraYears={[]}
          safraYear=""
          onSafraYearChange={() => {}}
        />
      </div>

      {collapsed && isSafras && plotOptions.length > 0 && (
        <FloatingControls
          talhaoOptions={plotOptions}
          talhao={plot}
          onTalhaoChange={setPlot}
          showSafra={false}
        />
      )}

      <section className={styles.content}>
        {!isSafras && (
          <header className={styles.contentHead}>
            <div>
              <p className={styles.breadcrumb}>
                {farmOptions.find((f) => f.value === farm)?.label || '—'} <span className={styles.sep}>/</span>{' '}
                {plotOptions.find((p) => p.value === plot)?.label || '—'}
              </p>
              <h1 className={styles.pageTitle}>Análise de Solo</h1>
            </div>
            <Badge variant="ativo" dot>Módulo SOLOS</Badge>
          </header>
        )}

        {noData ? (
          <EmptyState
            title="Nenhuma fazenda vinculada"
            description="Quando o agrônomo cadastrar suas fazendas e talhões, seus dados aparecerão aqui."
          />
        ) : module === 'solos' ? (
          (!hasSoil && resistance.length === 0) ? (
            <EmptyState
              title="Sem análises de solo"
              description="Ainda não há análises de solo nem leituras de resistência para este talhão. Assim que o agrônomo cadastrar, tudo aparece aqui."
            />
          ) : (
            <div className={styles.solos}>
              {hasSoil && (
                <>
              <GlassCard className={styles.filterBar}>
                <div className={styles.filterIntro}>
                  <span className={styles.filterDot} aria-hidden="true" />
                  <div>
                    <p className={styles.filterTitle}>Filtros</p>
                    <p className={styles.filterHint}>Aplicados a todos os gráficos</p>
                  </div>
                </div>
                <div className={styles.filterControls}>
                  <div className={styles.filterField}>
                    <label className={styles.filterLabel}>Nutriente</label>
                    <Select options={BAR_NUTRIENTS} value={nutrient} onChange={setNutrient} />
                  </div>
                  <div className={styles.filterField}>
                    <label className={styles.filterLabel}>Ano de análise</label>
                    <Select options={yearOptions} value={String(year)} onChange={(v) => setYear(Number(v))} />
                  </div>
                  {depths.length > 0 && (
                    <div className={styles.filterField}>
                      <label className={styles.filterLabel}>Profundidade</label>
                      <Select
                        options={depths.map((d) => ({ value: d, label: d }))}
                        value={depth || ''}
                        onChange={setDepth}
                      />
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className={styles.kpis}>
                <GlassCard className={styles.kpi}>
                  <p className={styles.kpiLabel}>{nutrientMeta.label}</p>
                  <p className={styles.kpiValue}>{fmt(curVal)} <span className={styles.kpiUnit}>{nutrientMeta.unit}</span></p>
                  <p className={styles.kpiSub}>em {year}</p>
                </GlassCard>
                <GlassCard className={styles.kpi}>
                  <p className={styles.kpiLabel}>Variação</p>
                  <p className={`${styles.kpiValue} ${deltaPct == null ? '' : deltaPct >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                    {deltaPct == null ? '—' : `${deltaPct >= 0 ? '+' : ''}${deltaPct}%`}
                  </p>
                  <p className={styles.kpiSub}>vs ano anterior</p>
                </GlassCard>
                <GlassCard className={styles.kpi}>
                  <p className={styles.kpiLabel}>Saturação (V%)</p>
                  <p className={styles.kpiValue}>{fmt(valueAt(satSeries, year))} <span className={styles.kpiUnit}>%</span></p>
                  <p className={styles.kpiSub}>em {year}</p>
                </GlassCard>
                <GlassCard className={styles.kpi}>
                  <p className={styles.kpiLabel}>pH (CaCl₂)</p>
                  <p className={styles.kpiValue}>{fmt(valueAt(phSeries, year))}</p>
                  <p className={styles.kpiSub}>em {year}</p>
                </GlassCard>
              </div>

              <div className={styles.cards}>
                <GlassCard className={`${styles.card} ${styles.cardWide}`}>
                  <div className={styles.cardHead}>
                    <p className={styles.cardKicker}>Histórico de evolução</p>
                    <h2 className={styles.cardTitle}>{nutrientMeta.label}</h2>
                  </div>
                  <EvolutionChart data={barData} unit={nutrientMeta.unit} />
                  <p className={styles.cardFoot}>Variação anual · {nutrientMeta.unit}</p>
                </GlassCard>

                <GlassCard className={styles.card}>
                  <div className={styles.cardHead}>
                    <p className={styles.cardKicker}>Teores do ano · {year}</p>
                    <h2 className={styles.cardTitle}>Perfil de nutrientes</h2>
                  </div>
                  {radarData.length > 0 ? (
                    <RadarTeores data={radarData} />
                  ) : (
                    <EmptyState compact title="Sem dados para o ano" description="Selecione outro ano com análise." />
                  )}
                  <p className={styles.cardFoot}>Nível (%) em relação ao ideal agronômico</p>
                </GlassCard>
              </div>
                </>
              )}

              {!hasSoil && (
                <EmptyState
                  compact
                  title="Sem análises de solo"
                  description="Ainda não há análises importadas — abaixo, a resistência do solo deste talhão."
                />
              )}

              {resistance.length > 0 && (
                <GlassCard className={styles.resistCard}>
                  <SoilResistanceTable readings={resistance} embedded canEdit={false} />
                </GlassCard>
              )}
            </div>
          )
        ) : (
          <div className={styles.safras}>
            {hasGeometry ? (
              <SafrasMap
                geojson={mapData.talhao.geometry}
                center={[Number(mapData.talhao.centroid.lat), Number(mapData.talhao.centroid.lng)]}
                color={safraColor}
                marker={mapData.safraAtiva ? { cropLabel, variety: mapData.safraAtiva.variety } : null}
                info={mapInfo}
              />
            ) : (
              <div className={styles.safrasEmpty}>
                <EmptyState
                  title="Talhão sem contorno"
                  description="O contorno deste talhão ainda não foi desenhado pelo agrônomo."
                />
              </div>
            )}

            {safraEvents.length > 0 && (
              <div className={cx(styles.timelineSlot, !timelineOpen && styles.timelineClosed)}>
                <button type="button" className={styles.timelineHandle} onClick={() => setTimelineOpen((p) => !p)} aria-label={timelineOpen ? 'Ocultar linha do tempo' : 'Mostrar linha do tempo'}>
                  <span className={styles.handleGrip} aria-hidden="true" />
                  <svg className={styles.handleChevron} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={styles.timelinePanel}>
                  <Timeline events={safraEvents} selectedId={selectedEventId} onSelect={setSelectedEventId} />
                </div>
              </div>
            )}

            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />}
          </div>
        )}
      </section>
    </main>
  );
}
