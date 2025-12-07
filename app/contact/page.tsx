"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, MapPin, MessageCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: searchParams.get("subject") || "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Contact Us</h1>
              <p className="mt-4 text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Phone</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Mon-Fri 8am-5pm</p>
                      <a href="tel:+265999123456" className="mt-2 block text-primary hover:underline">
                        +265 999 123 456
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">WhatsApp</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Quick responses</p>
                      <a href="https://wa.me/265999123456" className="mt-2 block text-primary hover:underline">
                        Chat with us
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email</h3>
                      <p className="mt-1 text-sm text-muted-foreground">We'll respond within 24hrs</p>
                      <a href="mailto:hello@matola.mw" className="mt-2 block text-primary hover:underline">
                        hello@matola.mw
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Office</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        City Centre, Area 3<br />
                        Lilongwe, Malawi
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardContent className="pt-6">
                    {isSubmitted ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Message Sent!</h3>
                        <p className="mt-2 text-muted-foreground">
                          Thank you for reaching out. We'll get back to you within 24 hours.
                        </p>
                        <Button className="mt-6" onClick={() => setIsSubmitted(false)}>
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="0999 123 456"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              placeholder="How can we help?"
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            rows={6}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Message"
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
