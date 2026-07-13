// Tipos para la caja del día
export interface CashRegister {
  id: string;
  userId: string;
  openedAt: Date;
  closedAt: Date | null;
  isOpen: boolean;
  initialAmount: number;
  currentBalance: number;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  timestamp: Date;
  userId: string;
  referenceId?: string;
  referenceType?: string;
}

export interface CashSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  incomeCount: number;
  expenseCount: number;
}

// Calculadores
export function calculateBalance(
  initialAmount: number,
  totalIncome: number,
  totalExpenses: number
): number {
  return initialAmount + totalIncome - totalExpenses;
}

export function calculateTotals(
  movements: CashMovement[]
): Pick<CashSummary, 'totalIncome' | 'totalExpenses' | 'incomeCount' | 'expenseCount'> {
  return {
    totalIncome: movements
      .filter((m) => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0),
    totalExpenses: movements
      .filter((m) => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0),
    incomeCount: movements.filter((m) => m.type === 'income').length,
    expenseCount: movements.filter((m) => m.type === 'expense').length,
  };
}
