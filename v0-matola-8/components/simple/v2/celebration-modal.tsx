"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Share2, Trophy, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type Achievement,
  getRandomCelebrationMessage,
  getRarityColor,
  getRarityBgColor,
  getUserLevel,
} from "@/lib/gamification/celebration-system"

interface CelebrationModalProps {
  achievement: Achievement
  language: "en" | "ny"
  totalPoints: number
  onClose: () => void
  onShare?: () => void
}

// Confetti particle component
function Confetti() {
  const colors = ["#F97316", "#10B981", "#3B82F6", "#EAB308", "#EC4899", "#8B5CF6"]
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      color: string
      rotation: number
      scale: number
      delay: number
    }>
  >([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animationDelay: `${particle.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}

// Sparkle effect around the achievement icon
function SparkleRing() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <Sparkles
          key={i}
          className="absolute w-4 h-4 text-warning animate-sparkle"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 45}deg) translateY(-60px)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

export function CelebrationModal({ achievement, language, totalPoints, onClose, onShare }: CelebrationModalProps) {
  const [showContent, setShowContent] = useState(false)
  const level = getUserLevel(totalPoints)
  const celebrationMessage = getRandomCelebrationMessage("badge_earned", language)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Play celebration sound (if available)
  useEffect(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      // Haptic feedback pattern: celebration!
      navigator.vibrate([100, 50, 100, 50, 200])
    }
  }, [])

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare()
    } else if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: language === "ny" ? "Ndapeza Achievement pa Matola!" : "I earned an Achievement on Matola!",
        text:
          language === "ny"
            ? `Ndapeza ${achievement.nameNy} pa Matola - malo obwino onyamula katundu ku Malawi!`
            : `I just earned ${achievement.name} on Matola - the best transport platform in Malawi!`,
        url: "https://matola.mw",
      })
    }
  }, [achievement, language, onShare])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      {/* Confetti */}
      <Confetti />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-sm mx-4 rounded-3xl bg-card border border-border p-8 text-center transition-all duration-500",
          showContent ? "scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Achievement Icon with glow effect */}
        <div className="relative mx-auto mb-6 flex items-center justify-center">
          <div
            className={cn(
              "relative flex h-28 w-28 items-center justify-center rounded-full",
              getRarityBgColor(achievement.rarity),
              "animate-pulse-slow",
            )}
          >
            {/* Glow effect */}
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-xl opacity-50",
                achievement.rarity === "legendary"
                  ? "bg-warning"
                  : achievement.rarity === "epic"
                    ? "bg-purple-500"
                    : achievement.rarity === "rare"
                      ? "bg-primary"
                      : "bg-success",
              )}
            />
            <span className="relative text-6xl z-10">{achievement.icon}</span>
            <SparkleRing />
          </div>
        </div>

        {/* Rarity Badge */}
        <div className="mb-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              getRarityBgColor(achievement.rarity),
              getRarityColor(achievement.rarity),
            )}
          >
            {achievement.rarity === "legendary" && <Trophy className="h-3 w-3" />}
            {achievement.rarity === "epic" && <Star className="h-3 w-3" />}
            {achievement.rarity}
          </span>
        </div>

        {/* Achievement Name */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === "ny" ? achievement.nameNy : achievement.name}
        </h2>

        {/* Celebration Message */}
        <p className="text-primary font-medium mb-2">{celebrationMessage}</p>

        {/* Description */}
        <p className="text-muted-foreground mb-4">
          {language === "ny" ? achievement.descriptionNy : achievement.description}
        </p>

        {/* Points Earned */}
        <div className="mb-6 flex items-center justify-center gap-2 text-warning">
          <Sparkles className="h-5 w-5" />
          <span className="text-xl font-bold">+{achievement.points}</span>
          <span className="text-sm">{language === "ny" ? "mfundo" : "points"}</span>
        </div>

        {/* Level Progress */}
        <div className="mb-6 p-4 rounded-2xl bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {language === "ny" ? "Mulingo" : "Level"} {level.level}
            </span>
            <span className="text-sm font-medium text-foreground">
              {language === "ny" ? level.titleNy : level.title}
            </span>
          </div>
          <div className="h-2 rounded-full bg-background overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-1000"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          {level.pointsToNext > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {level.pointsToNext} {language === "ny" ? "mfundo kuti mukwere" : "points to next level"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 h-12 rounded-xl border-border bg-transparent"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {language === "ny" ? "Gawanani" : "Share"}
          </Button>
          <Button onClick={onClose} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground">
            {language === "ny" ? "Chabwino!" : "Awesome!"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Mini toast notification for smaller achievements
export function AchievementToast({
  achievement,
  language,
  onClose,
}: {
  achievement: Achievement
  language: "en" | "ny"
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border p-4 shadow-lg max-w-sm",
          getRarityBgColor(achievement.rarity),
        )}
      >
        <span className="text-3xl">{achievement.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{language === "ny" ? achievement.nameNy : achievement.name}</p>
          <p className="text-sm text-muted-foreground">+{achievement.points} points</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-background/50 rounded-full">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
