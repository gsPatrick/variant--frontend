// Utilidades de localização para o cadastro: UFs, municípios (IBGE) e
// geocodificação (Nominatim/OpenStreetMap). Todas as APIs são gratuitas e
// sem chave. Usadas no RegisterModal para montar os dropdowns e centralizar
// o mapa na região da fazenda.

export const UFS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];

export const UF_OPTIONS = UFS.map(([uf, name]) => ({ value: uf, label: `${name} (${uf})` }));

const UF_NAME = Object.fromEntries(UFS);

// Municípios de uma UF via IBGE (ordenados por nome). Retorna [{value,label}].
export async function fetchCities(uf) {
  if (!uf) return [];
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  );
  if (!res.ok) throw new Error('Falha ao carregar municípios.');
  const data = await res.json();
  return (data || []).map((m) => ({ value: m.nome, label: m.nome }));
}

// Geocodifica "cidade, UF, Brasil" -> { lat, lng } (ou null). OpenStreetMap.
export async function geocodeCity(city, uf) {
  if (!city || !uf) return null;
  const q = `${city}, ${UF_NAME[uf] || uf}, Brasil`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const hit = Array.isArray(data) ? data[0] : null;
    if (!hit) return null;
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    return Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat: Math.round(lat * 1e7) / 1e7, lng: Math.round(lng * 1e7) / 1e7 }
      : null;
  } catch {
    return null;
  }
}
