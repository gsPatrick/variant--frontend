import * as XLSX from 'xlsx';

// Aliases reconhecidos (espelham o importador do backend).
const FIELD_ALIASES = {
  Talhão: ['talhao', 'talhao_gleba', 'gleba'],
  Ano: ['ano', 'year', 'safra'],
  Profundidade: ['prof', 'profundidade', 'depth'],
  Data: ['data', 'data_analise', 'data_da_analise'],
  Laboratório: ['laboratorio', 'lab', 'lab_name'],
  'pH (água)': ['ph', 'ph_em_agua', 'ph_agua', 'ph_h2o'],
  'pH CaCl2': ['ph_cacl2', 'ph_cacl_2'],
  'M.O': ['materia_organica', 'mo', 'm_o'],
  'Saturação (V%)': ['saturacao', 'saturacao_por_bases', 'v'],
  CTC: ['ctc', 'cec', 'ctc_efetiva'],
  'Sat. Al (m%)': ['saturacao_aluminio', 'm'],
  Fósforo: ['fosforo', 'p'],
  Potássio: ['potassio', 'k'],
  Cálcio: ['calcio', 'ca'],
  Magnésio: ['magnesio', 'mg'],
  Enxofre: ['enxofre', 's'],
  Zinco: ['zinco', 'zn'],
  Manganês: ['manganes', 'mn'],
  Ferro: ['ferro', 'fe'],
  Cobre: ['cobre', 'cu'],
  Boro: ['boro', 'b'],
};

function normalize(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const ALIAS_INDEX = {};
Object.entries(FIELD_ALIASES).forEach(([label, aliases]) => {
  aliases.forEach((a) => {
    ALIAS_INDEX[a] = label;
  });
});

function colIndex(headers, aliases) {
  return headers.findIndex((h) => aliases.includes(h));
}

export async function parsePreview(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { ok: false, error: 'A planilha não tem nenhuma aba.' };

  const matrix = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
    blankrows: false,
    raw: true,
  });
  if (matrix.length < 2) return { ok: false, error: 'A planilha está vazia ou sem dados.' };

  const rawHeaders = (matrix[0] || []).filter((h) => h !== null && String(h).trim() !== '');
  const headers = (matrix[0] || []).map(normalize);

  const idx = {
    talhao: colIndex(headers, FIELD_ALIASES['Talhão']),
    year: colIndex(headers, FIELD_ALIASES.Ano),
  };

  if (idx.year < 0) {
    return { ok: false, error: 'Não encontramos a coluna "Ano". Verifique o cabeçalho da planilha.' };
  }

  // Linha de unidades (2ª linha sem ano e com texto de unidade).
  let start = 1;
  const second = matrix[1] || [];
  const secondYear = Number.parseInt(second[idx.year], 10);
  const looksUnits =
    !Number.isInteger(secondYear) &&
    second.some((v) => typeof v === 'string' && /(cmol|mg|g\/|%|dm)/i.test(v));
  if (looksUnits) start = 2;

  const talhoes = new Set();
  const anos = new Set();
  let talhao = null;
  let year = null;
  let totalRows = 0;

  for (let r = start; r < matrix.length; r += 1) {
    const line = matrix[r] || [];
    if (line.every((c) => c === null || c === '')) continue;
    if (idx.talhao >= 0) {
      const t = line[idx.talhao];
      if (t !== null && String(t).trim() !== '' && String(t).trim() !== '-') talhao = String(t).trim();
    }
    const y = Number.parseInt(line[idx.year], 10);
    if (Number.isInteger(y)) year = y;
    if (!Number.isInteger(year)) continue;
    totalRows += 1;
    if (talhao) talhoes.add(talhao);
    anos.add(year);
  }

  const recognized = [];
  const ignored = [];
  const seen = new Set();
  rawHeaders.forEach((h) => {
    const n = normalize(h);
    const label = ALIAS_INDEX[n];
    if (label && !seen.has(label)) {
      seen.add(label);
      recognized.push(label);
    } else if (!label) {
      ignored.push(String(h).trim());
    }
  });

  const warnings = [];
  if (idx.talhao < 0) {
    warnings.push('Sem coluna "Talhão": as linhas serão importadas para o talhão selecionado abaixo.');
  }
  if (ignored.length > 0) {
    warnings.push(`Colunas não usadas (serão ignoradas): ${ignored.join(', ')}.`);
  }

  return {
    ok: true,
    fileName: file.name,
    fileSizeKb: Math.round(file.size / 1024),
    totalRows,
    talhoes: [...talhoes],
    anos: [...anos].sort(),
    recognized,
    ignored,
    hasTalhao: idx.talhao >= 0,
    warnings,
  };
}
