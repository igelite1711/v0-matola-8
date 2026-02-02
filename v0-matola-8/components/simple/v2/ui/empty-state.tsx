"use client"

import type React from "react"

import { Package, Truck, Search, MapPin, Trophy, Users, CreditCard, History, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

type EmptyType = "shipments" | "loads" | "search" | "tracking" | "achievements" | "contacts" | "payments" | "history"

interface EmptyStateProps {
  type: EmptyType
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const emptyConfig = {
  shipments: {
    icon: Package,
    titleEn: "No shipments yet",
    titleNy: "Palibe katundu",
    messageEn: "Post your first load and find transporters in minutes",
    messageNy: "Tumizani katundu wanu woyamba ndipo mupeza oyendetsa mwachangu",
    actionEn: "Post a Load",
    actionNy: "Tumizani Katundu",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  loads: {
    icon: Truck,
    titleEn: "No loads available",
    titleNy: "Palibe katundu",
    messageEn: "New loads are posted frequently. Check back soon or adjust your filters.",
    messageNy: "Katundu watsopano umabwera nthawi zonse. Bweraninso posachedwa.",
    actionEn: "Refresh",
    actionNy: "Sinthani",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  search: {
    icon: Search,
    titleEn: "No results found",
    titleNy: "Palibe zopezeka",
    messageEn: "Try adjusting your search or filters to find what you're looking for.",
    messageNy: "Yesani kusintha zofufuza zanu kuti mupeze zomwe mukufuna.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  tracking: {
    icon: MapPin,
    titleEn: "No active shipments",
    titleNy: "Palibe katundu womwe ukuyenda",
    messageEn: "When you have shipments in transit, you can track them here.",
    messageNy: "Mukakhala ndi katundu woyenda, mutha kuwona pompano.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  achievements: {
    icon: Trophy,
    titleEn: "No achievements yet",
    titleNy: "Palibe zopezedwa",
    messageEn: "Complete trips and tasks to earn badges and rewards.",
    messageNy: "Pherezani maulendo ndi ntchito kuti mupeze ma badge ndi mphotho.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  contacts: {
    icon: Users,
    titleEn: "No trusted contacts",
    titleNy: "Palibe anthu okhulupirira",
    messageEn: "Add contacts who will be notified in case of emergencies.",
    messageNy: "Onjezani anthu omwe adzadziwitsidwe pa nthawi ya chiopsezo.",
    actionEn: "Add Contact",
    actionNy: "Onjezani Munthu",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  payments: {
    icon: CreditCard,
    titleEn: "No transactions yet",
    titleNy: "Palibe malonda",
    messageEn: "Your payment history will appear here once you complete your first transaction.",
    messageNy: "Mbiri ya malonda anu idzawonekera muno mukatha londa loyamba.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  history: {
    icon: History,
    titleEn: "No trip history",
    titleNy: "Palibe mbiri ya maulendo",
    messageEn: "Your completed trips will appear here for future reference.",
    messageNy: "Maulendo anu omalizidwa adzawonekera pompano.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

export function EmptyState({ type, title, message, actionLabel, onAction, className }: EmptyStateProps) {
  const { language } = useTranslation()
  const config = emptyConfig[type]
  const Icon = config.icon

  const displayTitle = title || (language === "ny" ? config.titleNy : config.titleEn)
  const displayMessage = message || (language === "ny" ? config.messageNy : config.messageEn)
  const displayAction =
    actionLabel || (config.actionEn ? (language === "ny" ? config.actionNy : config.actionEn) : null)

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className={cn("flex h-20 w-20 items-center justify-center rounded-full mb-4", config.bgColor)}>
        <Icon className={cn("h-10 w-10", config.color)} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{displayMessage}</p>
      {displayAction && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {displayAction}
        </Button>
      )}
    </div>
  )
}

// Inline empty for smaller sections
export function EmptyInline({
  icon: Icon = Package,
  message,
}: {
  icon?: React.ElementType
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
