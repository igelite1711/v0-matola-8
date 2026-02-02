import { TransporterDashboardV2 } from "@/components/simple/v2/transporter-dashboard"
import { FloatingSOSButton } from "@/components/simple/v2/emergency-sos"

export default function TransporterDashboardPage() {
  return (
    <>
      <TransporterDashboardV2 />
      <FloatingSOSButton />
    </>
  )
}
