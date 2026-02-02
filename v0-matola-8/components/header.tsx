"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Truck, ChevronRight, Phone, MessageCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t, language } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-9 sm:w-9">
            <Truck className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
          </div>
          <span className="text-lg font-bold text-foreground sm:text-xl">Matola</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {language === "en" ? "Features" : "Zomwe Timapanga"}
          </Link>
          <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {language === "en" ? "How It Works" : "Momwe Zimagwirira"}
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {language === "en" ? "Pricing" : "Mitengo"}
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{language === "en" ? "Sign In" : "Lowani"}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">{language === "en" ? "Get Started" : "Yambani"}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 bg-background sm:top-16 lg:hidden">
          <nav className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                <MobileNavItem href="/#features" onClick={() => setMobileMenuOpen(false)}>
                  {language === "en" ? "Features" : "Zomwe Timapanga"}
                </MobileNavItem>
                <MobileNavItem href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                  {language === "en" ? "How It Works" : "Momwe Zimagwirira"}
                </MobileNavItem>
                <MobileNavItem href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                  {language === "en" ? "Pricing" : "Mitengo"}
                </MobileNavItem>
              </div>

              <div className="my-4 border-t border-border" />

              {/* Quick Access - Malawi Context */}
              <div className="mb-4 rounded-lg border border-border bg-card p-4">
                <p className="mb-3 text-sm font-medium">{language === "en" ? "Quick Access" : "Njira Zina Zolowera"}</p>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-xs">USSD</span>
                    <span className="text-xs font-medium text-primary">*555#</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs">WhatsApp</span>
                    <span className="text-xs font-medium text-primary">Chat</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <MobileNavItem href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {language === "en" ? "Sign In" : "Lowani"}
                </MobileNavItem>
              </div>
            </div>

            <div className="border-t border-border bg-card p-4">
              <Button asChild className="w-full h-12 text-base">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  {language === "en" ? "Get Started Free" : "Yambani Kwaulere"}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function MobileNavItem({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-lg px-3 py-4 text-base font-medium text-foreground active:bg-secondary"
    >
      {children}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}
