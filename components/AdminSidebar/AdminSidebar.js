'use client';

import { useState } from 'react';
import styles from './AdminSidebar.module.css';
import Input from '../Input/Input';
import TreeNode from '../TreeNode/TreeNode';
import EmptyState from '../EmptyState/EmptyState';

const Search = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const Plus = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Pencil = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="M13.5 6.5l3 3" />
  </svg>
);
const User = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const Barn = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-6 9 6v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export default function AdminSidebar({ owners = [], loading = false, onAdd, onAddFarm, onAddPlot, onEditPlot, activePlotId }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  return (
    <div className={styles.treeBlock}>
      <div className={styles.searchRow}>
        <Input icon={Search} placeholder="Buscar talhão..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className={styles.addBtn} onClick={onAdd} aria-label="Adicionar proprietário">
          {Plus}
        </button>
      </div>

      <div className={styles.tree}>
        {loading && <p className={styles.hint}>Carregando…</p>}

        {!loading && owners.length === 0 && (
          <EmptyState
            compact
            title="Nenhum proprietário"
            description="Cadastre o primeiro produtor com suas fazendas e talhões."
          />
        )}

        {!loading && owners.map((owner) => (
          <TreeNode
            key={owner.id}
            label={owner.name}
            type="owner"
            icon={User}
            meta={`${owner.farms.length} faz.`}
            defaultExpanded
            action={
              <button
                type="button"
                className={styles.addRow}
                onClick={() => onAddFarm && onAddFarm(owner)}
                aria-label={`Adicionar fazenda para ${owner.name}`}
                title="Adicionar fazenda"
              >
                {Plus}
              </button>
            }
          >
            {owner.farms.map((farm) => {
              const plots = farm.plots.filter((p) => !q || p.name.toLowerCase().includes(q));
              return (
                <TreeNode
                  key={farm.id}
                  label={farm.name}
                  type="farm"
                  icon={Barn}
                  meta={`${farm.plots.length} tal.`}
                  defaultExpanded
                  action={
                    <button
                      type="button"
                      className={styles.addRow}
                      onClick={() => onAddPlot && onAddPlot(owner, farm)}
                      aria-label={`Adicionar talhão em ${farm.name}`}
                      title="Adicionar talhão"
                    >
                      {Plus}
                    </button>
                  }
                >
                  {plots.map((plot) => (
                    <TreeNode
                      key={plot.id}
                      label={plot.name}
                      type="plot"
                      icon={Pin}
                      active={activePlotId === plot.id}
                      action={
                        <button
                          type="button"
                          className={styles.pencil}
                          onClick={() => onEditPlot(plot)}
                          aria-label={`Editar contorno de ${plot.name}`}
                          title="Editar contorno"
                        >
                          {Pencil}
                        </button>
                      }
                    />
                  ))}
                </TreeNode>
              );
            })}
          </TreeNode>
        ))}
      </div>
    </div>
  );
}
