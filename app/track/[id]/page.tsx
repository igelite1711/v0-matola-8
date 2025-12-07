"use client"

import { use } from "react"
import { PublicTracking } from "@/components/tracking/public-tracking"

export default function PublicTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <PublicTracking shipmentId={resolvedParams.id} />
}
