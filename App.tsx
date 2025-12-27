'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Expense, ParsedExpense, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { GeminiService } from './services/geminiService';
import { 
  subscribeToExpenses, 
  saveExpenses, 
  deleteExpense as deleteExpenseFromFirestore,
  updateExpense as updateExpenseInFirestore,
  subscribeToCategories,
  saveCategories,
  addCategory as addCategoryToFirestore
} from './services/firestoreService';
import VoiceInput from './components/VoiceInput';
import PreviewScreen from './components/PreviewScreen';
import Dashboard from './components/Dashboard';
import { Icon } from './components/Icons';
import { useAuth } from './contexts/AuthContext';

enum AppView {
  HOME = 'HOME',
  PREVIEW = 'PREVIEW',
  DASHBOARD = 'DASHBOARD'
}

function App() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentParsedData, setCurrentParsedData] = useState<ParsedExpense[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const expensesUnsubscribeRef = useRef<(() => void) | null>(null);
  const categoriesUnsubscribeRef = useRef<(() => void) | null>(null);
  
  // Subscribe to real-time updates từ Firestore
  useEffect(() => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    // Subscribe to expenses
    expensesUnsubscribeRef.current = subscribeToExpenses(user.uid, (expensesData) => {
      setExpenses(expensesData);
      setIsLoadingData(false);
    });

    // Subscribe to categories
    categoriesUnsubscribeRef.current = subscribeToCategories(user.uid, (categoriesData) => {
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Nếu chưa có categories, khởi tạo với default categories
        saveCategories(user.uid, DEFAULT_CATEGORIES).then(() => {
          setCategories(DEFAULT_CATEGORIES);
        }).catch(console.error);
      }
      setIsLoadingData(false);
    });

    // Cleanup subscriptions khi unmount hoặc user thay đổi
    return () => {
      if (expensesUnsubscribeRef.current) {
        expensesUnsubscribeRef.current();
        expensesUnsubscribeRef.current = null;
      }
      if (categoriesUnsubscribeRef.current) {
        categoriesUnsubscribeRef.current();
        categoriesUnsubscribeRef.current = null;
      }
    };
  }, [user]);

  // Redirect to login nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading state
  if (loading || isLoadingData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-slate-600">Đang tải...</div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const parsed = await GeminiService.parseExpenseText(text, categories);
      if (parsed && parsed.length > 0) {
        setCurrentParsedData(parsed);
        setView(AppView.PREVIEW);
      } else {
        alert("Không tìm thấy thông tin chi tiêu nào.");
      }
    } catch (error: any) {
      alert("Lỗi: " + (error?.message || "Không xác định"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmExpense = async (finalData: ParsedExpense[], newCategories: Category[]) => {
    if (!user) return;

    try {
      // Thêm categories mới nếu có
      if (newCategories.length > 0) {
        for (const category of newCategories) {
          await addCategoryToFirestore(user.uid, category);
        }
      }

      // Tạo expenses mới
      const newExpenses: Expense[] = finalData.map(item => ({
        id: crypto.randomUUID(), 
        ...item, 
        createdAt: Date.now(), 
        source: 'voice'
      }));

      // Lưu expenses vào Firestore
      await saveExpenses(user.uid, newExpenses);
      
      // Real-time subscription sẽ tự động cập nhật state
      setView(AppView.DASHBOARD);
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Lỗi khi lưu dữ liệu: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    try {
      await deleteExpenseFromFirestore(user.uid, id);
      // Real-time subscription sẽ tự động cập nhật state
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Lỗi khi xóa: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleUpdateExpense = async (expense: Expense) => {
    if (!user) return;
    try {
      await updateExpenseInFirestore(user.uid, expense);
      // Real-time subscription sẽ tự động cập nhật state
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Lỗi khi cập nhật: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleAddCategory = async (category: Category) => {
    if (!user) return;
    try {
      await addCategoryToFirestore(user.uid, category);
      // Real-time subscription sẽ tự động cập nhật state
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Lỗi khi thêm category: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center overflow-hidden font-sans">
      {/* 
         Mobile Container 
         - On Desktop: Fixed width, rounded, glass effect
         - On Mobile: Full width/height, transparent to show body background
      */}
      <div className="w-full h-full sm:max-w-md sm:h-[92vh] sm:rounded-[48px] sm:border-[8px] sm:border-white/20 sm:shadow-2xl relative flex flex-col overflow-hidden bg-white/40 backdrop-blur-xl sm:ring-1 sm:ring-white/50 transition-all duration-500">
        
        {/* Header */}
        <header className="px-6 py-5 flex justify-between items-center z-30 absolute top-0 left-0 w-full pointer-events-none">
          {view === AppView.HOME && (
              <div className="flex gap-2 pointer-events-auto animate-fade-in">
                 <button onClick={handleLogout} className="p-2 bg-white/30 backdrop-blur-md rounded-full text-slate-600 hover:text-red-500 hover:bg-white/50 transition-colors active:scale-90">
                    <Icon name="LogOut" size={20} />
                 </button>
              </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          
          {view === AppView.HOME && (
            <div key="home" className="h-full flex flex-col animate-slide-up">
               <div className="flex-1 flex flex-col">
                 <VoiceInput 
                    onTranscriptComplete={handleTranscript} 
                    isProcessing={isProcessing} 
                 />
               </div>
               
               {!isProcessing && (
                 <div className="p-6 pb-12 z-20 animate-slide-up-slow">
                    <button 
                      onClick={() => setView(AppView.DASHBOARD)}
                      className="group w-full glass-card py-5 rounded-[28px] flex items-center justify-between px-6 shadow-glass hover:bg-white/80 transition-all duration-300 active:scale-[0.98]"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="PieChart" size={24} />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-800 text-lg">Xem báo cáo</div>
                            <div className="text-xs text-slate-500 font-semibold">Lịch sử & Biểu đồ</div>
                          </div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                           <Icon name="ArrowLeft" className="rotate-180" size={20} />
                       </div>
                    </button>
                 </div>
               )}
            </div>
          )}

          {view === AppView.PREVIEW && (
            <div key="preview" className="h-full bg-white/60 backdrop-blur-xl animate-slide-up">
              <PreviewScreen 
                parsedData={currentParsedData} 
                categories={categories}
                onConfirm={handleConfirmExpense} 
                onCancel={() => { setView(AppView.HOME); setCurrentParsedData([]); }}
              />
            </div>
          )}

          {view === AppView.DASHBOARD && (
            <div key="dashboard" className="h-full animate-slide-up">
              <Dashboard 
                expenses={expenses} 
                categories={categories}
                onAddManual={() => {}}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
                onAddCategory={handleAddCategory}
              />
            </div>
          )}
        </main>

        {/* Floating Nav for Dashboard */}
        {view === AppView.DASHBOARD && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-8 py-4 rounded-full flex gap-10 z-30 shadow-glass-sm animate-pop-in">
             <button onClick={() => setView(AppView.HOME)} className="text-slate-400 hover:text-emerald-600 transition-colors hover:-translate-y-1 transform duration-200 active:scale-90">
                <Icon name="Mic" size={28} />
             </button>
             <button className="text-emerald-600 relative">
                <Icon name="PieChart" size={28} />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
             </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;