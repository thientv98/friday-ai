import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Expense, CategoryId, Category, TransactionType } from '../types';
import { Icon } from './Icons';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import SwipeableItem from './SwipeableItem';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  onAddManual: () => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onAddCategory: (category: Category) => void;
}

type FilterType = 'DAY' | 'WEEK' | 'MONTH';

const COLORS_PRESETS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
];

const ICONS_PRESETS = [
    'Utensils', 'Coffee', 'Bus', 'ShoppingBag', 'MoreHorizontal', 
    'Tag', 'Calendar', 'Gift', 'Home', 'Smartphone', 'Wallet', 'Banknote'
];

const Dashboard: React.FC<DashboardProps> = ({ expenses, categories, onAddManual, onDeleteExpense, onUpdateExpense, onAddCategory }) => {
  const [filterType, setFilterType] = useState<FilterType>('DAY');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  
  // --- Modals States ---
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS_PRESETS[0]);
  const [newCatIcon, setNewCatIcon] = useState(ICONS_PRESETS[0]);

  // --- Logic Helpers ---
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(date.setDate(diff));
  };

  const getEndOfWeek = (d: Date) => {
    const start = getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const isSameMonth = (d1: Date, d2: Date) => 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const isSameWeek = (d1: Date, currentSelected: Date) => {
    const start = getStartOfWeek(currentSelected);
    const end = getEndOfWeek(currentSelected);
    const d1Time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return d1Time >= startTime && d1Time <= endTime;
  };

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (filterType === 'DAY') newDate.setDate(newDate.getDate() - 1);
    if (filterType === 'WEEK') newDate.setDate(newDate.getDate() - 7);
    if (filterType === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (filterType === 'DAY') newDate.setDate(newDate.getDate() + 1);
    if (filterType === 'WEEK') newDate.setDate(newDate.getDate() + 7);
    if (filterType === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // --- Calculations ---
  const filteredTransactions = useMemo(() => {
    return expenses.filter(e => {
      const eDate = new Date(e.createdAt);
      let dateMatch = false;
      if (filterType === 'DAY') dateMatch = isSameDay(eDate, selectedDate);
      else if (filterType === 'WEEK') dateMatch = isSameWeek(eDate, selectedDate);
      else if (filterType === 'MONTH') dateMatch = isSameMonth(eDate, selectedDate);
      const categoryMatch = selectedCategoryId === 'ALL' || e.categoryId === selectedCategoryId;
      return dateMatch && categoryMatch;
    });
  }, [expenses, filterType, selectedDate, selectedCategoryId]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
        if (t.type === 'INCOME') income += t.amount;
        else expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [filteredTransactions]);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const pieChartData = useMemo(() => {
    const map = new Map<CategoryId, number>();
    filteredTransactions.filter(t => t.type === 'EXPENSE').forEach(e => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([id, value]) => {
      const cat = categoryMap[id] || { name: id, color: '#94a3b8' };
      return { name: cat.name, value, color: cat.color };
    }).filter(d => d.value > 0);
  }, [filteredTransactions, categoryMap]);

  const barChartData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toLocaleDateString('vi-VN', { month: 'short' }); 
        const monthData: any = { name: monthKey };
        const monthlyTransactions = expenses.filter(e => isSameMonth(new Date(e.createdAt), d));
        monthlyTransactions.forEach(e => {
             if ((selectedCategoryId === 'ALL' || e.categoryId === selectedCategoryId) && e.type === 'EXPENSE') {
                 monthData[e.categoryId] = (monthData[e.categoryId] || 0) + e.amount;
             }
        });
        data.push(monthData);
    }
    return data;
  }, [expenses, selectedCategoryId]); 

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  const formatCompactNumber = (number: number) => {
      const absValue = Math.abs(number);
      if (absValue >= 1_000_000_000) return (number / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ';
      if (absValue >= 1_000_000) return (number / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';
      if (absValue >= 1_000) return (number / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k';
      return number.toLocaleString('vi-VN');
  }

  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.createdAt - a.createdAt);

  const getDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
    if (filterType === 'DAY') return isSameDay(selectedDate, new Date()) ? "Hôm nay" : selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
    if (filterType === 'WEEK') {
        const start = getStartOfWeek(selectedDate);
        const end = getEndOfWeek(selectedDate);
        return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}`;
    }
    return "Tháng " + selectedDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  // --- Handlers ---
  const handleConfirmDelete = () => {
      if (expenseToDeleteId) {
          onDeleteExpense(expenseToDeleteId);
          setExpenseToDeleteId(null);
      }
  };

  const handleSaveEdit = () => {
      if (expenseToEdit) {
          onUpdateExpense(expenseToEdit);
          setExpenseToEdit(null);
      }
  };

  const handleCreateCategory = () => {
      if (!newCatName.trim()) return;
      const id = newCatName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_") + "_" + Math.floor(Math.random()*1000);
      onAddCategory({ id, name: newCatName, color: newCatColor, icon: newCatIcon });
      setSelectedCategoryId(id);
      setShowAddCategory(false);
      setNewCatName('');
  };

  return (
    <div className="flex flex-col h-full relative font-sans pb-24">
      
      {/* 1. Glass Header Card */}
      <div className="mx-4 mt-2 mb-4 glass-card rounded-[32px] p-5 z-10 animate-slide-up">
        
        {/* Navigator */}
        <div className="flex items-center justify-between mb-6">
           <button onClick={handlePrev} className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-emerald-600 transition-all active:scale-90">
             <Icon name="ChevronLeft" size={20} />
           </button>
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{filterType === 'DAY' ? 'Ngày' : filterType === 'WEEK' ? 'Tuần' : 'Tháng'}</span>
              <span className="text-slate-800 font-bold text-lg capitalize">{getDateLabel()}</span>
           </div>
           <button onClick={handleNext} className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-emerald-600 transition-all active:scale-90">
             <Icon name="ChevronRight" size={20} />
           </button>
        </div>

        {/* Balance Row */}
        <div className="flex flex-col items-center mb-6">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư</span>
             <span className={`text-4xl font-black tracking-tight ${balance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                {formatCompactNumber(balance)}
             </span>
        </div>

        {/* Income/Expense Split & Filter Tabs */}
        <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-2">
                 <div className="flex-1 bg-emerald-50/50 rounded-2xl p-3 flex flex-col items-center border border-emerald-100/50">
                    <span className="text-[10px] font-bold text-emerald-600/70 uppercase">Thu</span>
                    <span className="text-emerald-600 font-bold text-sm">+{formatCompactNumber(totalIncome)}</span>
                 </div>
                 <div className="flex-1 bg-red-50/50 rounded-2xl p-3 flex flex-col items-center border border-red-100/50">
                    <span className="text-[10px] font-bold text-red-500/70 uppercase">Chi</span>
                    <span className="text-red-500 font-bold text-sm">-{formatCompactNumber(totalExpense)}</span>
                 </div>
            </div>
        </div>
        
        <div className="mt-4 flex p-1 bg-slate-100/50 rounded-xl backdrop-blur-sm">
             {(['DAY', 'WEEK', 'MONTH'] as FilterType[]).map((t) => (
               <button
                 key={t}
                 onClick={() => setFilterType(t)}
                 className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all duration-300 ${
                   filterType === t 
                   ? 'bg-white text-emerald-600 shadow-sm' 
                   : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {t === 'DAY' ? 'Ngày' : t === 'WEEK' ? 'Tuần' : 'Tháng'}
               </button>
             ))}
           </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 mb-4">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 items-center">
              <button
                  onClick={() => setSelectedCategoryId('ALL')}
                  className={`flex items-center px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategoryId === 'ALL'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20'
                      : 'bg-white/60 text-slate-500 border-white/40 hover:bg-white'
                  }`}
              >
                  Tất cả
              </button>
              {categories.map(cat => (
                  <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                          selectedCategoryId === cat.id
                          ? 'bg-white text-slate-800 border-emerald-500/30 shadow-md ring-2 ring-emerald-500/10'
                          : 'bg-white/60 text-slate-500 border-white/40 hover:bg-white'
                      }`}
                  >
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                      {cat.name}
                  </button>
              ))}
              <button onClick={() => setShowAddCategory(true)} className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-emerald-600 border border-white/50 hover:bg-white shrink-0">
                  <Icon name="Plus" size={18} />
              </button>
          </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-5 pb-24">
        
        {/* Pie Chart */}
        {pieChartData.length > 0 && selectedCategoryId === 'ALL' && (
          <div className="glass-card rounded-[32px] p-6 animate-pop-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Phân bổ chi tiêu</h3>
            <div className="flex items-center">
                <div className="relative shrink-0 w-[130px] h-[130px]">
                    <PieChart width={130} height={130}>
                        <Pie
                            data={pieChartData}
                            cx={65} cy={65}
                            innerRadius={40}
                            outerRadius={55} 
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)} 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '12px', fontWeight: '600' }}
                        />
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-slate-700">{Math.round(totalExpense / (totalIncome + totalExpense || 1) * 100)}%</span>
                    </div>
                </div>
                <div className="flex-1 ml-6 space-y-3">
                    {pieChartData.slice(0, 3).map(d => (
                        <div key={d.name} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-slate-500 font-semibold text-xs truncate">{d.name}</span>
                            </div>
                            <span className="text-slate-800 font-bold text-sm ml-4">{formatCompactNumber(d.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {expenses.length > 0 && (
            <div className="glass-card rounded-[32px] p-6 animate-pop-in" style={{animationDelay: '0.1s'}}>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Xu hướng 6 tháng</h3>
                <div className="h-40 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                            <Tooltip 
                                cursor={{fill: '#f1f5f9', radius: 4}}
                                formatter={(value: number, name: string) => [formatCompactNumber(value), categories.find(c => c.id === name)?.name || name]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}
                            />
                            {categories.map((cat, index) => (
                                <Bar key={cat.id} dataKey={cat.id} stackId="a" fill={cat.color} radius={index === categories.length - 1 ? [4, 4, 4, 4] : [0, 0, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* Transaction List */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2 animate-fade-in">
             <h3 className="font-bold text-slate-800 text-lg">Giao dịch</h3>
             <span className="text-xs bg-white/50 px-2 py-1 rounded-lg text-slate-500 font-bold">{sortedTransactions.length}</span>
          </div>
          
          <div className="space-y-3">
            {sortedTransactions.map((transaction, index) => {
              const category = categoryMap[transaction.categoryId] || { name: transaction.categoryId, color: '#94a3b8', icon: 'Tag' };
              const date = new Date(transaction.createdAt);
              const isIncome = transaction.type === 'INCOME';
              
              return (
                <div key={transaction.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
                    <SwipeableItem onDelete={() => setExpenseToDeleteId(transaction.id)} onEdit={() => setExpenseToEdit(transaction)}>
                        <div className="p-4 flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-emerald-100">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white" style={{ backgroundColor: category.color }}>
                                <Icon name={category.icon} size={20} className="drop-shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 truncate text-[15px] mb-0.5">{transaction.title}</div>
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                    <span>{category.name}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>{date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                            <div className={`font-extrabold text-right ${isIncome ? 'text-emerald-500' : 'text-slate-800'}`}>
                                {isIncome ? '+' : '-'}{formatCompactNumber(transaction.amount)}
                            </div>
                        </div>
                    </SwipeableItem>
                </div>
              );
            })}
             {sortedTransactions.length === 0 && (
                 <div className="text-center py-10 opacity-50">
                     <p className="text-slate-500 font-medium">Chưa có giao dịch nào.</p>
                 </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Modals are kept similar but can be styled with glass classes if needed. 
          For brevity, reusing portal structure but assuming they inherit app styles. */}
      {showAddCategory && createPortal(
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/20 backdrop-blur-md transition-opacity animate-fade-in">
               <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
                  <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-bold text-slate-800">Danh mục mới</h3>
                           <button onClick={() => setShowAddCategory(false)}><Icon name="X" size={24} className="text-slate-400" /></button>
                      </div>
                      <input 
                              type="text" 
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              placeholder="Tên danh mục..."
                              className="w-full mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-lg font-bold outline-none transition-all"
                              autoFocus
                      />
                      <div className="mb-6">
                           <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Màu sắc</label>
                           <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                              {COLORS_PRESETS.map(c => (
                                  <button key={c} onClick={() => setNewCatColor(c)} className={`w-10 h-10 rounded-full shrink-0 transition-transform ${newCatColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-300' : ''}`} style={{ backgroundColor: c }}>{newCatColor === c && <Icon name="Check" size={16} className="text-white mx-auto" />}</button>
                              ))}
                           </div>
                      </div>
                      <button onClick={handleCreateCategory} disabled={!newCatName.trim()} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">Tạo ngay</button>
                  </div>
               </div>
          </div>, document.body
      )}

      {/* Delete Modal */}
      {expenseToDeleteId && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md animate-fade-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-6 w-full max-w-xs shadow-2xl animate-pop-in text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Icon name="Trash2" size={32} /></div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Xoá giao dịch?</h3>
                  <p className="text-slate-500 text-sm mb-6">Hành động này không thể hoàn tác.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setExpenseToDeleteId(null)} className="py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Huỷ</button>
                      <button onClick={handleConfirmDelete} className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30">Xoá</button>
                  </div>
              </div>
          </div>, document.body
      )}

      {/* Edit Modal - Simplifed for brevity, retaining logic */}
      {expenseToEdit && createPortal(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/20 backdrop-blur-md animate-fade-in">
             <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 animate-slide-up space-y-5 max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Sửa giao dịch</h3>
                    <button onClick={() => setExpenseToEdit(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <Icon name="X" size={20} />
                    </button>
                 </div>
                 
                 {/* Type Selector */}
                 <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
                        <button key={t} onClick={() => setExpenseToEdit({...expenseToEdit, type: t})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${expenseToEdit.type === t ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>{t === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}</button>
                    ))}
                 </div>
                 
                 {/* Amount Input */}
                 <input 
                    type="number" 
                    value={expenseToEdit.amount} 
                    onChange={e => setExpenseToEdit({...expenseToEdit, amount: Number(e.target.value)})} 
                    className="w-full text-3xl font-black text-center bg-transparent outline-none py-4 text-slate-800" 
                    placeholder="0"
                 />
                 
                 {/* Title Input */}
                 <input 
                    type="text" 
                    value={expenseToEdit.title} 
                    onChange={e => setExpenseToEdit({...expenseToEdit, title: e.target.value})} 
                    className="w-full p-4 rounded-xl bg-slate-50 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    placeholder="Mô tả giao dịch"
                 />
                 
                 {/* Category Selector */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {categories
                            .filter(cat => {
                                // Filter categories based on transaction type
                                if (expenseToEdit.type === 'INCOME') {
                                    return cat.id.includes('INCOME') || cat.id === 'SALARY';
                                }
                                return !cat.id.includes('INCOME') || cat.id === 'EXPENSE';
                            })
                            .map(cat => {
                                const isSelected = expenseToEdit.categoryId === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setExpenseToEdit({...expenseToEdit, categoryId: cat.id})}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all border ${
                                            isSelected
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-500/50 shadow-sm ring-2 ring-emerald-500/20'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: cat.color}}></div>
                                        <span className="truncate">{cat.name}</span>
                                        {isSelected && <Icon name="Check" size={16} className="ml-auto text-emerald-600 shrink-0" />}
                                    </button>
                                );
                            })}
                    </div>
                 </div>
                 
                 {/* Save Button */}
                 <button 
                    onClick={handleSaveEdit} 
                    className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors active:scale-95"
                 >
                    Lưu thay đổi
                 </button>
             </div>
          </div>, document.body
      )}
    </div>
  );
};

export default Dashboard;