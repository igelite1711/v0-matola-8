"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, t as translate, formatMWK, type translations } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (section: keyof typeof translations, key: string) => string
  formatPrice: (amount: number) => string
  isChichewa: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("matola-language") as Language
    if (saved && (saved === "en" || saved === "ny")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("matola-language", lang)
  }

  const t = (section: keyof typeof translations, key: string) => {
    return translate(section, key, language)
  }

  const formatPrice = (amount: number) => {
    return formatMWK(amount, language)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatPrice,
        isChichewa: language === "ny",
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
