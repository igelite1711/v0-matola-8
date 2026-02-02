"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, MapPin, Clock, Filter, Search, ArrowRight, Truck, Star, X, Leaf, Route } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { formatPrice } from "@/lib/matching-engine"
import { LoadDetailModal } from "./load-detail-modal"
import type { Shipment } from "@/lib/types"

const locations = [
  { name: "Zonse", value: "All", region: "" },
  { name: "Lilongwe", value: "Lilongwe", region: "Central" },
  { name: "Blantyre", value: "Blantyre", region: "Southern" },
  { name: "Mzuzu", value: "Mzuzu", region: "Northern" },
  { name: "Zomba", value: "Zomba", region: "Southern" },
  { name: "Kasungu", value: "Kasungu", region: "Central" },
  { name: "Mangochi", value: "Mangochi", region: "Southern" },
  { name: "Karonga", value: "Karonga", region: "Northern" },
  { name: "Mchinji", value: "Mchinji", region: "Central" },
  { name: "Mwanza", value: "Mwanza", region: "Southern" },
]

const cargoFilters = [
  { name: "Zonse", value: "All" },
  { name: "Chimanga (Maize)", value: "maize" },
  { name: "Fodya (Tobacco)", value: "tobacco" },
  { name: "Simenti (Cement)", value: "cement" },
  { name: "Feteleza (Fertilizer)", value: "fertilizer" },
  { name: "Zaulimi (Agricultural)", value: "agricultural" },
  { name: "Zomangira (Construction)", value: "construction" },
  { name: "Katundu Wamba (General)", value: "general" },
]

export function FindLoads() {
  const [searchQuery, setSearchQuery] = useState("")
  const [originFilter, setOriginFilter] = useState("All")
  const [destinationFilter, setDestinationFilter] = useState("All")
  const [cargoFilter, setCargoFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { shipments } = useApp()

  const filteredLoads = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.shipperName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesOrigin = originFilter === "All" || shipment.origin.city === originFilter
    const matchesDest = destinationFilter === "All" || shipment.destination.city === destinationFilter
    const matchesCargo = cargoFilter === "All" || shipment.cargoType === cargoFilter

    return matchesSearch && matchesOrigin && matchesDest && matchesCargo && shipment.status === "posted"
  })

  const handleOpenDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setModalOpen(true)
  }

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "Tsopano lino"
    if (hours < 24) return `${hours} maola apitawo`
    return `${Math.floor(hours / 24)} masiku apitawo`
  }

  const getCargoNameNy = (cargoType: string) => {
    const names: Record<string, string> = {
      maize: "Chimanga",
      tobacco: "Fodya",
      tea: "Tiyi",
      sugar: "Shuga",
      fertilizer: "Feteleza",
      cement: "Simenti",
      agricultural: "Zaulimi",
      construction: "Zomangira",
      general: "Katundu Wamba",
      perishable: "Zoola Msanga",
    }
    return names[cargoType] || cargoType
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Pezani Katundu (Find Loads)</h2>
        <p className="text-sm text-muted-foreground">Onani katundu wopezeka ndipo mutenge ntchito</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-3 sm:pt-6">
          <div className="flex gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sakani katundu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 sm:h-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              className="h-11 w-11 shrink-0 sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:mt-4 sm:grid-cols-3 sm:gap-4 sm:pt-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Kuchokera (Origin)</Label>
                <Select value={originFilter} onValueChange={setOriginFilter}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.name} {loc.region && `(${loc.region})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Kupita (Destination)</Label>
                <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.name} {loc.region && `(${loc.region})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Mtundu wa Katundu (Cargo Type)</Label>
                <Select value={cargoFilter} onValueChange={setCargoFilter}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cargoFilters.map((cargo) => (
                      <SelectItem key={cargo.value} value={cargo.value}>
                        {cargo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs text-muted-foreground sm:text-sm">{filteredLoads.length} katundu wopezeka</p>

        {filteredLoads.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Palibe katundu wopezeka</p>
              <p className="text-sm text-muted-foreground text-center">
                Sinthani zofufuza zanu kuti mupeze katundu wina
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLoads.map((shipment) => (
            <Card
              key={shipment.id}
              className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50"
            >
              <CardContent className="p-4 sm:p-6">
                {/* Mobile layout */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">
                            #{shipment.id.toUpperCase().slice(0, 8)}
                          </p>
                          {shipment.isBackhaul && (
                            <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0">-40%</Badge>
                          )}
                          {shipment.seasonalCategory && (
                            <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">
                              <Leaf className="h-2 w-2 mr-0.5" />
                              Nyengo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatPrice(shipment.price)}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{shipment.origin.city}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{shipment.destination.city}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="text-primary font-medium">{getCargoNameNy(shipment.cargoType)}</span>
                    <span>*</span>
                    <span>{shipment.weight.toLocaleString()} kg</span>
                    <span>*</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-yellow-500">4.7</span>
                    </div>
                  </div>

                  {shipment.origin.landmark && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shipment.origin.landmark} → {shipment.destination.landmark}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(shipment.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs bg-transparent"
                        onClick={() => handleOpenDetails(shipment)}
                      >
                        Zambiri
                      </Button>
                      <Button size="sm" className="h-9 text-xs" onClick={() => handleOpenDetails(shipment)}>
                        Tengani
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:flex sm:flex-col sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">#{shipment.id.toUpperCase()}</p>
                        {shipment.isBackhaul && <Badge className="bg-green-500/20 text-green-400">Backhaul -40%</Badge>}
                        {shipment.seasonalCategory && (
                          <Badge className="bg-amber-500/20 text-amber-400">
                            <Leaf className="h-3 w-3 mr-1" />
                            Nyengo ya {getCargoNameNy(shipment.cargoType)}
                          </Badge>
                        )}
                        {shipment.cargoType === "perishable" && (
                          <Badge className="bg-destructive/20 text-destructive">Msanga!</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-foreground">
                        <Route className="h-4 w-4 text-primary" />
                        <span className="font-medium">{shipment.origin.city}</span>
                        {shipment.origin.landmark && (
                          <span className="text-sm text-muted-foreground">({shipment.origin.landmark})</span>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{shipment.destination.city}</span>
                        {shipment.destination.landmark && (
                          <span className="text-sm text-muted-foreground">({shipment.destination.landmark})</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="text-primary">{getCargoNameNy(shipment.cargoType)}</span> *{" "}
                        {shipment.weight.toLocaleString()} kg
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          <span>{shipment.shipperName}</span>
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-yellow-500">4.7</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getRelativeTime(shipment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold text-primary">{formatPrice(shipment.price)}</p>
                    <p className="text-sm text-muted-foreground">Kutenga: {shipment.pickupDate.toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetails(shipment)}>
                        Zambiri
                      </Button>
                      <Button size="sm" onClick={() => handleOpenDetails(shipment)}>
                        Tengani Ntchito
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <LoadDetailModal shipment={selectedShipment} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
