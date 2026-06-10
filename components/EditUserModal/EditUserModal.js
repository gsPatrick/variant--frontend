'use client';

import { useState } from 'react';
import styles from './EditUserModal.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [doc, setDoc] = useState(user.doc);
  const [password, setPassword] = useState('');

  function handleSave() {
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

          <div className={styles.reset}>
            <label className={styles.label}>Redefinir senha</label>
            <Input
              type="password"
              placeholder="Deixe em branco para manter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Salvar</Button>
        </footer>
      </div>
    </div>
  );
}
