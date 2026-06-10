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
