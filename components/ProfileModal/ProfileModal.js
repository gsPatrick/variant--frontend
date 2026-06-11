'use client';

import { useEffect, useState } from 'react';
import styles from './ProfileModal.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import { auth } from '@/lib/api';

const Close = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function ProfileModal({ onClose, onToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await auth.me();
        setName(u.name || '');
        setEmail(u.email || '');
        setDocument(u.document || '');
        setPhone(u.phone || '');
      } catch {
        const u = auth.getUser() || {};
        setName(u.name || '');
        setEmail(u.email || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setError('');
    if (!name.trim()) return setError('Informe seu nome.');
    if (!email.trim()) return setError('Informe seu e-mail.');
    if (newPassword) {
      if (newPassword.length < 6) return setError('A nova senha precisa ter no mínimo 6 caracteres.');
      if (!currentPassword) return setError('Informe sua senha atual para trocar a senha.');
    }
    setSaving(true);
    try {
      const body = { name: name.trim(), email: email.trim(), document, phone };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const u = await auth.updateMe(body);
      auth.patchUser({ name: u.name, email: u.email });
      onToast(`Perfil atualizado${newPassword ? ' · senha alterada' : ''}.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Minha conta</p>
            <h2 className={styles.title}>Meu Perfil</h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">{Close}</button>
        </header>

        {loading ? (
          <div className={styles.body}><p className={styles.loading}>Carregando…</p></div>
        ) : (
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>CPF / CNPJ</label>
                <Input value={document} onChange={(e) => setDocument(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Telefone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className={styles.divider}>
              <span>Trocar senha</span>
            </div>
            <p className={styles.hint}>Deixe em branco para manter a senha atual.</p>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Senha atual</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nova senha</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
              </div>
            </div>
            {newPassword && <PasswordStrength value={newPassword} />}

            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}

        <footer className={styles.foot}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={save} loading={saving} disabled={loading}>Salvar</Button>
        </footer>
      </div>
    </div>
  );
}
