'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Logo from '@/components/Logo/Logo';
import { auth, DEST_BY_ROLE } from '@/lib/api';

const Icon = {
  mail: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.3 8.3A17 17 0 0 0 2 12s3.5 6 10 6a9.6 9.6 0 0 0 3.3-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Informe e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    try {
      const data = await auth.login(email.trim(), password);
      auth.save(data);
      const role = data?.user?.role;
      router.push(DEST_BY_ROLE[role] || '/workspace');
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        setError('E-mail ou senha incorretos.');
      } else if (err.status) {
        setError(err.message);
      } else {
        setError('Servidor indisponível. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Painel cinematográfico — vídeo + frase minimalista */}
      <aside className={styles.brand}>
        <video className={styles.video} autoPlay muted loop playsInline preload="auto">
          <source src="/login-bg.mp4" type="video/mp4" />
        </video>
        <div className={styles.brandOverlay} aria-hidden="true" />

        <div className={styles.brandLogo}>
          <img src="/logo.png" alt="Variant — Mapas e Consultoria" />
        </div>

        <div className={styles.brandContent}>
          <p className={styles.brandPhrase}>Informação precisa, decisão segura.</p>
        </div>
      </aside>

      {/* Formulário */}
      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <header className={styles.formHeader}>
            <div className={styles.logoMobile}>
              <Logo size="sm" />
            </div>
            <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
            <p className={styles.formSubtitle}>
              Acesse sua conta — identificamos seu perfil automaticamente.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">E-mail</label>
              <Input
                id="email"
                type="email"
                icon={Icon.mail}
                placeholder="voce@variant.agr.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="password">Senha</label>
                <a className={styles.forgot} href="#">Esqueci a senha</a>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                icon={Icon.lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                trailing={
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? Icon.eyeOff : Icon.eye}
                  </button>
                }
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" variant="primary" loading={loading} className={styles.submit}>
              Entrar {!loading && Icon.arrow}
            </Button>
          </form>

          <p className={styles.formFooter}>
            Problemas para acessar? Fale com o seu agrônomo responsável.
          </p>
        </div>
      </section>
    </main>
  );
}
