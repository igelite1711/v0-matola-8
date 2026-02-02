import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Users, Globe, Shield, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">About Matola</h1>
              <p className="mt-6 text-lg text-muted-foreground">
                We're on a mission to transform logistics in Malawi, making transportation more efficient, affordable,
                and accessible for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                <p className="mt-4 text-muted-foreground">
                  Matola was founded with a simple vision: to solve the inefficiencies in Malawi's logistics sector.
                  Every day, trucks travel empty on return journeys while shippers struggle to find affordable
                  transportation.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our platform connects shippers with transporters, optimizing routes through backhaul matching to
                  reduce costs by up to 30% while increasing earnings for drivers.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-64 w-64 rounded-full bg-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Truck className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Our Values</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Efficiency</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We optimize every route to reduce empty miles and maximize value for all parties.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Shield className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Trust</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    RTOA verification and secure payments ensure safe, reliable transactions.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Community</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We're building a network that empowers local transporters and businesses.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Globe className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Accessibility</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    USSD, WhatsApp, and web access ensures everyone can use our platform.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Heart className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Local First</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Built in Malawi, for Malawi, with local needs at the heart of everything.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="pt-6">
                  <Truck className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Innovation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Smart matching algorithms and real-time tracking for modern logistics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground">Join the Movement</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you're a shipper looking for affordable transport or a driver seeking more loads, Matola is here
              to help.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
