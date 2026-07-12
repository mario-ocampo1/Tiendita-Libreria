'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';

export interface SetPasswordState {
  error: string | null;
}

export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!password || password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'No se pudo guardar la contraseña. Intentá de nuevo.' };
  }

  redirect('/');
}
