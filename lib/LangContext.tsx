"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Lang } from "./i18n"

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType>({
  lang: "es",
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es")
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}