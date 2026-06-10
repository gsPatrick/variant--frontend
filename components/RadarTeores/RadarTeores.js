'use client';

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import styles from './RadarTeores.module.css';

function ChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tip}>
      <span className={styles.tipName}>{d.nutriente}</span>
      <span className={styles.tipValue}>
        {d.teor} <em className={styles.tipLevel}>· {d.nivel}%</em>
      </span>
    </div>
  );
}

export default function RadarTeores({ data }) {
  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="nutriente" tick={{ fill: 'rgba(245,245,247,0.7)', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="nivel"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#radarGrad)"
            fillOpacity={0.45}
            animationDuration={550}
          />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
