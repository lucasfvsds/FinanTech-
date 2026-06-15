import React from 'react';
import { FinancialItem, TransactionType, Category } from '../types';
import { PieChart, TrendingUp, Presentation, AlertCircle } from 'lucide-react';

interface FinanceChartsProps {
  items: FinancialItem[];
  categories: Category[];
}

export default function FinanceCharts({ items, categories }: FinanceChartsProps) {
  // 1. Calculate Expenses by category
  const expenses = items.filter(item => item.type === 'saida');
  const incomes = items.filter(item => item.type === 'entrada');

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomeAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Group expenses by category
  const expenseByCategoryMap: Record<string, number> = {};
  expenses.forEach(item => {
    expenseByCategoryMap[item.category] = (expenseByCategoryMap[item.category] || 0) + item.amount;
  });

  const categoryExpenses = Object.keys(expenseByCategoryMap).map(category => {
    const catObj = categories.find(c => c.name.toLowerCase() === category.toLowerCase() && c.type === 'saida');
    return {
      name: category,
      value: expenseByCategoryMap[category],
      percentage: totalExpenseAmount > 0 
        ? Math.round((expenseByCategoryMap[category] / totalExpenseAmount) * 100)
        : 0,
      color: catObj ? catObj.color : '#94a3b8'
    };
  }).sort((a, b) => b.value - a.value);

  // Group incomes by category
  const incomeByCategoryMap: Record<string, number> = {};
  incomes.forEach(item => {
    incomeByCategoryMap[item.category] = (incomeByCategoryMap[item.category] || 0) + item.amount;
  });

  const categoryIncomes = Object.keys(incomeByCategoryMap).map(category => {
    const catObj = categories.find(c => c.name.toLowerCase() === category.toLowerCase() && c.type === 'entrada');
    return {
      name: category,
      value: incomeByCategoryMap[category],
      percentage: totalIncomeAmount > 0
        ? Math.round((incomeByCategoryMap[category] / totalIncomeAmount) * 100)
        : 0,
      color: catObj ? catObj.color : '#10b981'
    };
  }).sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Helper calculation for beautiful interactive donut charts
  let cumulativePercentage = 0;
  const donutSegments = categoryExpenses.map(cat => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += cat.percentage;
    return {
      ...cat,
      startPercentage,
      endPercentage: cumulativePercentage
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-dashboard">
      
      {/* Chart: Expenses Distribution by Category */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between" id="expenses-category-chart">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
            <PieChart size={16} className="text-rose-500" />
            Distribuição de Despesas (Saídas)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Total Despendido: <strong className="text-rose-600 font-bold font-mono text-xs">{formatCurrency(totalExpenseAmount)}</strong>
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
            <AlertCircle size={24} className="text-slate-300 stroke-1" />
            <span>Nenhuma despesa para exibir no gráfico</span>
            <p className="text-[10px] text-slate-400">Adicione contas sob o tipo "Saída" para gerar tendências.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            {/* Custom SVG Solid Pie Chart Component */}
            <div className="flex justify-center relative">
              <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                {donutSegments.map((segment, index) => {
                  // Pie radius is 25 (diameter 50) and strokeWidth is 50, filling from center cx=50, cy=50 all the way to r=50
                  const r = 25;
                  const c = 2 * Math.PI * r;
                  const dashArray = `${(segment.percentage / 100) * c} ${c}`;
                  const dashOffset = `-${(segment.startPercentage / 100) * c}`;
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="50"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all hover:opacity-85 cursor-pointer origin-center hover:scale-102"
                      title={`${segment.name}: ${segment.percentage}%`}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legends & Value items */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {categoryExpenses.slice(0, 5).map((category) => (
                <div key={category.name} className="flex flex-col gap-0.5" id={`category-legend-${category.name}`}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                      <span className="text-slate-700 truncate">{category.name}</span>
                    </div>
                    <span className="font-mono text-slate-900 ml-2">{formatCurrency(category.value)}</span>
                  </div>
                  {/* Category Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[9px] font-mono text-slate-400">{category.percentage}% do total</span>
                  </div>
                </div>
              ))}
              {categoryExpenses.length > 5 && (
                <p className="text-[10px] text-slate-400 text-right italic">+ {categoryExpenses.length - 5} outras categorias</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart: Income vs Expenses Comparison Bars */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between" id="flow-comparison-chart">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
            <Presentation size={16} className="text-emerald-500" />
            Fluxo Geral: Entradas vs Saídas
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Comparação direta dos totais liquidados ou agendados</p>
        </div>

        <div className="flex-1 mt-6 flex flex-col justify-center space-y-6">
          {/* Total flow summary bars */}
          <div className="space-y-4">
            {/* Income Bar Segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Receitas Totais (Entradas)
                </span>
                <span className="text-sm font-mono font-bold text-emerald-700">
                  {formatCurrency(totalIncomeAmount)}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ 
                    width: totalIncomeAmount + totalExpenseAmount > 0 
                      ? `${(totalIncomeAmount / (totalIncomeAmount + totalExpenseAmount)) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>

            {/* Expense Bar Segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Despesas Totais (Saídas)
                </span>
                <span className="text-sm font-mono font-bold text-rose-700">
                  {formatCurrency(totalExpenseAmount)}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-700" 
                  style={{ 
                    width: totalIncomeAmount + totalExpenseAmount > 0 
                      ? `${(totalExpenseAmount / (totalIncomeAmount + totalExpenseAmount)) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Micro Analytics Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 flex items-center justify-between text-xs">
            <span className="text-slate-500">Razão de Poupança:</span>
            {totalIncomeAmount > 0 ? (
              <span className={`font-mono font-bold font-semibold ${totalIncomeAmount > totalExpenseAmount ? 'text-emerald-700' : 'text-rose-600'}`}>
                {Math.round(((totalIncomeAmount - totalExpenseAmount) / totalIncomeAmount) * 100)}% de economia
              </span>
            ) : (
              <span className="text-slate-400 italic">Preencha receitas extras</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
