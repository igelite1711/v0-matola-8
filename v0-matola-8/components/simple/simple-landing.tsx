"use client"

import Link from "next/link"
import { Truck, Package, Shield, ArrowRight, Star, MapPin, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: Zap,
    title: "3-Tap Booking",
    description: "Post a load or find cargo in seconds, not minutes",
  },
  {
    icon: MapPin,
    title: "Smart Matching",
    description: "Our algorithm finds the perfect transporter for your route",
  },
  {
    icon: Shield,
    title: "Verified Partners",
    description: "Every transporter is verified and rated by real users",
  },
]

const STATS = [
  { value: "2,500+", label: "Transporters" },
  { value: "15,000+", label: "Loads Moved" },
  { value: "30%", label: "Cost Savings" },
]

export function SimpleLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-12 md:pt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">1,200+ transporters online now</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-center text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl text-balance">
            Move cargo across <span className="text-primary">Malawi</span>
            <br className="hidden md:block" />
            in 3 simple taps
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-muted-foreground text-pretty">
            Connect with verified transporters, fill empty trucks, and save up to 30% on shipping costs. The simplest
            way to move goods.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 w-full gap-2 bg-primary px-8 text-lg text-primary-foreground hover:bg-primary/90 sm:w-auto"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full px-8 text-lg border-border sm:w-auto bg-transparent"
              asChild
            >
              <Link href="/login">I have an account</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-medium text-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium text-foreground">4.8</span>
                <span className="text-sm text-muted-foreground">(2,100+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Shipping made simple</h2>
            <p className="text-muted-foreground">
              Whether you&apos;re sending goods or driving a truck, we&apos;ve got you covered
            </p>
          </div>

          {/* Two paths */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Shipper path */}
            <div className="rounded-3xl bg-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">I need to ship goods</h3>
              <p className="mb-6 text-muted-foreground">
                Post your load and get matched with verified transporters instantly
              </p>
              <ol className="mb-6 space-y-3">
                {["Select route & cargo type", "Get instant price quotes", "Track your shipment live"].map(
                  (step, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </li>
                  ),
                )}
              </ol>
              <Button className="w-full bg-primary text-primary-foreground" asChild>
                <Link href="/register?type=shipper">Post a Load</Link>
              </Button>
            </div>

            {/* Transporter path */}
            <div className="rounded-3xl bg-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">I have a truck</h3>
              <p className="mb-6 text-muted-foreground">Fill your empty trips and earn more with every journey</p>
              <ol className="mb-6 space-y-3">
                {["Set your routes & capacity", "Get matched with nearby loads", "Accept jobs & get paid"].map(
                  (step, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </li>
                  ),
                )}
              </ol>
              <Button className="w-full bg-primary text-primary-foreground" asChild>
                <Link href="/register?type=transporter">Find Loads</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Built for African roads</h2>
            <p className="text-muted-foreground">Designed for how logistics actually works in Malawi</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="rounded-2xl bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Join 5,000+ users</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground">Ready to move?</h2>
          <p className="mb-8 text-muted-foreground">Start shipping smarter today. No subscription, no hidden fees.</p>
          <Button
            size="lg"
            className="h-14 gap-2 bg-primary px-8 text-lg text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link href="/register">
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Matola</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2025 Matola. Made in Malawi.</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Help
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
