import React, { useState } from 'react';
import { ParsedExpense, CategoryId, Category, TransactionType } from '../types';
import { Icon } from './Icons';

interface PreviewScreenProps {
  parsedData: ParsedExpense[];
  categories: Category[];
  onConfirm: (finalData: ParsedExpense[], newCategories: Category[]) => void;
  onCancel: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ parsedData, categories, onConfirm, onCancel }) => {
  const [items, setItems] = useState<ParsedExpense[]>(parsedData);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({});

  const handleDelete = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleUpdate = (index: number, field: keyof ParsedExpense, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const toggleType = (index: number) => {
      const currentType = items[index].type;
      handleUpdate(index, 'type', currentType === 'EXPENSE' ? 'INCOME' : 'EXPENSE');
  };

  const getCategory = (id: string) => localCategories.find(c => c.id === id);

  const handleCreateCategory = (index: number, name: string) => {
    if (!name.trim()) return;
    const id = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_");
    let finalId = id;
    if (localCategories.some(c => c.id === finalId)) finalId = `${id}_${Math.floor(Math.random() * 1000)}`;
    const newCat: Category = { id: finalId, name: name, color: '#' + Math.floor(Math.random()*16777215).toString(16), icon: 'Tag' };
    setLocalCategories(prev => [...prev, newCat]);
    handleUpdate(index, 'categoryId', finalId);
    const nextNames = { ...newCategoryNames };
    delete nextNames[index];
    setNewCategoryNames(nextNames);
  };

  const getTotal = () => items.reduce((sum, item) => sum + (item.type === 'INCOME' ? item.amount : -item.amount), 0);

  const handleFinalConfirm = () => {
    const newlyAdded = localCategories.filter(lc => !categories.some(oc => oc.id === lc.id));
    const implicitNewCategories: Category[] = [];
    items.forEach(item => {
        if (!localCategories.find(c => c.id === item.categoryId)) {
            const newCat: Category = { id: item.categoryId, name: item.categoryId, color: '#' + Math.floor(Math.random()*16777215).toString(16), icon: 'Tag' };
            implicitNewCategories.push(newCat);
        }
    });
    onConfirm(items, [...newlyAdded, ...implicitNewCategories]);
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Glass Header */}
      <div className="glass px-6 py-5 z-10 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100/50">
            <Icon name="ArrowLeft" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-800">Xác nhận</h1>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-100">
            {items.length} mục
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {items.length === 0 && (
           <div className="flex flex-col items-center justify-center mt-20 opacity-40">
               <Icon name="ShoppingBag" size={56} className="text-slate-400 mb-4" />
               <div className="text-slate-500 font-bold">Không có gì để lưu</div>
           </div>
        )}

        {items.map((item, index) => {
            const isCategoryInput = newCategoryNames[index] !== undefined;
            const unknownCategory = !getCategory(item.categoryId);
            const isIncome = item.type === 'INCOME';

            return (
                <div key={index} className="glass-card rounded-[28px] p-5 relative group transition-all hover:scale-[1.01] animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <button 
                        onClick={() => handleDelete(index)}
                        className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-2 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                    >
                        <Icon name="X" size={16} />
                    </button>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                             <input 
                                type="text" 
                                value={item.title}
                                onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                                className="flex-1 bg-transparent border-none p-0 text-slate-800 font-bold text-lg focus:ring-0 outline-none placeholder:text-slate-300"
                                placeholder="Tên mục..."
                            />
                            <button 
                                onClick={() => toggleType(index)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${isIncome ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}
                            >
                                {isIncome ? 'Thu' : 'Chi'}
                            </button>
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="w-[35%]">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Số tiền</label>
                                <input 
                                    type="number" 
                                    value={item.amount}
                                    onChange={(e) => handleUpdate(index, 'amount', Number(e.target.value))}
                                    className={`w-full bg-slate-50/50 rounded-xl px-3 py-2.5 font-bold text-base outline-none border border-transparent focus:bg-white focus:border-emerald-200 transition-all ${isIncome ? 'text-emerald-500' : 'text-slate-800'}`}
                                />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Danh mục</label>
                                {isCategoryInput ? (
                                    <div className="flex gap-2">
                                        <input 
                                            autoFocus
                                            value={newCategoryNames[index]}
                                            onChange={(e) => setNewCategoryNames(prev => ({...prev, [index]: e.target.value}))}
                                            className="flex-1 bg-white border border-emerald-500 rounded-xl px-3 py-2.5 text-sm outline-none shadow-sm"
                                        />
                                        <button onClick={() => handleCreateCategory(index, newCategoryNames[index])} className="bg-emerald-500 text-white p-2.5 rounded-xl"><Icon name="Check" size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={item.categoryId}
                                                onChange={(e) => handleUpdate(index, 'categoryId', e.target.value as CategoryId)}
                                                className={`w-full bg-slate-50/50 rounded-xl px-3 py-2.5 text-slate-700 text-sm font-semibold appearance-none outline-none border border-transparent focus:bg-white focus:border-emerald-200 transition-all ${unknownCategory ? 'text-amber-500' : ''}`}
                                            >
                                                {localCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                {unknownCategory && <option value={item.categoryId}>{item.categoryId} (?)</option>}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icon name="ChevronRight" size={14} className="rotate-90" /></div>
                                        </div>
                                        <button onClick={() => setNewCategoryNames(prev => ({...prev, [index]: ""}))} className="w-10 flex items-center justify-center bg-white/50 border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-200"><Icon name="Plus" size={18} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="p-6 glass border-t border-white/20">
        <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Tổng cộng</span>
            <span className={`text-2xl font-black ${getTotal() >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}
            </span>
        </div>
        <button 
          onClick={handleFinalConfirm}
          disabled={items.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
        >
          <Icon name="Check" />
          Lưu tất cả
        </button>
      </div>
    </div>
  );
};

export default PreviewScreen;