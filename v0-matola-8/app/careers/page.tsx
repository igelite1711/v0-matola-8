import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Briefcase } from "lucide-react"

const openPositions = [
  {
    title: "Software Engineer",
    location: "Lilongwe",
    type: "Full-time",
    department: "Engineering",
    description: "Build and maintain our logistics platform using modern web technologies.",
  },
  {
    title: "Operations Manager",
    location: "Blantyre",
    type: "Full-time",
    department: "Operations",
    description: "Oversee day-to-day operations and manage transporter relationships.",
  },
  {
    title: "Customer Support Specialist",
    location: "Remote",
    type: "Full-time",
    department: "Support",
    description: "Help shippers and transporters get the most out of our platform.",
  },
  {
    title: "Marketing Coordinator",
    location: "Lilongwe",
    type: "Full-time",
    department: "Marketing",
    description: "Drive growth through creative marketing campaigns and partnerships.",
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Join Our Team</h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Help us transform logistics in Malawi. We're looking for passionate people who want to make a real
                difference.
              </p>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Why Join Matola?</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Meaningful Work</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your work directly impacts businesses and livelihoods across Malawi.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Flexible Hours</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We trust you to manage your time and deliver great results.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Local Impact</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be part of building technology made in Malawi, for Malawi.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Growth</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Learn and grow with us as we scale across the region.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Open Positions</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              {openPositions.map((position, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{position.title}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{position.department}</Badge>
                          <Badge variant="outline">{position.location}</Badge>
                          <Badge variant="outline">{position.type}</Badge>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/contact?subject=Career: ${position.title}`}>Apply Now</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{position.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* No matching position */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">Don't see a perfect fit?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              We're always looking for talented people. Send us your CV and tell us how you'd like to contribute.
            </p>
            <Button className="mt-6 bg-transparent" variant="outline" asChild>
              <Link href="/contact?subject=General Application">Send Your CV</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
