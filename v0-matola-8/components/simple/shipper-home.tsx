"use client"

import { useState } from "react"
import { Package, Clock, CheckCircle2, ArrowRight, MapPin, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOCK_SHIPMENTS = [
  {
    id: "SH001",
    origin: "Lilongwe",
    destination: "Blantyre",
    status: "in_transit",
    cargo: "Farm Produce",
    weight: "2,500 kg",
    transporter: "John M.",
    eta: "Today, 4:00 PM",
  },
  {
    id: "SH002",
    origin: "Mzuzu",
    destination: "Lilongwe",
    status: "pending",
    cargo: "General Goods",
    weight: "1,000 kg",
    matches: 3,
  },
  {
    id: "SH003",
    origin: "Blantyre",
    destination: "Zomba",
    status: "completed",
    cargo: "Building Materials",
    weight: "5,000 kg",
    completedAt: "Yesterday",
  },
]

export function ShipperHome() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const stats = [
    { label: "Active", value: 2, color: "text-primary" },
    { label: "This Month", value: 12, color: "text-foreground" },
    { label: "Saved", value: "MK 45,000", color: "text-success" },
  ]

  const filteredShipments = MOCK_SHIPMENTS.filter((s) => {
    if (filter === "active") return s.status !== "completed"
    if (filter === "completed") return s.status === "completed"
    return true
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Good morning</h1>
        <p className="text-muted-foreground">What would you like to ship today?</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl bg-card p-4 text-center">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Primary CTA - Hidden on mobile (shown in bottom nav) */}
      <div className="mb-8 hidden md:block">
        <Button className="w-full gap-2 bg-primary py-6 text-lg text-primary-foreground hover:bg-primary/90">
          <Plus className="h-5 w-5" />
          Post a New Load
        </Button>
      </div>

      {/* Shipments Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Shipments</h2>
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>

        {filteredShipments.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No shipments found</p>
          </div>
        )}
      </div>

      {/* Market Insight */}
      <div className="mt-8 rounded-2xl bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Market Insight</span>
        </div>
        <p className="text-sm text-foreground">
          <span className="font-semibold text-success">High demand</span> for Lilongwe → Blantyre route. 8 transporters
          available.
        </p>
      </div>
    </div>
  )
}

function ShipmentCard({ shipment }: { shipment: (typeof MOCK_SHIPMENTS)[0] }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Finding Transporters",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    in_transit: {
      icon: Package,
      label: "In Transit",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    completed: {
      icon: CheckCircle2,
      label: "Delivered",
      color: "text-success",
      bg: "bg-success/10",
    },
  }

  const status = statusConfig[shipment.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <div className="group rounded-2xl bg-card p-4 transition-all hover:bg-card/80">
      {/* Route */}
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{shipment.origin}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{shipment.destination}</span>
      </div>

      {/* Details */}
      <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{shipment.cargo}</span>
        <span>•</span>
        <span>{shipment.weight}</span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 rounded-full px-3 py-1", status.bg)}>
          <StatusIcon className={cn("h-4 w-4", status.color)} />
          <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
        </div>

        {shipment.status === "pending" && shipment.matches && (
          <span className="text-sm text-muted-foreground">{shipment.matches} matches</span>
        )}

        {shipment.status === "in_transit" && shipment.eta && (
          <span className="text-sm text-muted-foreground">ETA: {shipment.eta}</span>
        )}

        {shipment.status === "completed" && shipment.completedAt && (
          <span className="text-sm text-muted-foreground">{shipment.completedAt}</span>
        )}
      </div>
    </div>
  )
}
