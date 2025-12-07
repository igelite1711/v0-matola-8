import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Truck, Package, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-muted-foreground">No hidden fees. Pay only when shipments are completed.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Shipper Plan */}
          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">For Shippers</CardTitle>
              <CardDescription>Businesses shipping goods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-foreground">Free</span>
                <p className="mt-1 text-sm text-muted-foreground">8% service fee per shipment</p>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Access verified transporters</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Real-time GPS tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Secure escrow payments</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Basic cargo insurance</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Start Shipping</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Transporter Plan */}
          <Card className="relative border-border ring-2 ring-primary">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">For Transporters</CardTitle>
              <CardDescription>Drivers and fleet owners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-foreground">Free</span>
                <p className="mt-1 text-sm text-muted-foreground">8% commission per completed job</p>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Find loads across Malawi</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Smart backhaul matching</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Instant Mobile Money payments</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">RTOA verification badge</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register?type=transporter">Start Earning</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all pricing details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
