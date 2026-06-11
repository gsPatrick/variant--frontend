'use client';

import { useState } from 'react';
import styles from './EditUserModal.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import PasswordStrength from '../PasswordStrength/PasswordStrength';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Barn = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-6 9 6v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" />
  </svg>
);

export default function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [doc, setDoc] = useState(user.doc || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const farms = Array.isArray(user.farms) ? user.farms : [];

  function handleSave() {
    setError('');
    if (!name.trim()) return setError('Informe o nome.');
    if (!email.trim()) return setError('Informe o e-mail.');
    if (password && password.length < 6) return setError('A nova senha precisa ter no mínimo 6 caracteres.');
    onSave({ ...user, name, email, doc, newPassword: password }, { passwordReset: Boolean(password) });
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Editar produtor</p>
            <h2 className={styles.title}>{user.name}</h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            {Close}
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>CPF / CNPJ</label>
            <Input value={doc} onChange={(e) => setDoc(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Fazendas e talhões</label>
            {farms.length === 0 ? (
              <p className={styles.empty}>Nenhuma fazenda cadastrada. Use o “+” na lista do mapa para adicionar.</p>
            ) : (
              <div className={styles.tree}>
                {farms.map((f) => (
                  <div key={f.id} className={styles.farm}>
                    <div className={styles.farmHead}>
                      <span className={styles.farmIcon}>{Barn}</span>
                      <span className={styles.farmName}>{f.name}</span>
                      {(f.city || f.state) && (
                        <span className={styles.farmMeta}>{[f.city, f.state].filter(Boolean).join('/')}</span>
                      )}
                      <span className={styles.count}>{(f.plots || []).length} tal.</span>
                    </div>
                    {(f.plots || []).length > 0 && (
                      <ul className={styles.plots}>
                        {f.plots.map((p) => (
                          <li key={p.id} className={styles.plot}>
                            <span className={styles.plotIcon}>{Pin}</span>
                            {p.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.reset}>
            <label className={styles.label}>Redefinir senha</label>
            <Input
              type="password"
              placeholder="Deixe em branco para manter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && <PasswordStrength value={password} />}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Salvar</Button>
        </footer>
      </div>
    </div>
  );
}
