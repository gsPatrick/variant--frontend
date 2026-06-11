'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

import AdminNav from '@/components/AdminNav/AdminNav';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import AdminFloating from '@/components/AdminFloating/AdminFloating';
import DrawToolbar from '@/components/DrawToolbar/DrawToolbar';
import ImportModal from '@/components/ImportModal/ImportModal';
import KmlImportModal from '@/components/KmlImportModal/KmlImportModal';
import ProfileModal from '@/components/ProfileModal/ProfileModal';
import RegisterModal from '@/components/RegisterModal/RegisterModal';
import QuickAddModal from '@/components/QuickAddModal/QuickAddModal';
import SoilResistanceTable from '@/components/SoilResistanceTable/SoilResistanceTable';
import Toast from '@/components/Toast/Toast';
import UsersTable from '@/components/UsersTable/UsersTable';
import EditUserModal from '@/components/EditUserModal/EditUserModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import DataDrivePanel from '@/components/DataDrivePanel/DataDrivePanel';
import SafrasManager from '@/components/SafrasManager/SafrasManager';
import ParametersPanel from '@/components/ParametersPanel/ParametersPanel';
import Timeline from '@/components/Timeline/Timeline';
import EventModal from '@/components/EventModal/EventModal';

import { cropOptions, yearOptions } from './adminData';
import { usersApi, onboardingApi, farmsApi, plotsApi, seasonsApi, mediaUrl } from '@/lib/api';

// Converte o evento da API para o formato da Timeline / EventModal.
function adaptEvent(e) {
  const [y, m, d] = String(e.eventDate || '').split('-');
  return {
    id: e.id,
    type: e.eventType,
    date: d && m ? `${d}/${m}` : e.eventDate,
    dateFull: d ? `${d}/${m}/${y}` : e.eventDate,
    title: e.title,
    description: e.description,
    photos: (e.photos || []).map((p) => mediaUrl(p.url)),
  };
}

const AdminMap = dynamic(() => import('@/components/AdminMap/AdminMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Carregando mapa…</div>,
});

const cx = (...c) => c.filter(Boolean).join(' ');

