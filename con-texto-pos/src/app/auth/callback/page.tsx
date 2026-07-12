'use client';

import './callback.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/core/supabase/client';

/**
 * Supabase redirige aquí con el hash: #access_token=...&type=invite|recovery|...
 * Este componente cliente lee el hash, establece la sesión y redirige según el tipo.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Leer el tipo desde el hash inmediatamente por si Supabase lo limpia después
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const tipo = hashParams.get('type');

    const supabase = createClient();

    // onAuthStateChange captura el evento cuando Supabase procesa el hash automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) return;

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (tipo === 'invite' || tipo === 'recovery') {
            // Invitación o recuperación: el usuario debe crear/actualizar su contraseña
            router.replace('/auth/set-password');
          } else {
            router.replace('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="callback-root">
      <div className="callback-spinner" aria-label="Verificando tu cuenta..." />
      <p className="callback-text">Verificando tu acceso...</p>
    </div>
  );
}
