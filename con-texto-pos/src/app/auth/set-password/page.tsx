'use client';

import './set-password.css';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { setPasswordAction, type SetPasswordState } from './actions';

const INITIAL_STATE: SetPasswordState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="login-submit-btn"
      aria-busy={pending}
    >
      {pending ? (
        <span className="btn-loading">
          <span className="spinner" aria-hidden="true" />
          Guardando...
        </span>
      ) : (
        'Crear contraseña'
      )}
    </button>
  );
}

export default function SetPasswordPage() {
  const [state, formAction] = useActionState(setPasswordAction, INITIAL_STATE);

  return (
    <div className="login-root">
      <div className="login-bg" aria-hidden="true" />

      <main className="login-card" role="main">
        <div className="login-logo-wrap">
          <Image
            src="/Logo.jpeg"
            alt="Con-Texto Chacras"
            width={180}
            height={130}
            priority
            className="login-logo"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className="login-header">
          <h1 className="login-title">Crear contraseña</h1>
          <p className="login-subtitle">Elegí una contraseña segura para tu cuenta</p>
        </div>

        <form action={formAction} className="login-form" noValidate>
          <div className="form-field">
            <label htmlFor="sp-password" className="field-label">
              Nueva contraseña
            </label>
            <input
              id="sp-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="field-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="sp-confirm" className="field-label">
              Confirmar contraseña
            </label>
            <input
              id="sp-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repetí la contraseña"
              className="field-input"
            />
          </div>

          {state.error && (
            <div className="login-error" role="alert" aria-live="polite">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </main>
    </div>
  );
}
