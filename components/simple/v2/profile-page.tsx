"use client"

import { useState } from "react"
import {
  Shield,
  Star,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe,
  Bell,
  Lock,
  CreditCard,
  Users,
  Award,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { getTrustLevel, BADGE_DEFINITIONS, type BadgeType } from "@/lib/trust/trust-system"
import { getUserLevel } from "@/lib/gamification/celebration-system"
import { formatMWK } from "@/lib/payments/mobile-money"
import Link from "next/link"

const MOCK_USER = {
  name: "Chisomo Banda",
  phone: "+265 999 123 456",
  email: "chisomo@example.com",
  location: "Lilongwe",
  role: "transporter" as const,
  verified: true,
  joinedAt: "March 2024",
  trustScore: 85,
  totalPoints: 2450,
  totalTrips: 47,
  totalEarnings: 1850000,
  rating: 4.8,
  ratingCount: 42,
  badges: ["first_trip", "trips_10", "trips_25", "fast_responder", "route_expert", "community_vouched"] as BadgeType[],
}

export function ProfilePage() {
  const { language, setLanguage } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)

  const trustLevel = getTrustLevel(MOCK_USER.trustScore)
  const level = getUserLevel(MOCK_USER.totalPoints)

  const menuItems = [
    {
      icon: Trophy,
      label: language === "ny" ? "Zopezedwa" : "Achievements",
      sublabel: `${MOCK_USER.badges.length} badges`,
      href: "/simple/v2/achievements",
      color: "text-warning",
    },
    {
      icon: TrendingUp,
      label: language === "ny" ? "Oyamba" : "Leaderboard",
      sublabel: language === "ny" ? "Onani malo anu" : "See your rank",
      href: "/simple/v2/leaderboard",
      color: "text-primary",
    },
    {
      icon: CreditCard,
      label: language === "ny" ? "Ndalama" : "Wallet & Payments",
      sublabel: formatMWK(MOCK_USER.totalEarnings),
      href: "/simple/v2/wallet",
      color: "text-success",
    },
    {
      icon: Users,
      label: language === "ny" ? "Anthu Okhulupirira" : "Trusted Contacts",
      sublabel: language === "ny" ? "3 anthu" : "3 contacts",
      href: "/simple/v2/contacts",
      color: "text-primary",
    },
  ]

  const settingsItems = [
    {
      icon: Bell,
      label: language === "ny" ? "Zidziwitso" : "Notifications",
      href: "/simple/v2/settings/notifications",
    },
    {
      icon: Lock,
      label: language === "ny" ? "Chitetezo" : "Security & PIN",
      href: "/simple/v2/settings/security",
    },
    {
      icon: Globe,
      label: language === "ny" ? "Chilankhulo" : "Language",
      action: () => setLanguage(language === "en" ? "ny" : "en"),
      value: language === "en" ? "English" : "Chichewa",
    },
    {
      icon: HelpCircle,
      label: language === "ny" ? "Thandizo" : "Help & Support",
      href: "/simple/v2/help",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background pb-20 pt-8">
        <div className="mx-auto max-w-2xl px-4">
          {/* Settings button */}
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Card */}
          <div className="relative">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground border-4 border-background">
                  {MOCK_USER.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </button>
                {MOCK_USER.verified && (
                  <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Role */}
            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold text-foreground">{MOCK_USER.name}</h1>
              <p className="text-muted-foreground capitalize">
                {MOCK_USER.role === "transporter"
                  ? language === "ny"
                    ? "Woyendetsa"
                    : "Transporter"
                  : language === "ny"
                    ? "Wotumiza"
                    : "Shipper"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-card border border-border p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-foreground">{MOCK_USER.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {MOCK_USER.ratingCount} {language === "ny" ? "mfundo" : "reviews"}
                </p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 text-center">
                <p className="font-bold text-foreground">{MOCK_USER.totalTrips}</p>
                <p className="text-xs text-muted-foreground">{language === "ny" ? "Maulendo" : "Trips"}</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield
                    className={cn("h-4 w-4", trustLevel.level === "highly_trusted" ? "text-success" : "text-primary")}
                  />
                  <span className="font-bold text-foreground">{MOCK_USER.trustScore}</span>
                </div>
                <p className="text-xs text-muted-foreground">{language === "ny" ? "Kudalira" : "Trust"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 -mt-10">
        {/* Level Progress Card */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                {level.level}
              </div>
              <div>
                <p className="font-semibold text-foreground">{language === "ny" ? level.titleNy : level.title}</p>
                <p className="text-sm text-muted-foreground">
                  {MOCK_USER.totalPoints.toLocaleString()} {language === "ny" ? "mfundo" : "points"}
                </p>
              </div>
            </div>
            <Link href="/simple/v2/achievements">
              <Button variant="ghost" size="sm" className="text-primary">
                <Award className="h-4 w-4 mr-1" />
                {MOCK_USER.badges.length}
              </Button>
            </Link>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success rounded-full"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {level.pointsToNext} {language === "ny" ? "mfundo kuti mulingo wotsatira" : "points to next level"}
          </p>
        </div>

        {/* Badges Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{language === "ny" ? "Ma Badge" : "Badges"}</h3>
            <Link href="/simple/v2/achievements" className="text-sm text-primary">
              {language === "ny" ? "Onani Onse" : "View All"}
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {MOCK_USER.badges.slice(0, 5).map((badge) => {
              const def = BADGE_DEFINITIONS[badge]
              if (!def) return null
              return (
                <div
                  key={badge}
                  className="flex-shrink-0 flex items-center gap-2 rounded-full bg-card border border-border px-3 py-2"
                >
                  <span className="text-lg">{def.icon}</span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {language === "ny" ? def.nameNy : def.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{language === "ny" ? "Za Inu" : "Contact Info"}</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{MOCK_USER.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{MOCK_USER.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{MOCK_USER.location}</span>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-secondary", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden mb-6">
          {settingsItems.map((item, i) => (
            <div key={i}>
              {item.href ? (
                <Link href={item.href}>
                  <div className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-left text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </button>
              )}
              {i < settingsItems.length - 1 && <div className="h-px bg-border mx-4" />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {language === "ny" ? "Tulukani" : "Log Out"}
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Matola v2.0.0 • {language === "ny" ? "Wopangidwa ku Malawi" : "Made in Malawi"}
        </p>
      </div>
    </div>
  )
}
