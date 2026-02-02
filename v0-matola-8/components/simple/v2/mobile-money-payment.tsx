"use client"

import { useState } from "react"
import { CheckCircle2, Clock, ArrowRight, Copy, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-language"
import { type MobileMoneyProvider, formatMWK, PAYMENT_INSTRUCTIONS, USSD_CODES } from "@/lib/payments/mobile-money"

interface MobileMoneyPaymentProps {
  amount: number
  reference: string
  onSuccess: () => void
  onClose: () => void
}

export function MobileMoneyPayment({ amount, reference, onSuccess, onClose }: MobileMoneyPaymentProps) {
  const { language } = useTranslation()
  const [step, setStep] = useState<"select" | "instructions" | "waiting" | "success">("select")
  const [provider, setProvider] = useState<MobileMoneyProvider | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleProviderSelect = (p: MobileMoneyProvider) => {
    setProvider(p)
    setStep("instructions")
  }

  const handlePaymentInitiated = () => {
    setStep("waiting")
    // In production, this would poll the API for payment confirmation
    setTimeout(() => {
      setStep("success")
    }, 5000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl border-t border-border max-h-[90vh] overflow-auto pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-muted-foreground">
            {language === "ny" ? "Lekani" : "Cancel"}
          </button>
          <h2 className="font-semibold text-foreground">{language === "ny" ? "Lipireni" : "Payment"}</h2>
          <div className="w-12" />
        </div>

        <div className="p-6">
          {/* Amount Display */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              {language === "ny" ? "Ndalama Zolipira" : "Amount to Pay"}
            </p>
            <p className="text-4xl font-bold text-foreground">{formatMWK(amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ref: {reference}</p>
          </div>

          {/* Step: Select Provider */}
          {step === "select" && (
            <div>
              <h3 className="font-medium text-foreground mb-4">
                {language === "ny" ? "Sankhani njira yolipirira" : "Select payment method"}
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => handleProviderSelect("airtel")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500 text-white font-bold">
                    AM
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">Airtel Money</p>
                    <p className="text-sm text-muted-foreground">*778#</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleProviderSelect("tnm")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 text-white font-bold">
                    TNM
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">TNM Mpamba</p>
                    <p className="text-sm text-muted-foreground">*212#</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Step: Instructions */}
          {step === "instructions" && provider && (
            <div>
              <h3 className="font-medium text-foreground mb-4">
                {language === "ny" ? "Tsatirani malangizo" : "Follow these steps"}
              </h3>

              {/* USSD Code Card */}
              <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "ny" ? "Dinani nambala iyi" : "Dial this code"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">{USSD_CODES[provider].sendMoney}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary bg-transparent"
                    onClick={() => handleCopy(USSD_CODES[provider].sendMoney)}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Step by step instructions */}
              <div className="space-y-3 mb-6">
                {PAYMENT_INSTRUCTIONS[provider][language === "ny" ? "ny" : "en"].map((instruction, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <p className="text-foreground pt-0.5">{instruction}</p>
                  </div>
                ))}
              </div>

              {/* Matola Number */}
              <div className="rounded-2xl bg-secondary/50 p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {language === "ny" ? "Nambala ya Matola" : "Matola Number"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">
                    {provider === "airtel" ? "0999 123 456" : "0888 123 456"}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => handleCopy(provider === "airtel" ? "0999123456" : "0888123456")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handlePaymentInitiated}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold"
              >
                {language === "ny" ? "Ndalipira" : "I've Made Payment"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step: Waiting */}
          {step === "waiting" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Clock className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === "ny" ? "Kudikira Kutsimikizira" : "Waiting for Confirmation"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ny"
                  ? "Tikudikirira kutsimikizira malipiro anu..."
                  : "Waiting for your payment confirmation..."}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === "ny" ? "Malipiro Atheka!" : "Payment Successful!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ny" ? "Zikomo! Malipiro anu alandidwa." : "Thank you! Your payment has been received."}
              </p>
              <Button
                onClick={onSuccess}
                className="w-full h-14 bg-success text-white rounded-2xl text-lg font-semibold"
              >
                {language === "ny" ? "Pitirizani" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
