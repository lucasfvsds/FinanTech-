import React, { useState, useEffect } from 'react';
import { Plus, HelpCircle, AlertCircle, Calendar, Save } from 'lucide-react';
import { 
  FinancialItem, 
  TransactionType, 
  InstallmentInfo,
  Category
} from '../types';

interface TransactionFormProps {
  categories: Category[];
  onAddTransactions: (items: Omit<FinancialItem, 'id' | 'createdAt'>[]) => void;
}

export default function TransactionForm({ categories, onAddTransactions }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('saida');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
  // Installments variables
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState<number>(2);
  const [startInstallment, setStartInstallment] = useState<number>(1);
  const [installmentType, setInstallmentType] = useState<'total' | 'each'>('total');

  const handleInstallmentCountChange = (value: number) => {
    const count = Math.max(1, value);
    setInstallmentCount(count);
    if (startInstallment > count) {
      setStartInstallment(count);
    }
  };

  const handleStartInstallmentChange = (value: number) => {
    const start = Math.max(1, value);
    setStartInstallment(start);
    if (start > installmentCount) {
      setInstallmentCount(start);
    }
  };

  const typeCategories = categories.filter((cat) => cat.type === type);

  // Set default category on type change and set default date (today)
  useEffect(() => {
    if (typeCategories.length > 0) {
      setCategory(typeCategories[0].name);
    } else {
      setCategory('');
    }
  }, [type, categories]);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount === '' || amount <= 0 || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const itemsToCreate: Omit<FinancialItem, 'id' | 'createdAt'>[] = [];
    const baseDate = new Date(dueDate + 'T12:00:00'); // set mid-day to avoid timezone offset shifts

    if (isInstallment && installmentCount >= 1) {
      const gId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
      
      const parsedAmount = Number(amount);
      const valuePerInstallment = installmentType === 'total' 
        ? Number((parsedAmount / installmentCount).toFixed(2))
        : parsedAmount;

      for (let i = startInstallment; i <= installmentCount; i++) {
        // Calculate due date for consecutive months starting from the selected month
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + (i - startInstallment));
        
        const yyyy = nextDate.getFullYear();
        const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
        const dd = String(nextDate.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const installmentInfo: InstallmentInfo = {
          current: i,
          total: installmentCount,
          groupId: gId
        };

        // If it's the current selected installment, keep the user-specified paid status, others default to unpaid
        const installmentPaid = i === startInstallment ? isPaid : false;

        itemsToCreate.push({
          name: `${name.trim()} (${i}/${installmentCount})`,
          type,
          amount: valuePerInstallment,
          category,
          dueDate: formattedDate,
          isPaid: installmentPaid,
          installments: installmentInfo
        });
      }
    } else {
      // Single transaction
      itemsToCreate.push({
        name: name.trim(),
        type,
        amount: Number(amount),
        category,
        dueDate,
        isPaid,
        installments: null
      });
    }

    onAddTransactions(itemsToCreate);

    // Reset Form
    setName('');
    setAmount('');
    setIsPaid(false);
    setIsInstallment(false);
    setInstallmentCount(2);
    setStartInstallment(1);
    setInstallmentType('total');
    
    // Reset date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);

    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden" id="financial-form-container">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-display">Adicionar Transação</h2>
          <p className="text-xs text-slate-500">Registre suas receitas, despesas fixas ou parceladas</p>
        </div>
        <button
          id="toggle-form-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isOpen 
            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-600/10'
          }`}
        >
          <Plus size={15} className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
          {isOpen ? 'Fechar Formulário' : 'Nova Transação'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-6 space-y-5 animate-fade-in" id="add-transaction-form">
          {/* Nature Indicator Selector */}
          <div className="grid grid-cols-2 gap-3" id="trans-type-selector">
            <button
              type="button"
              id="type-saida"
              onClick={() => setType('saida')}
              className={`py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all ${
                type === 'saida'
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-rose-500 ${type === 'saida' ? 'animate-pulse' : ''}`}></span>
              Saída (Despesa)
            </button>
            <button
              type="button"
              id="type-entrada"
              onClick={() => setType('entrada')}
              className={`py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all ${
                type === 'entrada'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ${type === 'entrada' ? 'animate-pulse' : ''}`}></span>
              Entrada (Receita)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tx-name" className="text-xs font-semibold text-slate-700">Descrição / Nome da Conta *</label>
              <input
                id="tx-name"
                type="text"
                required
                placeholder={type === 'saida' ? 'Ex: Conta de Luz, Supermercado, Aluguel' : 'Ex: Salário Mensal, Trabalho Extra'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-850 text-sm bg-white text-slate-950 font-medium"
              />
            </div>

            {/* Value */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-700">Valor * (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-850 text-sm font-mono bg-white text-slate-950 font-bold"
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tx-category" className="text-xs font-semibold text-slate-700">Categoria</label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-850 text-sm bg-white text-slate-950 font-medium"
              >
                {typeCategories.map((cat) => (
                  <option key={cat.id} value={cat.name} className="text-slate-950 bg-white">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5 animate-relative">
              <label htmlFor="tx-due-date" className="text-xs font-semibold text-slate-700">Data de Vencimento *</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="tx-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-850 text-sm bg-white text-slate-950 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Installment Controls Section */}
          <div className="pt-2 border-t border-dashed border-slate-100">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <input
                  id="tx-is-installment"
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-sm border-slate-300 text-slate-950 focus:ring-slate-900/20"
                />
                <label htmlFor="tx-is-installment" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Dividir esta conta em Parcelas
                </label>
              </div>
              <span className="text-[10px] text-slate-400 italic">Ideal para compras no cartão de crédito</span>
            </div>

            {isInstallment && (
              <div className="bg-slate-50 rounded-xl p-4 mt-2 border border-slate-150 space-y-3.5 dynamic-slide-down">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current installment number */}
                  <div className="flex flex-col gap-1 bg-slate-100/40 p-2.5 rounded-lg border border-slate-200/50">
                    <label htmlFor="tx-start-installment" className="text-xs font-bold text-slate-800">Qual é a parcela deste mês? *</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-slate-500 font-medium">Parcela</span>
                      <input
                        id="tx-start-installment"
                        type="number"
                        min="1"
                        max={installmentCount}
                        value={startInstallment}
                        onChange={(e) => handleStartInstallmentChange(parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 rounded border border-slate-250 focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-xs font-semibold text-center text-slate-950 bg-white"
                      />
                    </div>
                  </div>

                  {/* Total Installments */}
                  <div className="flex flex-col gap-1 bg-slate-100/40 p-2.5 rounded-lg border border-slate-200/50">
                    <label htmlFor="tx-installment-count" className="text-xs font-bold text-slate-800">Total de parcelas contratadas *</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-slate-500 font-medium">De</span>
                      <input
                        id="tx-installment-count"
                        type="number"
                        min="1"
                        max="72"
                        value={installmentCount}
                        onChange={(e) => handleInstallmentCountChange(parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 rounded border border-slate-250 focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-xs font-semibold text-center text-slate-950 bg-white"
                      />
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex flex-col gap-1 bg-slate-100/40 p-2.5 rounded-lg border border-slate-200/50">
                    <label className="text-xs font-bold text-slate-800">Tipo de Parcelamento</label>
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setInstallmentType('total')}
                        className={`flex-1 py-1.5 px-1 rounded text-[10px] font-bold border transition-all ${
                          installmentType === 'total'
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallmentType('each')}
                        className={`flex-1 py-1.5 px-1 rounded text-[10px] font-bold border transition-all ${
                          installmentType === 'each'
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Unitário
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview Math */}
                {amount !== '' && amount > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5 text-teal-600 font-bold">
                      <AlertCircle size={14} />
                      <span>Simulação de Registro:</span>
                    </div>
                    <div className="text-slate-600 text-[11px] leading-relaxed">
                      <div>
                        {installmentType === 'total' ? (
                          <span>Cada parcela custará <strong className="text-slate-950 font-bold">R$ {(Number(amount) / installmentCount).toFixed(2)}</strong> (Total R$ {Number(amount).toFixed(2)})</span>
                        ) : (
                          <span>Cada parcela custará <strong className="text-slate-950 font-bold">R$ {Number(amount).toFixed(2)}</strong> (Total R$ {(Number(amount) * installmentCount).toFixed(2)})</span>
                        )}
                      </div>
                      <div className="mt-2 font-semibold text-slate-700 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/40">
                        O sistema registrará as parcelas consecutivamente no seu fluxo financeiro:
                        <ul className="list-disc pl-4 mt-1 font-medium space-y-0.5 text-teal-950">
                          <li>Mês selecionado ({dueDate}): Parcela <strong className="font-bold">{startInstallment} de {installmentCount}</strong></li>
                          {installmentCount > startInstallment && (
                            <li>Seguintes até Parcela <strong className="font-bold">{installmentCount} de {installmentCount}</strong></li>
                          )}
                        </ul>
                        <span className="block mt-1 text-[10px] text-teal-600 font-semibold">Totalizadores cadastrarão {installmentCount - startInstallment + 1} parcelas futuras restantes</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paid / Unpaid Status */}
          <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 border border-slate-150" id="payment-status-wrapper">
            <div className="flex items-center gap-2">
              <input
                id="tx-is-paid"
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4.5 h-4.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
              />
              <label htmlFor="tx-is-paid" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                {type === 'entrada' ? 'Marcar como Recebido' : 'Marcar como Já Pago'}
              </label>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {isPaid 
                ? (type === 'entrada' ? 'Confirmado' : 'Pago') 
                : (type === 'entrada' ? 'Pendente' : 'Em Aberto')
              }
            </span>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 justify-end pt-2" id="form-actions">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Lançamento
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
