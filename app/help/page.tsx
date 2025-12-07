"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Phone, MessageCircle, Mail, Truck, CreditCard, Shield, MapPin } from "lucide-react"

const faqCategories = [
  {
    title: "Getting Started",
    icon: Truck,
    questions: [
      {
        q: "How do I create an account?",
        a: "You can create an account using your phone number. Just dial *555# for USSD, message us on WhatsApp, or register on our website. You'll need your phone number and a 4-digit PIN.",
      },
      {
        q: "What's the difference between a Shipper and a Transporter account?",
        a: "Shippers are businesses or individuals who need to move goods. Transporters are drivers and vehicle owners who provide transportation services. You can only have one account type at a time.",
      },
      {
        q: "Do I need to pay to use Matola?",
        a: "Registration is free! We charge a small commission only when a shipment is completed successfully. See our pricing page for details.",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods are accepted?",
        a: "We accept Airtel Money, TNM Mpamba, bank transfers, and cash on delivery for verified transactions.",
      },
      {
        q: "How does escrow payment work?",
        a: "When you book a shipment, payment is held securely in escrow. The transporter receives payment only after you confirm delivery. This protects both parties.",
      },
      {
        q: "When do transporters get paid?",
        a: "Transporters receive payment within 24 hours of delivery confirmation. For Mobile Money, it's usually instant.",
      },
    ],
  },
  {
    title: "Safety & Verification",
    icon: Shield,
    questions: [
      {
        q: "What is RTOA verification?",
        a: "RTOA (Road Transport Operators Association) verification confirms that a transporter is a legitimate, licensed operator. We verify vehicle registration, driver's license, and insurance.",
      },
      {
        q: "How do I report a problem with a shipment?",
        a: "Go to your shipment details and tap 'Report Issue'. You can also contact our support team via WhatsApp or phone. We respond within 30 minutes during business hours.",
      },
      {
        q: "Is my cargo insured?",
        a: "Basic insurance is included for all shipments. For high-value goods, we offer additional coverage options. Contact us for details.",
      },
    ],
  },
  {
    title: "Tracking & Delivery",
    icon: MapPin,
    questions: [
      {
        q: "How do I track my shipment?",
        a: "Use your tracking code on our website, reply with the code on WhatsApp, or dial *555*TRACK#. You'll get real-time location updates.",
      },
      {
        q: "What happens if my delivery is late?",
        a: "We monitor all shipments and will notify you of any delays. If a transporter is significantly late without valid reason, you may be eligible for compensation.",
      },
      {
        q: "Can I change the delivery address?",
        a: "Contact the transporter directly through the app or our support team. Address changes may affect pricing if the distance changes significantly.",
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Help Center</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions or get in touch with our support team.
            </p>

            {/* Search */}
            <div className="relative mt-8">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help..."
                className="h-12 pl-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Contact */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Call Us</h3>
                <a href="tel:+265999123456" className="mt-1 block text-sm text-primary hover:underline">
                  +265 999 123 456
                </a>
              </CardContent>
            </Card>
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground">WhatsApp</h3>
                <a href="https://wa.me/265999123456" className="mt-1 block text-sm text-primary hover:underline">
                  Chat Now
                </a>
              </CardContent>
            </Card>
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <a href="mailto:support@matola.mw" className="mt-1 block text-sm text-primary hover:underline">
                  support@matola.mw
                </a>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Sections */}
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-8 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            {(searchQuery ? filteredCategories : faqCategories).map((category, index) => (
              <div key={index} className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {searchQuery && filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                <Button className="mt-4 bg-transparent" variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Still need help */}
          <div className="mx-auto mt-16 max-w-xl text-center">
            <h2 className="text-2xl font-bold text-foreground">Still need help?</h2>
            <p className="mt-2 text-muted-foreground">Our support team is available Monday to Friday, 8am - 5pm.</p>
            <Button className="mt-6" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
