'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Por favor completá todos los campos.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensaje amigable sin exponer detalles técnicos
    return { error: 'Credenciales incorrectas. Verificá tu email y contraseña.' };
  }

  redirect('/');
}
