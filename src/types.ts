export type TransactionType = 'entrada' | 'saida';

export interface InstallmentInfo {
  current: number;
  total: number;
  groupId: string; // To link installments from the same purchase together
}

export interface FinancialItem {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  category: string;
  dueDate: string; // ISO string YYYY-MM-DD
  isPaid: boolean;
  installments: InstallmentInfo | null;
  notes?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  pendingExpense: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  isCustom?: boolean;
}

export const INITIAL_CATEGORIES: Category[] = [
  // Entradas (Receitas)
  { id: 'cat-salario', name: 'Salário', type: 'entrada', color: '#10b981' },
  { id: 'cat-investimentos', name: 'Investimentos', type: 'entrada', color: '#06b6d4' },
  { id: 'cat-freelance', name: 'Freelance', type: 'entrada', color: '#8b5cf6' },
  { id: 'cat-vendas', name: 'Vendas', type: 'entrada', color: '#f59e0b' },
  { id: 'cat-presente', name: 'Presente', type: 'entrada', color: '#ec4899' },
  { id: 'cat-outros', name: 'Outros', type: 'entrada', color: '#64748b' },
  // Saídas (Despesas)
  { id: 'cat-moradia', name: 'Moradia', type: 'saida', color: '#f43f5e' },
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'saida', color: '#f97316' },
  { id: 'cat-transporte', name: 'Transporte', type: 'saida', color: '#3b82f6' },
  { id: 'cat-saude', name: 'Saúde', type: 'saida', color: '#14b8a6' },
  { id: 'cat-educacao', name: 'Educação', type: 'saida', color: '#6366f1' },
  { id: 'cat-lazer', name: 'Lazer', type: 'saida', color: '#ff007f' },
  { id: 'cat-cartao', name: 'Fatura Cartão', type: 'saida', color: '#475569' },
  { id: 'cat-assinaturas', name: 'Assinaturas', type: 'saida', color: '#a855f7' },
  { id: 'cat-outros-sai', name: 'Outros', type: 'saida', color: '#94a3b8' },
];

export const CATEGORIES_ENTRADA = [
  'Salário',
  'Investimentos',
  'Freelance',
  'Vendas',
  'Presente',
  'Outros'
];

export const CATEGORIES_SAIDA = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Fatura Cartão',
  'Assinaturas',
  'Outros'
];

export const CATEGORY_COLORS: Record<string, string> = {
  // Entradas
  'Salário': '#10b981', // green-500
  'Investimentos': '#06b6d4', // cyan-500
  'Freelance': '#8b5cf6', // violet-500
  'Vendas': '#f59e0b', // amber-500
  'Presente': '#ec4899', // pink-500
  // Saídas
  'Moradia': '#f43f5e', // rose-500
  'Alimentação': '#f97316', // orange-550
  'Transporte': '#3b82f6', // blue-550
  'Saúde': '#14b8a6', // teal-550
  'Educação': '#6366f1', // indigo-550
  'Lazer': '#ff007f', // deep pink
  'Fatura Cartão': '#64748b', // slate-550
  'Assinaturas': '#a855f7', // purple-550
  'Outros': '#94a3b8', // slate-450
};
