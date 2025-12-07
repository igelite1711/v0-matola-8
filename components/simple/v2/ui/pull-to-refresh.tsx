"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current

      if (diff > 0 && containerRef.current?.scrollTop === 0) {
        setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5))
      }
    },
    [isRefreshing],
  )

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
  }, [pullDistance, isRefreshing, onRefresh])

  const isReady = pullDistance >= THRESHOLD

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: pullDistance, top: 0 }}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-transform",
            isRefreshing && "animate-spin",
            isReady && "scale-110",
          )}
          style={{
            transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined,
          }}
        >
          <RefreshCw className={cn("h-5 w-5", isReady ? "text-primary" : "text-muted-foreground")} />
        </div>
      </div>

      {/* Content */}
      <div className="transition-transform duration-200" style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  )
}
