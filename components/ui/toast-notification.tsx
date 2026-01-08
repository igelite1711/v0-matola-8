"use client"

import { useApp } from "@/contexts/app-context"
import { CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastNotification() {
  const { toast, clearToast } = useApp()

  if (!toast) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30 bg-red-500/10",
    info: "border-blue-500/30 bg-blue-500/10",
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm",
          bgColors[toast.type],
        )}
      >
        {icons[toast.type]}
        <p className="text-sm font-medium text-foreground">{toast.message}</p>
        <button onClick={clearToast} className="ml-2 rounded-full p-1 hover:bg-secondary" aria-label="Dismiss">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

// Toast function - to be used from app context
export const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // This function is a placeholder - actual implementation uses useApp hook in client components
  console.log(`Toast [${type}]: ${message}`)
}
