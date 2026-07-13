import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';
import CashStatus from './components/CashStatus';
import CashBalance from './components/CashBalance';
import CashMovements from './components/CashMovements';
import CashActions from './components/CashActions';

// TODO: Obtener datos reales de Supabase
async function getCashData() {
  return {
    isOpen: true,
    openedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
    userName: 'Mario',
    initialAmount: 500,
    totalIncome: 2500,
    totalExpenses: 300,
    currentBalance: 2700,
    movements: [
      {
        id: '1',
        type: 'income' as const,
        description: 'Venta #001',
        amount: 250,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'Mario',
        reference: 'V001',
      },
      {
        id: '2',
        type: 'income' as const,
        description: 'Venta #002',
        amount: 1200,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'Mario',
        reference: 'V002',
      },
      {
        id: '3',
        type: 'expense' as const,
        description: 'Compra de insumos',
        amount: 300,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'Mario',
      },
      {
        id: '4',
        type: 'income' as const,
        description: 'Venta #003',
        amount: 1050,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        user: 'Mario',
        reference: 'V003',
      },
    ],
  };
}

export default async function CajaPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/auth/login');
  }

  const cashData = await getCashData();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Caja del día</h1>
        <p className="text-gray-600 mt-1">
          Gestión de efectivo y movimientos de caja
        </p>
      </div>

      {/* Estado de caja */}
      <CashStatus
        isOpen={cashData.isOpen}
        openedAt={cashData.openedAt}
        userName={cashData.userName}
      />

      {/* Balance */}
      <CashBalance
        initialAmount={cashData.initialAmount}
        totalIncome={cashData.totalIncome}
        totalExpenses={cashData.totalExpenses}
        currentBalance={cashData.currentBalance}
      />

      {/* Acciones rápidas */}
      <CashActions />

      {/* Movimientos */}
      <CashMovements movements={cashData.movements} />
    </div>
  );
}
