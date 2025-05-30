export interface DashboardStats {
  balance: number;
  income: number;
  savings: number;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    spent: number;
    startDate: string;
    endDate: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expenditure';
}
export interface Reminder {
  id: string;
  title: string;
  subtitle?: string;
  highlight: boolean;
  isAI: boolean;
  amount?: number;
  description?: string;
  category?: string;
  dueDate?: string;
  icon?: string;
  type?: 'income' | 'expenditure';
}