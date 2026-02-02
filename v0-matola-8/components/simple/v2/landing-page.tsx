"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Truck,
  Package,
  Shield,
  ArrowRight,
  Star,
  MapPin,
  Zap,
  Globe,
  Mic,
  Wifi,
  WifiOff,
  ChevronRight,
  Phone,
  MessageCircle,
  Sun,
  Droplets,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-language"
import { getCurrentSeason, getCurrentCropSeason, SEASONAL_TIPS } from "@/lib/seasonal/seasonal-intelligence"

export function LandingPageV2() {
  const { t, language, setLanguage } = useTranslation()
  const [isOnline, setIsOnline] = useState(true)
  const season = getCurrentSeason()
  const cropSeason = getCurrentCropSeason()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const seasonalTip = SEASONAL_TIPS[cropSeason === "off_season" && season === "rainy" ? "rainy" : cropSeason]

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-warning" />
          <span className="text-sm text-warning font-medium">
            {language === "ny" ? "Simuli pa intaneti - Mungagwiritsirebe ntchito" : "You're offline - App still works"}
          </span>
        </div>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Matola</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "ny" : "en")}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "Chichewa" : "English"}
            </button>

            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/simple/v2/login">{language === "ny" ? "Lowani" : "Login"}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 md:pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Live Status Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="text-sm font-medium text-success">
                {language === "ny" ? "Oyendetsa 1,247 ali pa intaneti" : "1,247 transporters online now"}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-center text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            {language === "ny" ? (
              <>
                Yendetsani katundu ku <span className="text-primary">Malawi</span>
                <br className="hidden md:block" />
                mosavuta
              </>
            ) : (
              <>
                Move cargo across <span className="text-primary">Malawi</span>
                <br className="hidden md:block" />
                in 3 simple taps
              </>
            )}
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-center text-lg md:text-xl text-muted-foreground text-pretty">
            {language === "ny"
              ? "Lumikizanani ndi oyendetsa otsimikizidwa, dzazani magalimoto opanda katundu, ndipo sungani ndalama mpaka 30%."
              : "Connect with verified transporters, fill empty trucks, and save up to 30% on shipping costs."}
          </p>

          {/* Voice Command Hint */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2">
              <Mic className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {language === "ny" ? "Lankhulani kuti mupeze katundu" : "Speak to find loads"}
              </span>
            </div>
          </div>

          {/* CTA Buttons - Large, thumb-friendly */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-16 w-full gap-3 bg-primary px-8 text-lg font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto min-w-[200px] rounded-2xl shadow-lg shadow-primary/25"
              asChild
            >
              <Link href="/simple/v2/register">
                {language === "ny" ? "Yambani Kwaulere" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 w-full px-8 text-lg font-semibold border-2 border-border sm:w-auto min-w-[200px] rounded-2xl bg-transparent"
              asChild
            >
              <Link href="/simple/v2/login">{language === "ny" ? "Ndili ndi akaunti" : "I have an account"}</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-bold text-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">4.8</span>
                <span className="text-sm text-muted-foreground">(2,100+)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Alert Banner */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-r from-warning/10 to-success/10 border border-warning/20 p-4 flex items-start gap-3">
            {season === "rainy" ? (
              <Droplets className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            ) : (
              <Sun className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-foreground mb-1">{language === "ny" ? "Nthawi ino" : "Current Season"}</p>
              <p className="text-sm text-muted-foreground">{language === "ny" ? seasonalTip.ny : seasonalTip.en}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8">
          {[
            { value: "2,500+", label: language === "ny" ? "Oyendetsa" : "Transporters" },
            { value: "15,000+", label: language === "ny" ? "Katundu Woyendetsedwa" : "Loads Moved" },
            { value: "30%", label: language === "ny" ? "Kusungidwa" : "Cost Savings" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-5xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
              {language === "ny" ? "Zosavuta kwambiri" : "Shipping made simple"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {language === "ny"
                ? "Ngakhale muli wotumiza kapena woyendetsa, tilipo kuthandiza"
                : "Whether you're sending goods or driving a truck, we've got you covered"}
            </p>
          </div>

          {/* Two paths - Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Shipper path */}
            <div className="group rounded-3xl bg-card p-8 border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {language === "ny" ? "Ndikufuna kutumiza" : "I need to ship goods"}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {language === "ny"
                  ? "Lembani katundu wanu ndipo mupeze oyendetsa wotsimikizidwa nthawi yomweyo"
                  : "Post your load and get matched with verified transporters instantly"}
              </p>
              <ol className="mb-6 space-y-3">
                {(language === "ny"
                  ? ["Sankhani koyendera ndi mtundu", "Pezani mitengo yomweyo", "Tsatirani katundu wanu"]
                  : ["Select route & cargo type", "Get instant price quotes", "Track your shipment live"]
                ).map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <Button
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-base font-medium"
                asChild
              >
                <Link href="/simple/v2/register?type=shipper">
                  {language === "ny" ? "Tumizani Katundu" : "Post a Load"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Transporter path */}
            <div className="group rounded-3xl bg-card p-8 border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {language === "ny" ? "Ndili ndi galimoto" : "I have a truck"}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {language === "ny"
                  ? "Dzazani maulendo anu opanda katundu ndipo mupeze ndalama zambiri"
                  : "Fill your empty trips and earn more with every journey"}
              </p>
              <ol className="mb-6 space-y-3">
                {(language === "ny"
                  ? ["Konzani njira zanu", "Pezani katundu wapafupi", "Vomerani ntchito ndipo mulipidwe"]
                  : ["Set your routes & capacity", "Get matched with nearby loads", "Accept jobs & get paid"]
                ).map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <Button
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-base font-medium"
                asChild
              >
                <Link href="/simple/v2/register?type=transporter">
                  {language === "ny" ? "Pezani Katundu" : "Find Loads"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
              {language === "ny" ? "Popangidwira misewu ya Africa" : "Built for African roads"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {language === "ny"
                ? "Popangidwira momwe mayendedwe amagwirira ntchito ku Malawi"
                : "Designed for how logistics actually works in Malawi"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: language === "ny" ? "Kubuka Mwa 3" : "3-Tap Booking",
                desc:
                  language === "ny"
                    ? "Lembani katundu kapena pezani mu mphindi"
                    : "Post a load or find cargo in seconds",
              },
              {
                icon: Wifi,
                title: language === "ny" ? "Mugwira Ntchito Popanda Intaneti" : "Works Offline",
                desc: language === "ny" ? "Gwiritsani ntchito popanda intaneti" : "Keep working even without network",
              },
              {
                icon: Mic,
                title: language === "ny" ? "Malamulo a Mawu" : "Voice Commands",
                desc: language === "ny" ? "Lankhulani m'Chichewa kapena Chingerezi" : "Speak in Chichewa or English",
              },
              {
                icon: Shield,
                title: language === "ny" ? "Kutsimikizidwa ndi Anthu" : "Community Verified",
                desc:
                  language === "ny"
                    ? "Kudalira kwa anthu osati ma computer okha"
                    : "Trust built on community, not just algorithms",
              },
              {
                icon: Phone,
                title: language === "ny" ? "Airtel & TNM Mpamba" : "Mobile Money",
                desc:
                  language === "ny"
                    ? "Lipilani ndi Airtel Money kapena TNM Mpamba"
                    : "Pay with Airtel Money or TNM Mpamba",
              },
              {
                icon: MapPin,
                title: language === "ny" ? "Njira Zonse ku Malawi" : "All Malawi Routes",
                desc:
                  language === "ny"
                    ? "Lilongwe, Blantyre, Mzuzu ndi kwina konse"
                    : "Lilongwe, Blantyre, Mzuzu and everywhere",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl bg-card p-6 border border-border">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USSD / WhatsApp Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-card to-secondary/30 p-8 md:p-12 border border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {language === "ny" ? "Mulibe smartphone?" : "No smartphone?"}
              </h2>
              <p className="text-muted-foreground">
                {language === "ny" ? "Gwiritsani ntchito USSD kapena WhatsApp" : "Use USSD or WhatsApp instead"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">USSD</h3>
                <p className="text-3xl font-bold text-primary mb-2">*384*628652#</p>
                <p className="text-sm text-muted-foreground">
                  {language === "ny" ? "Dinani pa foni iliyonse" : "Dial from any phone"}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                  <MessageCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-xl font-bold text-success mb-2">+265 999 123 456</p>
                <p className="text-sm text-muted-foreground">
                  {language === "ny" ? "Tumizani 'Moni' kuti muyambe" : "Send 'Hi' to start"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 md:py-20 bg-gradient-to-b from-transparent to-card/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === "ny" ? "Muli okonzeka?" : "Ready to get started?"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === "ny"
              ? "Lowani lero ndipo yambani kusungira ndalama pa kayendetsedwe ka katundu"
              : "Join today and start saving on your cargo transport"}
          </p>
          <Button
            size="lg"
            className="h-16 gap-3 bg-primary px-10 text-lg font-semibold text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/25"
            asChild
          >
            <Link href="/simple/v2/register">
              {language === "ny" ? "Yambani Kwaulere" : "Get Started Free"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Matola</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === "ny" ? "Wopangidwa ku Malawi" : "Made in Malawi"} • 2024
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                {language === "ny" ? "Thandizo" : "Help"}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                {language === "ny" ? "Malamulo" : "Terms"}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                {language === "ny" ? "Chinsinsi" : "Privacy"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
