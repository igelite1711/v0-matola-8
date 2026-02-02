// Journey Safety Tracker for Matola
// Real-time location tracking, checkpoint system, and emergency alerts

export interface JourneyCheckpoint {
  id: string
  name: string
  nameNy: string
  location: { lat: number; lng: number }
  expectedTime: Date
  actualTime?: Date
  status: "pending" | "passed" | "delayed" | "missed"
}

export interface ActiveJourney {
  id: string
  shipmentId: string
  transporterId: string
  shipperId: string
  origin: string
  destination: string
  startedAt: Date
  expectedArrival: Date
  currentLocation?: { lat: number; lng: number }
  lastUpdateAt?: Date
  checkpoints: JourneyCheckpoint[]
  status: "active" | "delayed" | "emergency" | "completed"
  safetyScore: number
}

export interface EmergencyAlert {
  id: string
  journeyId: string
  type: "sos" | "delayed" | "off_route" | "no_signal" | "checkpoint_missed"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  messageNy: string
  location?: { lat: number; lng: number }
  createdAt: Date
  resolvedAt?: Date
  notifiedContacts: string[]
}

// Known checkpoints on major Malawian routes
export const ROUTE_CHECKPOINTS: Record<string, JourneyCheckpoint[]> = {
  "Lilongwe-Blantyre": [
    {
      id: "cp1",
      name: "Dedza Turnoff",
      nameNy: "Pamalo pa Dedza",
      location: { lat: -14.3794, lng: 34.3314 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp2",
      name: "Ntcheu Boma",
      nameNy: "Ntcheu Boma",
      location: { lat: -14.8194, lng: 34.6364 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp3",
      name: "Balaka Junction",
      nameNy: "Pamalo pa Balaka",
      location: { lat: -14.9794, lng: 34.9564 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp4",
      name: "Liwonde Bridge",
      nameNy: "Mlatho wa Liwonde",
      location: { lat: -15.0594, lng: 35.2264 },
      expectedTime: new Date(),
      status: "pending",
    },
  ],
  "Lilongwe-Mzuzu": [
    {
      id: "cp1",
      name: "Kasungu Turnoff",
      nameNy: "Pamalo pa Kasungu",
      location: { lat: -13.0333, lng: 33.4833 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp2",
      name: "Mzimba Boma",
      nameNy: "Mzimba Boma",
      location: { lat: -11.9, lng: 33.6 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp3",
      name: "Ekwendeni",
      nameNy: "Ekwendeni",
      location: { lat: -11.3667, lng: 33.8833 },
      expectedTime: new Date(),
      status: "pending",
    },
  ],
  "Blantyre-Zomba": [
    {
      id: "cp1",
      name: "Lunzu",
      nameNy: "Lunzu",
      location: { lat: -15.65, lng: 35.0167 },
      expectedTime: new Date(),
      status: "pending",
    },
    {
      id: "cp2",
      name: "Zomba City Center",
      nameNy: "Pakati pa Zomba",
      location: { lat: -15.3833, lng: 35.3167 },
      expectedTime: new Date(),
      status: "pending",
    },
  ],
}

// Safety monitoring thresholds
export const SAFETY_THRESHOLDS = {
  maxDelayMinutes: 60, // Alert if more than 60 min delayed
  maxOffRouteKm: 10, // Alert if more than 10km off route
  noSignalMinutes: 30, // Alert if no location update for 30 min
  checkpointWindowMinutes: 45, // Must pass checkpoint within 45 min of expected
}

export class JourneyTracker {
  private activeJourneys: Map<string, ActiveJourney> = new Map()
  private alerts: EmergencyAlert[] = []

  // Start tracking a new journey
  async startJourney(
    shipmentId: string,
    transporterId: string,
    shipperId: string,
    origin: string,
    destination: string,
    estimatedDurationHours: number,
  ): Promise<ActiveJourney> {
    const routeKey = `${origin}-${destination}`
    const checkpoints = ROUTE_CHECKPOINTS[routeKey] || []

    // Calculate expected times for each checkpoint
    const now = new Date()
    const totalCheckpoints = checkpoints.length
    const hoursPerCheckpoint = estimatedDurationHours / (totalCheckpoints + 1)

    const timedCheckpoints = checkpoints.map((cp, index) => ({
      ...cp,
      expectedTime: new Date(now.getTime() + (index + 1) * hoursPerCheckpoint * 60 * 60 * 1000),
      status: "pending" as const,
    }))

    const journey: ActiveJourney = {
      id: `journey_${Date.now()}`,
      shipmentId,
      transporterId,
      shipperId,
      origin,
      destination,
      startedAt: now,
      expectedArrival: new Date(now.getTime() + estimatedDurationHours * 60 * 60 * 1000),
      checkpoints: timedCheckpoints,
      status: "active",
      safetyScore: 100,
    }

    this.activeJourneys.set(journey.id, journey)
    return journey
  }

  // Update transporter location
  async updateLocation(journeyId: string, lat: number, lng: number): Promise<void> {
    const journey = this.activeJourneys.get(journeyId)
    if (!journey) return

    journey.currentLocation = { lat, lng }
    journey.lastUpdateAt = new Date()

    // Check if near any checkpoint
    await this.checkCheckpoints(journey)

    // Check if off route
    await this.checkRouteDeviation(journey)

    this.activeJourneys.set(journeyId, journey)
  }

  // Check if transporter passed checkpoints
  private async checkCheckpoints(journey: ActiveJourney): Promise<void> {
    if (!journey.currentLocation) return

    for (const checkpoint of journey.checkpoints) {
      if (checkpoint.status !== "pending") continue

      const distance = this.calculateDistance(
        journey.currentLocation.lat,
        journey.currentLocation.lng,
        checkpoint.location.lat,
        checkpoint.location.lng,
      )

      // If within 2km of checkpoint, mark as passed
      if (distance < 2) {
        checkpoint.status = "passed"
        checkpoint.actualTime = new Date()

        // Check if significantly delayed
        const delayMinutes = (checkpoint.actualTime.getTime() - checkpoint.expectedTime.getTime()) / (60 * 1000)
        if (delayMinutes > SAFETY_THRESHOLDS.checkpointWindowMinutes) {
          checkpoint.status = "delayed"
          journey.safetyScore = Math.max(0, journey.safetyScore - 10)
        }
      }
    }
  }

  // Check if transporter deviated from route
  private async checkRouteDeviation(journey: ActiveJourney): Promise<void> {
    // Simplified - in production would use actual route geometry
    // For now, just log
  }

  // Trigger emergency SOS
  async triggerSOS(journeyId: string, location?: { lat: number; lng: number }): Promise<EmergencyAlert> {
    const journey = this.activeJourneys.get(journeyId)

    const alert: EmergencyAlert = {
      id: `alert_${Date.now()}`,
      journeyId,
      type: "sos",
      severity: "critical",
      message: "Emergency SOS triggered! Transporter needs immediate assistance.",
      messageNy: "SOS yadzidzidzi! Woyendetsa akufuna chithandizo mwachangu.",
      location: location || journey?.currentLocation,
      createdAt: new Date(),
      notifiedContacts: [],
    }

    this.alerts.push(alert)

    // Update journey status
    if (journey) {
      journey.status = "emergency"
      journey.safetyScore = 0
      this.activeJourneys.set(journeyId, journey)
    }

    // In production: Send SMS, WhatsApp, and push notifications
    await this.notifyEmergencyContacts(alert)

    return alert
  }

  // Notify emergency contacts
  private async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    // In production: Send notifications via SMS, WhatsApp, email
    console.log("Emergency alert sent:", alert)
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Get journey status
  getJourney(journeyId: string): ActiveJourney | undefined {
    return this.activeJourneys.get(journeyId)
  }

  // Get all active alerts
  getActiveAlerts(): EmergencyAlert[] {
    return this.alerts.filter((a) => !a.resolvedAt)
  }
}

export const journeyTracker = new JourneyTracker()
