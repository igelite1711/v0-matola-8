"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
}

// Inline button loading state
export function ButtonLoading({
  children,
  isLoading,
  className,
}: {
  children: React.ReactNode
  isLoading: boolean
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {isLoading && <Spinner size="sm" />}
      {children}
    </span>
  )
}

// Full screen loading overlay
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

// Inline loading for sections
export function SectionLoading({ height = "h-32" }: { height?: string }) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <Spinner size="md" />
    </div>
  )
}
