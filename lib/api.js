export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://variant-variant--api.fax7kp.easypanel.host/api/v1';

const STORAGE = {
  access: 'variant.accessToken',
  refresh: 'variant.refreshToken',
  user: 'variant.user',
};

function storedToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE.access);
}
function storedRefresh() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE.refresh);
}
function parse(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
function fail(res, payload) {
  const error = new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
  error.status = res.status;
  error.code = payload?.error?.code;
  error.details = payload?.error?.details;
  return error;
}

// Renovação automática do access token (sessão só termina no logout).
let refreshing = null;
async function tryRefresh() {
  const rt = storedRefresh();
  if (!rt) return false;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        if (!res.ok) return false;
        const data = parse(await res.text())?.data;
        if (!data?.accessToken) return false;
        localStorage.setItem(STORAGE.access, data.accessToken);
        if (data.refreshToken) localStorage.setItem(STORAGE.refresh, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function rawFetch(path, { method = 'GET', body, token, headers, formData } = {}) {
  const tok = token === undefined ? storedToken() : token;
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      ...headers,
    },
    body: formData || (body !== undefined ? JSON.stringify(body) : undefined),
  });
}

async function send(path, opts = {}, retried = false) {
  const res = await rawFetch(path, opts);
  if (res.status === 401 && !retried && opts.token !== null && storedRefresh()) {
    const ok = await tryRefresh();
    if (ok) return send(path, opts, true);
  }
  const payload = parse(await res.text());
  if (!res.ok) throw fail(res, payload);
  return payload?.data !== undefined ? payload.data : payload;
}

export function request(path, opts = {}) {
  return send(path, opts);
}
export function upload(path, formData) {
  return send(path, { method: 'POST', formData });
}

export const auth = {
  login(email, password) {
    return request('/auth/login', { method: 'POST', body: { email, password }, token: null });
  },
  async logout() {
    const rt = storedRefresh();
    try {
      if (rt) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
      }
    } catch {
      /* ignora */
    }
    this.clear();
  },
  save({ accessToken, refreshToken, user } = {}) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE.access, accessToken || '');
    localStorage.setItem(STORAGE.refresh, refreshToken || '');
    localStorage.setItem(STORAGE.user, JSON.stringify(user || {}));
  },
  getUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(STORAGE.user) || 'null');
    } catch {
      return null;
    }
  },
  getToken: storedToken,
  clear() {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
  },
};

export const usersApi = {
  list: () => request('/users'),
  update: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const onboardingApi = {
  create: (body) => request('/onboarding', { method: 'POST', body }),
};

export const farmsApi = {
  list: () => request('/farms'),
  create: (body) => request('/farms', { method: 'POST', body }),
  update: (id, body) => request(`/farms/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/farms/${id}`, { method: 'DELETE' }),
};

export const plotsApi = {
  list: () => request('/plots'),
  create: (body) => request('/plots', { method: 'POST', body }),
  update: (id, body) => request(`/plots/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/plots/${id}`, { method: 'DELETE' }),
  map: (id) => request(`/plots/${id}/map`),
  evolution: (id, nutriente) => request(`/plots/${id}/soil-analyses/evolution?nutriente=${encodeURIComponent(nutriente)}`),
  radar: (id, year) => request(`/plots/${id}/soil-analyses/radar?year=${year}`),
  resistance: (id) => request(`/plots/${id}/resistance`),
  saveResistance: (id, readings) => request(`/plots/${id}/resistance`, { method: 'PUT', body: { readings } }),
  uploadKml: (id, file) => {
    const fd = new FormData();
    fd.append('arquivo', file);
    return upload(`/plots/${id}/kml`, fd);
  },
  importSoil: (id, file) => {
    const fd = new FormData();
    fd.append('arquivo', file);
    return upload(`/plots/${id}/soil-analyses/import`, fd);
  },
};

export const seasonsApi = {
  list: (plotId) => request(`/seasons${plotId ? `?plotId=${encodeURIComponent(plotId)}` : ''}`),
  create: (body) => request('/seasons', { method: 'POST', body }),
  update: (id, body) => request(`/seasons/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/seasons/${id}`, { method: 'DELETE' }),
  events: (seasonId) => request(`/seasons/${seasonId}/events`),
  addEvent: (seasonId, { title, eventType, eventDate, description, file }) => {
    const fd = new FormData();
    fd.append('title', title);
    if (eventType) fd.append('eventType', eventType);
    if (eventDate) fd.append('eventDate', eventDate);
    if (description) fd.append('description', description);
    if (file) fd.append('foto', file);
    return upload(`/seasons/${seasonId}/events`, fd);
  },
  updateEvent: (seasonId, eventId, { title, eventType, eventDate, description, file }) => {
    const fd = new FormData();
    if (title != null) fd.append('title', title);
    if (eventType) fd.append('eventType', eventType);
    if (eventDate) fd.append('eventDate', eventDate);
    if (description != null) fd.append('description', description);
    if (file) fd.append('foto', file);
    return send(`/seasons/${seasonId}/events/${eventId}`, { method: 'PUT', formData: fd });
  },
  removeEvent: (seasonId, eventId) => request(`/seasons/${seasonId}/events/${eventId}`, { method: 'DELETE' }),
};

const ORIGIN = API_BASE.replace(/\/api\/v\d+$/, '');
export function mediaUrl(u) {
  if (!u) return u;
  return /^https?:\/\//.test(u) ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
}

export const DEST_BY_ROLE = {
  admin: '/admin/workspace',
  producer: '/workspace',
};
