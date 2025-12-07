import { ShipperDashboardV2 } from "@/components/simple/v2/shipper-dashboard"
import { FloatingSOSButton } from "@/components/simple/v2/emergency-sos"

export default function ShipperDashboardPage() {
  return (
    <>
      <ShipperDashboardV2 />
      <FloatingSOSButton />
    </>
  )
}
