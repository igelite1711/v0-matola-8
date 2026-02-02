"use client"

import { Shield, Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatPrice } from "@/lib/matching-engine"
import { useLanguage } from "@/contexts/language-context"
import type { EscrowHold } from "@/lib/types"

interface EscrowStatusCardProps {
  escrow: EscrowHold
  shipmentRoute?: string
}

export function EscrowStatusCard({ escrow, shipmentRoute }: EscrowStatusCardProps) {
  const { language } = useLanguage()

  const statusConfig = {
    held: {
      icon: Clock,
      label: { en: "Held in Escrow", ny: "Yagwiritsidwa" },
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
      progress: 50,
    },
    released: {
      icon: CheckCircle,
      label: { en: "Released", ny: "Yatulutsidwa" },
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      progress: 100,
    },
    refunded: {
      icon: ArrowRight,
      label: { en: "Refunded", ny: "Yabwezedwa" },
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      progress: 100,
    },
    disputed: {
      icon: AlertTriangle,
      label: { en: "Disputed", ny: "Yadandaulidwa" },
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      progress: 50,
    },
  }

  const config = statusConfig[escrow.status]
  const StatusIcon = config.icon

  const releaseConditionLabels = {
    delivery_confirmed: { en: "On delivery confirmation", ny: "Katundu akafika" },
    manual_release: { en: "Manual release", ny: "Kutulutsidwa pamanja" },
    dispute_resolved: { en: "After dispute resolution", ny: "Dandaulo lithetsedwa" },
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}>
              <Shield className={`h-4 w-4 ${config.color}`} />
            </div>
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Escrow Protection" : "Chitetezo cha Escrow"}
            </CardTitle>
          </div>
          <Badge className={`${config.bgColor} ${config.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label[language]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{language === "en" ? "Total Amount" : "Ndalama Zonse"}</span>
            <span className="font-medium">{formatPrice(escrow.grossAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === "en" ? "Platform Fee (5%)" : "Ndalama za Platform (5%)"}
            </span>
            <span className="text-destructive">-{formatPrice(escrow.platformFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>{language === "en" ? "Driver Receives" : "Woyendetsa Alandira"}</span>
            <span className="text-green-500">{formatPrice(escrow.netAmount)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={config.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{language === "en" ? "Payment Received" : "Malipiro Alandiridwa"}</span>
            <span>
              {escrow.status === "released"
                ? language === "en"
                  ? "Funds Released"
                  : "Ndalama Zatulutsidwa"
                : language === "en"
                  ? "Awaiting Delivery"
                  : "Kudikira Kufika"}
            </span>
          </div>
        </div>

        {/* Release Condition */}
        {escrow.status === "held" && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary">
              <strong>{language === "en" ? "Release Condition:" : "Momwe Zidzatulutsidwira:"}</strong>{" "}
              {releaseConditionLabels[escrow.releaseCondition][language]}
            </p>
          </div>
        )}

        {/* Shipment Reference */}
        {shipmentRoute && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{language === "en" ? "Shipment" : "Ulendo"}</span>
            <span>{shipmentRoute}</span>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{language === "en" ? "Held at" : "Wagwiritsidwa pa"}</span>
          <span>{escrow.heldAt.toLocaleDateString()}</span>
        </div>
        {escrow.releasedAt && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{language === "en" ? "Released at" : "Watulutsidwa pa"}</span>
            <span>{escrow.releasedAt.toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
