import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Truck, Package, Briefcase } from "lucide-react"

const plans = [
  {
    name: "Shipper",
    description: "For businesses and individuals shipping goods",
    icon: Package,
    price: "Free",
    priceDetail: "8% service fee per completed shipment",
    features: [
      "Post unlimited shipments",
      "Access to verified transporters",
      "Real-time GPS tracking",
      "Secure escrow payments",
      "Basic cargo insurance included",
      "WhatsApp & USSD access",
      "24/7 customer support",
    ],
    cta: "Start Shipping",
    href: "/register",
    popular: false,
  },
  {
    name: "Transporter",
    description: "For drivers and fleet owners",
    icon: Truck,
    price: "Free",
    priceDetail: "8% commission per completed job",
    features: [
      "Find loads across Malawi",
      "Smart backhaul matching",
      "Instant payment notifications",
      "RTOA verification badge",
      "Rating and review system",
      "WhatsApp & USSD access",
      "Priority job notifications",
    ],
    cta: "Start Earning",
    href: "/register?type=transporter",
    popular: true,
  },
  {
    name: "Broker",
    description: "For logistics intermediaries",
    icon: Briefcase,
    price: "MK 50,000",
    priceDetail: "per month",
    features: [
      "Manage multiple shippers",
      "Build transporter network",
      "Advanced analytics dashboard",
      "Priority matching for clients",
      "Bulk shipment management",
      "Dedicated account manager",
      "Custom commission structure",
    ],
    cta: "Contact Sales",
    href: "/contact?subject=Broker Account",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                No hidden fees. Pay only when shipments are completed successfully.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative border-border bg-background ${plan.popular ? "ring-2 ring-primary" : ""}`}
                >
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <plan.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 text-center">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.priceDetail}</p>
                    </div>
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fee Breakdown */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-3xl font-bold text-foreground">How Fees Work</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">For Shippers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Service Fee:</strong> 8% of the agreed transport cost
                    </p>
                    <p>
                      <strong className="text-foreground">Example:</strong> For a MK 100,000 shipment, you pay MK
                      108,000 total. The transporter receives MK 100,000.
                    </p>
                    <p>
                      <strong className="text-foreground">Insurance:</strong> Basic coverage included. Additional
                      coverage available at 2% of cargo value.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">For Transporters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Commission:</strong> 8% of the agreed transport cost
                    </p>
                    <p>
                      <strong className="text-foreground">Example:</strong> For a MK 100,000 job, you receive MK 92,000.
                      The 8% covers platform fees.
                    </p>
                    <p>
                      <strong className="text-foreground">Payment:</strong> Funds released within 24 hours of delivery
                      confirmation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">Have questions about pricing?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Check our Help Center for detailed answers or contact our team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/help">Help Center</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
