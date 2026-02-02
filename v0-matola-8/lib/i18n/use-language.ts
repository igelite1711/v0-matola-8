"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type Language, t as translate, type TranslationKey } from "./translations"

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => translate(key, get().language),
    }),
    {
      name: "matola-language",
    },
  ),
)

// Hook for components
export function useTranslation() {
  const { language, setLanguage, t } = useLanguage()
  return { language, setLanguage, t }
}
