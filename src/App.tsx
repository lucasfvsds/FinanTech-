import React, { useState, useEffect, useMemo } from 'react';
import { 
  FinancialItem, 
  FinancialSummary,
  Category,
  INITIAL_CATEGORIES
} from './types';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinanceCharts from './components/FinanceCharts';
import CategoryManager from './components/CategoryManager';
import { 
  PiggyBank, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Mail,
  User,
  Info,
  Clock,
  Sparkles,
  AlertCircle,
  Table,
  Home,
  Users,
  Loader2,
  Brain,
  Send,
  MessageSquare,
  Sparkle,
  Check,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'minhas_financas_items_v2';
const LOCAL_STORAGE_CATEGORIES_KEY = 'minhas_financas_categories_v2';

// Clean inline vector SVG model mimicking the provided beautiful F-arrow logo image
const FinanTechLogo = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} select-none transition-transform hover:scale-105 duration-300`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoBackground" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="60%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    
    {/* Main launcher background squircle */}
    <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#logoBackground)" />
    
    {/* Concentric rings backing/halo representing the graphic circles */}
    <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.25" fill="none" strokeDasharray="22 10" />
    <circle cx="50" cy="50" r="24" stroke="url(#neonGlow)" strokeWidth="6" fill="none" />
    <circle cx="50" cy="50" r="18" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.2" fill="none" strokeDasharray="4 6" />

    {/* The majestic flowing "F" curve that shoots off as an upward arrow */}
    <path 
      d="M 33,70 C 37,55 42,42 54,34 C 60,30 65,24 71,21" 
      stroke="#ffffff" 
      strokeWidth="5.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Arrowhead */}
    <path 
      d="M 58,21 L 72,20 L 71,34" 
      stroke="#ffffff" 
      strokeWidth="5.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Elegant 'F' loop/crossbar */}
    <path 
      d="M 31,54 L 57,54" 
      stroke="#ffffff" 
      strokeWidth="5.5" 
      strokeLinecap="round" 
    />
  </svg>
);

// Seeds based on current year and month (2026-06 as metadata indicates local time is June 15, 2026)
const getSeedTransactions = (): FinancialItem[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Format next months
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(now.getMonth() + 1);
  const nextMonthYear = nextMonthDate.getFullYear();
  const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0');

  const thirdMonthDate = new Date();
  thirdMonthDate.setMonth(now.getMonth() + 2);
  const thirdMonthYear = thirdMonthDate.getFullYear();
  const thirdMonth = String(thirdMonthDate.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'seed-income-1',
      name: 'Salário Mensal',
      type: 'entrada',
      amount: 4800.00,
      category: 'Salário',
      dueDate: `${year}-${month}-05`,
      isPaid: true,
      installments: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-income-2',
      name: 'Rendimento de Freelance',
      type: 'entrada',
      amount: 950.00,
      category: 'Freelance',
      dueDate: `${year}-${month}-18`,
      isPaid: false,
      installments: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-expense-1',
      name: 'Reserva do Aluguel',
      type: 'saida',
      amount: 1900.00,
      category: 'Moradia',
      dueDate: `${year}-${month}-10`,
      isPaid: true,
      installments: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-expense-2',
      name: 'Supermercado Mensal',
      type: 'saida',
      amount: 624.50,
      category: 'Alimentação',
      dueDate: `${year}-${month}-12`,
      isPaid: true,
      installments: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-expense-3',
      name: 'Energia / Luz',
      type: 'saida',
      amount: 185.20,
      category: 'Moradia',
      dueDate: `${year}-${month}-15`,
      isPaid: false,
      installments: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-expense-4',
      name: 'Assinaturas Digitais (Netflix/Spotify)',
      type: 'saida',
      amount: 79.90,
      category: 'Assinaturas',
      dueDate: `${year}-${month}-20`,
      isPaid: false,
      installments: null,
      createdAt: new Date().toISOString()
    },
    // Credit card installments sequence (e.g. 1/3, 2/3, 3/3)
    {
      id: 'seed-inst-1',
      name: 'Ar Condicionado (1/3)',
      type: 'saida',
      amount: 350.00,
      category: 'Moradia',
      dueDate: `${year}-${month}-25`,
      isPaid: false,
      installments: {
        current: 1,
        total: 3,
        groupId: 'seed-group-arcondicionado'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-inst-2',
      name: 'Ar Condicionado (2/3)',
      type: 'saida',
      amount: 350.00,
      category: 'Moradia',
      dueDate: `${nextMonthYear}-${nextMonth}-25`,
      isPaid: false,
      installments: {
        current: 2,
        total: 3,
        groupId: 'seed-group-arcondicionado'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-inst-3',
      name: 'Ar Condicionado (3/3)',
      type: 'saida',
      amount: 350.00,
      category: 'Moradia',
      dueDate: `${thirdMonthYear}-${thirdMonth}-25`,
      isPaid: false,
      installments: {
        current: 3,
        total: 3,
        groupId: 'seed-group-arcondicionado'
      },
      createdAt: new Date().toISOString()
    }
  ];
};

export default function App() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [greeting, setGreeting] = useState('');
  
  // Controle de Abas Ativas: 'principal' | 'planilha' | 'ai'
  const [activeTab, setActiveTab] = useState<'principal' | 'planilha' | 'ai'>('principal');

  // Controle de competência mensal YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Filtros de Planilha Excel
  const [sheetStatusFilter, setSheetStatusFilter] = useState<'all' | 'pago' | 'pendente'>('all');
  const [sheetSortBy, setSheetSortBy] = useState<'dueDate' | 'amount' | 'name'>('dueDate');

  // Estados dos relatórios & diagnóstico por Inteligência Artificial (Gemini)
  const [aiInsights, setAiInsights] = useState('');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Olá! Sou o FinanTech AI, seu assistente pessoal de inteligência financeira. Eu posso analisar seus gastos, sugerir caminhos de economia ou lançar contas automaticamente! Tente me dizer algo como "Gastei 55 reais com lazer hoje" ou pergunte "Dicas de poupança". Como posso ajudar?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [draftTransaction, setDraftTransaction] = useState<any | null>(null);

  // Custom confirmation dialog state to replace native confirm() inside sandboxed iframe
  const [appConfirmation, setAppConfirmation] = useState<{
    type: 'reset' | 'clear' | 'delete';
    item?: FinancialItem;
  } | null>(null);

  // 1. Initial Load and default seeding if empty
  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawData) {
      try {
        setItems(JSON.parse(rawData));
      } catch (e) {
        setItems(getSeedTransactions());
      }
    } else {
      setItems(getSeedTransactions());
    }

    const rawCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (rawCategories) {
      try {
        setCategories(JSON.parse(rawCategories));
      } catch (e) {
        setCategories(INITIAL_CATEGORIES);
      }
    } else {
      setCategories(INITIAL_CATEGORIES);
    }

    // Adapt personal greeting to hours
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bom dia');
    } else if (hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
  }, []);

  // 2. Persists items whenever they change
  const saveToStorage = (updatedItems: FinancialItem[]) => {
    setItems(updatedItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
  };

  const saveCategoriesToStorage = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const catWithId: Category = {
      ...newCat,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)
    };
    saveCategoriesToStorage([...categories, catWithId]);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    saveCategoriesToStorage(updated);
  };

  const handleUpdateCategoryColor = (id: string, color: string) => {
    const updated = categories.map(c => {
      if (c.id === id) {
        return { ...c, color };
      }
      return c;
    });
    saveCategoriesToStorage(updated);
  };

  // 3. Appends transaction logs
  const handleAddTransactions = (newItems: Omit<FinancialItem, 'id' | 'createdAt'>[]) => {
    const itemsWithIds: FinancialItem[] = newItems.map(item => ({
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString()
    }));

    const updated = [...items, ...itemsWithIds];
    saveToStorage(updated);
  };

  // 4. Toggle specific transaction paid state
  const handleTogglePaid = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isPaid: !item.isPaid };
      }
      return item;
    });
    saveToStorage(updated);
  };

  // 4b. Multi-purpose Item Editor with installment synchrony
  const handleUpdateItem = (
    id: string, 
    updatedFields: Partial<FinancialItem>, 
    editGroupOption?: 'only' | 'all'
  ) => {
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    let updated: FinancialItem[] = [];

    if (!targetItem.installments || !editGroupOption || editGroupOption === 'only') {
      updated = items.map(item => {
        if (item.id === id) {
          return { ...item, ...updatedFields };
        }
        return item;
      });
    } else if (editGroupOption === 'all') {
      const { groupId } = targetItem.installments;
      updated = items.map(item => {
        if (item.installments?.groupId === groupId) {
          let finalName = item.name;
          if (updatedFields.name) {
            const baseNamePattern = /\s*\(\d+\/\d+\)$/;
            const cleanNewName = updatedFields.name.replace(baseNamePattern, '');
            finalName = `${cleanNewName} (${item.installments.current}/${item.installments.total})`;
          }

          return {
            ...item,
            ...updatedFields,
            name: finalName,
            amount: updatedFields.amount !== undefined ? updatedFields.amount : item.amount,
            category: updatedFields.category ?? item.category,
            type: updatedFields.type ?? item.type,
            dueDate: item.id === id ? (updatedFields.dueDate ?? item.dueDate) : item.dueDate
          };
        }
        return item;
      });
    }

    saveToStorage(updated);
  };

  // 5. Handles deletions with installment intelligence
  const handleDeleteItem = (id: string, deleteGroupOption?: 'only' | 'remaining' | 'all') => {
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    if (!targetItem.installments || !deleteGroupOption || deleteGroupOption === 'only') {
      const updated = items.filter(item => item.id !== id);
      saveToStorage(updated);
      return;
    }

    const { groupId, current } = targetItem.installments;

    if (deleteGroupOption === 'remaining') {
      const updated = items.filter(item => {
        if (item.installments?.groupId === groupId) {
          return item.installments.current < current;
        }
        return item.id !== id;
      });
      saveToStorage(updated);
    } else if (deleteGroupOption === 'all') {
      const updated = items.filter(item => item.installments?.groupId !== groupId);
      saveToStorage(updated);
    }
  };

  // 6. Reset all transactions to factory seed state
  const handleResetData = () => {
    saveToStorage(getSeedTransactions());
    saveCategoriesToStorage(INITIAL_CATEGORIES);
  };

  // 7. Clear all ledger database logs to start 105% empty
  const handleClearAll = () => {
    saveToStorage([]);
  };

  // 8. Selected month name string calculation
  const getSelectedMonthName = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[month - 1]} de ${year}`;
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${prevYear}-${prevMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextYear}-${nextMonth}`);
  };

  // Calculate high-level financial summary belonging STRICTLY to active month
  const activeMonthTransactions = useMemo(() => {
    return items.filter(item => item.dueDate.startsWith(selectedMonth));
  }, [items, selectedMonth]);

  const summary: FinancialSummary = useMemo(() => {
    return activeMonthTransactions.reduce(
      (acc, item) => {
        if (item.type === 'entrada') {
          acc.totalIncome += item.amount;
          acc.totalBalance += item.amount;
        } else {
          acc.totalExpense += item.amount;
          acc.totalBalance -= item.amount;
          if (!item.isPaid) {
            acc.pendingExpense += item.amount;
          }
        }
        return acc;
      },
      { totalBalance: 0, totalIncome: 0, totalExpense: 0, pendingExpense: 0 }
    );
  }, [activeMonthTransactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const getDueDayHex = (dateStr: string) => {
    if (!dateStr) return '';
    const [, , day] = dateStr.split('-');
    return `Dia ${parseInt(day)}`;
  };

  const getDueMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${months[parseInt(month) - 1]} / ${year}`;
  };

  const isOverdue = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDateStr < today;
  };

  // Excel filtered spreadsheet rows
  const excelFilteredTransactions = useMemo(() => {
    return activeMonthTransactions
      .filter(t => {
        const matchesStatus = sheetStatusFilter === 'all' ||
                              (sheetStatusFilter === 'pago' && t.isPaid) ||
                              (sheetStatusFilter === 'pendente' && !t.isPaid);
        return matchesStatus;
      })
      .sort((a, b) => {
        if (sheetSortBy === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sheetSortBy === 'amount') {
          return b.amount - a.amount;
        }
        if (sheetSortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [activeMonthTransactions, sheetStatusFilter, sheetSortBy]);

  // AI Insights diagnostic submitter (Server-side model request proxy)
  const handleGenerateMonthlyInsights = async () => {
    setGeneratingInsights(true);
    setAiInsights('');
    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthName: getSelectedMonthName(),
          metrics: {
            totalIncome: summary.totalIncome,
            totalExpense: summary.totalExpense,
            totalBalance: summary.totalBalance,
            pendingExpense: summary.pendingExpense,
          },
          transactions: activeMonthTransactions,
        })
      });
      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
      } else {
        setAiInsights('Nenhum diagnóstico pôde ser computado no momento.');
      }
    } catch (e: any) {
      console.error(e);
      setAiInsights('Erro ao conectar com o servidor para gerar relatórios de IA. Verifique as credenciais.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  // Send conversation message logic
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiChatLoading(true);
    setDraftTransaction(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: aiChatHistory,
          message: userMsg,
          categories: categories,
        })
      });

      const data = await response.json();

      if (data.isTransaction && data.transaction) {
        setDraftTransaction(data.transaction);
        setAiChatHistory(prev => [...prev, {
          role: 'model',
          text: `Detectei que você deseja registrar um lançamento! Preparei o formulário de rascunho com os dados extraídos.\n\n` +
                `**Item:** ${data.transaction.title}\n` +
                `**Valor:** ${formatCurrency(data.transaction.amount)}\n` +
                `**Categoria:** ${data.transaction.category}\n` +
                `**Vencimento:** ${data.transaction.dueDate}\n\n` +
                `*Clique em "Confirmar Lançamento na Nuvem" abaixo para consolidar este registro.*`
        }]);
      } else if (data.response) {
        setAiChatHistory(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'model', text: 'Não compreendi sua solicitação conversacional.' }]);
      }
    } catch (error) {
      console.error(error);
      setAiChatHistory(prev => [...prev, { role: 'model', text: 'Ocorreu um erro ao comunicar-se com a inteligência artificial.' }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Save the proposal drafted from IA text instructions
  const saveDraftTransaction = () => {
    if (!draftTransaction) return;
    const added: Omit<FinancialItem, 'id' | 'createdAt'> = {
      name: draftTransaction.title,
      type: draftTransaction.type === 'income' ? 'entrada' : 'saida',
      amount: draftTransaction.amount,
      category: draftTransaction.category,
      dueDate: draftTransaction.dueDate,
      isPaid: false,
      installments: null,
    };
    handleAddTransactions([added]);
    setDraftTransaction(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16 antialiased relative selection:bg-teal-500 selection:text-white" id="main-app-shell">
      
      {/* HEADER PREMIUM GLASSMORPHISM */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md" id="premium-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <FinanTechLogo className="w-11 h-11 shrink-0" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent flex items-center gap-2">
                FinanTech <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Premium</span>
              </h1>
              <p className="text-xs text-slate-400">Seu controle financeiro inteligente de alta fidelidade</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* TABS SELECTOR */}
            <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('principal')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === 'principal' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/15' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Início
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('planilha')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === 'planilha' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/15' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Planilha Excel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === 'ai' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/15' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                Assistente IA
              </button>
            </nav>

            {/* Quick Demo Re-Seeder */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setAppConfirmation({ type: 'reset' })}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Restaurar dados de teste padrão"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setAppConfirmation({ type: 'clear' })}
                className="p-1.5 text-slate-400 hover:text-rose-450 rounded-lg transition-colors cursor-pointer"
                title="Apagar todos os dados"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ACTIVE PAGE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10 space-y-6">

        {/* TIME FRAME PERIOD ACTIVE SELECTOR */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-3xl flex items-center justify-between shadow-xl">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Período Ativo
            </span>
            <span className="text-base font-black text-white mt-0.5 tracking-tight">
              {getSelectedMonthName()}
            </span>
          </div>

          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* DYNAMIC METRIC CARDS FOR ACTIVE COMPETENCE MONTH */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box 1: Incomes */}
          <div className="relative overflow-hidden bg-slate-950/40 border border-slate-800/80 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/10">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Receitas do Mês
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Previsto</span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                {formatCurrency(summary.totalIncome)}
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800-pt-3 pt-3">
                Previsão de fluxo de caixa para receitas do período.
              </div>
            </div>
          </div>

          {/* Box 2: Expenses */}
          <div className="relative overflow-hidden bg-slate-950/40 border border-slate-800/80 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-rose-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-400 border border-rose-500/10">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Despesas do Mês
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Previsto</span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                {formatCurrency(summary.totalExpense)}
              </h2>
              <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span className="text-rose-400 font-bold">{formatCurrency(summary.totalExpense - summary.pendingExpense)}</span> pagos
                <span className="text-slate-700">•</span>
                <span className="text-slate-300 font-semibold">{formatCurrency(summary.pendingExpense)}</span> em aberto
              </div>
            </div>
          </div>

          {/* Box 3: Month Net Balance */}
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/15 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-teal-500/5" id="box-net-balance">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-500/15 p-3 rounded-2xl text-teal-400 border border-teal-500/10">
                <Wallet className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                summary.totalBalance >= 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {summary.totalBalance >= 0 ? 'Superávit' : 'Déficit'}
              </span>
            </div>
            <div>
              <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Equilíbrio Líquido</span>
              <h2 className={`text-2xl font-black tracking-tight mt-1 ${summary.totalBalance >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
                {formatCurrency(summary.totalBalance)}
              </h2>
              <p className="text-xs text-slate-500 mt-4 border-t border-slate-800 pt-3 leading-tight">
                Saldo final prospectado líquido para o mês ativo.
              </p>
            </div>
          </div>

        </section>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD / PRINCIPAL VIEW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'principal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in duration-300">
            {/* Column 1: Forms & Custom Categories Manager */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Wraps standard TransactionForm in custom polished dark wrapper container */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-1.5 rounded-3xl shadow-xl">
                <TransactionForm 
                  categories={categories}
                  onAddTransactions={handleAddTransactions}
                />
              </div>

              {/* Wraps standard CategoryManager in custom polished dark wrapper container */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-1.5 rounded-3xl shadow-xl">
                <CategoryManager 
                  categories={categories}
                  items={items}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateCategoryColor={handleUpdateCategoryColor}
                />
              </div>

            </div>

            {/* Column 2: Interactive SVG Distribution Graphs & Ledger Tracker */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Pie and comparative flow visualization chart */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                <div className="border-b border-teal-500/5 pb-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles size={16} className="text-teal-400" />
                    Análise Gráfica Simplificada
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visão analítica dos fluxos correspondentes do mês ativo</p>
                </div>
                
                {/* Visual SVG charts container */}
                <div className="chart-bg-theme-adjust">
                  <FinanceCharts 
                    items={activeMonthTransactions} 
                    categories={categories} 
                  />
                </div>
              </div>

              {/* Quick contextual help alert */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 items-start">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 space-y-1">
                  <h5 className="font-bold text-slate-200">Gerenciador de Competências</h5>
                  <p>
                    As transações exibidas acima nesta página são automaticamente isoladas de acordo com as datas de vencimento que pertencem ao mês atualmente focado no seletor do topo.
                  </p>
                </div>
              </div>

              {/* Transactions table ledger scroll tracking */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-2 rounded-3xl shadow-2xl">
                <TransactionList 
                  items={items} 
                  categories={categories}
                  onTogglePaid={handleTogglePaid}
                  onDeleteItem={handleDeleteItem}
                  onUpdateItem={handleUpdateItem}
                  activeMonth={selectedMonth}
                />
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: EXCEL PLANILHA VIEW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'planilha' && (
          <div className="bg-slate-950/30 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl animate-fade-in duration-300">
            
            {/* Table Control Banner Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Table className="w-5 h-5 text-teal-400" />
                  Planilha de Lançamentos Tabular (Estilo Excel)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Grade de dados estruturada com controles dinâmicos de filtros e critérios de classificação inteligente.</p>
              </div>

              {/* Dynamic spreadsheet filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Situação</span>
                  <select
                    value={sheetStatusFilter}
                    onChange={(e) => setSheetStatusFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs px-3 py-2 outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="all">Todas as parcelas</option>
                    <option value="pago">Pagas / Recebidas</option>
                    <option value="pendente">Abertas / Pendentes</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Critério Ordenar</span>
                  <select
                    value={sheetSortBy}
                    onChange={(e) => setSheetSortBy(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs px-3 py-2 outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="dueDate">Dia do Vencimento</option>
                    <option value="amount">Maior Valor</option>
                    <option value="name">Alfabético</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Structured Row Columns Grade */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse align-middle">
                <thead>
                  <tr className="bg-slate-950/75 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                    <th className="px-6 py-4 border-r border-slate-900 w-32 text-center">Data Vencimento</th>
                    <th className="px-6 py-4 border-r border-slate-900 w-40 text-center">Competência</th>
                    <th className="px-6 py-4 border-r border-slate-900">Descrição do Lançamento</th>
                    <th className="px-6 py-4 border-r border-slate-900">Marcador / Categoria</th>
                    <th className="px-6 py-4 border-r border-slate-900 text-right">Valor Líquido</th>
                    <th className="px-6 py-4 border-r border-slate-900 text-center">Parcelado</th>
                    <th className="px-6 py-4 border-r border-slate-900 text-center font-bold">Status</th>
                    <th className="px-6 py-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-350 divide-y divide-slate-900/40">
                  {excelFilteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium">
                        Nenhum registro de conta catalogado coincide com os filtros ativos para {getSelectedMonthName()}.
                      </td>
                    </tr>
                  ) : (
                    excelFilteredTransactions.map((item, index) => {
                      const overdue = isOverdue(item.dueDate, item.isPaid);
                      const catMetadata = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase() && c.type === item.type);
                      const markerBg = catMetadata ? catMetadata.color : '#475569';
                      
                      return (
                        <tr 
                          key={item.id}
                          className={`hover:bg-teal-500/[0.03] transition-all ${
                            index % 2 === 0 ? 'bg-slate-950/20' : 'bg-slate-950/5'
                          }`}
                        >
                          {/* Due Date Indicator */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 text-center whitespace-nowrap font-black">
                            <span className="inline-block bg-teal-500/10 border border-teal-500/20 text-teal-300 px-3 py-1 rounded-lg text-xs">
                              {getDueDayHex(item.dueDate)}
                            </span>
                          </td>

                          {/* Period */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 text-center whitespace-nowrap font-medium text-slate-400">
                            <span className="inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-teal-400" />
                              {getDueMonthYear(item.dueDate)}
                            </span>
                          </td>

                          {/* Item Name */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 font-bold text-slate-100 max-w-xs truncate">
                            {item.name}
                          </td>

                          {/* Category Tag */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 whitespace-nowrap">
                            <span 
                              className="text-[10px] font-bold text-slate-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 uppercase tracking-wide shadow-xs"
                              style={{ backgroundColor: `${markerBg}20`, border: `1px solid ${markerBg}40`, color: markerBg }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: markerBg }} />
                              {item.category}
                            </span>
                          </td>

                          {/* Net Value */}
                          <td className={`px-6 py-3.5 border-r border-slate-900/30 text-right font-black whitespace-nowrap text-sm ${
                            item.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {item.type === 'entrada' ? '+' : '-'} {formatCurrency(item.amount)}
                          </td>

                          {/* In Installments */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              item.installments 
                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                              {item.installments 
                                ? `${item.installments.current} / ${item.installments.total}` 
                                : 'Única'
                              }
                            </span>
                          </td>

                          {/* Status Badge clickable triggers */}
                          <td className="px-6 py-3.5 border-r border-slate-900/30 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(item.id)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                                item.isPaid
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : overdue
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse hover:bg-rose-500/20'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                              }`}
                            >
                              {item.isPaid ? 'PAGO' : overdue ? 'VENCIDO' : 'PENDENTE'}
                            </button>
                          </td>

                          {/* Quick delete item trigger */}
                          <td className="px-6 py-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setAppConfirmation({ type: 'delete', item })}
                              className="text-slate-500 hover:text-rose-450 p-1.5 rounded-xl hover:bg-rose-50/10 transition-all border border-transparent hover:border-rose-500/15 cursor-pointer"
                              title="Remover Conta da Planilha"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total spreadsheet status bottom panel */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <span>* Atalho: Você pode ajustar e consolidar o status do pagamento agilmente clicando no botão digital de status.</span>
              <div className="flex gap-4 font-mono font-bold">
                <span>Total Entradas: <strong className="text-emerald-400">{formatCurrency(summary.totalIncome)}</strong></span>
                <span>Total Saídas: <strong className="text-rose-400">{formatCurrency(summary.totalExpense)}</strong></span>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ARTIFICIAL INTELLIGENCE CONSULTANT (GEMINI) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in duration-300">
            
            {/* Column 1: Financial Diagnostic Audit Analyzer */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between min-h-[350px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/20">
                        <Brain className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Auditoria Mensal</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10">Gemini-3.5-Flash</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Clique no botão abaixo para consolidar todo o balanço de despesas, saldos e parcelas do mês correspondente e submeter ao conselho analítico da Inteligência Artificial.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerateMonthlyInsights}
                    disabled={generatingInsights || activeMonthTransactions.length === 0}
                    className="w-full bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-500 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-lg hover:shadow-teal-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {generatingInsights ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Gerando diagnóstico...
                      </>
                    ) : (
                      <>
                        <Sparkle className="w-4 h-4 text-amber-250 animate-pulse" />
                        Gerar Diagnóstico Financeiro
                      </>
                    )}
                  </button>
                  {activeMonthTransactions.length === 0 && (
                    <p className="text-[10px] text-amber-500 mt-2 text-center">
                      * Lance au menos uma conta no mês para gerar análises consistentes.
                    </p>
                  )}
                </div>

                {/* Report Insights presentation rendered elegantly */}
                {aiInsights && (
                  <div className="mt-5 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl max-h-[350px] overflow-y-auto">
                    <div className="prose prose-invert text-xs text-slate-300 leading-relaxed space-y-3">
                      {aiInsights.split('\n').map((line, i) => {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('###')) {
                          return <h4 key={i} className="text-sm font-bold text-teal-300 mt-3 border-b border-teal-500/5 pb-1">{cleanLine.replace('###', '')}</h4>;
                        }
                        if (cleanLine.startsWith('##')) {
                          return <h3 key={i} className="text-base font-extrabold text-white mt-4">{cleanLine.replace('##', '')}</h3>;
                        }
                        if (cleanLine.startsWith('*')) {
                          return <li key={i} className="ml-3 list-disc text-slate-300 mt-1">{cleanLine.replace('*', '').trim()}</li>;
                        }
                        return <p key={i} className="mb-1 leading-relaxed">{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Proposed transaction launch draft extracted from AI chat logs */}
              {draftTransaction && (
                <div className="bg-gradient-to-tr from-slate-950 to-teal-950 border border-teal-500/30 p-5 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lançamento Inteligente Proposto</h4>
                  </div>
                  
                  <p className="text-xs text-slate-300 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    "{draftTransaction.explanation}"
                  </p>

                  <div className="grid grid-cols-2 gap-3.5 text-xs bg-slate-900/70 p-3 rounded-xl border border-slate-800 mb-4">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Descrição</span>
                      <strong className="text-slate-200">{draftTransaction.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Valor Líquido</span>
                      <strong className="text-emerald-400">{formatCurrency(draftTransaction.amount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Categoria</span>
                      <strong className="text-slate-200">{draftTransaction.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Vencimento</span>
                      <strong className="text-slate-200">{draftTransaction.dueDate}</strong>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDraftTransaction(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-350 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={saveDraftTransaction}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:scale-[1.02] text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
                    >
                      Confirmar Lançamento
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Column 2: Conversational Expert Assistant Chat Sandbox */}
            <div className="lg:col-span-7 flex flex-col bg-slate-950/40 border border-slate-800 rounded-3xl h-[650px] shadow-xl overflow-hidden">
              
              {/* Chat Sub header toolbar */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chat & Comandos Inteligentes</h4>
                    <p className="text-[10px] text-slate-500">Insira faturas por text e pergunte conselhos gerais</p>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-400 uppercase">
                  Conexão Ativa
                </div>
              </div>

              {/* Messages container wrapper */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
                {aiChatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                      chat.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>
                  </div>
                ))}

                {/* Typing load indicators */}
                {aiChatLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="bg-slate-900 text-slate-400 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs shadow-lg flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                      <span className="text-teal-300 font-semibold uppercase tracking-wider text-[9px]">Analisando com Gemini...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message interactive form controls */}
              <form onSubmit={sendChatMessage} className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ex: 'paguei 40 reais com almoço ontem' ou 'como economizar?'..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={aiChatLoading}
                  className="bg-teal-600 hover:bg-teal-500 p-3 rounded-2xl text-white shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER METADATA COFFEE CREDITS */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 mt-16 py-4 border-t border-slate-800">
        <p>© 2026 FinanTech Premium. Desenvolvido localmente de forma segura e inteligente.</p>
      </footer>

      {/* GLOBAL CONFIRMATION MODAL TO REPLACE native confirm() BLOCK FOR IFRAME */}
      {appConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-in text-slate-100">
            {appConfirmation.type === 'reset' && (
              <>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-display">Atenção: Reiniciar Dados</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Deseja realmente reconfigurar todas as contas de teste padrão? Suas alterações locais no aparelho serão apagadas e substituídas pela simulação inicial.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setAppConfirmation(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-750 text-slate-300 rounded-xl hover:bg-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Não, cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleResetData();
                      setAppConfirmation(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Sim, Restaurar
                  </button>
                </div>
              </>
            )}

            {appConfirmation.type === 'clear' && (
              <>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                    <Trash2 className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-display">Confirmar Limpeza Total</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Deseja remover todos os lançamentos cadastrados e iniciar com uma planilha 100% vazia? Essa ação deletará todo o seu progresso local.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setAppConfirmation(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-755 text-slate-300 rounded-xl hover:bg-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Manter Contas
                  </button>
                  <button
                    onClick={() => {
                      handleClearAll();
                      setAppConfirmation(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-rose-650 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/10 cursor-pointer"
                  >
                    Sim, Deletar Tudo
                  </button>
                </div>
              </>
            )}

            {appConfirmation.type === 'delete' && appConfirmation.item && (
              <>
                {appConfirmation.item.installments ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-display">Remover parcelas agrupadas</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          O lançamento <strong className="text-slate-200">"{appConfirmation.item.name}"</strong> faz parte de um conjunto de parcelas. Como deseja prosseguir?
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 font-sans">
                      <button
                        onClick={() => {
                          handleDeleteItem(appConfirmation.item!.id, 'only');
                          setAppConfirmation(null);
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                      >
                        🔴 Deletar <strong className="text-rose-450 font-bold">Apenas esta parcela</strong> e manter as outras
                      </button>
                      
                      <button
                        onClick={() => {
                          handleDeleteItem(appConfirmation.item!.id, 'remaining');
                          setAppConfirmation(null);
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                      >
                        ⏩ Deletar esta parcela e <strong className="font-bold text-slate-200">todas as seguintes</strong> deste plano
                      </button>

                      <button
                        onClick={() => {
                          handleDeleteItem(appConfirmation.item!.id, 'all');
                          setAppConfirmation(null);
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl border border-rose-500/10 bg-rose-950/15 hover:bg-rose-950/30 text-rose-300 hover:text-rose-200 transition-all text-xs font-semibold cursor-pointer"
                      >
                        💥 Deletar <strong className="font-bold text-rose-450">todas as parcelas agrupadas</strong> desta compra
                      </button>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setAppConfirmation(null)}
                        className="px-4 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 text-xs font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-display">Confirmar Exclusão</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Tem certeza que deseja remover o lançamento <strong className="text-slate-200">"{appConfirmation.item.name}"</strong> no valor de <strong className="text-teal-300">{formatCurrency(appConfirmation.item.amount)}</strong>?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setAppConfirmation(null)}
                        className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-750 text-slate-300 rounded-xl hover:bg-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteItem(appConfirmation.item!.id);
                          setAppConfirmation(null);
                        }}
                        className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-750 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
                      >
                        Excluir Conta
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
