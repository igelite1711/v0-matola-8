"use client"

import { use } from "react"
import { ShipmentTracking } from "@/components/dashboard/tracking/shipment-tracking"

export default function TrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <ShipmentTracking shipmentId={resolvedParams.id} />
}
