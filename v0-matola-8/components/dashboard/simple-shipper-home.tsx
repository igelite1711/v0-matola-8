"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import { QuickActionsBar } from "./quick-actions"
import { Package, Truck, CheckCircle, ArrowRight } from "lucide-react"

export function SimpleShipperHome() {
  const { language } = useLanguage()
  const { user, shipments } = useApp()

  // Simple counts
  const activeCount = shipments.filter((s) => ["posted", "assigned", "in-transit"].includes(s.status)).length
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length

  // Recent shipments (max 3)
  const recentShipments = shipments.slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "bg-chart-2/20 text-chart-2"
      case "delivered":
        return "bg-chart-3/20 text-chart-3"
      case "posted":
      case "pending":
        return "bg-chart-4/20 text-chart-4"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ny: string }> = {
      posted: { en: "Finding Driver", ny: "Akusakidwa" },
      assigned: { en: "Driver Found", ny: "Apezeka" },
      "in-transit": { en: "On the Way", ny: "Pa Njira" },
      delivered: { en: "Delivered", ny: "Yafika" },
      pending: { en: "Pending", ny: "Ikudikira" },
    }
    return labels[status]?.[language] || status
  }

  return (
    <div className="space-y-6">
      {/* Greeting - Simple */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {language === "en"
            ? `Hello, ${user?.name?.split(" ")[0] || "there"}`
            : `Moni, ${user?.name?.split(" ")[0] || ""}`}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "What would you like to do today?" : "Mukufuna kuchita chiyani lero?"}
        </p>
      </div>

      {/* Primary Actions */}
      <QuickActionsBar userType="shipper" />

      {/* Simple Stats - Just 2 numbers */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">{language === "en" ? "Active" : "Zikuyenda"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/10">
              <CheckCircle className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{deliveredCount}</p>
              <p className="text-xs text-muted-foreground">{language === "en" ? "Delivered" : "Zafika"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Simplified */}
      {recentShipments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{language === "en" ? "Recent Activity" : "Posachedwapa"}</h3>
            <Link href="/dashboard/shipments" className="text-sm text-primary hover:underline flex items-center gap-1">
              {language === "en" ? "View all" : "Onani zonse"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentShipments.map((shipment) => (
              <Link key={shipment.id} href={`/dashboard/shipments/${shipment.id}`}>
                <Card className="border-border bg-card hover:border-primary/50 transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <span>{shipment.origin.city}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{shipment.destination.city}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{shipment.weight.toLocaleString()}kg</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(shipment.status)}`}>
                      {getStatusLabel(shipment.status)}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentShipments.length === 0 && (
        <Card className="border-dashed border-2 border-border bg-transparent">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-1">
              {language === "en" ? "No shipments yet" : "Palibe katundu pano"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en" ? "Post your first load to get started" : "Ikani katundu woyamba kuti muyambe"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
