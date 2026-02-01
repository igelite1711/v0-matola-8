"use client"

import { useToast } from "@/components/simple/v2/ui/toast"

export function useCopyToClipboard() {
  const { addToast } = useToast()

  const copyToClipboard = async (text: string, message?: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }

      addToast({
        type: "success",
        message: message || "Copied to clipboard",
      })
    } catch (err) {
      addToast({
        type: "error",
        message: "Failed to copy",
      })
    }
  }

  return { copyToClipboard }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand("copy")
      document.body.removeChild(textArea)
      return success
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err)
    return false
  }
}
