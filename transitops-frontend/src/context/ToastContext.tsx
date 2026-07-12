import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  push: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = nextId++
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const remove = (id: number) => setToasts((t) => t.filter((toast) => toast.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-panel bg-white animate-fade-in',
              toast.variant === 'success' && 'border-go/30',
              toast.variant === 'error' && 'border-alert/30',
              toast.variant === 'info' && 'border-route/30',
            )}
          >
            {toast.variant === 'success' && <CheckCircle2 className="h-4 w-4 text-go mt-0.5 shrink-0" />}
            {toast.variant === 'error' && <XCircle className="h-4 w-4 text-alert mt-0.5 shrink-0" />}
            {toast.variant === 'info' && <Info className="h-4 w-4 text-route mt-0.5 shrink-0" />}
            <p className="text-sm text-ink flex-1">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="text-slate-400 hover:text-ink shrink-0" aria-label="Dismiss notification">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
