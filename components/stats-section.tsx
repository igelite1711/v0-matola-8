export function StatsSection() {
  const stats = [
    { value: "40%", label: "Backhaul Savings", labelMw: "Kusungidwa", description: "average cost reduction" },
    { value: "850+", label: "Verified Transporters", labelMw: "Oyendetsa", description: "RTOA & community verified" },
    { value: "28", label: "Districts Covered", labelMw: "Maboma", description: "across all 3 regions" },
    { value: "94%", label: "On-Time Delivery", labelMw: "Pa Nthawi", description: "successful deliveries" },
  ]

  return (
    <section className="border-y border-border bg-card py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground sm:mt-1 sm:text-base">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.labelMw}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
