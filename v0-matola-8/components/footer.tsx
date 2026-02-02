"use client"

import Link from "next/link"
import { Truck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="border-t border-border bg-card py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {/* Logo section - full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-9 sm:w-9">
                <Truck className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg font-bold text-foreground sm:text-xl">Matola</span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
              {language === "en"
                ? "Connecting shippers and transporters across Malawi for smarter, cheaper logistics."
                : "Kulumikiza otumiza ndi oyendetsa ku Malawi kuti zinthu ziyende bwino ndi mtengo wotsika."}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {language === "en" ? "Platform" : "Malo Ogwirira Ntchito"}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground sm:text-sm">
              <li>
                <Link href="/register" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "For Shippers" : "Kwa Otumiza"}
                </Link>
              </li>
              <li>
                <Link href="/register?type=transporter" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "For Transporters" : "Kwa Oyendetsa"}
                </Link>
              </li>
              <li>
                <Link href="/contact?subject=Broker Account" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "For Brokers" : "Kwa Madalali"}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Pricing" : "Mitengo"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {language === "en" ? "Company" : "Kampani"}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "About Us" : "Za Ife"}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Careers" : "Ntchito"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Contact" : "Tilumikizeni"}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Blog" : "Nkhani"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {language === "en" ? "Support" : "Thandizo"}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground sm:text-sm">
              <li>
                <Link href="/help" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Help Center" : "Malo Othandizira"}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Safety" : "Chitetezo"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Terms" : "Malamulo"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground active:text-foreground">
                  {language === "en" ? "Privacy" : "Zachinsinsi"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:mt-8 sm:pt-8 sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} Matola. {language === "en" ? "Made in Malawi." : "Yapangidwa ku Malawi."}
          </p>
        </div>
      </div>
    </footer>
  )
}
