import { LiveTracking } from "@/components/simple/v2/live-tracking"

export default function TrackingPage({ params }: { params: { id: string } }) {
  return <LiveTracking shipmentId={params.id} />
}
