// Anos de safra disponíveis (alternância na sidebar).
export const safraYears = [
  { value: '2024', label: 'Safra 2024' },
  { value: '2025', label: 'Safra 2025' },
];

// Contorno (GeoJSON) e centro de cada talhão. Coordenadas mockadas (MT).
function polygon(coords) {
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

const plotPolygons = {
  sede: polygon([
    [-55.912, -13.002],
    [-55.898, -13.0],
    [-55.892, -13.008],
    [-55.9, -13.016],
    [-55.914, -13.014],
    [-55.912, -13.002],
  ]),
  norte: polygon([
    [-55.928, -12.976],
    [-55.914, -12.974],
    [-55.91, -12.984],
    [-55.92, -12.99],
    [-55.93, -12.985],
    [-55.928, -12.976],
  ]),
  leste: polygon([
    [-55.856, -13.05],
    [-55.842, -13.046],
    [-55.836, -13.056],
    [-55.844, -13.066],
    [-55.858, -13.062],
    [-55.856, -13.05],
  ]),
  oeste: polygon([
    [-55.962, -13.018],
    [-55.948, -13.014],
    [-55.94, -13.024],
    [-55.95, -13.034],
    [-55.964, -13.03],
    [-55.962, -13.018],
  ]),
};

// Centro [lat, lng] (Leaflet usa lat,lng).
const plotCenters = {
  sede: [-13.008, -55.904],
  norte: [-12.982, -55.92],
  leste: [-13.056, -55.848],
  oeste: [-13.024, -55.953],
};

// Configuração de cultura/variedade por talhão e ano.
const setups = {
  sede: {
    2024: { crop: 'soja', variety: 'Ares 7200' },
    2025: { crop: 'milho', variety: 'BRS 511' },
  },
  norte: {
    2024: { crop: 'milho', variety: 'AG 8088' },
    2025: { crop: 'soja', variety: 'Fielder RR' },
  },
  leste: {
    2024: { crop: 'soja', variety: 'Ares 7200' },
    2025: { crop: 'soja', variety: 'Soytech 95' },
  },
  oeste: {
    2024: { crop: 'milho', variety: 'BRS 511' },
    2025: { crop: 'milho', variety: 'AG 9045' },
  },
};

const CROP_LABEL = { soja: 'Soja', milho: 'Milho' };

function photo(event, crop, year, n) {
  return `https://picsum.photos/seed/${event}-${crop}-${year}-${n}/900/560`;
}

function gallery(event, crop, year, count) {
  return Array.from({ length: count }, (_, i) => photo(event, crop, year, i + 1));
}

// Roteiro da safra (>8 eventos) para validar scroll/carrossel da timeline.
// `next: true` => data no ano da colheita (jan–mar do ano seguinte).
const EVENT_SPECS = [
  {
    id: 'preparo', type: 'preparo', date: '28/09', title: 'Preparo de solo', photos: 3,
    desc: 'Preparo e nivelamento do solo com correção de pH a lanço. Cobertura vegetal dessecada e palhada distribuída uniformemente para proteção do solo.',
  },
  {
    id: 'plantio', type: 'plantio', date: '12/10', title: 'Plantio', photos: 4,
    desc: 'Plantio de {label} com espaçamento de 0,50 m e população ajustada à fertilidade do talhão. Umidade do solo ideal na semeadura, garantindo germinação uniforme. Profundidade de deposição mantida entre 3 e 4 cm e regulagem conferida em campo.',
  },
  {
    id: 'emergencia', type: 'monitoramento', date: '20/10', title: 'Emergência', photos: 3,
    desc: 'Avaliação de estande e emergência das plântulas. Distribuição uniforme confirmada, sem necessidade de replantio em nenhuma das linhas avaliadas.',
  },
  {
    id: 'adubacao', type: 'adubacao', date: '05/11', title: 'Adubação de cobertura', photos: 5,
    desc: 'Cobertura nitrogenada e potássica conforme análise de solo, com taxas ajustadas por zona de manejo. Operação realizada sem vento e com previsão de chuva leve nas 48 horas seguintes, otimizando o aproveitamento.',
  },
  {
    id: 'herbicida', type: 'aplicacao', date: '22/11', title: 'Herbicida pós', photos: 3,
    desc: 'Aplicação de herbicida pós-emergente para controle de plantas daninhas em estádio inicial. Pontas antideriva e volume de calda ajustados à cobertura foliar.',
  },
  {
    id: 'fungicida1', type: 'aplicacao', date: '08/12', title: 'Fungicida (1ª)', photos: 4,
    desc: 'Primeira aplicação de fungicida preventivo contra doenças foliares. Janela climática favorável, com temperatura e umidade relativa registradas durante toda a operação.',
  },
  {
    id: 'inseticida', type: 'aplicacao', date: '20/12', title: 'Inseticida', photos: 4,
    desc: 'Monitoramento de pragas indicou nível próximo ao limiar de controle. Aplicação de inseticida à tarde para reduzir deriva, com boa cobertura do dossel.',
  },
  {
    id: 'fungicida2', type: 'aplicacao', date: '10/01', title: 'Fungicida (2ª)', photos: 3, next: true,
    desc: 'Segunda aplicação de fungicida no enchimento de grãos, mantendo a sanidade foliar. Reaplicação programada conforme o intervalo de proteção do produto.',
  },
  {
    id: 'monitoramento', type: 'monitoramento', date: '02/02', title: 'Monitoramento', photos: 3, next: true,
    desc: 'Vistoria de acompanhamento da lavoura, avaliação de enchimento de grãos e estimativa de produtividade. Nenhuma intervenção adicional necessária no período.',
  },
  {
    id: 'dessecacao', type: 'aplicacao', date: '20/02', title: 'Dessecação', photos: 3, next: true,
    desc: 'Dessecação de pré-colheita para uniformizar a maturação e antecipar a entrada da colhedora, reduzindo perdas e umidade dos grãos.',
  },
  {
    id: 'colheita', type: 'colheita', date: '15/03', title: 'Colheita', photos: 6, next: true,
    desc: 'Colheita de {label} com umidade de grãos no ponto ideal e baixa perda na plataforma. Produtividade acima da média histórica do talhão. Escoamento direto para os silos da fazenda, com amostragem para classificação.',
  },
];

function buildEvents(crop, year) {
  const label = CROP_LABEL[crop];
  const harvestYear = Number(year) + 1;
  return EVENT_SPECS.map((s) => ({
    id: s.id,
    type: s.type,
    date: s.date,
    dateFull: `${s.date}/${s.next ? harvestYear : year}`,
    title: s.title,
    description: s.desc.replaceAll('{label}', label),
    photos: gallery(s.id, crop, year, s.photos),
  }));
}

// Retorna a safra completa de um talhão/ano (mapa + marcador + eventos).
export function getSafra(plot, year) {
  const setup = (setups[plot] || setups.sede)[year] || setups.sede[2025];
  const color = setup.crop === 'soja' ? '#22c55e' : '#f97316';
  return {
    crop: setup.crop,
    cropLabel: CROP_LABEL[setup.crop],
    variety: setup.variety,
    color,
    geojson: plotPolygons[plot] || plotPolygons.sede,
    center: plotCenters[plot] || plotCenters.sede,
    events: buildEvents(setup.crop, year),
  };
}
