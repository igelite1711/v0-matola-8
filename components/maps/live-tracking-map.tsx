"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, Truck, MapPin, AlertCircle, Locate, ZoomIn, ZoomOut } from "lucide-react"

// Malawi location coordinates
const MALAWI_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  Lilongwe: { lat: -13.9626, lng: 33.7741 },
  Blantyre: { lat: -15.7861, lng: 35.0058 },
  Mzuzu: { lat: -11.4658, lng: 34.0207 },
  Zomba: { lat: -15.3833, lng: 35.3167 },
  Kasungu: { lat: -13.0333, lng: 33.4833 },
  Mangochi: { lat: -14.4833, lng: 35.2667 },
  Karonga: { lat: -9.9333, lng: 33.9333 },
  Dedza: { lat: -14.3667, lng: 34.3333 },
  Ntcheu: { lat: -14.8167, lng: 34.6333 },
  Salima: { lat: -13.7833, lng: 34.45 },
  Mchinji: { lat: -13.7833, lng: 32.8833 },
}

// Route waypoints for common routes
const ROUTE_WAYPOINTS: Record<string, Array<{ lat: number; lng: number; name: string }>> = {
  "Lilongwe-Blantyre": [
    { lat: -13.9626, lng: 33.7741, name: "Lilongwe" },
    { lat: -14.3667, lng: 34.3333, name: "Dedza" },
    { lat: -14.8167, lng: 34.6333, name: "Ntcheu" },
    { lat: -15.3833, lng: 35.0167, name: "Balaka" },
    { lat: -15.7861, lng: 35.0058, name: "Blantyre" },
  ],
  "Lilongwe-Mzuzu": [
    { lat: -13.9626, lng: 33.7741, name: "Lilongwe" },
    { lat: -13.0333, lng: 33.4833, name: "Kasungu" },
    { lat: -12.2667, lng: 33.8, name: "Mzimba" },
    { lat: -11.4658, lng: 34.0207, name: "Mzuzu" },
  ],
}

interface LiveTrackingMapProps {
  originCity: string
  destinationCity: string
  progress: number // 0-100
  driverName?: string
  vehiclePlate?: string
  onGeofenceEnter?: (zone: "pickup" | "dropoff") => void
  showControls?: boolean
}

