"use client"

import { AlertCircle, RefreshCw, WifiOff, ServerCrash, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

type ErrorType = "generic" | "network" | "server" | "notFound" | "permission"

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

const errorConfig = {
  generic: {
    icon: AlertCircle,
    titleEn: "Something went wrong",
    titleNy: "Chinachake chasokoneza",
    messageEn: "An unexpected error occurred. Please try again.",
    messageNy: "Cholakwika chachitika. Chonde yesaninso.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  network: {
    icon: WifiOff,
    titleEn: "No internet connection",
    titleNy: "Palibe intaneti",
    messageEn: "Check your connection and try again. Your data is saved offline.",
    messageNy: "Onetsetsani intaneti yanu ndiyesaninso. Zanu zasungidwa.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  server: {
    icon: ServerCrash,
    titleEn: "Server error",
    titleNy: "Vuto la seva",
    messageEn: "Our servers are having issues. Please try again later.",
    messageNy: "Ma seva athu ali ndi vuto. Chonde yesani pambuyo pake.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  notFound: {
    icon: FileWarning,
    titleEn: "Not found",
    titleNy: "Sizinapezeke",
    messageEn: "The item you're looking for doesn't exist or was removed.",
    messageNy: "Chomwe mukufuna sichinapezeke kapena chachotsedwa.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  permission: {
    icon: AlertCircle,
    titleEn: "Access denied",
    titleNy: "Simunaloledwe",
    messageEn: "You don't have permission to view this content.",
    messageNy: "Mulibe chilolezo chowona izi.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function ErrorState({ type = "generic", title, message, onRetry, className }: ErrorStateProps) {
  const { language } = useTranslation()
  const config = errorConfig[type]
  const Icon = config.icon

  const displayTitle = title || (language === "ny" ? config.titleNy : config.titleEn)
  const displayMessage = message || (language === "ny" ? config.messageNy : config.messageEn)

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full mb-4", config.bgColor)}>
        <Icon className={cn("h-8 w-8", config.color)} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{displayMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          {language === "ny" ? "Yesaninso" : "Try Again"}
        </Button>
      )}
    </div>
  )
}

// Inline error for form fields
export function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive mt-1.5">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  )
}

// Error toast banner
export function ErrorBanner({
  message,
  onDismiss,
  onRetry,
}: {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
}) {
  const { language } = useTranslation()

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex gap-3 mt-2">
          {onRetry && (
            <button onClick={onRetry} className="text-sm font-medium text-primary">
              {language === "ny" ? "Yesaninso" : "Retry"}
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="text-sm text-muted-foreground">
              {language === "ny" ? "Tsekani" : "Dismiss"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
