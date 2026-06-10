export const farms = [
  { value: 'primavera', label: 'Fazenda Primavera' },
  { value: 'horizonte', label: 'Fazenda Horizonte' },
];

export const plotsByFarm = {
  primavera: [
    { value: 'sede', label: 'Talhão Sede' },
    { value: 'norte', label: 'Talhão Norte' },
  ],
  horizonte: [
    { value: 'leste', label: 'Talhão Leste' },
    { value: 'oeste', label: 'Talhão Oeste' },
  ],
};

export const YEARS = [2023, 2024, 2025, 2026];

// Nutrientes do gráfico de barras (histórico). value = chave nos dados.
export const BAR_NUTRIENTS = [
  { value: 'Ca', label: 'Cálcio', unit: 'cmolc/dm³' },
  { value: 'Mg', label: 'Magnésio', unit: 'cmolc/dm³' },
  { value: 'K', label: 'Potássio', unit: 'cmolc/dm³' },
  { value: 'P', label: 'Fósforo', unit: 'mg/dm³' },
  { value: 'S', label: 'Enxofre', unit: 'mg/dm³' },
  { value: 'mo', label: 'Matéria Orgânica', unit: 'g/dm³' },
  { value: 'v', label: 'Saturação (V%)', unit: '%' },
];

// Nutrientes do radar + valor de referência (ideal) para normalizar em %.
export const RADAR_NUTRIENTS = [
  { key: 'P', label: 'P', ideal: 18 },
  { key: 'Zn', label: 'Zn', ideal: 2.2 },
  { key: 'Mn', label: 'Mn', ideal: 22 },
  { key: 'Fe', label: 'Fe', ideal: 50 },
  { key: 'Cu', label: 'Cu', ideal: 1.8 },
  { key: 'B', label: 'B', ideal: 0.6 },
  { key: 'Mg', label: 'Mg', ideal: 2 },
  { key: 'Ca', label: 'Ca', ideal: 6 },
  { key: 'S', label: 'S', ideal: 12 },
  { key: 'K', label: 'K', ideal: 0.45 },
];

// Dados de análise de solo por talhão e ano (mockados, plausíveis).
export const soilData = {
  sede: {
    2023: { Ca: 3.0, Mg: 0.9, K: 0.22, P: 8, S: 5, mo: 28, v: 48, Zn: 1.0, Mn: 12, Fe: 32, Cu: 0.9, B: 0.3 },
    2024: { Ca: 3.4, Mg: 1.1, K: 0.26, P: 11, S: 6, mo: 31, v: 54, Zn: 1.3, Mn: 14, Fe: 35, Cu: 1.1, B: 0.35 },
    2025: { Ca: 4.0, Mg: 1.3, K: 0.30, P: 13, S: 7, mo: 34, v: 60, Zn: 1.6, Mn: 16, Fe: 38, Cu: 1.3, B: 0.42 },
    2026: { Ca: 4.6, Mg: 1.6, K: 0.35, P: 16, S: 9, mo: 38, v: 66, Zn: 1.9, Mn: 18, Fe: 42, Cu: 1.5, B: 0.5 },
  },
  norte: {
    2023: { Ca: 2.4, Mg: 0.7, K: 0.18, P: 6, S: 4, mo: 24, v: 42, Zn: 0.8, Mn: 10, Fe: 28, Cu: 0.7, B: 0.25 },
    2024: { Ca: 2.8, Mg: 0.9, K: 0.21, P: 9, S: 5, mo: 27, v: 47, Zn: 1.0, Mn: 12, Fe: 31, Cu: 0.9, B: 0.3 },
    2025: { Ca: 3.1, Mg: 1.0, K: 0.24, P: 10, S: 6, mo: 29, v: 51, Zn: 1.2, Mn: 13, Fe: 33, Cu: 1.0, B: 0.34 },
    2026: { Ca: 3.6, Mg: 1.2, K: 0.28, P: 12, S: 7, mo: 32, v: 57, Zn: 1.4, Mn: 15, Fe: 36, Cu: 1.2, B: 0.4 },
  },
  leste: {
    2023: { Ca: 3.8, Mg: 1.2, K: 0.30, P: 12, S: 7, mo: 33, v: 58, Zn: 1.5, Mn: 15, Fe: 36, Cu: 1.2, B: 0.4 },
    2024: { Ca: 4.1, Mg: 1.3, K: 0.33, P: 14, S: 8, mo: 35, v: 62, Zn: 1.7, Mn: 17, Fe: 39, Cu: 1.4, B: 0.45 },
    2025: { Ca: 4.4, Mg: 1.5, K: 0.36, P: 15, S: 9, mo: 37, v: 66, Zn: 1.9, Mn: 18, Fe: 41, Cu: 1.5, B: 0.5 },
    2026: { Ca: 4.9, Mg: 1.7, K: 0.40, P: 17, S: 10, mo: 40, v: 70, Zn: 2.1, Mn: 20, Fe: 44, Cu: 1.7, B: 0.55 },
  },
  oeste: {
    2023: { Ca: 2.0, Mg: 0.6, K: 0.15, P: 5, S: 3, mo: 22, v: 38, Zn: 0.6, Mn: 8, Fe: 25, Cu: 0.6, B: 0.2 },
    2024: { Ca: 2.3, Mg: 0.7, K: 0.17, P: 7, S: 4, mo: 24, v: 43, Zn: 0.8, Mn: 10, Fe: 28, Cu: 0.7, B: 0.26 },
    2025: { Ca: 2.7, Mg: 0.9, K: 0.20, P: 8, S: 5, mo: 26, v: 48, Zn: 0.9, Mn: 11, Fe: 30, Cu: 0.85, B: 0.3 },
    2026: { Ca: 3.0, Mg: 1.0, K: 0.23, P: 10, S: 6, mo: 29, v: 53, Zn: 1.1, Mn: 13, Fe: 33, Cu: 1.0, B: 0.36 },
  },
};

// Série histórica (ano -> valor) de um nutriente para o gráfico de barras.
export function getEvolutionSeries(plot, nutrientKey) {
  const plotData = soilData[plot] || {};
  return YEARS.map((year) => ({
    year: String(year),
    valor: plotData[year] ? plotData[year][nutrientKey] : null,
  }));
}

// Resumo do ano para os KPIs (valor atual, variação vs ano anterior, V%, M.O.).
export function getYearSummary(plot, year, nutrientKey) {
  const data = soilData[plot] || {};
  const cur = data[year] ? data[year][nutrientKey] : null;
  const idx = YEARS.indexOf(year);
  const prevYear = idx > 0 ? YEARS[idx - 1] : null;
  const prev = prevYear && data[prevYear] ? data[prevYear][nutrientKey] : null;
  const deltaPct = cur != null && prev ? Math.round(((cur - prev) / prev) * 100) : null;
  return {
    cur,
    prevYear,
    deltaPct,
    v: data[year] ? data[year].v : null,
    mo: data[year] ? data[year].mo : null,
  };
}

// Teores de um ano para o radar, com nível (%) normalizado pelo ideal.
export function getRadarSeries(plot, year) {
  const record = (soilData[plot] || {})[year] || {};
  return RADAR_NUTRIENTS.map((n) => {
    const teor = record[n.key] ?? 0;
    return {
      nutriente: n.label,
      teor,
      nivel: Math.min(100, Math.round((teor / n.ideal) * 100)),
    };
  });
}
