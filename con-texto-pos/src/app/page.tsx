import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  // Verificar si el usuario está autenticado
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // Si no está autenticado, redirigir al login
    redirect('/auth/login');
  }

  // Si está autenticado, redirigir al dashboard
  redirect('/dashboard');
}
