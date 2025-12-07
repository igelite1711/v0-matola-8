"use client"

import { useState } from "react"
import { Truck, MapPin, ArrowRight, Package, Star, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOCK_LOADS = [
  {
    id: "LD001",
    origin: "Lilongwe",
    destination: "Blantyre",
    cargo: "Farm Produce",
    weight: "2,500 kg",
    price: "MK 85,000",
    distance: "320 km",
    shipper: { name: "Farmers Co-op", rating: 4.8 },
    matchScore: 95,
    isBackhaul: true,
  },
  {
    id: "LD002",
    origin: "Lilongwe",
    destination: "Mzuzu",
    cargo: "General Goods",
    weight: "1,200 kg",
    price: "MK 65,000",
    distance: "350 km",
    shipper: { name: "QuickMart", rating: 4.5 },
    matchScore: 82,
    isBackhaul: false,
  },
  {
    id: "LD003",
    origin: "Lilongwe",
    destination: "Salima",
    cargo: "Building Materials",
    weight: "5,000 kg",
    price: "MK 45,000",
    distance: "100 km",
    shipper: { name: "BuildRight Ltd", rating: 4.9 },
    matchScore: 78,
    isBackhaul: false,
  },
]

export function TransporterHome() {
  const [isOnline, setIsOnline] = useState(true)

  const stats = [
    { label: "Today", value: "MK 85,000", sublabel: "Earned" },
    { label: "This Week", value: "5", sublabel: "Trips" },
    { label: "Rating", value: "4.8", sublabel: "Stars" },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Status Toggle */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-card p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              isOnline ? "bg-success/10" : "bg-muted",
            )}
          >
            <Truck className={cn("h-6 w-6", isOnline ? "text-success" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{isOnline ? "You're Online" : "You're Offline"}</p>
            <p className="text-sm text-muted-foreground">
              {isOnline ? "Receiving load requests" : "Not receiving requests"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={cn("relative h-8 w-14 rounded-full transition-colors", isOnline ? "bg-success" : "bg-muted")}
        >
          <div
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white transition-transform",
              isOnline ? "left-7" : "left-1",
            )}
          />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl bg-card p-4 text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Recommended Loads */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recommended Loads</h2>
            <p className="text-sm text-muted-foreground">Based on your route history</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {MOCK_LOADS.map((load) => (
            <LoadCard key={load.id} load={load} />
          ))}
        </div>
      </div>

      {/* Empty Return Trip CTA */}
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
        <Zap className="mx-auto mb-2 h-8 w-8 text-primary" />
        <p className="mb-1 font-semibold text-foreground">Empty Return?</p>
        <p className="mb-3 text-sm text-muted-foreground">Tap to find loads on your way back</p>
        <Button size="sm" className="bg-primary text-primary-foreground">
          Find Return Loads
        </Button>
      </div>
    </div>
  )
}

function LoadCard({ load }: { load: (typeof MOCK_LOADS)[0] }) {
  return (
    <div className="group rounded-2xl bg-card p-4 transition-all hover:bg-card/80">
      {/* Header with match score */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {load.isBackhaul && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Backhaul</span>
          )}
          <span className="text-xs text-muted-foreground">{load.distance}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
          <span className="text-xs font-semibold text-primary">{load.matchScore}%</span>
          <span className="text-xs text-primary">match</span>
        </div>
      </div>

      {/* Route */}
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{load.origin}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{load.destination}</span>
      </div>

      {/* Details */}
      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {load.cargo}
        </span>
        <span>•</span>
        <span>{load.weight}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <span className="text-xs font-medium text-foreground">{load.shipper.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{load.shipper.name}</p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-xs text-muted-foreground">{load.shipper.rating}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">{load.price}</p>
          <p className="text-xs text-muted-foreground">Offered</p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 border-border text-muted-foreground bg-transparent">
          Details
        </Button>
        <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          Accept
        </Button>
      </div>
    </div>
  )
}
