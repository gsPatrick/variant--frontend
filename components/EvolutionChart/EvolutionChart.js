'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import styles from './EvolutionChart.module.css';

// Escala Y estável e justa: deriva o topo (e os ticks) do maior valor da série,
// com ~5% de folga, sempre arredondando para um número "redondo". Assim valores
// parecidos (ex.: 3,27 e 3,57) geram sempre a mesma escala (não pula de 4 p/ 8).
function niceScale(maxValue, tickTarget = 4) {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return { max: 4, ticks: [0, 1, 2, 3, 4] };
  }
  const rawStep = (maxValue * 1.1) / tickTarget;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const base = rawStep / pow;
  const niceStep = (base <= 1 ? 1 : base <= 2 ? 2 : base <= 2.5 ? 2.5 : base <= 5 ? 5 : 10) * pow;
  const max = Math.ceil((maxValue * 1.05) / niceStep) * niceStep;
  const ticks = [];
  for (let t = 0; t <= max + niceStep / 1000; t += niceStep) {
    ticks.push(Math.round(t * 1000) / 1000);
  }
  return { max, ticks };
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tip}>
      <span className={styles.tipYear}>{label}</span>
      <span className={styles.tipValue}>
        {payload[0].value}
        {unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

export default function EvolutionChart({ data, unit }) {
  const maxValue = (data || []).reduce(
    (m, d) => (Number.isFinite(Number(d?.valor)) ? Math.max(m, Number(d.valor)) : m),
    0
  );
  const { max: yMax, ticks: yTicks } = niceScale(maxValue);

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 6, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="52%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: 'rgba(245,245,247,0.6)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            domain={[0, yMax]}
            ticks={yTicks}
            allowDecimals
            tick={{ fill: 'rgba(245,245,247,0.4)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip unit={unit} />} />
          <Bar
            dataKey="valor"
            fill="url(#barGrad)"
            radius={[10, 10, 0, 0]}
            maxBarSize={58}
            animationDuration={550}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
