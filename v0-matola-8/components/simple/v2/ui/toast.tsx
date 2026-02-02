"use client"

import type React from "react"

import { useState, createContext, useContext, useCallback } from "react"
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "loading"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  loading: (title: string, message?: string) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7)
      setToasts((prev) => [...prev, { ...toast, id }])

      if (toast.type !== "loading" && toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id)
        }, toast.duration || 4000)
      }

      return id
    },
    [removeToast],
  )

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message })
    },
    [addToast],
  )

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message, duration: 6000 })
    },
    [addToast],
  )

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message })
    },
    [addToast],
  )

  const loading = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: "loading", title, message, duration: 0 })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, loading }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10 border-success/20",
    },
    error: {
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/20",
    },
    info: {
      icon: Info,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    loading: {
      icon: Loader2,
      color: "text-primary",
      bgColor: "bg-card border-border",
    },
  }

  const { icon: Icon, color, bgColor } = config[toast.type]

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-lg animate-in slide-in-from-bottom-4 duration-300",
        bgColor,
      )}
    >
      {toast.type === "loading" ? (
        <Loader2 className={cn("h-5 w-5 animate-spin", color)} />
      ) : (
        <Icon className={cn("h-5 w-5", color)} />
      )}
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{toast.title}</p>
        {toast.message && <p className="text-xs text-muted-foreground">{toast.message}</p>}
      </div>
      {toast.type !== "loading" && (
        <button onClick={onRemove} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
