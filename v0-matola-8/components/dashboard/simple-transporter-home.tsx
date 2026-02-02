"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import { formatPrice } from "@/lib/matching-engine"
import { Truck, Package, TrendingUp, MapPin, ArrowRight, Zap, Power } from "lucide-react"

export function SimpleTransporterHome() {
  const { language } = useLanguage()
  const router = useRouter()
  const { user, shipments, isDriverOnline, setDriverOnline } = useApp()

  // Simple stats
  const activeJobs = shipments.filter((s) => ["confirmed", "picked_up", "in_transit"].includes(s.status))
  const availableLoads = shipments.filter((s) => s.status === "posted")

  // Mock earnings
  const monthlyEarnings = 485000

  return (
    <div className="space-y-6">
      {/* Greeting + Online Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language === "en"
              ? `Hello, ${user?.name?.split(" ")[0] || "Driver"}`
              : `Moni, ${user?.name?.split(" ")[0] || "Woyendetsa"}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isDriverOnline
              ? language === "en"
                ? "You're online and receiving loads"
                : "Muli pa intaneti"
              : language === "en"
                ? "Go online to receive loads"
                : "Pitani pa intaneti"}
          </p>
        </div>

        <Card
          className={`border ${isDriverOnline ? "border-chart-3/50 bg-chart-3/10" : "border-destructive/50 bg-destructive/10"}`}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <Power className={`h-4 w-4 ${isDriverOnline ? "text-chart-3" : "text-destructive"}`} />
            <Switch checked={isDriverOnline} onCheckedChange={setDriverOnline} />
            <span className={`text-sm font-medium ${isDriverOnline ? "text-chart-3" : "text-destructive"}`}>
              {isDriverOnline
                ? language === "en"
                  ? "Online"
                  : "Pa Intaneti"
                : language === "en"
                  ? "Offline"
                  : "Opanda Intaneti"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats - 3 key numbers */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <Truck className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold text-foreground">{activeJobs.length}</p>
            <p className="text-xs text-muted-foreground">{language === "en" ? "Active" : "Zikuyenda"}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto text-chart-2 mb-1" />
            <p className="text-xl font-bold text-foreground">{availableLoads.length}</p>
            <p className="text-xs text-muted-foreground">{language === "en" ? "Available" : "Opezeka"}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-chart-3 mb-1" />
            <p className="text-xl font-bold text-foreground">MK {(monthlyEarnings / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">{language === "en" ? "This Month" : "Mwezi Uno"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Job - If any */}
      {activeJobs.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              {language === "en" ? "Current Job" : "Ntchito Yapano"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3 text-chart-3" />
                <span className="font-medium">{activeJobs[0].origin.city}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{activeJobs[0].destination.city}</span>
              </div>
              <Button size="sm" onClick={() => router.push(`/dashboard/transporter/my-jobs`)}>
                {language === "en" ? "View" : "Onani"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Loads - Only show when online */}
      {isDriverOnline && availableLoads.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-4" />
                {language === "en" ? "Recommended" : "Zokuyenerani"}
              </CardTitle>
              <Badge variant="secondary">{availableLoads.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableLoads.slice(0, 3).map((load) => (
              <div
                key={load.id}
                onClick={() => router.push(`/dashboard/transporter/find-loads`)}
                className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{load.origin.city}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{load.destination.city}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {load.weight.toLocaleString()}kg • {load.cargoDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(load.price)}</p>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/dashboard/transporter/find-loads")}
            >
              {language === "en" ? "See All Loads" : "Onani Zonse"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline State */}
      {!isDriverOnline && (
        <Card className="border-dashed border-2 border-border bg-transparent">
          <CardContent className="p-8 text-center">
            <Power className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-1">
              {language === "en" ? "You're offline" : "Muli opanda intaneti"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? "Go online to receive load recommendations"
                : "Pitani pa intaneti kuti mulandire katundu"}
            </p>
            <Button onClick={() => setDriverOnline(true)}>
              <Power className="h-4 w-4 mr-2" />
              {language === "en" ? "Go Online" : "Pitani pa Intaneti"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
