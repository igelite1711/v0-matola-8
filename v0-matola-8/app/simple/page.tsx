import { SimpleNav } from "@/components/simple/simple-nav"
import { SimpleLanding } from "@/components/simple/simple-landing"

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-background">
      <SimpleNav onAction={() => {}} />
      <SimpleLanding />
    </div>
  )
}
