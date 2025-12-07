import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:rounded-2xl sm:p-8 md:p-12">
          <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl">
                Ready to Move Smarter?
              </h2>
              <p className="mb-5 text-sm text-muted-foreground sm:mb-6 sm:text-base md:text-lg">
                Join hundreds of businesses already saving on logistics with Matola.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button size="lg" asChild className="h-12 w-full gap-2 text-base sm:h-11 sm:w-auto sm:text-sm">
                  <Link href="/register">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 w-full gap-2 bg-transparent text-base sm:h-11 sm:w-auto sm:text-sm"
                >
                  <Link href="tel:+265999123456">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 sm:rounded-xl sm:p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4 sm:text-base">Quick Access via USSD</h3>
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3 sm:gap-4 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary sm:h-12 sm:w-12">
                  <Phone className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-primary sm:text-2xl">*123#</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">Dial from any phone</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                No smartphone? No problem. Book shipments, check status, and manage payments via USSD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
