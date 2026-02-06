import { Shield, Smartphone, TrendingDown, Wheat, Map, Banknote, WifiOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: TrendingDown,
      title: "Backhaul Optimization",
      titleMw: "Chepetsani Mtengo",
      description: "Save 30-50% by matching return trips. Don't drive empty from Blantyre back to Lilongwe.",
      highlight: true,
    },
    {
      icon: Shield,
      title: "RTOA Verified Drivers",
      titleMw: "Oyendetsa Otsimikizirika",
      description: "All transporters verified through Road Transport Operators Association and community ratings.",
    },
    {
      icon: Smartphone,
      title: "USSD + WhatsApp",
      titleMw: "Palibe Data Yambiri",
      description: "Book via USSD *384*628652# or WhatsApp. Works on any phone, even 2G networks.",
    },
    {
      icon: Wheat,
      title: "Seasonal Intelligence",
      titleMw: "Nyengo ya Malonda",
      description: "Know when maize, tobacco, tea seasons peak. Get better rates during high-demand periods.",
    },
    {
      icon: Map,
      title: "All Malawi Corridors",
      titleMw: "Njira Zonse",
      description: "Lilongwe↔Blantyre, Mzuzu↔Karonga, plus Nacala, Beira & Dar corridors for exports.",
    },
    {
      icon: WifiOff,
      title: "Offline Functionality",
      titleMw: "Sitalindira Intaneti",
      description: "Access the app offline, queue actions, and sync when online. Perfect for low-bandwidth areas.",
    },
  ]

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            Zomwe Tikukupatsani
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
            Built for Malawi's unique logistics challenges - landlocked reality, seasonal cargo, and mobile-first users.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50"
            >
              <CardHeader className="pb-2 sm:pb-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                  <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                </div>
                <CardTitle className="text-base text-foreground sm:text-lg">
                  {feature.title}
                  <span className="block text-xs font-normal text-muted-foreground">{feature.titleMw}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
