import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { FinancialSummary } from '../types';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isPositive = summary.totalBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="summary-section">
      {/* Saldo Total */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-32">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Geral</span>
          <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Wallet size={18} />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold font-mono tracking-tight ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(summary.totalBalance)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            Receitas menos despesas registradas
          </p>
        </div>
        {/* Subtle decorative background glow */}
        <div className={`absolute -right-4 -bottom-4 w-12 h-12 rounded-full opacity-5 blur-xl ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      </div>

      {/* Receitas (Entradas) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-32">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Entradas</span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>Ativo & parcelas recebidas</span>
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-emerald-500 opacity-[0.03] blur-xl"></div>
      </div>

      {/* Despesas Gerais (Saídas) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-32">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Saídas</span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Pago ou agendado no período
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-rose-500 opacity-[0.03] blur-xl"></div>
      </div>

      {/* Despesas Pendentes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between h-32">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Despesas Pendentes</span>
          <div className={`p-2 rounded-xl ${summary.pendingExpense > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertCircle size={18} />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold font-mono tracking-tight ${summary.pendingExpense > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
            {formatCurrency(summary.pendingExpense)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            {summary.pendingExpense > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-700 font-medium">Contas em aberto a pagar</span>
              </>
            ) : (
              'Nenhuma conta em aberto'
            )}
          </p>
        </div>
        <div className={`absolute -right-4 -bottom-4 w-12 h-12 rounded-full opacity-[0.04] blur-xl ${summary.pendingExpense > 0 ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
      </div>
    </div>
  );
}
