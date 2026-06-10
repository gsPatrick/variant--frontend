'use client';

import { useState } from 'react';
import styles from './page.module.css';

import Button from '@/components/Button/Button';
import Badge from '@/components/Badge/Badge';
import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';
import GlassCard from '@/components/GlassCard/GlassCard';
import TreeNode from '@/components/TreeNode/TreeNode';
import TimelineDot from '@/components/TimelineDot/TimelineDot';
import Logo from '@/components/Logo/Logo';

const Icon = {
  search: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  barn: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9-6 9 6v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  ),
  seed: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V9" />
      <path d="M12 9c0-4 3-6 7-6 0 4-3 6-7 6z" />
      <path d="M12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
    </svg>
  ),
  droplet: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  ),
  spray: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <path d="M9 8V5h3V3" />
      <path d="M18 5h2M18 8h2M19 11h1" />
    </svg>
  ),
  harvest: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c4 0 6-3 6-8M20 20c-4 0-6-3-6-8" />
      <path d="M10 12c0-5 1-8 2-9 1 1 2 4 2 9" />
    </svg>
  ),
};

const swatches = [
  { name: 'Deep Dark', value: '#030303', fill: 'fillDeep' },
  { name: 'Elevação', value: '#0a0a0a', fill: 'fillElev' },
  { name: 'Vidro Escuro', value: 'rgba(10,10,10,.45)', fill: 'fillGlass' },
  { name: 'Verde Variant', value: '#22c55e', fill: 'fillGreen' },
  { name: 'Ouro', value: '#eab308', fill: 'fillGold' },
  { name: 'Laranja', value: '#f97316', fill: 'fillOrange' },
  { name: 'Texto Primário', value: '#f5f5f7', fill: 'fillText1' },
  { name: 'Texto Secundário', value: 'rgba(245,.62)', fill: 'fillText2' },
];

const fazendas = [
  { value: 'boa-vista', label: 'Fazenda Boa Vista' },
  { value: 'modelo', label: 'Fazenda Modelo' },
  { value: 'horizonte', label: 'Fazenda Horizonte' },
];

const safras = [
  { value: '2023-2024', label: 'Safra 2023/2024' },
  { value: '2022-2023', label: 'Safra 2022/2023' },
  { value: '2021-2022', label: 'Safra 2021/2022' },
];

const timeline = [
  { label: 'Plantio', date: '05 Nov', variant: 'plantio', icon: Icon.seed, active: true },
  { label: 'Adubação', date: '20 Nov', variant: 'adubacao', icon: Icon.droplet },
  { label: 'Defensivos', date: '12 Dez', variant: 'defensivo', icon: Icon.spray, pulse: true },
  { label: 'Colheita', date: '18 Mar', variant: 'colheita', icon: Icon.harvest },
];

function SectionHeader({ index, title, description }) {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.sectionIndex}>{index}</span>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDesc}>{description}</p>
      </div>
    </header>
  );
}

