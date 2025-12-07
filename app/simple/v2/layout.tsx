import type React from "react"
import { ToastProvider } from "@/components/simple/v2/ui/toast"

export default function SimpleV2Layout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