export default function AdminWorkspacePage() {
  const [tab, setTab] = useState('map');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlotId, setSelectedPlotId] = useState(null);

  const [drawActive, setDrawActive] = useState(false);
  const [drawTool, setDrawTool] = useState('polygon');
  const [drawMode, setDrawMode] = useState(null);
  const [drawArea, setDrawArea] = useState(0);
  const [drawCmd, setDrawCmd] = useState(null);
  const [showR, setShowR] = useState(false);
  const [activeDepth, setActiveDepth] = useState(null);
  const [resistance, setResistance] = useState([]);
  const [savingR, setSavingR] = useState(false);

  const [plotEvents, setPlotEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const [importing, setImporting] = useState(false);
  const [kmlImporting, setKmlImporting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillOwner, setPrefillOwner] = useState('');
  const [quickAdd, setQuickAdd] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [toast, setToast] = useState('');

  const fetchTree = useCallback(async () => {
    try {
      const data = await usersApi.list();
      setTree(data || []);
    } catch (err) {
      setToast(err.code === 'UNAUTHENTICATED' ? 'Sessão expirada — faça login.' : 'Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const allPlots = useMemo(
    () =>
      tree.flatMap((o) =>
        o.farms.flatMap((f) =>
          f.plots.map((p) => ({
            ...p,
            farmId: f.id,
            farmName: f.name,
            ownerName: o.name,
            farmCentroidLat: f.centroidLat,
            farmCentroidLng: f.centroidLng,
          }))
        )
      ),
    [tree]
  );

  useEffect(() => {
    if (!selectedPlotId && allPlots.length > 0) setSelectedPlotId(allPlots[0].id);
  }, [allPlots, selectedPlotId]);

  // Carrega os eventos da safra mais recente do talhão selecionado (timeline do mapa).
  useEffect(() => {
    setSelectedEventId(null);
    if (tab !== 'map' || !selectedPlotId) {
      setPlotEvents([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const seasons = await seasonsApi.list(selectedPlotId);
        if (!seasons || seasons.length === 0) {
          if (!cancelled) setPlotEvents([]);
          return;
        }
        const events = await seasonsApi.events(seasons[0].id);
        if (!cancelled) setPlotEvents((events || []).map(adaptEvent));
      } catch {
        if (!cancelled) setPlotEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, selectedPlotId]);

  // Carrega as leituras de resistência (compactação) do talhão selecionado.
  useEffect(() => {
    setActiveDepth(null);
    if (!selectedPlotId) {
      setResistance([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await plotsApi.resistance(selectedPlotId);
        if (!cancelled) setResistance(data.readings || []);
      } catch {
        if (!cancelled) setResistance([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPlotId]);

  async function saveResistance(rows) {
    if (!selectedPlotId) return;
    setSavingR(true);
    try {
      const data = await plotsApi.saveResistance(selectedPlotId, rows);
      setResistance(data.readings || []);
      setActiveDepth(null);
      setToast('Resistência do solo salva.');
    } catch (err) {
      setToast(err.message || 'Não foi possível salvar a resistência.');
    } finally {
      setSavingR(false);
    }
  }

  const selectedPlot = allPlots.find((p) => p.id === selectedPlotId) || null;
  const plotSelectOptions = allPlots.map((p) => ({ value: p.id, label: `${p.name} · ${p.farmName}` }));
  const usersForTable = tree.map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email,
    doc: o.document || '—',
    farms: o.farms.length,
    active: o.active,
  }));

  const heat = useMemo(
    () => (activeDepth != null ? resistance.find((r) => r.depthCm === activeDepth) || null : null),
    [activeDepth, resistance]
  );
  const selectedEvent = plotEvents.find((e) => e.id === selectedEventId) || null;

  function selectPlotById(id) {
    setSelectedPlotId(id);
  }
  function handleEditPlot(plot) {
    setSelectedPlotId(plot.id);
    setDrawActive(true);
  }

  // Reseta o estado de desenho ao sair do modo.
  useEffect(() => {
    if (!drawActive) {
      setDrawTool('polygon');
      setDrawMode(null);
      setDrawArea(0);
      setDrawCmd(null);
    }
  }, [drawActive]);

  const drawProps = {
    plotName: selectedPlot?.name,
    tool: drawTool,
    mode: drawMode,
    area: drawArea,
    onTool: (t) => { setDrawMode(null); setDrawTool(t); },
    onMode: (m) => setDrawMode((prev) => (prev === m ? null : m)),
    onClear: () => { setDrawArea(0); setDrawCmd({ name: 'clear', seq: Date.now() }); },
    onSave: () => setDrawCmd({ name: 'save', seq: Date.now() }),
    onCancel: () => setDrawActive(false),
  };
  function closeModal() {
    setModalOpen(false);
    setPrefillOwner('');
  }

  // ----- Onboarding (cadastro de proprietário/fazenda/talhões) -----
  async function handleCreate(data) {
    const farms = (data.farms || []).filter((f) => f.name && f.name.trim());
    if (!data.owner?.trim() || !data.email?.trim() || !data.password) {
      throw new Error('Preencha nome, e-mail e senha do proprietário.');
    }
    if (farms.length === 0) throw new Error('Adicione ao menos uma fazenda.');

    const [first, ...rest] = farms;
    const res = await onboardingApi.create({
      mode: 'automatico',
      cliente: { name: data.owner.trim(), email: data.email.trim(), password: data.password },
      projeto: {
        name: first.name.trim(),
        city: first.city || undefined,
        state: first.state || undefined,
        centroidLat: first.centroidLat ?? undefined,
        centroidLng: first.centroidLng ?? undefined,
      },
      informacoes: { plots: first.plots.filter((p) => p && p.trim()).map((name) => ({ name: name.trim() })) },
    });
    const producerId = res?.cliente?.id;
    for (const f of rest) {
      // eslint-disable-next-line no-await-in-loop
      const farm = await farmsApi.create({
        producerId,
        name: f.name.trim(),
        city: f.city || undefined,
        state: f.state || undefined,
        centroidLat: f.centroidLat ?? undefined,
        centroidLng: f.centroidLng ?? undefined,
      });
      for (const pn of f.plots.filter((p) => p && p.trim())) {
        // eslint-disable-next-line no-await-in-loop
        await plotsApi.create({ farmId: farm.id, name: pn.trim() });
      }
    }
    closeModal();
    await fetchTree();
    setToast('Proprietário cadastrado com sucesso!');
  }

  // ----- Adicionar / editar fazenda e talhão (sidebar) -----
  async function handleQuickSubmit(payload) {
    if (!quickAdd) return;
    const { mode, action } = quickAdd;
    if (mode === 'farm' && action === 'edit') {
      await farmsApi.update(quickAdd.farm.id, payload);
      setToast('Fazenda atualizada.');
    } else if (mode === 'farm') {
      const farm = await farmsApi.create({ producerId: quickAdd.owner.id, ...payload });
      setToast(`Fazenda "${farm.name}" adicionada a ${quickAdd.owner.name}.`);
    } else if (mode === 'plot' && action === 'edit') {
      await plotsApi.update(quickAdd.plot.id, { name: payload.name });
      setToast('Talhão renomeado.');
    } else {
      const plot = await plotsApi.create({ farmId: quickAdd.farm.id, name: payload.name });
      setSelectedPlotId(plot.id);
      setToast(`Talhão "${plot.name}" adicionado a ${quickAdd.farm.name}.`);
    }
    setQuickAdd(null);
    await fetchTree();
  }

  // ----- Excluir fazenda / talhão (sidebar) -----
  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'farm') {
        await farmsApi.remove(confirmDelete.farm.id);
        setToast('Fazenda excluída.');
      } else {
        await plotsApi.remove(confirmDelete.plot.id);
        if (selectedPlotId === confirmDelete.plot.id) setSelectedPlotId(null);
        setToast('Talhão excluído.');
      }
      setConfirmDelete(null);
      await fetchTree();
    } catch (err) {
      setToast(err.message);
      setConfirmDelete(null);
    }
  }

  // ----- Usuários -----
  async function toggleUser(user) {
    try {
      await usersApi.update(user.id, { active: !user.active });
      await fetchTree();
      setToast(`${user.name} ${user.active ? 'desativado' : 'ativado'}.`);
    } catch (err) {
      setToast(err.message);
    }
  }
  // Abre a edição com o dono completo (fazendas → talhões) para o modal exibir.
  function openEditUser(row) {
    const owner = tree.find((o) => o.id === row.id);
    setEditUser(owner ? { ...owner, doc: owner.document || '' } : row);
  }

  async function saveUser(updated, { passwordReset }) {
    try {
      const body = { name: updated.name, email: updated.email, document: updated.doc };
      if (passwordReset && updated.newPassword) body.password = updated.newPassword;
      await usersApi.update(updated.id, body);
      setEditUser(null);
      await fetchTree();
      setToast(`Dados atualizados${passwordReset ? ' · senha redefinida' : ''}.`);
    } catch (err) {
      setToast(err.message);
    }
  }
  async function deleteUser() {
    try {
      await usersApi.remove(confirmUser.id);
      setConfirmUser(null);
      await fetchTree();
      setToast('Produtor excluído.');
    } catch (err) {
      setToast(err.message);
    }
  }
  function newOnboarding(user) {
    setPrefillOwner(user.name);
    setModalOpen(true);
  }

  // ----- Salvar contorno desenhado (persiste geometria no talhão) -----
  async function saveDraw(result) {
    if (!result) {
      setToast('Desenhe um contorno antes de salvar.');
      return;
    }
    const { geometry, centroid } = result;
    try {
      await plotsApi.update(selectedPlotId, {
        geometry,
        centroidLat: centroid ? centroid.lat : undefined,
        centroidLng: centroid ? centroid.lng : undefined,
      });
      setDrawActive(false);
      await fetchTree();
      setToast('Contorno atualizado com sucesso!');
    } catch (err) {
      setToast(err.message);
    }
  }

  return (
    <main className={cx(styles.shell, navCollapsed && styles.navCollapsed)}>
      <div className={styles.sidebarSlot}>
        <AdminNav active={tab} onChange={setTab} collapsed={navCollapsed} onToggle={() => setNavCollapsed((p) => !p)} onProfile={() => setProfileOpen(true)}>
          {tab === 'map' && (
            <AdminSidebar
              owners={tree}
              loading={loading}
              onAdd={() => setModalOpen(true)}
              onAddFarm={(owner) => setQuickAdd({ mode: 'farm', action: 'create', owner })}
              onAddPlot={(owner, farm) => setQuickAdd({ mode: 'plot', action: 'create', owner, farm })}
              onEditFarm={(owner, farm) => setQuickAdd({ mode: 'farm', action: 'edit', owner, farm })}
              onDeleteFarm={(owner, farm) => setConfirmDelete({ type: 'farm', owner, farm })}
              onEditPlot={handleEditPlot}
              onRenamePlot={(owner, farm, plot) => setQuickAdd({ mode: 'plot', action: 'edit', owner, farm, plot })}
              onDeletePlot={(owner, farm, plot) => setConfirmDelete({ type: 'plot', owner, farm, plot })}
              activePlotId={drawActive ? selectedPlotId : null}
            />
          )}
        </AdminNav>
      </div>

      <div className={styles.main}>
        {tab === 'map' && (
          <section className={styles.mapArea}>
            <AdminMap
              plot={selectedPlot}
              drawActive={drawActive}
              drawTool={drawTool}
              drawMode={drawMode}
              drawCmd={drawCmd}
              heat={heat}
              onArea={setDrawArea}
              onSaveDraw={saveDraw}
            />

            {drawActive && !navCollapsed && (
              <div className={styles.drawToolbarTop}>
                <DrawToolbar {...drawProps} />
              </div>
            )}

            {!drawActive && plotEvents.length > 0 && (
              <div className={cx(styles.timelineSlot, !timelineOpen && styles.timelineClosed)}>
                <button
                  type="button"
                  className={styles.timelineHandle}
                  onClick={() => setTimelineOpen((p) => !p)}
                  aria-label={timelineOpen ? 'Ocultar linha do tempo' : 'Mostrar linha do tempo'}
                >
                  <span className={styles.handleGrip} aria-hidden="true" />
                  <svg className={styles.handleChevron} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className={styles.timelinePanel}>
                  <Timeline events={plotEvents} selectedId={selectedEventId} onSelect={setSelectedEventId} />
                </div>
              </div>
            )}

            {!drawActive && selectedEvent && (
              <EventModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />
            )}

            {selectedPlot && (
              <div className={styles.soilDock}>
                {showR && (
                  <SoilResistanceTable
                    readings={resistance}
                    activeDepth={activeDepth}
                    onSelect={(d) => setActiveDepth((prev) => (prev === d ? null : d))}
                    onSave={saveResistance}
                    onClose={() => setShowR(false)}
                    saving={savingR}
                    canEdit
                  />
                )}
                <button
                  type="button"
                  className={cx(styles.rButton, showR && styles.rButtonActive)}
                  onClick={() => setShowR((prev) => !prev)}
                  aria-label="Resistência do solo"
                  title="Resistência do solo"
                >
                  R
                </button>
              </div>
            )}
          </section>
        )}

        {tab === 'datadrive' && (
          <div className={styles.panelWrap}>
            <DataDrivePanel
              plots={allPlots}
              onOpenImport={() => setImporting(true)}
              onImportKml={() => setKmlImporting(true)}
              onViewOnMap={(plotId) => { setSelectedPlotId(plotId); setTab('map'); }}
              onToast={setToast}
            />
          </div>
        )}

        {tab === 'safras' && (
          <div className={styles.panelWrap}>
            <SafrasManager plotOptions={plotSelectOptions} cropOptions={cropOptions} yearOptions={yearOptions} onToast={setToast} />
          </div>
        )}

        {tab === 'users' && (
          <div className={styles.panelWrap}>
            <UsersTable
              users={usersForTable}
              loading={loading}
              onToggle={toggleUser}
              onEdit={openEditUser}
              onDelete={setConfirmUser}
              onNewOnboarding={newOnboarding}
              onAdd={() => setModalOpen(true)}
            />
          </div>
        )}

        {tab === 'config' && (
          <div className={styles.panelWrap}>
            <ParametersPanel onToast={setToast} />
          </div>
        )}
      </div>

      {navCollapsed && tab === 'map' && allPlots.length > 0 && (
        <AdminFloating
          plotOptions={plotSelectOptions}
          plotId={selectedPlotId}
          onSelectPlot={selectPlotById}
          onImport={() => setImporting(true)}
          onEdit={() => setDrawActive(true)}
          onAdd={() => setModalOpen(true)}
          belowSlot={drawActive ? <DrawToolbar {...drawProps} attached /> : null}
        />
      )}

      {importing && (
        <ImportModal
          plots={allPlots}
          defaultPlotId={selectedPlotId}
          onClose={() => setImporting(false)}
          onComplete={() => { setImporting(false); fetchTree(); }}
          onToast={setToast}
        />
      )}

      {kmlImporting && (
        <KmlImportModal
          plots={allPlots}
          defaultPlotId={selectedPlotId}
          onClose={() => setKmlImporting(false)}
          onComplete={() => { setKmlImporting(false); fetchTree(); }}
          onToast={setToast}
        />
      )}

      {modalOpen && (
        <RegisterModal initialOwner={prefillOwner} onClose={closeModal} onCreate={handleCreate} />
      )}

      {quickAdd && (
        <QuickAddModal
          mode={quickAdd.mode}
          targetName={quickAdd.action === 'edit' ? undefined : (quickAdd.mode === 'farm' ? quickAdd.owner?.name : quickAdd.farm?.name)}
          initial={
            quickAdd.action !== 'edit'
              ? undefined
              : quickAdd.mode === 'farm'
                ? { name: quickAdd.farm.name, state: quickAdd.farm.state || '', city: quickAdd.farm.city || '' }
                : { name: quickAdd.plot.name }
          }
          onClose={() => setQuickAdd(null)}
          onSubmit={handleQuickSubmit}
        />
      )}

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={saveUser} />}

      {confirmUser && (
        <ConfirmDialog
          title="Excluir produtor"
          message={`Excluir "${confirmUser.name}" e todos os dados vinculados? Esta ação não pode ser desfeita.`}
          onConfirm={deleteUser}
          onCancel={() => setConfirmUser(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === 'farm' ? 'Excluir fazenda' : 'Excluir talhão'}
          message={
            confirmDelete.type === 'farm'
              ? `Excluir a fazenda "${confirmDelete.farm.name}" e TODOS os talhões, análises e safras dela? Esta ação não pode ser desfeita.`
              : `Excluir o talhão "${confirmDelete.plot.name}" e todos os dados dele (análises, resistência, safras)? Esta ação não pode ser desfeita.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} onToast={setToast} />}

      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  );
}
