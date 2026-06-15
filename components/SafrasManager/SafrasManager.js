'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './SafrasManager.module.css';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import EmptyState from '../EmptyState/EmptyState';
import { seasonsApi, mediaUrl } from '@/lib/api';

const EVENT_TYPES = [
  { value: 'plantio', label: 'Plantio' },
  { value: 'adubacao', label: 'Adubação' },
  { value: 'aplicacao_defensivos', label: 'Aplicação de defensivos' },
  { value: 'irrigacao', label: 'Irrigação' },
  { value: 'colheita', label: 'Colheita' },
  { value: 'visita', label: 'Visita' },
  { value: 'correcao', label: 'Correção' },
  { value: 'manejo', label: 'Manejo' },
  { value: 'outro', label: 'Outro' },
];

const cx = (...c) => c.filter(Boolean).join(' ');
const isSoja = (c) => String(c || '').toLowerCase().includes('soja');
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const CalIcon = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
const Pencil = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M13.5 6.5l3 3" />
  </svg>
);
const Trash = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);

function SeasonCard({ season, plotLabel, onChanged, onToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', eventType: 'plantio', eventDate: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Edição/exclusão da safra
  const [editingSeason, setEditingSeason] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ crop: season.crop, variety: season.variety, yearLabel: season.seasonLabel || String(season.year) });
  const [savingSeason, setSavingSeason] = useState(false);
  const [confirmDelSeason, setConfirmDelSeason] = useState(false);
  const [busySeason, setBusySeason] = useState(false);

  // Edição/exclusão de evento
  const [editingEventId, setEditingEventId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [confirmDelEventId, setConfirmDelEventId] = useState(null);

  // Paginação dos eventos
  const [eventPage, setEventPage] = useState(0);
  const EVENTS_PER_PAGE = 4;
  const totalEventPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const page = Math.min(eventPage, totalEventPages - 1);
  const pagedEvents = events.slice(page * EVENTS_PER_PAGE, (page + 1) * EVENTS_PER_PAGE);

  const load = useCallback(async () => {
    try {
      const data = await seasonsApi.events(season.id);
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [season.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitEvent() {
    if (!form.title.trim() || !form.eventDate) {
      onToast('Informe título e data do evento.');
      return;
    }
    setSaving(true);
    try {
      await seasonsApi.addEvent(season.id, { ...form, file });
      setForm({ title: '', eventType: 'plantio', eventDate: '', description: '' });
      setFile(null);
      setAdding(false);
      await load();
      onToast('Evento cadastrado!');
    } catch (err) {
      onToast(err.message || 'Falha ao cadastrar evento.');
    } finally {
      setSaving(false);
    }
  }

  async function saveSeason() {
    if (!seasonForm.variety.trim()) {
      onToast('Informe a variedade.');
      return;
    }
    setSavingSeason(true);
    try {
      const year = Number.parseInt(String(seasonForm.yearLabel), 10);
      await seasonsApi.update(season.id, {
        crop: seasonForm.crop,
        variety: seasonForm.variety.trim(),
        year,
        seasonLabel: seasonForm.yearLabel,
      });
      setEditingSeason(false);
      onToast('Safra atualizada!');
      onChanged();
    } catch (err) {
      onToast(err.message || 'Falha ao atualizar a safra.');
    } finally {
      setSavingSeason(false);
    }
  }

  async function deleteSeason() {
    setBusySeason(true);
    try {
      await seasonsApi.remove(season.id);
      onToast('Safra excluída.');
      onChanged();
    } catch (err) {
      onToast(err.message || 'Falha ao excluir a safra.');
      setBusySeason(false);
      setConfirmDelSeason(false);
    }
  }

  function startEditEvent(e) {
    setConfirmDelEventId(null);
    setEditingEventId(e.id);
    setEditFile(null);
    setEditForm({
      title: e.title || '',
      eventType: e.eventType || 'plantio',
      eventDate: e.eventDate || '',
      description: e.description || '',
    });
  }

  async function saveEvent(eventId) {
    if (!editForm.title.trim() || !editForm.eventDate) {
      onToast('Informe título e data do evento.');
      return;
    }
    setSavingEvent(true);
    try {
      await seasonsApi.updateEvent(season.id, eventId, { ...editForm, file: editFile });
      setEditingEventId(null);
      setEditForm(null);
      setEditFile(null);
      await load();
      onToast('Evento atualizado!');
    } catch (err) {
      onToast(err.message || 'Falha ao atualizar o evento.');
    } finally {
      setSavingEvent(false);
    }
  }

  async function deleteEvent(eventId) {
    try {
      await seasonsApi.removeEvent(season.id, eventId);
      setConfirmDelEventId(null);
      await load();
      onToast('Evento excluído.');
    } catch (err) {
      onToast(err.message || 'Falha ao excluir o evento.');
    }
  }

  return (
    <div className={styles.seasonCard}>
      <div className={styles.seasonHead}>
        {editingSeason ? (
          <div className={styles.seasonEdit}>
            <div className={styles.seasonEditRow}>
              <Input placeholder="Cultura (ex.: Soja)" value={seasonForm.crop} onChange={(e) => setSeasonForm((f) => ({ ...f, crop: e.target.value }))} />
              <Input placeholder="Ano (ex.: 2024/2025)" value={seasonForm.yearLabel} onChange={(e) => setSeasonForm((f) => ({ ...f, yearLabel: e.target.value }))} />
            </div>
            <Input placeholder="Variedade" value={seasonForm.variety} onChange={(e) => setSeasonForm((f) => ({ ...f, variety: e.target.value }))} />
            <div className={styles.editActions}>
              <Button variant="secondary" onClick={() => setEditingSeason(false)} disabled={savingSeason}>Cancelar</Button>
              <Button variant="primary" onClick={saveSeason} loading={savingSeason}>Salvar</Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className={styles.seasonPlot}>{plotLabel}</span>
              <span className={styles.seasonYear}>{season.seasonLabel || season.year}</span>
            </div>
            <div className={styles.seasonMeta}>
              <Badge variant={isSoja(season.crop) ? 'soja' : 'milho'} dot>
                {cap(season.crop)}
              </Badge>
              <span className={styles.variety}>{season.variety}</span>
              <div className={styles.rowActions}>
                <button type="button" className={styles.iconBtn} onClick={() => setEditingSeason(true)} title="Editar safra" aria-label="Editar safra">{Pencil}</button>
                <button type="button" className={cx(styles.iconBtn, styles.danger)} onClick={() => setConfirmDelSeason(true)} title="Excluir safra" aria-label="Excluir safra">{Trash}</button>
              </div>
            </div>
          </>
        )}
      </div>

      {confirmDelSeason && (
        <div className={styles.confirmBar}>
          <span>Excluir esta safra e <strong>todos os eventos</strong>?</span>
          <div className={styles.confirmActions}>
            <button type="button" className={styles.confirmCancel} onClick={() => setConfirmDelSeason(false)} disabled={busySeason}>Cancelar</button>
            <button type="button" className={styles.confirmDanger} onClick={deleteSeason} disabled={busySeason}>{busySeason ? 'Excluindo…' : 'Excluir'}</button>
          </div>
        </div>
      )}

      <div className={styles.events}>
        {!loading && events.length > 0 && (
          <div className={styles.eventsHead}>
            <span className={styles.eventsCount}>{events.length} evento{events.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {loading && <p className={styles.noEvents}>Carregando eventos…</p>}
        {!loading && events.length === 0 && <p className={styles.noEvents}>Nenhum evento cadastrado ainda.</p>}

        <div className={styles.eventsList}>
        {!loading && pagedEvents.map((e) => (
          editingEventId === e.id ? (
            <div key={e.id} className={styles.addForm}>
              <div className={styles.addRow}>
                <Input placeholder="Título" value={editForm.title} onChange={(ev) => setEditForm((f) => ({ ...f, title: ev.target.value }))} />
                <input type="date" className={styles.date} value={editForm.eventDate} onChange={(ev) => setEditForm((f) => ({ ...f, eventDate: ev.target.value }))} />
              </div>
              <Select options={EVENT_TYPES} value={editForm.eventType} onChange={(v) => setEditForm((f) => ({ ...f, eventType: v }))} />
              <textarea
                className={styles.desc}
                rows={2}
                placeholder="Descrição..."
                value={editForm.description}
                onChange={(ev) => setEditForm((f) => ({ ...f, description: ev.target.value }))}
              />
              <label className={styles.fileRow}>
                <span>{editFile ? editFile.name : 'Adicionar nova foto (opcional)'}</span>
                <input type="file" accept="image/*" className={styles.fileInput} onChange={(ev) => setEditFile(ev.target.files?.[0] || null)} />
              </label>
              <div className={styles.addActions}>
                <Button variant="secondary" onClick={() => { setEditingEventId(null); setEditForm(null); }} disabled={savingEvent}>Cancelar</Button>
                <Button variant="primary" onClick={() => saveEvent(e.id)} loading={savingEvent}>Salvar evento</Button>
              </div>
            </div>
          ) : (
            <div key={e.id} className={styles.event}>
              <div className={styles.eventTop}>
                <span className={styles.eventTitle}>{e.title}</span>
                <div className={styles.eventActions}>
                  <span className={styles.eventDate}>{e.eventDate}</span>
                  <button type="button" className={styles.iconBtn} onClick={() => startEditEvent(e)} title="Editar evento" aria-label="Editar evento">{Pencil}</button>
                  <button type="button" className={cx(styles.iconBtn, styles.danger)} onClick={() => setConfirmDelEventId(e.id)} title="Excluir evento" aria-label="Excluir evento">{Trash}</button>
                </div>
              </div>
              {e.description && <p className={styles.eventDesc}>{e.description}</p>}
              {e.photos?.length > 0 && (
                <div className={styles.photos}>
                  {e.photos.map((p) => (
                    <span key={p.id} className={styles.photo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(p.url)} alt={e.title} loading="lazy" />
                    </span>
                  ))}
                </div>
              )}
              {confirmDelEventId === e.id && (
                <div className={styles.confirmBar}>
                  <span>Excluir este evento?</span>
                  <div className={styles.confirmActions}>
                    <button type="button" className={styles.confirmCancel} onClick={() => setConfirmDelEventId(null)}>Cancelar</button>
                    <button type="button" className={styles.confirmDanger} onClick={() => deleteEvent(e.id)}>Excluir</button>
                  </div>
                </div>
              )}
            </div>
          )
        ))}
        </div>

        {!loading && totalEventPages > 1 && (
          <div className={styles.pager}>
            <button type="button" className={styles.pagerBtn} disabled={page === 0} onClick={() => setEventPage(page - 1)} aria-label="Anterior">‹</button>
            <span className={styles.pagerInfo}>{page + 1} / {totalEventPages}</span>
            <button type="button" className={styles.pagerBtn} disabled={page >= totalEventPages - 1} onClick={() => setEventPage(page + 1)} aria-label="Próximo">›</button>
          </div>
        )}

        {adding ? (
          <div className={styles.addForm}>
            <div className={styles.addRow}>
              <Input placeholder="Título (ex.: Plantio)" value={form.title} onChange={(ev) => setForm((f) => ({ ...f, title: ev.target.value }))} />
              <input type="date" className={styles.date} value={form.eventDate} onChange={(ev) => setForm((f) => ({ ...f, eventDate: ev.target.value }))} />
            </div>
            <Select options={EVENT_TYPES} value={form.eventType} onChange={(v) => setForm((f) => ({ ...f, eventType: v }))} />
            <textarea
              className={styles.desc}
              rows={2}
              placeholder="Descrição do que foi realizado..."
              value={form.description}
              onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
            />
            <label className={styles.fileRow}>
              <span>{file ? file.name : 'Anexar foto (opcional)'}</span>
              <input type="file" accept="image/*" className={styles.fileInput} onChange={(ev) => setFile(ev.target.files?.[0] || null)} />
            </label>
            <div className={styles.addActions}>
              <Button variant="secondary" onClick={() => setAdding(false)} disabled={saving}>Cancelar</Button>
              <Button variant="primary" onClick={submitEvent} loading={saving}>Salvar evento</Button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.addEvent} onClick={() => setAdding(true)}>+ Novo evento</button>
        )}
      </div>
    </div>
  );
}

export default function SafrasManager({ plotOptions = [], cropOptions, yearOptions, onToast }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plot, setPlot] = useState(plotOptions[0]?.value);
  const [yearLabel, setYearLabel] = useState('');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seasonPage, setSeasonPage] = useState(0);

  const labelOfPlot = (id) => plotOptions.find((p) => p.value === id)?.label || 'Talhão';

  const load = useCallback(async () => {
    try {
      const data = await seasonsApi.list();
      setSeasons(data || []);
    } catch {
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createSeason() {
    if (!plot) {
      onToast('Selecione um talhão (cadastre um produtor primeiro).');
      return;
    }
    if (!crop.trim()) {
      onToast('Informe a cultura.');
      return;
    }
    const year = Number.parseInt(String(yearLabel), 10);
    if (!yearLabel.trim() || Number.isNaN(year)) {
      onToast('Informe o ano agrícola (ex.: 2024 ou 2024/2025).');
      return;
    }
    if (!variety.trim()) {
      onToast('Informe a variedade.');
      return;
    }
    setSubmitting(true);
    try {
      await seasonsApi.create({ plotId: plot, crop: crop.trim(), variety: variety.trim(), year, seasonLabel: yearLabel.trim() });
      setVariety('');
      setCrop('');
      setYearLabel('');
      await load();
      onToast('Temporada cadastrada com sucesso!');
    } catch (err) {
      onToast(err.message || 'Falha ao cadastrar temporada.');
    } finally {
      setSubmitting(false);
    }
  }

  const noPlots = plotOptions.length === 0;

  // Paginação das safras
  const SEASONS_PER_PAGE = 5;
  const totalSeasonPages = Math.max(1, Math.ceil(seasons.length / SEASONS_PER_PAGE));
  const sPage = Math.min(seasonPage, totalSeasonPages - 1);
  const pagedSeasons = seasons.slice(sPage * SEASONS_PER_PAGE, (sPage + 1) * SEASONS_PER_PAGE);

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Temporadas</p>
          <h1 className={styles.title}>Gestão de Safras</h1>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>Nova temporada</h2>
          {noPlots ? (
            <p className={styles.formHint}>Cadastre um produtor com talhões antes de criar safras.</p>
          ) : (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Talhão</label>
                <Select options={plotOptions} value={plot} onChange={setPlot} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Ano agrícola</label>
                <Input placeholder="Ex.: 2024/2025" value={yearLabel} onChange={(e) => setYearLabel(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Cultura</label>
                <Input placeholder="Ex.: Soja, Milho, Algodão" value={crop} onChange={(e) => setCrop(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Variedade</label>
                <Input placeholder="Ex.: Ares 7200" value={variety} onChange={(e) => setVariety(e.target.value)} />
              </div>
              <Button variant="primary" className={styles.submit} loading={submitting} onClick={createSeason}>
                Cadastrar temporada
              </Button>
            </>
          )}
        </section>

        <section className={styles.listCol}>
          <div className={styles.seasons}>
            {loading && <p className={styles.noEvents}>Carregando safras…</p>}

            {!loading && seasons.length === 0 && (
              <EmptyState
                icon={CalIcon}
                title="Nenhuma safra cadastrada"
                description="Crie a primeira temporada no formulário ao lado e adicione os eventos da linha do tempo."
              />
            )}

            {!loading && pagedSeasons.map((s) => (
              <SeasonCard
                key={s.id}
                season={s}
                plotLabel={labelOfPlot(s.plotId)}
                onChanged={load}
                onToast={onToast}
              />
            ))}
          </div>

          {!loading && totalSeasonPages > 1 && (
            <div className={cx(styles.pager, styles.pagerBar)}>
              <button type="button" className={styles.pagerBtn} disabled={sPage === 0} onClick={() => setSeasonPage(sPage - 1)} aria-label="Anterior">‹</button>
              <span className={styles.pagerInfo}>Safras {sPage * SEASONS_PER_PAGE + 1}–{Math.min((sPage + 1) * SEASONS_PER_PAGE, seasons.length)} de {seasons.length}</span>
              <button type="button" className={styles.pagerBtn} disabled={sPage >= totalSeasonPages - 1} onClick={() => setSeasonPage(sPage + 1)} aria-label="Próximo">›</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
