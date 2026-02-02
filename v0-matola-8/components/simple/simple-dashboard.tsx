"use client"

import { useApp } from "@/contexts/app-context"
import { ShipperHome } from "./shipper-home"
import { TransporterHome } from "./transporter-home"

export function SimpleDashboard() {
  const { user } = useApp()

  if (user?.role === "transporter") {
    return <TransporterHome />
  }

  return <ShipperHome />
}
