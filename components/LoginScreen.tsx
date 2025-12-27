import React from 'react';
import { Icon } from './Icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm px-8">
        <div className="glass-card rounded-[40px] p-8 flex flex-col items-center shadow-glass animate-pop-in">
            
            {/* Logo Container */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[32px] flex items-center justify-center shadow-glow relative z-10">
                    <Icon name="Mic" size={40} className="text-white" />
                </div>
            </div>

            {/* Typography */}
            <div className="text-center space-y-3 mb-10">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Friday AI</h1>
                <p className="text-slate-500 font-medium text-base leading-relaxed">
                    Trợ lý tài chính cá nhân<br/>
                    <span className="text-emerald-600 font-bold">Nhanh. Thông minh. Đơn giản.</span>
                </p>
            </div>

            {/* Login Button */}
            <button 
                onClick={onLogin}
                className="w-full group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-lg shadow-slate-200/50 transition-all duration-300 active:scale-95"
            >
                {/* Google Icon */}
                <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold text-slate-700 text-lg">Tiếp tục với Google</span>
            </button>
        </div>
        
        {/* Footer */}
      </div>
    </div>
  );
};

export default LoginScreen;