'use client';

import './login.css';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { loginAction, type LoginState } from './actions';

const INITIAL_STATE: LoginState = { error: null };

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
          Ingresando...
        </span>
      ) : (
        'Ingresar'
      )}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <div className="login-root">
      {/* Fondo con patrón sutil */}
      <div className="login-bg" aria-hidden="true" />

      <main className="login-card" role="main">
        {/* Logo del negocio */}
        <div className="login-logo-wrap">
          <Image
            src="/Logo.jpeg"
            alt="Con-Texto Chacras"
            width={180}
            height={130}
            priority
            className="login-logo"
            style={{ height: 'auto' }}
          />
        </div>

        <div className="login-header">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Sistema de Punto de Venta</p>
        </div>

        <form action={formAction} className="login-form" noValidate>
          <div className="form-field">
            <label htmlFor="login-email" className="field-label">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="usuario@contextochacras.com"
              className="field-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password" className="field-label">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
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

        <p className="login-footer-note">
          ¿No tenés acceso? Contactá al administrador del sistema.
        </p>
      </main>
    </div>
  );
}
