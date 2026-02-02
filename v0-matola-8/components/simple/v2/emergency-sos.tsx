"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Phone, MapPin, Share2, X, Shield, Siren, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

interface EmergencyContact {
  id: string
  name: string
  nameNy: string
  phone: string
  icon: React.ElementType
  color: string
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "police",
    name: "Police",
    nameNy: "Apolisi",
    phone: "997",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    nameNy: "Ambulansi",
    phone: "998",
    icon: Siren,
    color: "bg-red-500",
  },
  {
    id: "matola",
    name: "Matola Support",
    nameNy: "Thandizo la Matola",
    phone: "+265999123456",
    icon: MessageCircle,
    color: "bg-primary",
  },
]

export function EmergencySOS({ onClose }: { onClose: () => void }) {
  const { language } = useTranslation()
  const [isSharing, setIsSharing] = useState(false)
  const [locationShared, setLocationShared] = useState(false)

  const handleShareLocation = async () => {
    setIsSharing(true)

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        })

        // In production, this would send to emergency contacts
        console.log("Location shared:", position.coords)
        setLocationShared(true)
      } catch (error) {
        console.error("Failed to get location:", error)
      }
    }

    setIsSharing(false)
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="fixed inset-0 z-[100] bg-destructive/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {language === "ny" ? "Chithandizo Chadzidzidzi" : "Emergency SOS"}
              </h1>
              <p className="text-sm text-white/70">
                {language === "ny" ? "Thandizo lilipo 24/7" : "Help is available 24/7"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Share Location - Most Important */}
          <div className="mb-6">
            <Button
              onClick={handleShareLocation}
              disabled={isSharing || locationShared}
              className={cn(
                "w-full h-20 rounded-2xl text-lg font-bold transition-all",
                locationShared ? "bg-success text-white" : "bg-white text-destructive hover:bg-white/90",
              )}
            >
              {locationShared ? (
                <>
                  <MapPin className="mr-3 h-6 w-6" />
                  {language === "ny" ? "Malo Atumizidwa!" : "Location Shared!"}
                </>
              ) : isSharing ? (
                <>
                  <div className="mr-3 h-6 w-6 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                  {language === "ny" ? "Kutumiza..." : "Sharing..."}
                </>
              ) : (
                <>
                  <Share2 className="mr-3 h-6 w-6" />
                  {language === "ny" ? "Tumizani Malo Anu" : "Share My Location"}
                </>
              )}
            </Button>
            <p className="text-center text-sm text-white/60 mt-2">
              {language === "ny"
                ? "Malo anu adzatumizidwa kwa anthu anu ndi apolisi"
                : "Your location will be sent to your contacts and police"}
            </p>
          </div>

          {/* Emergency Contacts */}
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            {language === "ny" ? "Imbani Chithandizo" : "Call for Help"}
          </h2>

          <div className="space-y-3 mb-6">
            {EMERGENCY_CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleCall(contact.phone)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", contact.color)}>
                  <contact.icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white text-lg">
                    {language === "ny" ? contact.nameNy : contact.name}
                  </p>
                  <p className="text-sm text-white/60">{contact.phone}</p>
                </div>
                <Phone className="h-6 w-6 text-white" />
              </button>
            ))}
          </div>

          {/* Trusted Contacts */}
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            {language === "ny" ? "Anthu Anu Okhulupirira" : "Your Trusted Contacts"}
          </h2>

          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-white/60" />
              <span className="text-white/60">
                {language === "ny" ? "Palibe anthu okhulupirira" : "No trusted contacts added"}
              </span>
            </div>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
              {language === "ny" ? "Onjezani Anthu" : "Add Contacts"}
            </Button>
          </div>

          {/* Safety Tips */}
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white mb-2">
              {language === "ny" ? "Malangizo a Chitetezo" : "Safety Tips"}
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• {language === "ny" ? "Khalani pomwe pali anthu" : "Stay in well-lit areas"}</li>
              <li>• {language === "ny" ? "Uzani wina komwe muli" : "Let someone know your location"}</li>
              <li>• {language === "ny" ? "Sungani foni yanu yochajidwa" : "Keep your phone charged"}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="p-4 border-t border-white/10">
          <p className="text-center text-xs text-white/40">
            {language === "ny"
              ? "Mukadandaula, imbani 997 nthawi yomweyo"
              : "If in immediate danger, call 997 immediately"}
          </p>
        </div>
      </div>
    </div>
  )
}

// Floating SOS Button Component
export function FloatingSOSButton() {
  const { language } = useTranslation()
  const [showSOS, setShowSOS] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPressing, setIsPressing] = useState(false)

  const handlePressStart = () => {
    setIsPressing(true)
    const timer = setTimeout(() => {
      setShowSOS(true)
      setIsPressing(false)
    }, 1500) // 1.5 second long press
    setLongPressTimer(timer)
  }

  const handlePressEnd = () => {
    setIsPressing(false)
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  return (
    <>
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={cn(
          "fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          isPressing ? "bg-destructive scale-110 animate-pulse" : "bg-destructive/80 hover:bg-destructive",
        )}
      >
        <AlertTriangle className="h-6 w-6 text-white" />

        {/* Progress ring when pressing */}
        {isPressing && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="163.36"
              className="animate-[sos-progress_1.5s_linear_forwards]"
              style={{
                strokeDashoffset: 163.36,
              }}
            />
          </svg>
        )}
      </button>

      {/* Hint tooltip */}
      {!showSOS && (
        <div className="fixed bottom-24 right-20 z-30 bg-card rounded-lg px-3 py-2 shadow-lg border border-border opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {language === "ny" ? "Dinani nthawi yaitali pa SOS" : "Long press for SOS"}
          </p>
        </div>
      )}

      {showSOS && <EmergencySOS onClose={() => setShowSOS(false)} />}

      <style jsx>{`
        @keyframes sos-progress {
          from {
            stroke-dashoffset: 163.36;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  )
}
