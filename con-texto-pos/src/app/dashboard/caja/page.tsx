import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';
import { obtenerSesionAbierta, obtenerVentasDeSesion, obtenerUsuarioInterno } from './actions';
import CajaOperativa from './components/CajaOperativa';
import AbrirCaja from './components/AbrirCaja';

export default async function CajaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/auth/login');
  }

  const usuarioInterno = await obtenerUsuarioInterno(data.user.id);

  const sesion = await obtenerSesionAbierta(usuarioInterno.id);

  if (!sesion) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Caja del día</h1>
          <p className="text-gray-600 mt-1">
            No hay una caja abierta. Abrí una para empezar a vender.
          </p>
        </div>
        <AbrirCaja usuarioId={usuarioInterno.id} />
      </div>
    );
  }

  const ventas = await obtenerVentasDeSesion(sesion.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Caja del día</h1>
        <p className="text-gray-600 mt-1">Escaneá productos y registrá la venta</p>
      </div>
      <CajaOperativa
        sesion={sesion}
        usuarioId={usuarioInterno.id}
        ventasIniciales={ventas ?? []}
      />
    </div>
  );
}