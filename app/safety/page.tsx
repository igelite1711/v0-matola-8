import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2, AlertTriangle, Phone, Eye, Lock, Truck, Users } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Your Safety is Our Priority
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                At Matola, we've built multiple layers of protection to ensure safe, reliable transactions for both
                shippers and transporters.
              </p>
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">How We Keep You Safe</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>RTOA Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All transporters are verified through the Road Transport Operators Association. We check driver's
                    licenses, vehicle registration, and insurance documents.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Escrow Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Payment is held securely until delivery is confirmed. Shippers don't pay until they receive their
                    goods, and transporters are guaranteed payment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-Time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track your shipment in real-time via GPS. Know exactly where your goods are and get notifications at
                    every checkpoint.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ratings & Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Both parties rate each other after every trip. This builds a trusted community and helps you choose
                    reliable partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cargo Insurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Basic cargo insurance is included with every shipment. Additional coverage is available for
                    high-value goods.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>24/7 Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our support team is available around the clock for emergencies. Report issues instantly through the
                    app or WhatsApp.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Safety Tips</h2>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-foreground">For Shippers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Always use verified transporters with RTOA badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Take photos of your goods before loading</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Use in-app payments for protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Track your shipment and confirm delivery promptly</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">For Transporters</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">
                      Complete verification to build trust and get more jobs
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">
                      Inspect cargo before accepting and document any issues
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Keep your app updated for real-time communication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">Report problems immediately through the app</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Report Issue */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Report a Safety Concern</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              If you encounter any safety issues or suspicious behavior, please report it immediately. Your safety is
              our top priority.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/contact?subject=Safety Concern">Report Issue</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+265999123456">Emergency: +265 999 123 456</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