export default function DesignSystemPage() {
  const [search, setSearch] = useState('');
  const [treeSearch, setTreeSearch] = useState('');
  const [fazenda, setFazenda] = useState('boa-vista');
  const [safra, setSafra] = useState('2023-2024');
  const [sceneSearch, setSceneSearch] = useState('');

  return (
    <main className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />

      <header className={styles.hero}>
        <Logo size="lg" className={styles.heroLogo} />
        <span className={styles.eyebrow}>Variant · Design System</span>
        <h1 className={styles.heroTitle}>
          A base visual de uma plataforma
          <span className={styles.gradientText}> cinematográfica</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Glassmorphism em preto profundo, desfoques suaves e o gradiente Variant
          do verde ao laranja. Cada átomo abaixo é um componente reutilizável.
        </p>
        <div className={styles.heroBadges}>
          <Badge variant="soja" dot>Soja</Badge>
          <Badge variant="milho" dot>Milho</Badge>
          <Badge variant="ativo">Ativo</Badge>
          <Badge variant="default">Glassmorphism</Badge>
        </div>
      </header>

      {/* 01 — Tipografia, Cores e Gradientes */}
      <section className={styles.section}>
        <SectionHeader index="01" title="Tipografia, Cores & Gradientes" description="Tokens fundamentais — fundo, vidro, destaques e a assinatura Variant." />

        <div className={styles.grid2}>
          <GlassCard>
            <p className={styles.cardLabel}>Tipografia</p>
            <div className={styles.typeStack}>
              <p className={styles.typeDisplay}>Aa</p>
              <h3 className={styles.typeH3}>Título de seção marcante</h3>
              <p className={styles.typeBody}>
                Corpo de texto com alta legibilidade, equilíbrio e respiro visual
                para leituras longas em fundo escuro.
              </p>
              <p className={styles.typeCaption}>LEGENDA · METADADOS · 12PX</p>
            </div>
          </GlassCard>

          <GlassCard>
            <p className={styles.cardLabel}>Gradientes</p>
            <div className={styles.gradStack}>
              <div className={`${styles.gradBar} ${styles.fillGrad}`}>
                <span>Variant · 135°</span>
              </div>
              <div className={`${styles.gradBar} ${styles.fillGradSoft}`}>
                <span>Variant Soft · overlay</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className={styles.swatchGrid}>
          {swatches.map((s) => (
            <div key={s.name} className={styles.swatch}>
              <div className={`${styles.swatchFill} ${styles[s.fill]}`} />
              <div className={styles.swatchInfo}>
                <span className={styles.swatchName}>{s.name}</span>
                <span className={styles.swatchValue}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02 — Botões e Badges */}
      <section className={styles.section}>
        <SectionHeader index="02" title="Botões & Badges" description="Estados normal, hover, ativo, disabled e loading de cada variação." />

        <div className={styles.grid2}>
          <GlassCard>
            <p className={styles.cardLabel}>Botões</p>
            <div className={styles.btnRow}>
              <Button variant="primary">Cadastrar</Button>
              <Button variant="secondary">Cancelar</Button>
              <Button variant="ghost">Detalhes</Button>
              <Button variant="icon" aria-label="Buscar">{Icon.search}</Button>
            </div>
            <div className={styles.btnRow}>
              <Button variant="primary" loading>Salvando</Button>
              <Button variant="primary" disabled>Indisponível</Button>
              <Button variant="secondary" disabled>Bloqueado</Button>
            </div>
          </GlassCard>

          <GlassCard>
            <p className={styles.cardLabel}>Badges de status</p>
            <div className={styles.badgeRow}>
              <Badge variant="soja" dot>Soja</Badge>
              <Badge variant="milho" dot>Milho</Badge>
              <Badge variant="ativo">Ativo</Badge>
              <Badge variant="alerta" dot>Atenção</Badge>
              <Badge variant="inativo">Inativo</Badge>
              <Badge variant="default">Rascunho</Badge>
            </div>
            <p className={styles.helperText}>
              Pílulas translúcidas: fundo a 10% de opacidade e texto vibrante na
              mesma matiz.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 03 — Campos de Formulário */}
      <section className={styles.section}>
        <SectionHeader index="03" title="Campos de Formulário" description="Inputs e selects translúcidos com foco em brilho gradiente verde." />

        <GlassCard>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Busca</label>
              <Input
                icon={Icon.search}
                placeholder="Buscar talhão, fazenda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Variedade</label>
              <Input
                placeholder="Ex.: Ares 7200"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Fazenda</label>
              <Select options={fazendas} value={fazenda} onChange={setFazenda} placeholder="Selecione a fazenda" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Safra</label>
              <Select options={safras} value={safra} onChange={setSafra} placeholder="Selecione a safra" />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 04 — Estruturas de Vidro */}
      <section className={styles.section}>
        <SectionHeader index="04" title="Estruturas de Vidro" description="GlassCards flutuando sobre um cenário escuro — o desfoque real em ação." />

        <div className={styles.scene}>
          <div className={styles.sceneGrid} aria-hidden="true" />

          <GlassCard className={styles.floatWidgetA}>
            <div className={styles.widgetHead}>
              <span className={styles.widgetIcon}>{Icon.pin}</span>
              <div>
                <p className={styles.widgetTitle}>Talhão Norte 02</p>
                <p className={styles.widgetSub}>Fazenda Boa Vista · 80,25 ha</p>
              </div>
              <Badge variant="soja" dot>Soja</Badge>
            </div>
            <div className={styles.metricRow}>
              <div>
                <p className={styles.metricValue}>3,5</p>
                <p className={styles.metricLabel}>Cálcio</p>
              </div>
              <div>
                <p className={styles.metricValue}>45,8</p>
                <p className={styles.metricLabel}>M. Orgânica</p>
              </div>
              <div>
                <p className={styles.metricValue}>12</p>
                <p className={styles.metricLabel}>Fósforo</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className={styles.floatWidgetB}>
            <Input
              icon={Icon.search}
              placeholder="Buscar no mapa..."
              value={sceneSearch}
              onChange={(e) => setSceneSearch(e.target.value)}
            />
            <div className={styles.widgetActions}>
              <Button variant="primary">Ver no mapa</Button>
              <Button variant="secondary">Exportar</Button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 05 — Árvore Hierárquica */}
      <section className={styles.section}>
        <SectionHeader index="05" title="Árvore Hierárquica" description="Navegação Proprietário → Fazenda → Talhão, interativa e expansível." />

        <div className={styles.treeWrap}>
          <GlassCard className={styles.treePanel}>
            <Input icon={Icon.search} placeholder="Filtrar..." value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)} />
            <div className={styles.tree}>
              <TreeNode label="João Pereira" type="owner" icon={Icon.user} meta="2 fazendas" defaultExpanded>
                <TreeNode label="Fazenda Boa Vista" type="farm" icon={Icon.barn} meta="3 talhões" defaultExpanded>
                  <TreeNode label="Talhão Norte 01" type="plot" icon={Icon.pin} badge={<Badge variant="soja">Soja</Badge>} active />
                  <TreeNode label="Talhão Norte 02" type="plot" icon={Icon.pin} badge={<Badge variant="milho">Milho</Badge>} />
                  <TreeNode label="Talhão Sul 01" type="plot" icon={Icon.pin} badge={<Badge variant="soja">Soja</Badge>} />
                </TreeNode>
                <TreeNode label="Fazenda Horizonte" type="farm" icon={Icon.barn} meta="1 talhão">
                  <TreeNode label="Talhão Central" type="plot" icon={Icon.pin} badge={<Badge variant="milho">Milho</Badge>} />
                </TreeNode>
              </TreeNode>
              <TreeNode label="Maria Souza" type="owner" icon={Icon.user} meta="1 fazenda">
                <TreeNode label="Fazenda Modelo" type="farm" icon={Icon.barn} meta="2 talhões">
                  <TreeNode label="Talhão Leste" type="plot" icon={Icon.pin} badge={<Badge variant="soja">Soja</Badge>} />
                  <TreeNode label="Talhão Oeste" type="plot" icon={Icon.pin} badge={<Badge variant="inativo">Inativo</Badge>} />
                </TreeNode>
              </TreeNode>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 06 — Timeline */}
      <section className={styles.section}>
        <SectionHeader index="06" title="Linha do Tempo" description="Trilha horizontal de eventos da safra com pontos indicadores." />

        <GlassCard>
          <div className={styles.timeline}>
            <div className={styles.timelineTrack} aria-hidden="true">
              <div className={styles.timelineProgress} />
            </div>
            <ul className={styles.timelineItems}>
              {timeline.map((ev) => (
                <li key={ev.label} className={styles.timelineItem}>
                  <TimelineDot icon={ev.icon} variant={ev.variant} active={ev.active} pulse={ev.pulse} />
                  <span className={styles.timelineLabel}>{ev.label}</span>
                  <span className={styles.timelineDate}>{ev.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </section>

      <footer className={styles.footer}>
        <span className={styles.gradientText}>Variant</span> Design System · construído com Next.js & CSS Modules
      </footer>
    </main>
  );
}
