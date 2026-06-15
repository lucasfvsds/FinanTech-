import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Filter, 
  Calendar,
  Layers,
  Check,
  X,
  AlertTriangle,
  Pencil,
  Save
} from 'lucide-react';
import { FinancialItem, TransactionType, Category } from '../types';

interface TransactionListProps {
  items: FinancialItem[];
  categories: Category[];
  onTogglePaid: (id: string) => void;
  onDeleteItem: (id: string, deleteGroupOption?: 'only' | 'remaining' | 'all') => void;
  onUpdateItem: (id: string, updatedFields: Partial<FinancialItem>, editGroupOption?: 'only' | 'all') => void;
  activeMonth?: string;
}

export default function TransactionList({ items, categories, onTogglePaid, onDeleteItem, onUpdateItem, activeMonth }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pago' | 'pendente'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(activeMonth || 'all'); // format YYYY-MM

  // Sync month filter state whenever activeMonth prop changes
  useEffect(() => {
    if (activeMonth) {
      setMonthFilter(activeMonth);
    }
  }, [activeMonth]);
  
  // Deletion modal states
  const [itemToDelete, setItemToDelete] = useState<FinancialItem | null>(null);

  // Editing states
  const [itemToEdit, setItemToEdit] = useState<FinancialItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<TransactionType>('saida');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editGroupOption, setEditGroupOption] = useState<'only' | 'all'>('only');

  const handleEditClick = (item: FinancialItem) => {
    setItemToEdit(item);
    setEditName(item.name);
    setEditType(item.type);
    setEditAmount(item.amount);
    setEditCategory(item.category);
    setEditDueDate(item.dueDate);
    setEditIsPaid(item.isPaid);
    setEditGroupOption('only');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    onUpdateItem(itemToEdit.id, {
      name: editName,
      type: editType,
      amount: editAmount,
      category: editCategory,
      dueDate: editDueDate,
      isPaid: editIsPaid
    }, editGroupOption);

    setItemToEdit(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // dateStr comes in YYYY-MM-DD format
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isOverdue = (dateStr: string, isPaid: boolean) => {
    if (isPaid) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr + 'T23:59:59');
    return dueDate < today;
  };

  // Get distinct months/years from transactions for filter options
  const monthOptions = Array.from(
    new Set(
      items.map(item => {
        if (!item.dueDate) return '';
        return item.dueDate.substring(0, 7); // "YYYY-MM"
      }).filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort desc (recent months first)

  const monthNames: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };

  const formatMonthOptionLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${monthNames[month] || month} de ${year}`;
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pago' && item.isPaid) || 
                          (statusFilter === 'pendente' && !item.isPaid);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesMonth = monthFilter === 'all' || (item.dueDate && item.dueDate.startsWith(monthFilter));

    return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesMonth;
  });

  // Grouping installments if selected
  const [groupInstallments, setGroupInstallments] = useState(true);

  const displayedItems = React.useMemo(() => {
    if (!groupInstallments) {
      return filteredItems;
    }

    const nonGrouped: FinancialItem[] = [];
    const groupedByGid = new Map<string, FinancialItem[]>();

    for (const item of filteredItems) {
      if (item.installments?.groupId) {
        const gid = item.installments.groupId;
        if (!groupedByGid.has(gid)) {
          groupedByGid.set(gid, []);
        }
        groupedByGid.get(gid)!.push(item);
      } else {
        nonGrouped.push(item);
      }
    }

    const representatives: FinancialItem[] = [];

    for (const [gid, groupList] of groupedByGid.entries()) {
      // Sort items by current installment number ascending
      const sortedGroup = [...groupList].sort(
        (a, b) => (a.installments?.current || 0) - (b.installments?.current || 0)
      );

      // Find the first unpaid installment in chronological order
      let rep = sortedGroup.find(i => !i.isPaid);
      // If none is unpaid (all are paid), show the last paid one (highest index)
      if (!rep) {
        rep = sortedGroup[sortedGroup.length - 1];
      }

      if (rep) {
        representatives.push(rep);
      }
    }

    const merged = [...nonGrouped, ...representatives];
    
    // Sort merged back by due date ascending
    return merged.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredItems, groupInstallments]);

  // Calculate stats of current filtered selection
  const filteredTotalValue = displayedItems.reduce((acc, item) => {
    return item.type === 'entrada' ? acc + item.amount : acc - item.amount;
  }, 0);

  // Group deleting orchestrator
  const handleDeleteClick = (item: FinancialItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteGroup = (option?: 'only' | 'remaining' | 'all') => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id, option);
      setItemToDelete(null);
    }
  };

  const categoriesToRender = Array.from(
    new Set(
      categories
        .filter(cat => typeFilter === 'all' || cat.type === typeFilter)
        .map(cat => cat.name)
    )
  );

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden mt-6" id="transaction-list-container">
      {/* Search and Filters Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              Lançamentos Financeiros
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {displayedItems.length} {displayedItems.length === 1 ? 'conta' : 'contas'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Acompanhe vencimentos, parcelas e pagamentos</p>
            
            <div className="flex items-center gap-2 mt-2" id="toggle-group-wrapper">
              <input
                id="toggle-group-installments"
                type="checkbox"
                checked={groupInstallments}
                onChange={(e) => setGroupInstallments(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="toggle-group-installments" className="text-xs text-slate-600 font-semibold cursor-pointer select-none flex items-center gap-2">
                <span>Agrupar faturas parceladas</span>
                <span className="text-[10px] text-teal-600 font-bold bg-teal-50/50 border border-teal-500/20 rounded px-1.5 py-0.5">Mostrando apenas a parcela atual em aberto</span>
              </label>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar em descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 bg-white"
            />
          </div>
        </div>

        {/* Filter Badges Row & Combos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* Filter: Type */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tipo</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCategoryFilter('all'); // reset category when type changes
              }}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950"
            >
              <option value="all">Todos os fluxos</option>
              <option value="entrada">Apenas Entradas</option>
              <option value="saida">Apenas Saídas</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950"
            >
              <option value="all">Todas as situações</option>
              <option value="pago">Pago / Recebido</option>
              <option value="pendente">Aberto / Pendente</option>
            </select>
          </div>

          {/* Filter: Category */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categorias</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950"
            >
              <option value="all">Todas categorias</option>
              {categoriesToRender.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filter: Month/Year */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mês de vencimento</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950"
            >
              <option value="all">Todos os meses</option>
              {monthOptions.map(ym => (
                <option key={ym} value={ym}>{formatMonthOptionLabel(ym)}</option>
              ))}
            </select>
          </div>

          {/* Balanced Stats indicator in header */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-100/60 p-2 rounded-lg flex items-center justify-between lg:flex-col lg:justify-center lg:items-start">
            <span className="text-[10px] font-semibold text-slate-500">Total Filtrado</span>
            <span className={`text-sm font-bold font-mono ${filteredTotalValue >= 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
              {formatCurrency(filteredTotalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto w-full">
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Layers size={36} className="text-slate-300 stroke-1" />
            <p className="text-sm">Nenhum lançamento encontrado para os filtros atuais.</p>
            <p className="text-xs text-slate-400">Tente buscar por termos diferentes ou adicione uma nova conta.</p>
          </div>
        ) : (
          <table className="w-full border-collapse align-middle" id="transactions-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/12 text-center">Situação</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-4/12">Nome da Conta / Descrição</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Categoria</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12 text-right">Vencimento</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12 text-right">Valor</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedItems.map((item) => {
                const isItemOverdue = isOverdue(item.dueDate, item.isPaid);
                const catObj = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase() && c.type === item.type);
                const categoryColor = catObj ? catObj.color : '#cbd5e1';

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      item.isPaid ? 'opacity-70' : ''
                    } ${isItemOverdue ? 'bg-red-50/30 hover:bg-red-50/50' : ''}`}
                    id={`row-${item.id}`}
                  >
                    {/* Paid checkbox button */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => onTogglePaid(item.id)}
                        className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${
                          item.isPaid
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isItemOverdue
                              ? 'border-rose-450 hover:bg-rose-50 text-rose-600'
                              : 'border-slate-300 hover:border-slate-500 text-slate-300 hover:text-slate-500'
                        }`}
                        title={item.isPaid ? 'Marca como pendente' : 'Marcar como pago'}
                      >
                        {item.isPaid ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isItemOverdue ? 'bg-rose-500' : 'bg-transparent'}`}></div>
                        )}
                      </button>
                    </td>

                    {/* Account Name & Installment indicators */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-semibold text-slate-900 ${item.isPaid ? 'line-through text-slate-400' : ''}`}>
                          {item.name}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Installments tag */}
                          {item.installments && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                              Parcela {item.installments.current}/{item.installments.total}
                            </span>
                          )}

                          {/* Overdue alert badge */}
                          {isItemOverdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-200 text-rose-700 font-bold px-1.5 py-0.5 rounded animate-pulse">
                              <AlertTriangle size={10} /> ATENÇÃO: Atrasado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors shrink-0"
                        style={{ 
                          backgroundColor: `${categoryColor}15`, 
                          color: categoryColor, 
                          borderColor: `${categoryColor}35` 
                        }}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Due Date Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className={`text-xs font-mono font-medium ${
                        isItemOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                      }`}>
                        {formatDate(item.dueDate)}
                      </div>
                    </td>

                    {/* Value Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`font-mono font-bold text-sm ${
                        item.type === 'entrada' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {item.type === 'entrada' ? '+' : '-'} {formatCurrency(item.amount)}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 px-2 rounded-lg text-slate-400 hover:text-teal-650 hover:bg-teal-50 bg-transparent transition-all border border-transparent hover:border-teal-100"
                          title="Editar lançamento"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1 px-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-transparent transition-all border border-transparent hover:border-rose-100"
                          title="Deletar conta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Deletion dialog Modal for both simple and installment items */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-in text-slate-100">
            {itemToDelete.installments ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-display">Como deseja remover as parcelas?</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      O lançamento <strong className="text-slate-200">"{itemToDelete.name}"</strong> faz parte de um conjunto de parcelas. Escolha abaixo a melhor opção de exclusão:
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 font-sans">
                  <button
                    onClick={() => confirmDeleteGroup('only')}
                    className="w-full text-left py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                  >
                    🔴 Deletar <strong className="text-rose-450 font-bold">Apenas esta parcela</strong> e manter as outras
                  </button>
                  
                  <button
                    onClick={() => confirmDeleteGroup('remaining')}
                    className="w-full text-left py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                  >
                    ⏩ Deletar esta parcela e <strong className="font-bold text-slate-200">todas as seguintes</strong> deste plano
                  </button>

                  <button
                    onClick={() => confirmDeleteGroup('all')}
                    className="w-full text-left py-3 px-4 rounded-xl border border-rose-500/10 bg-rose-950/15 hover:bg-rose-950/30 text-rose-300 hover:text-rose-200 transition-all text-xs font-semibold cursor-pointer"
                  >
                    💥 Deletar <strong className="font-bold text-rose-450">todas as parcelas agrupadas</strong> desta compra
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-display">Confirmar Exclusão</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tem certeza que deseja remover permanentemente o lançamento <strong className="text-slate-200">"{itemToDelete.name}"</strong> no valor de <strong className="text-teal-300">{formatCurrency(itemToDelete.amount)}</strong>?
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">Esta ação é irreversível.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-750 text-slate-300 rounded-xl hover:bg-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => confirmDeleteGroup()}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-750 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Edit transaction modal dialogue */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-in text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Pencil size={18} className="text-teal-400" />
                Editar Lançamento
              </h4>
              <button 
                type="button" 
                onClick={() => setItemToEdit(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Name description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-350">Descrição / Nome do lançamento</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-350">Tipo de Fluxo</label>
                  <select
                    value={editType}
                    onChange={(e) => {
                      const newType = e.target.value as TransactionType;
                      setEditType(newType);
                      // Auto pick first category available for this type
                      const typeCats = categories.filter(c => c.type === newType);
                      if (typeCats.length > 0) {
                        setEditCategory(typeCats[0].name);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-200 text-xs font-semibold"
                  >
                    <option value="entrada">📈 Entrada (Receita)</option>
                    <option value="saida">📉 Saída (Despesa)</option>
                  </select>
                </div>

                {/* Amount input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-350">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-200 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-350">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-200 text-xs font-semibold"
                  >
                    {categories.filter(c => c.type === editType).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.filter(c => c.type === editType).length === 0 && (
                      <option value="Outros">Outros</option>
                    )}
                  </select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-350">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-250 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Status Paid/Unpaid toggle */}
              <div className="pt-2 flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-250">Situação de Pagamento</span>
                  <span className="text-[10px] text-slate-450">Marque se a conta já foi devidamente {editType === 'entrada' ? 'recebida' : 'paga'}.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPaid(!editIsPaid)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide border transition-all duration-300 cursor-pointer ${
                    editIsPaid
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {editIsPaid ? 'PAGO / RECEBIDO' : 'EM ABERTO'}
                </button>
              </div>

              {/* Installment options structure */}
              {itemToEdit.installments && (
                <div className="bg-slate-950/85 p-3.5 rounded-2xl border border-teal-500/20 space-y-2 mt-2">
                  <div className="flex items-start gap-2 text-teal-400">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200">Lançamento Parcelado Detectado</span>
                      <p className="text-[10px] text-slate-400">Esta conta faz parte de um plano parcelado (Parcela {itemToEdit.installments.current} de {itemToEdit.installments.total}). Escolha a abrangência da edição:</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                    <button
                      type="button"
                      onClick={() => setEditGroupOption('only')}
                      className={`text-left p-2.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                        editGroupOption === 'only'
                          ? 'bg-teal-600/15 border-teal-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🎯 <strong className="font-bold">Alterar apenas esta parcela específica</strong> (Parcela {itemToEdit.installments.current}/{itemToEdit.installments.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGroupOption('all')}
                      className={`text-left p-2.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                        editGroupOption === 'all'
                          ? 'bg-teal-600/15 border-teal-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔗 <strong className="font-bold">Aplicar alterações a todas as parcelas do plano</strong> (Valor, Categoria e Prefixo do Nome)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-755 text-slate-300 rounded-xl hover:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
