import React, { useState } from 'react';
import { 
  FolderPlus, 
  Trash2, 
  HelpCircle, 
  Info, 
  Check, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Lock,
  Palette
} from 'lucide-react';
import { Category, TransactionType, FinancialItem } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  items: FinancialItem[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategoryColor: (id: string, color: string) => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#0284c7', // Sky Blue
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#64748b', // Slate
];

export default function CategoryManager({ 
  categories, 
  items, 
  onAddCategory, 
  onDeleteCategory,
  onUpdateCategoryColor
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('saida');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('#6366f1');

  // Count occurrences of category names in transactions
  const getCategoryUseCount = (catName: string, catType: TransactionType) => {
    return items.filter(
      item => item.category.toLowerCase() === catName.toLowerCase() && item.type === catType
    ).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    // Check for duplicates within same type
    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === cleanName.toLowerCase() && cat.type === type
    );

    if (isDuplicate) {
      alert(`Já existe uma categoria chamada "${cleanName}" para ${type === 'entrada' ? 'entradas' : 'saídas'}.`);
      return;
    }

    onAddCategory({
      name: cleanName,
      type,
      color: selectedColor,
      isCustom: true
    });

    // Reset Form
    setName('');
    // Pick another color to be playful
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    setSelectedColor(randomColor);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomColor(val);
    setSelectedColor(val);
  };

  const incomeCategories = categories.filter(c => c.type === 'entrada');
  const expenseCategories = categories.filter(c => c.type === 'saida');

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden" id="category-manager-container">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
            <Tag size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">Categorias Personalizadas</h2>
            <p className="text-[11px] text-slate-500">Customize os marcadores das suas contas</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isOpen 
              ? 'bg-slate-200 text-slate-705 hover:bg-slate-300' 
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-xs'
          }`}
        >
          {isOpen ? 'Ocultar Categorias' : 'Gerenciar'}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6 animate-fade-in" id="category-manager-body">
          
          {/* Create Category Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-150">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles size={13} className="text-violet-500" />
              Criar Nova Categoria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-name-input" className="text-[10px] font-bold text-slate-500 uppercase">Nome da Categoria</label>
                <input
                  id="cat-name-input"
                  type="text"
                  required
                  maxLength={24}
                  placeholder="Supermercado, Academia, Bônus..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 text-xs bg-white text-slate-950 font-semibold"
                />
              </div>

              {/* Type Switcher */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Fluxo</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('saida')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'saida'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownRight size={13} />
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('entrada')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'entrada'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight size={13} />
                    Receita
                  </button>
                </div>
              </div>
            </div>

            {/* Colors Preset Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Selecione uma Cor</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor.toLowerCase() === color.toLowerCase() && (
                      <Check size={12} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" strokeWidth={3} />
                    )}
                  </button>
                ))}

                {/* Custom Native Color Picker */}
                <div className="relative flex items-center gap-1 cursor-pointer">
                  <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-6 h-6 p-0 border-0 rounded-full cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: customColor }}
                  >
                    {!PRESET_COLORS.includes(selectedColor) && (
                      <Check size={12} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedColor}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
            >
              <FolderPlus size={14} />
              Adicionar Categoria
            </button>
          </form>

          {/* List existing Categories side-by-side (Expenses vs Incomes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Expenses List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Despesas ({expenseCategories.length})
              </h4>
              
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white max-h-48 overflow-y-auto">
                {expenseCategories.map(cat => {
                  const useCount = getCategoryUseCount(cat.name, cat.type);
                  return (
                    <div key={cat.id} className="p-2 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {/* Interactive circle color edit button */}
                        <button
                          type="button"
                          className="relative flex items-center justify-center shrink-0 w-6 h-6 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-350 transition-all hover:scale-105 cursor-pointer"
                          title="Clique para alterar a cor desta bolinha"
                        >
                          <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: cat.color }} />
                          <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => onUpdateCategoryColor(cat.id, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
                          />
                        </button>

                        {/* Category name inside a custom colored ellipse */}
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors shrink-0 max-w-[120px] truncate"
                          style={{ 
                            backgroundColor: `${cat.color}15`, 
                            color: cat.color, 
                            borderColor: `${cat.color}35` 
                          }}
                        >
                          {cat.name}
                        </span>

                        {useCount > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-full">
                            {useCount}
                          </span>
                        )}
                      </div>

                      {cat.isCustom ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (useCount > 0) {
                              if (!confirm(`Existem ${useCount} contas associadas à categoria "${cat.name}". Excluir a categoria removerá os marcadores coloridos do gráfico, mas manterá seus lançamentos. Confirmar exclusão?`)) {
                                return;
                              }
                            }
                            onDeleteCategory(cat.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir categoria personalizada"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <div className="text-[9px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-50 text-slate-450 rounded border border-slate-100 flex items-center gap-0.5">
                          <Lock size={10} />
                          Padrão
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Income List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Receitas ({incomeCategories.length})
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white max-h-48 overflow-y-auto">
                {incomeCategories.map(cat => {
                  const useCount = getCategoryUseCount(cat.name, cat.type);
                  return (
                    <div key={cat.id} className="p-2 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {/* Interactive circle color edit button */}
                        <button
                          type="button"
                          className="relative flex items-center justify-center shrink-0 w-6 h-6 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-350 transition-all hover:scale-105 cursor-pointer"
                          title="Clique para alterar a cor desta bolinha"
                        >
                          <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: cat.color }} />
                          <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => onUpdateCategoryColor(cat.id, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
                          />
                        </button>

                        {/* Category name inside a custom colored ellipse */}
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors shrink-0 max-w-[120px] truncate"
                          style={{ 
                            backgroundColor: `${cat.color}15`, 
                            color: cat.color, 
                            borderColor: `${cat.color}35` 
                          }}
                        >
                          {cat.name}
                        </span>

                        {useCount > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-full">
                            {useCount}
                          </span>
                        )}
                      </div>

                      {cat.isCustom ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (useCount > 0) {
                              if (!confirm(`Existem ${useCount} contas associadas à categoria "${cat.name}". Excluir a categoria removerá os marcadores coloridos do gráfico, mas manterá seus lançamentos. Confirmar exclusão?`)) {
                                return;
                              }
                            }
                            onDeleteCategory(cat.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir categoria personalizada"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <div className="text-[9px] text-slate-450 font-medium px-1.5 py-0.5 bg-slate-50 text-slate-450 rounded border border-slate-100 flex items-center gap-0.5">
                          <Lock size={10} />
                          Padrão
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex gap-2 items-start text-xs text-blue-800">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <p>
              Qualquer categoria marcada como <strong>Padrão</strong> não pode ser excluída, pois sustenta a integridade básica do sistema. Categorias criadas por você são excluíveis a qualquer momento.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
