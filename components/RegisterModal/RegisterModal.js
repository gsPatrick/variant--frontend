'use client';

import { useState } from 'react';
import styles from './RegisterModal.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Select from '../Select/Select';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import { UF_OPTIONS, fetchCities, geocodeCity } from '@/lib/geo';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Plus = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" />
  </svg>
);

function emptyFarm() {
  return {
    name: '',
    state: '',
    city: '',
    cities: [],
    loadingCities: false,
    geocoding: false,
    centroidLat: null,
    centroidLng: null,
    plots: [''],
  };
}

export default function RegisterModal({ onClose, onCreate, initialOwner = '' }) {
  const [owner, setOwner] = useState(initialOwner);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farms, setFarms] = useState([emptyFarm()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function patchFarm(fi, patch) {
    setFarms((prev) => prev.map((f, i) => (i === fi ? { ...f, ...patch } : f)));
  }
  function addFarm() {
    setFarms((prev) => [...prev, emptyFarm()]);
  }
  function addPlot(fi) {
    setFarms((prev) => prev.map((f, i) => (i === fi ? { ...f, plots: [...f.plots, ''] } : f)));
  }
  function setPlotName(fi, pi, value) {
    setFarms((prev) =>
      prev.map((f, i) =>
        i === fi ? { ...f, plots: f.plots.map((p, j) => (j === pi ? value : p)) } : f
      )
    );
  }

  async function onStateChange(fi, uf) {
    patchFarm(fi, { state: uf, city: '', cities: [], loadingCities: true, centroidLat: null, centroidLng: null });
    try {
      const cities = await fetchCities(uf);
      patchFarm(fi, { cities, loadingCities: false });
    } catch {
      patchFarm(fi, { cities: [], loadingCities: false });
    }
  }

  async function onCityChange(fi, city, uf) {
    patchFarm(fi, { city, geocoding: true, centroidLat: null, centroidLng: null });
    const coord = await geocodeCity(city, uf);
    // Só aplica se a cidade ainda for a selecionada (evita corrida).
    setFarms((prev) =>
      prev.map((f, i) =>
        i === fi && f.city === city
          ? { ...f, geocoding: false, centroidLat: coord ? coord.lat : null, centroidLng: coord ? coord.lng : null }
          : f
      )
    );
  }

  async function handleCreate() {
    setError('');
    // Validações claras antes de chamar a API.
    if (!owner.trim()) return setError('Informe o nome do proprietário.');
    if (!email.trim()) return setError('Informe o e-mail de acesso.');
    if (password.length < 6) return setError('A senha precisa ter no mínimo 6 caracteres.');

    setSubmitting(true);
    try {
      await onCreate({ owner, email, password, farms });
    } catch (err) {
      // Mostra o detalhe específico da API (ex.: senha curta) quando houver.
      const detail = Array.isArray(err.details) && err.details[0]?.message;
      setError(detail || err.message || 'Não foi possível cadastrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Cadastro</p>
            <h2 className={styles.title}>Adicionar Proprietário</h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            {Close}
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Nome do Proprietário</label>
            <Input placeholder="Ex.: João" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>E-mail de acesso</label>
            <Input type="email" placeholder="joao@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha de acesso</label>
            <Input type="password" placeholder="mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordStrength value={password} />
          </div>

          {farms.map((farm, fi) => (
            <div className={styles.farmBlock} key={fi}>
              <div className={styles.field}>
                <label className={styles.label}>Fazenda {farms.length > 1 ? fi + 1 : ''}</label>
                <div className={styles.inlineRow}>
                  <Input
                    placeholder="Nome da fazenda"
                    value={farm.name}
                    onChange={(e) => patchFarm(fi, { name: e.target.value })}
                  />
                  <button type="button" className={styles.addInline} onClick={addFarm} aria-label="Adicionar fazenda" title="Adicionar fazenda">
                    {Plus}
                  </button>
                </div>
              </div>

              <div className={styles.locRow}>
                <div className={styles.field}>
                  <label className={styles.subLabel}>Estado (UF)</label>
                  <Select
                    options={UF_OPTIONS}
                    value={farm.state}
                    onChange={(uf) => onStateChange(fi, uf)}
                    placeholder="Selecione a UF"
                    searchable
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.subLabel}>Cidade</label>
                  <Select
                    options={farm.cities}
                    value={farm.city}
                    onChange={(city) => onCityChange(fi, city, farm.state)}
                    placeholder={farm.state ? 'Selecione a cidade' : 'Escolha a UF primeiro'}
                    searchable
                    disabled={!farm.state}
                    loading={farm.loadingCities}
                  />
                </div>
              </div>

              {farm.city && (
                <p className={`${styles.geoHint} ${farm.geocoding ? '' : farm.centroidLat != null ? styles.geoOk : styles.geoWarn}`}>
                  <span className={styles.geoIcon}>{Pin}</span>
                  {farm.geocoding
                    ? 'Localizando no mapa…'
                    : farm.centroidLat != null
                      ? `Mapa será centralizado em ${farm.city}/${farm.state}`
                      : 'Não localizamos no mapa — dá pra centralizar manualmente ao desenhar.'}
                </p>
              )}

              <div className={styles.plots}>
                {farm.plots.map((plot, pi) => (
                  <div className={styles.field} key={pi}>
                    <label className={styles.subLabel}>Talhão / Gleba</label>
                    <div className={styles.inlineRow}>
                      <Input
                        placeholder="Nome do talhão"
                        value={plot}
                        onChange={(e) => setPlotName(fi, pi, e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.addInline}
                        onClick={() => addPlot(fi)}
                        aria-label="Adicionar talhão"
                        title="Adicionar talhão"
                      >
                        {Plus}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreate} loading={submitting}>
            Criar
          </Button>
        </footer>
      </div>
    </div>
  );
}
