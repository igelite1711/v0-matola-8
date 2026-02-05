import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Package, MapPin, Phone, MessageCircle, Wheat, Leaf } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Decorative grid lines - hidden on mobile for cleaner look */}
      <div className="absolute inset-0 opacity-20 hidden sm:block">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 sm:mb-6 sm:gap-2 sm:px-4 sm:py-2">
            <Leaf className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
            <span className="text-[10px] font-medium text-primary sm:text-xs">Nyengo ya Fodya</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">Tobacco Season - High Demand!</span>
          </div>

          <h1 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Nyamulani Katundu Ku <span className="text-primary">Malawi</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Mosavuta, Motsika Mtengo
          </h1>

          <p className="mx-auto mb-6 max-w-xl text-pretty text-sm text-muted-foreground sm:mb-8 sm:max-w-2xl sm:text-base md:text-lg">
            Pezani oyendetsa amagalimoto otsimikizika ndi RTOA, chepetsani maulendo opanda katundu ndi backhaul, ndipo
            sungani ndalama mpaka 40%. Gwiritsirani ntchito USSD, WhatsApp, kapena Airtel/TNM Mpamba.
          </p>

          {/* Access Methods - Malawi Reality */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">*384*MATOLA#</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1.5 text-[#128C7E]">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-red-600">
              <span className="text-xs sm:text-sm">Airtel Money</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-yellow-700">
              <span className="text-xs sm:text-sm">TNM Mpamba</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Button size="lg" asChild className="h-14 w-full gap-2 text-base font-semibold sm:h-12 sm:w-auto sm:text-base">
              <Link href="/register">
                Yambani Kutumiza / Start Shipping
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 w-full text-base font-semibold sm:h-12 sm:w-auto sm:text-base bg-background border-2"
            >
              <Link href="/register?type=transporter">Lowani Ngati Woyendetsa / Join as Driver</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-8 max-w-5xl sm:mt-12 md:mt-16">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8">
            {/* Mobile layout: vertical stack */}
            <div className="flex flex-col gap-4 sm:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">Lilongwe</span>
                  <p className="text-xs text-muted-foreground">Kanengo ADMARC</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
                  <Wheat className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-700">Chimanga</span>
                </div>
              </div>

              {/* Vertical route line with truck */}
              <div className="flex items-center gap-3 pl-5">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-0.5 bg-border" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                    <Truck className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="h-6 w-0.5 bg-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Via M1 Highway...</span>
                  <p className="text-[10px] text-muted-foreground">311 km | 4-5 maola</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">Blantyre</span>
                  <p className="text-xs text-muted-foreground">Limbe Market</p>
                </div>
              </div>
            </div>

            {/* Desktop layout: horizontal */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Lilongwe</span>
                <span className="text-xs text-muted-foreground">Kanengo ADMARC</span>
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
                  <Wheat className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-700">Chimanga 5T</span>
                </div>
              </div>

              <div className="relative mx-4 flex-1 md:mx-8">
                <div className="h-1 w-full rounded-full bg-border">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
                <div className="absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                    <Truck className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>Dedza</span>
                  <span>Ntcheu</span>
                  <span>Balaka</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Blantyre</span>
                <span className="text-xs text-muted-foreground">Limbe Market</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:mt-6 sm:flex sm:items-center sm:justify-center sm:gap-6 sm:pt-6">
              <div className="text-center">
                <p className="text-lg font-bold text-primary sm:text-2xl">MK 185,000</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Mtengo Woyembekezeka</p>
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground sm:text-2xl">4-5 hrs</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Via M1 Highway</p>
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 sm:text-2xl">-40%</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Backhaul Available!</p>
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="col-span-2 text-center sm:col-span-1">
                <p className="text-lg font-bold text-foreground sm:text-2xl">8</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">RTOA Verified Drivers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
