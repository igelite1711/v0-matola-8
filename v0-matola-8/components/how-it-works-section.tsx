import { Package, Search, Truck, CheckCircle } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Package,
      title: "Post Your Shipment",
      description: "Enter pickup/delivery locations, cargo details, and preferred timing. Get instant quotes.",
    },
    {
      icon: Search,
      title: "Get Matched",
      description: "Our system finds the best transporters based on route, capacity, and ratings.",
    },
    {
      icon: Truck,
      title: "Track & Monitor",
      description: "Follow your shipment in real-time with SMS updates at every checkpoint.",
    },
    {
      icon: CheckCircle,
      title: "Confirm Delivery",
      description: "Verify delivery with photo proof. Pay securely and rate your experience.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-card py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            How Matola Works
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
            Ship goods in four simple steps - by web, app, or USSD.
          </p>
        </div>

        <div className="mx-auto max-w-xl lg:max-w-4xl">
          {/* Mobile layout */}
          <div className="space-y-6 lg:hidden">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                    <step.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {index < steps.length - 1 && <div className="mt-2 h-full w-0.5 bg-border" />}
                </div>
                <div className="pb-6">
                  <span className="text-xs font-medium text-primary">Step {index + 1}</span>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop layout - alternating sides */}
          <div className="relative hidden lg:block">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />

            <div className="space-y-0">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={`relative flex items-start gap-12 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className="flex-1" />

                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary shadow-lg shadow-primary/30">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>

                  <div className={`flex-1 pb-16 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <span className="mb-1 block text-sm font-medium text-primary">Step {index + 1}</span>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
