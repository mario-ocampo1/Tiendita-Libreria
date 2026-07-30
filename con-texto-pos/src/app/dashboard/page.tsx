import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';
import { getAllDashboardData } from '@/lib/supabase-queries';
import DailySummary from './components/DailySummary';
import PaymentMethods from './components/PaymentMethods';
import AttentionRequired from './components/AttentionRequired';
import QuickAccess from './components/QuickAccess';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verificar que el usuario esté autenticado
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/auth/login');
  }

  const dashboardData = await getAllDashboardData();

  const fechaHoyFormatted = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a237e]">Resumen del día</h1>
          <p className="text-gray-600 mt-1 capitalize">
            {fechaHoyFormatted} · un vistazo a tu comercio
          </p>
        </div>
        <div
          className={`flex items-center gap-2 border rounded-full px-4 py-2 ${
            dashboardData.isCajaOpen
              ? 'bg-[#e8eaf6] border-[#d0d5eb] text-[#1a237e]'
              : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dashboardData.isCajaOpen ? 'bg-[#1a237e]' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm font-medium">
            {dashboardData.isCajaOpen ? 'Caja abierta' : 'Caja cerrada'}
          </span>
        </div>
      </div>

      {/* Resumen diario */}
      <DailySummary
        totalSales={dashboardData.totalSales}
        confirmedSales={dashboardData.confirmedSales}
        averageTicket={dashboardData.averageTicket}
        estimatedProfit={dashboardData.estimatedProfit}
        profitMargin={dashboardData.profitMargin}
      />

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Cobros por método */}
        <div className="lg:col-span-1">
          <PaymentMethods
            methods={dashboardData.paymentMethods}
            totalCollected={dashboardData.totalSales}
          />
        </div>

        {/* Columna derecha - Atención requerida y accesos rápidos */}
        <div className="lg:col-span-2 space-y-6">
          <AttentionRequired alerts={dashboardData.alerts} />
          <QuickAccess />
        </div>
      </div>
    </div>
  );
}

