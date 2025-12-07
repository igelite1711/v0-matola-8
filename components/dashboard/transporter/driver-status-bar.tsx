"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Power, PowerOff, Package, Wifi, WifiOff, Navigation } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { updateDriverAvailability } from "@/lib/smart-matching"

export function DriverStatusBar() {
  const { language } = useLanguage()
  const { user, isDriverOnline, setDriverOnline, driverCapacity, setDriverCapacity, showToast } = useApp()

  const [acceptingBackhaul, setAcceptingBackhaul] = useState(true)
  const [acceptingSharedLoads, setAcceptingSharedLoads] = useState(false)

  const handleOnlineToggle = () => {
    const newOnlineState = !isDriverOnline
    setDriverOnline(newOnlineState)

    // Update in matching engine
    if (user) {
      updateDriverAvailability(user.id, {
        isOnline: newOnlineState,
        capacityPercentage: driverCapacity,
        currentLocation: user.currentLocation as any,
        acceptingBackhaul,
        acceptingSharedLoads,
      })
    }
  }

  const handleCapacityChange = (value: number[]) => {
    const newCapacity = value[0]
    setDriverCapacity(newCapacity)

    if (user) {
      updateDriverAvailability(user.id, { capacityPercentage: newCapacity })
    }
  }

  const handleBackhaulToggle = (checked: boolean) => {
    setAcceptingBackhaul(checked)
    if (user) {
      updateDriverAvailability(user.id, { acceptingBackhaul: checked })
    }
    showToast(
      checked
        ? language === "en"
          ? "Backhaul offers enabled"
          : "Zofuna za backhaul zalolezedwa"
        : language === "en"
          ? "Backhaul offers disabled"
          : "Zofuna za backhaul zaletsa",
      "info",
    )
  }

  const handleSharedLoadsToggle = (checked: boolean) => {
    setAcceptingSharedLoads(checked)
    if (user) {
      updateDriverAvailability(user.id, { acceptingSharedLoads: checked })
    }
    showToast(
      checked
        ? language === "en"
          ? "Shared load offers enabled"
          : "Zofuna za shared load zalolezedwa"
        : language === "en"
          ? "Shared load offers disabled"
          : "Zofuna za shared load zaletsa",
      "info",
    )
  }

  const getCapacityLabel = (capacity: number) => {
    if (capacity === 0) return { en: "Full", ny: "Wadzaza", color: "text-red-500" }
    if (capacity <= 25) return { en: "Almost Full", ny: "Pafupifupi wadzaza", color: "text-amber-500" }
    if (capacity <= 50) return { en: "Half Space", ny: "Hafu", color: "text-yellow-500" }
    if (capacity <= 75) return { en: "Some Space", ny: "Malo ena", color: "text-blue-500" }
    return { en: "Empty", ny: "Wopanda kanthu", color: "text-green-500" }
  }

  const capacityInfo = getCapacityLabel(driverCapacity)

  return (
    <Card
      className={`border-2 transition-colors ${
        isDriverOnline ? "border-green-500/50 bg-green-500/5" : "border-muted bg-muted/20"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Online/Offline Toggle */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className={`gap-2 min-w-[140px] ${
                isDriverOnline ? "bg-green-600 hover:bg-green-700" : "bg-muted hover:bg-muted/80"
              }`}
              onClick={handleOnlineToggle}
            >
              {isDriverOnline ? (
                <>
                  <Power className="h-5 w-5" />
                  {language === "en" ? "Online" : "Pa Intaneti"}
                </>
              ) : (
                <>
                  <PowerOff className="h-5 w-5" />
                  {language === "en" ? "Offline" : "Kunja kwa Intaneti"}
                </>
              )}
            </Button>

            <div className="hidden sm:block">
              {isDriverOnline ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Wifi className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    {language === "en" ? "Receiving load offers" : "Akulandira zofuna"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">{language === "en" ? "Not receiving offers" : "Sakuulandira zofuna"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Capacity Slider */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{language === "en" ? "Truck Capacity" : "Malo a Galimoto"}</span>
              </div>
              <Badge className={`${capacityInfo.color} bg-transparent border border-current`}>
                {driverCapacity}% {capacityInfo[language]}
              </Badge>
            </div>
            <Slider
              value={[driverCapacity]}
              onValueChange={handleCapacityChange}
              max={100}
              step={25}
              disabled={!isDriverOnline}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{language === "en" ? "Full" : "Wadzaza"}</span>
              <span>{language === "en" ? "Empty" : "Wopanda"}</span>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={acceptingBackhaul} onCheckedChange={handleBackhaulToggle} disabled={!isDriverOnline} />
              <label className="text-sm cursor-pointer">{language === "en" ? "Backhaul" : "Kubwerera"}</label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={acceptingSharedLoads}
                onCheckedChange={handleSharedLoadsToggle}
                disabled={!isDriverOnline || driverCapacity === 0}
              />
              <label className="text-sm cursor-pointer">{language === "en" ? "Shared Loads" : "Kogawana"}</label>
            </div>
          </div>

          {/* Location Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4 text-primary" />
            <span>{user?.currentLocation?.city || "Lilongwe"}</span>
          </div>
        </div>

        {/* Shared Loads Explainer */}
        {acceptingSharedLoads && driverCapacity > 0 && driverCapacity < 100 && (
          <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
            <span className="font-medium">{language === "en" ? "Shared Loads Active:" : "Kogawana Kwayamba:"}</span>{" "}
            {language === "en"
              ? `You'll receive offers for loads that fit your ${driverCapacity}% available space`
              : `Mudzalandira zofuna za katundu zomwe zikuyenera malo anu a ${driverCapacity}%`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
