"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

interface LanguageToggleProps {
  onLanguageChange?: (lang: "en" | "ny") => void
}

export function LanguageToggle({ onLanguageChange }: LanguageToggleProps) {
  const [language, setLanguage] = useState<"en" | "ny">("en")

  const handleChange = (lang: "en" | "ny") => {
    setLanguage(lang)
    onLanguageChange?.(lang)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === "en" ? "English" : "Chichewa"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("ny")}>Chichewa (Nyanja)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Common translations for the platform
export const translations = {
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    shipments: "Shipments",
    tracking: "Tracking",
    payments: "Payments",
    settings: "Settings",
    signOut: "Sign Out",

    // Common actions
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    search: "Search",
    filter: "Filter",

    // Shipment status
    pending: "Pending",
    matched: "Matched",
    inTransit: "In Transit",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",

    // Common labels
    origin: "Origin",
    destination: "Destination",
    weight: "Weight",
    price: "Price",
    date: "Date",
    time: "Time",
    phone: "Phone",
    name: "Name",

    // Messages
    welcome: "Welcome",
    loading: "Loading...",
    noResults: "No results found",
    error: "An error occurred",
    success: "Success",
  },
  ny: {
    // Navigation
    home: "Patsogolo",
    dashboard: "Gawo Lalikulu",
    shipments: "Katundu",
    tracking: "Kutsata",
    payments: "Malipiro",
    settings: "Zosintha",
    signOut: "Tulukani",

    // Common actions
    submit: "Tumizani",
    cancel: "Siyani",
    save: "Sungani",
    delete: "Chotsani",
    edit: "Sinthani",
    view: "Onani",
    search: "Funani",
    filter: "Sankhani",

    // Shipment status
    pending: "Ikudikirira",
    matched: "Yapezeka",
    inTransit: "Pa Njira",
    delivered: "Yafika",
    completed: "Yathera",
    cancelled: "Yaletsa",

    // Common labels
    origin: "Kuchokera",
    destination: "Kupita",
    weight: "Kulemera",
    price: "Mtengo",
    date: "Tsiku",
    time: "Nthawi",
    phone: "Foni",
    name: "Dzina",

    // Messages
    welcome: "Takulandirani",
    loading: "Ikukonza...",
    noResults: "Palibe zotsatira",
    error: "Pali vuto",
    success: "Zabwino",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
