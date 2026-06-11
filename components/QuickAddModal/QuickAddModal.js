'use client';

import { useEffect, useState } from 'react';
import styles from './QuickAddModal.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { UF_OPTIONS, fetchCities, geocodeCity } from '@/lib/geo';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" />
  </svg>
);

export default function QuickAddModal({ mode, targetName, initial, onClose, onSubmit }) {
  const isFarm = mode === 'farm';
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [coord, setCoord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edição de fazenda: carrega as cidades da UF já salva (pra mostrar a seleção).
  useEffect(() => {
    if (isFarm && initial?.state) {
      setLoadingCities(true);
      fetchCities(initial.state)
        .then(setCities)
        .catch(() => setCities([]))
        .finally(() => setLoadingCities(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onStateChange(uf) {
    setState(uf);
    setCity('');
    setCities([]);
    setCoord(null);
    setLoadingCities(true);
    try {
      setCities(await fetchCities(uf));
    } catch {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }
  async function onCityChange(c) {
    setCity(c);
    setCoord(null);
    setGeocoding(true);
    const r = await geocodeCity(c, state);
    setGeocoding(false);
    setCoord(r);
  }

  async function submit() {
    setError('');
    if (!name.trim()) {
      setError(isFarm ? 'Informe o nome da fazenda.' : 'Informe o nome do talhão.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = isFarm
        ? {
            name: name.trim(),
            city: city || undefined,
            state: state || undefined,
            centroidLat: coord ? coord.lat : undefined,
            centroidLng: coord ? coord.lng : undefined,
          }
        : { name: name.trim() };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>{editing ? (isFarm ? 'Editar fazenda' : 'Editar talhão') : (isFarm ? 'Nova fazenda' : 'Novo talhão')}</p>
            <h2 className={styles.title}>{editing ? (isFarm ? 'Editar fazenda' : 'Renomear talhão') : (isFarm ? 'Adicionar fazenda' : 'Adicionar talhão')}</h2>
            {targetName && <p className={styles.sub}>{isFarm ? 'para' : 'em'} {targetName}</p>}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            {Close}
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>{isFarm ? 'Nome da fazenda' : 'Nome do talhão'}</label>
            <Input
              placeholder={isFarm ? 'Ex.: Fazenda Modelo' : 'Ex.: Talhão 1'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {isFarm && (
            <>
              <div className={styles.locRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Estado (UF)</label>
                  <Select options={UF_OPTIONS} value={state} onChange={onStateChange} placeholder="Selecione a UF" searchable />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cidade</label>
                  <Select
                    options={cities}
                    value={city}
                    onChange={onCityChange}
                    placeholder={state ? 'Selecione a cidade' : 'Escolha a UF primeiro'}
                    searchable
                    disabled={!state}
                    loading={loadingCities}
                  />
                </div>
              </div>
              {city && (
                <p className={`${styles.geoHint} ${geocoding ? '' : coord ? styles.geoOk : styles.geoWarn}`}>
                  <span className={styles.geoIcon}>{Pin}</span>
                  {geocoding
                    ? 'Localizando no mapa…'
                    : coord
                      ? `Mapa será centralizado em ${city}/${state}`
                      : 'Não localizamos no mapa — dá pra centralizar manualmente ao desenhar.'}
                </p>
              )}
            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} loading={submitting}>
            {editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
