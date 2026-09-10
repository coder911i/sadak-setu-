import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast stack: top on mobile (clear of the tab bar), bottom-right on desktop */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed z-[70] flex flex-col gap-2.5 pointer-events-none
                   top-3 left-3 right-3 items-center
                   sm:top-auto sm:left-auto sm:bottom-5 sm:right-5 sm:items-end sm:max-w-sm sm:w-full"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-white border-emerald-200 text-ink-900',
            warning: 'bg-white border-amber-200 text-ink-900',
            error: 'bg-white border-red-200 text-ink-900',
            info: 'bg-white border-line text-ink-900',
          };

          const IconComponent = {
            success: CheckCircle2,
            warning: AlertTriangle,
            error: AlertCircle,
            info: Info,
          }[toast.type] || Info;

          const iconColor = {
            success: 'text-emerald-600',
            warning: 'text-amber-600',
            error: 'text-red-600',
            info: 'text-brand-600',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full sm:w-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-elevated animate-slide-in ${typeStyles[toast.type] || typeStyles.info}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="font-semibold text-subhead leading-tight">{toast.title}</h4>}
                {toast.message && <p className="text-footnote text-ink-600 mt-1 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-400 hover:text-ink-900 hover:bg-surface-100 rounded-lg transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
