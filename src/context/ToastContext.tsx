import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContextValue {
  notify: (text: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ notify: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{
              borderColor:
                t.type === 'error'
                  ? 'rgba(239, 68, 68, 0.6)'
                  : t.type === 'success'
                    ? 'rgba(34, 197, 94, 0.6)'
                    : undefined,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
