import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* 🟢 প্রিমিয়াম ভাসমান টাস্ট কন্টেইনার */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-3.5 pointer-events-none max-w-sm w-full px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex items-center justify-between gap-3.5 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white text-xs sm:text-sm font-bold transition-all transform animate-slide-in border ${
              toast.type === 'success' 
                ? 'bg-white/90 dark:bg-[#16171a]/90 border-emerald-500/40 shadow-emerald-500/10' :
              toast.type === 'error' 
                ? 'bg-white/90 dark:bg-[#16171a]/90 border-red-500/40 shadow-red-500/10' :
                'bg-white/90 dark:bg-[#16171a]/90 border-blue-500/40 shadow-blue-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow-sm ${
                toast.type === 'success' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                toast.type === 'error' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              }`}>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error Notice' : 'Information'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{toast.message}</span>
              </div>
            </div>

            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer text-sm p-1"
            >
              ✕
            </button>

            {/* নিচের দিকে কাউন্টডাউন প্রোগ্রেস লাইন */}
            <div className={`absolute bottom-0 left-0 h-1 w-full animate-shrink ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);