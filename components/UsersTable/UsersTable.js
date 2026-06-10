'use client';

import { useState } from 'react';
import styles from './UsersTable.module.css';
import Input from '../Input/Input';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import EmptyState from '../EmptyState/EmptyState';

const UserPlus = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.2 2.6-5 5.5-5 1.3 0 2.5.4 3.4 1" /><path d="M17 14v6M14 17h6" />
  </svg>
);

const cx = (...c) => c.filter(Boolean).join(' ');

const Search = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
  </svg>
);
const Pencil = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M13.5 6.5l3 3" />
  </svg>
);
const Wand = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2M15 10V8M11 6H9M21 6h-2" /><path d="M6 21L17 10l-3-3L3 18z" />
  </svg>
);
const Trash = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

export default function UsersTable({ users = [], loading = false, onToggle, onEdit, onDelete, onNewOnboarding, onAdd }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const isEmpty = !loading && users.length === 0;

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Acessos</p>
          <h1 className={styles.title}>Gestão de Usuários</h1>
        </div>
        <div className={styles.headActions}>
          <div className={styles.search}>
            <Input icon={Search} placeholder="Buscar por nome ou e-mail..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button variant="primary" onClick={onAdd}>+ Novo produtor</Button>
        </div>
      </header>

      {loading && <div className={styles.tableWrap}><p className={styles.empty}>Carregando…</p></div>}

      {isEmpty && (
        <div className={styles.tableWrap}>
          <EmptyState
            icon={UserPlus}
            title="Nenhum produtor cadastrado"
            description="Cadastre o primeiro produtor (com fazendas e talhões) para começar a popular os dados."
            action={<Button variant="primary" onClick={onAdd}>+ Cadastrar produtor</Button>}
          />
        </div>
      )}

      {!loading && !isEmpty && (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produtor</th>
              <th>CPF / CNPJ</th>
              <th className={styles.center}>Fazendas</th>
              <th className={styles.center}>Status</th>
              <th className={styles.right}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className={!u.active ? styles.inactive : ''}>
                <td>
                  <div className={styles.user}>
                    <span className={styles.avatar}>{u.name.charAt(0)}</span>
                    <div className={styles.userInfo}>
                      <span className={styles.name}>{u.name}</span>
                      <span className={styles.email}>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.doc}>{u.doc}</td>
                <td className={styles.center}>
                  <Badge variant="default">{u.farms}</Badge>
                </td>
                <td className={styles.center}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={u.active}
                    className={cx(styles.switch, u.active && styles.switchOn)}
                    onClick={() => onToggle(u)}
                    aria-label={u.active ? 'Desativar' : 'Ativar'}
                  >
                    <span className={styles.knob} />
                  </button>
                </td>
                <td className={styles.right}>
                  <div className={styles.actions}>
                    <button type="button" className={styles.action} onClick={() => onNewOnboarding(u)} title="Novo onboarding" aria-label="Novo onboarding">
                      {Wand}
                    </button>
                    <button type="button" className={styles.action} onClick={() => onEdit(u)} title="Editar" aria-label="Editar">
                      {Pencil}
                    </button>
                    <button type="button" className={cx(styles.action, styles.danger)} onClick={() => onDelete(u)} title="Excluir" aria-label="Excluir">
                      {Trash}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className={styles.empty}>Nenhum produtor encontrado.</p>}
      </div>
      )}
    </div>
  );
}
