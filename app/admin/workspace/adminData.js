// Hierarquia Proprietário -> Fazenda -> Talhão. Polígonos em [lat, lng] (Leaflet).
export const owners = [
  {
    id: 'joao',
    name: 'João Pereira',
    farms: [
      {
        id: 'primavera',
        name: 'Fazenda Primavera',
        plots: [
          {
            id: 'sede',
            name: 'Talhão Sede',
            center: [-13.008, -55.904],
            polygon: [
              [-13.002, -55.912],
              [-13.0, -55.898],
              [-13.008, -55.892],
              [-13.016, -55.9],
              [-13.014, -55.914],
            ],
          },
          {
            id: 'norte',
            name: 'Talhão Norte',
            center: [-12.982, -55.92],
            polygon: [
              [-12.976, -55.928],
              [-12.974, -55.914],
              [-12.984, -55.91],
              [-12.99, -55.92],
              [-12.985, -55.93],
            ],
          },
        ],
      },
      {
        id: 'horizonte',
        name: 'Fazenda Horizonte',
        plots: [
          {
            id: 'leste',
            name: 'Talhão Leste',
            center: [-13.056, -55.848],
            polygon: [
              [-13.05, -55.856],
              [-13.046, -55.842],
              [-13.056, -55.836],
              [-13.066, -55.844],
              [-13.062, -55.858],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'maria',
    name: 'Maria Souza',
    farms: [
      {
        id: 'modelo',
        name: 'Fazenda Modelo',
        plots: [
          {
            id: 'oeste',
            name: 'Talhão Oeste',
            center: [-13.024, -55.953],
            polygon: [
              [-13.018, -55.962],
              [-13.014, -55.948],
              [-13.024, -55.94],
              [-13.034, -55.95],
              [-13.03, -55.964],
            ],
          },
        ],
      },
    ],
  },
];

// Tabela de resistência do solo (compactação) por profundidade.
export const resistanceRows = [
  { depth: '10 cm', mpa: 0.8 },
  { depth: '20 cm', mpa: 1.4 },
  { depth: '30 cm', mpa: 2.6 },
  { depth: '40 cm', mpa: 3.2 },
  { depth: '50 cm', mpa: 2.3 },
  { depth: '60 cm', mpa: 1.6 },
];

export const firstPlot = owners[0].farms[0].plots[0];

// Opções derivadas (selects).
export const plotOptions = owners.flatMap((o) =>
  o.farms.flatMap((f) => f.plots.map((p) => ({ value: p.id, label: `${p.name} · ${f.name}` })))
);
export const cropOptions = [
  { value: 'soja', label: 'Soja' },
  { value: 'milho', label: 'Milho' },
];
export const yearOptions = [
  { value: '2023/2024', label: '2023/2024' },
  { value: '2024/2025', label: '2024/2025' },
  { value: '2025/2026', label: '2025/2026' },
];

// Produtores (gestão de usuários).
export const producers = [
  { id: 'p1', name: 'João Pereira', email: 'joao@variant.agr.br', doc: '123.456.789-00', farms: 2, active: true },
  { id: 'p2', name: 'Maria Souza', email: 'maria@variant.agr.br', doc: '987.654.321-00', farms: 1, active: true },
  { id: 'p3', name: 'Carlos Lima', email: 'carlos.lima@agro.com', doc: '12.345.678/0001-90', farms: 3, active: false },
  { id: 'p4', name: 'Ana Beatriz', email: 'ana.b@fazendas.com', doc: '321.654.987-11', farms: 1, active: true },
  { id: 'p5', name: 'Roberto Nunes', email: 'rnunes@campo.com', doc: '45.678.901/0001-22', farms: 2, active: true },
];

// DataDrive — importações de planilhas (análises) e KML (contornos).
export const importsXlsx = [
  { id: 'i1', file: 'analises_2025_sede.xlsx', plot: 'Talhão Sede', date: '12/03/2025', rows: 48 },
  { id: 'i2', file: 'solo_norte_q1.csv', plot: 'Talhão Norte', date: '02/03/2025', rows: 36 },
  { id: 'i3', file: 'fertilidade_leste.xlsx', plot: 'Talhão Leste', date: '18/02/2025', rows: 52 },
  { id: 'i4', file: 'analises_oeste_2024.xlsx', plot: 'Talhão Oeste', date: '20/11/2024', rows: 41 },
];
export const importsKml = [
  { id: 'k1', file: 'contorno_sede.kml', plot: 'Talhão Sede', date: '02/02/2025' },
  { id: 'k2', file: 'talhao_norte.kml', plot: 'Talhão Norte', date: '28/01/2025' },
  { id: 'k3', file: 'leste_perimetro.kml', plot: 'Talhão Leste', date: '15/01/2025' },
];

// Safras cadastradas (com eventos).
function evPhoto(seed, n) {
  return `https://picsum.photos/seed/${seed}-${n}/600/400`;
}
export const seasons = [
  {
    id: 's1',
    plot: 'Talhão Sede',
    year: '2024/2025',
    crop: 'soja',
    variety: 'Ares 7200',
    events: [
      { id: 'e1', date: '2024-10-12', title: 'Plantio', description: 'Plantio de soja com espaçamento de 0,50 m.', photos: [evPhoto('s1-plantio', 1), evPhoto('s1-plantio', 2)] },
      { id: 'e2', date: '2024-11-05', title: 'Adubação de cobertura', description: 'Cobertura nitrogenada conforme análise.', photos: [evPhoto('s1-adub', 1)] },
      { id: 'e3', date: '2025-03-15', title: 'Colheita', description: 'Colheita com umidade no ponto ideal.', photos: [evPhoto('s1-colh', 1), evPhoto('s1-colh', 2)] },
    ],
  },
  {
    id: 's2',
    plot: 'Talhão Norte',
    year: '2024/2025',
    crop: 'milho',
    variety: 'BRS 511',
    events: [
      { id: 'e4', date: '2024-10-20', title: 'Plantio', description: 'Plantio de milho safrinha.', photos: [evPhoto('s2-plantio', 1)] },
      { id: 'e5', date: '2024-12-20', title: 'Aplicação de defensivos', description: 'Inseticida em estádio vegetativo.', photos: [evPhoto('s2-aplic', 1), evPhoto('s2-aplic', 2)] },
    ],
  },
  {
    id: 's3',
    plot: 'Talhão Leste',
    year: '2025/2026',
    crop: 'soja',
    variety: 'Soytech 95',
    events: [
      { id: 'e6', date: '2025-10-10', title: 'Plantio', description: 'Início da safra 2025/2026.', photos: [evPhoto('s3-plantio', 1)] },
    ],
  },
];
