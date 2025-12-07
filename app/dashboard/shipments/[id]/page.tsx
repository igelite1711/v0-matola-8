"use client"

import { use } from "react"
import { ShipmentDetail } from "@/components/dashboard/shipper/shipment-detail"

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <ShipmentDetail shipmentId={resolvedParams.id} />
}