export function LiveTrackingMap({
  originCity,
  destinationCity,
  progress,
  driverName = "Driver",
  vehiclePlate = "XX 0000",
  onGeofenceEnter,
  showControls = true,
}: LiveTrackingMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 })
  const [zoom, setZoom] = useState(1)
  const [isAnimating, setIsAnimating] = useState(true)
  const [geofenceStatus, setGeofenceStatus] = useState<
    "none" | "approaching_pickup" | "at_pickup" | "approaching_dropoff" | "at_dropoff"
  >("none")
  const animationRef = useRef<number>()

  // Get route waypoints
  const getRouteKey = useCallback(() => {
    const key1 = `${originCity}-${destinationCity}`
    const key2 = `${destinationCity}-${originCity}`
    if (ROUTE_WAYPOINTS[key1]) return key1
    if (ROUTE_WAYPOINTS[key2]) return key2
    return null
  }, [originCity, destinationCity])

  // Interpolate position along route based on progress
  const getPositionOnRoute = useCallback(
    (progressPercent: number) => {
      const routeKey = getRouteKey()
      const origin = MALAWI_LOCATIONS[originCity] || { lat: -13.9626, lng: 33.7741 }
      const destination = MALAWI_LOCATIONS[destinationCity] || { lat: -15.7861, lng: 35.0058 }

      if (routeKey && ROUTE_WAYPOINTS[routeKey]) {
        const waypoints = ROUTE_WAYPOINTS[routeKey]
        const totalSegments = waypoints.length - 1
        const segmentProgress = (progressPercent / 100) * totalSegments
        const currentSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1)
        const segmentFraction = segmentProgress - currentSegment

        const start = waypoints[currentSegment]
        const end = waypoints[currentSegment + 1] || waypoints[currentSegment]

        return {
          lat: start.lat + (end.lat - start.lat) * segmentFraction,
          lng: start.lng + (end.lng - start.lng) * segmentFraction,
          nearestWaypoint: waypoints[currentSegment].name,
        }
      }

      // Direct interpolation if no waypoints defined
      return {
        lat: origin.lat + (destination.lat - origin.lat) * (progressPercent / 100),
        lng: origin.lng + (destination.lng - origin.lng) * (progressPercent / 100),
        nearestWaypoint: progressPercent < 50 ? originCity : destinationCity,
      }
    },
    [originCity, destinationCity, getRouteKey],
  )

  // Geofencing logic
  const checkGeofence = useCallback(
    (pos: { lat: number; lng: number }) => {
      const origin = MALAWI_LOCATIONS[originCity]
      const destination = MALAWI_LOCATIONS[destinationCity]

      if (!origin || !destination) return

      const distanceToOrigin = Math.sqrt(Math.pow(pos.lat - origin.lat, 2) + Math.pow(pos.lng - origin.lng, 2))
      const distanceToDestination = Math.sqrt(
        Math.pow(pos.lat - destination.lat, 2) + Math.pow(pos.lng - destination.lng, 2),
      )

      const GEOFENCE_RADIUS = 0.1 // ~10km
      const APPROACH_RADIUS = 0.3 // ~30km

      if (distanceToOrigin < GEOFENCE_RADIUS && progress < 20) {
        if (geofenceStatus !== "at_pickup") {
          setGeofenceStatus("at_pickup")
          onGeofenceEnter?.("pickup")
        }
      } else if (distanceToOrigin < APPROACH_RADIUS && progress < 20) {
        setGeofenceStatus("approaching_pickup")
      } else if (distanceToDestination < GEOFENCE_RADIUS) {
        if (geofenceStatus !== "at_dropoff") {
          setGeofenceStatus("at_dropoff")
          onGeofenceEnter?.("dropoff")
        }
      } else if (distanceToDestination < APPROACH_RADIUS) {
        setGeofenceStatus("approaching_dropoff")
      } else {
        setGeofenceStatus("none")
      }
    },
    [originCity, destinationCity, progress, geofenceStatus, onGeofenceEnter],
  )

  // Draw map on canvas
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)

    const origin = MALAWI_LOCATIONS[originCity] || { lat: -13.9626, lng: 33.7741 }
    const destination = MALAWI_LOCATIONS[destinationCity] || { lat: -15.7861, lng: 35.0058 }

    // Calculate bounds
    const minLat = Math.min(origin.lat, destination.lat) - 0.5
    const maxLat = Math.max(origin.lat, destination.lat) + 0.5
    const minLng = Math.min(origin.lng, destination.lng) - 0.5
    const maxLng = Math.max(origin.lng, destination.lng) + 0.5

    const latRange = (maxLat - minLat) / zoom
    const lngRange = (maxLng - minLng) / zoom

    const centerLat = (origin.lat + destination.lat) / 2
    const centerLng = (origin.lng + destination.lng) / 2

    const toCanvasX = (lng: number) => {
      return ((lng - (centerLng - lngRange / 2)) / lngRange) * width
    }
    const toCanvasY = (lat: number) => {
      return height - ((lat - (centerLat - latRange / 2)) / latRange) * height
    }

    // Draw grid lines
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath()
      ctx.moveTo((width / 10) * i, 0)
      ctx.lineTo((width / 10) * i, height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, (height / 10) * i)
      ctx.lineTo(width, (height / 10) * i)
      ctx.stroke()
    }

    // Draw route polyline (dashed for remaining, solid for completed)
    const routeKey = getRouteKey()
    const waypoints = routeKey && ROUTE_WAYPOINTS[routeKey] ? ROUTE_WAYPOINTS[routeKey] : [origin, destination]

    // Draw full route (dashed)
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    waypoints.forEach((wp, i) => {
      const x = toCanvasX(wp.lng)
      const y = toCanvasY(wp.lat)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw completed route (solid)
    const pos = getPositionOnRoute(progress)
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 4
    ctx.setLineDash([])
    ctx.beginPath()
    let reachedCurrent = false
    waypoints.forEach((wp, i) => {
      const x = toCanvasX(wp.lng)
      const y = toCanvasY(wp.lat)
      if (i === 0) ctx.moveTo(x, y)
      else if (!reachedCurrent) {
        ctx.lineTo(x, y)
        // Check if we've passed this waypoint
        const wpProgress = (i / (waypoints.length - 1)) * 100
        if (wpProgress > progress) reachedCurrent = true
      }
    })
    // Draw to current position
    if (!reachedCurrent) {
      ctx.lineTo(toCanvasX(pos.lng), toCanvasY(pos.lat))
    }
    ctx.stroke()

    // Draw waypoint markers
    waypoints.forEach((wp, i) => {
      const x = toCanvasX(wp.lng)
      const y = toCanvasY(wp.lat)
      const wpProgress = (i / (waypoints.length - 1)) * 100

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = wpProgress <= progress ? "#22c55e" : "#3b82f6"
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      const wpName = "name" in wp ? wp.name : i === 0 ? originCity : destinationCity
      ctx.font = "12px Inter, sans-serif"
      ctx.fillStyle = "#a1a1aa"
      ctx.textAlign = "center"
      ctx.fillText(wpName, x, y - 12)
    })

    // Draw origin marker (green)
    const originX = toCanvasX(origin.lng)
    const originY = toCanvasY(origin.lat)
    ctx.beginPath()
    ctx.arc(originX, originY, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#22c55e"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = "#fff"
    ctx.font = "bold 10px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("A", originX, originY)

    // Draw destination marker (red)
    const destX = toCanvasX(destination.lng)
    const destY = toCanvasY(destination.lat)
    ctx.beginPath()
    ctx.arc(destX, destY, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#ef4444"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = "#fff"
    ctx.fillText("B", destX, destY)

    // Draw geofence circles
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#22c55e40"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(originX, originY, 30 * zoom, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = "#ef444440"
    ctx.beginPath()
    ctx.arc(destX, destY, 30 * zoom, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw truck at current position
    const truckX = toCanvasX(pos.lng)
    const truckY = toCanvasY(pos.lat)

    // Truck shadow
    ctx.beginPath()
    ctx.arc(truckX + 2, truckY + 2, 18, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(0,0,0,0.3)"
    ctx.fill()

    // Truck circle
    ctx.beginPath()
    ctx.arc(truckX, truckY, 18, 0, Math.PI * 2)
    const gradient = ctx.createRadialGradient(truckX, truckY, 0, truckX, truckY, 18)
    gradient.addColorStop(0, "#3b82f6")
    gradient.addColorStop(1, "#1d4ed8")
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Truck icon (simplified)
    ctx.fillStyle = "#fff"
    ctx.fillRect(truckX - 8, truckY - 4, 16, 8)
    ctx.fillRect(truckX - 10, truckY - 2, 4, 4)

    // Pulse animation
    if (isAnimating) {
      ctx.beginPath()
      ctx.arc(truckX, truckY, 25 + (Date.now() % 1000) / 50, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 - (Date.now() % 1000) / 2000})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    setCurrentPosition(pos)
  }, [originCity, destinationCity, progress, zoom, isAnimating, getRouteKey, getPositionOnRoute])

  useEffect(() => {
    const pos = getPositionOnRoute(progress)
    checkGeofence(pos)
  }, [progress, getPositionOnRoute, checkGeofence])

  useEffect(() => {
    const animate = () => {
      drawMap()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [drawMap])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50">
      <canvas
        ref={canvasRef}
        className="w-full h-48 sm:h-64"
        style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
      />

      {/* Status overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <Badge className="bg-primary/90 text-primary-foreground gap-1.5">
          <Navigation className="h-3 w-3 animate-pulse" />
          Live Tracking
        </Badge>
        {geofenceStatus === "approaching_dropoff" && (
          <Badge className="bg-amber-500/90 text-white gap-1.5">
            <AlertCircle className="h-3 w-3" />
            Approaching Destination
          </Badge>
        )}
        {geofenceStatus === "at_dropoff" && (
          <Badge className="bg-green-500/90 text-white gap-1.5">
            <MapPin className="h-3 w-3" />
            Arrived at Destination
          </Badge>
        )}
      </div>

      {/* Driver info overlay */}
      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <div>
            <p className="font-medium">{driverName}</p>
            <p className="text-muted-foreground">{vehiclePlate}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => setZoom(1)}
          >
            <Locate className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-green-500" />
            {originCity}
          </span>
          <span>{progress}% complete</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-red-500" />
            {destinationCity}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
