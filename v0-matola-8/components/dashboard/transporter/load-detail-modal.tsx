"use client"

import { useState } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import type { Shipment } from "@/lib/types"
import { formatPrice } from "@/lib/matching-engine"

interface LoadDetailModalProps {
  shipment: Shipment | null
  open: boolean
  onClose: () => void
}

export function LoadDetailModal({ shipment, open, onClose }: LoadDetailModalProps) {
  const [bidPrice, setBidPrice] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { submitBid } = useApp()

  if (!shipment) return null

  const handleSubmitBid = async () => {
    setIsSubmitting(true)
    submitBid({
      shipmentId: shipment.id,
      proposedPrice: bidPrice ? Number.parseInt(bidPrice) : shipment.price,
      message: bidMessage || undefined,
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setBidPrice("")
      setBidMessage("")
      onClose()
    }, 1500)
  }

  const handleAcceptPrice = async () => {
    setIsSubmitting(true)
    submitBid({
      shipmentId: shipment.id,
      proposedPrice: shipment.price,
      message: bidMessage || undefined,
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setBidPrice("")
      setBidMessage("")
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Load Details</span>
            {shipment.isBackhaul && (
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                Backhaul -40%
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Send className="h-8 w-8 text-green-500" />
            </div>
            <p className="mt-4 text-lg font-medium">Bid Submitted!</p>
            <p className="text-sm text-muted-foreground">The shipper will review your offer</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Route */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="h-12 w-0.5 bg-border" />
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{shipment.origin.city}</p>
                  {shipment.origin.landmark && (
                    <p className="text-sm text-muted-foreground">{shipment.origin.landmark}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="font-medium">{shipment.destination.city}</p>
                  {shipment.destination.landmark && (
                    <p className="text-sm text-muted-foreground">{shipment.destination.landmark}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Offered Price</p>
              <p className="text-3xl font-bold text-primary">{formatPrice(shipment.price)}</p>
              <p className="text-sm text-muted-foreground capitalize">{shipment.paymentMethod.replace("_", " ")}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Cargo Type</p>
                <p className="font-medium capitalize">{shipment.cargoType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">{shipment.weight.toLocaleString()} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Pickup Date</p>
                <p className="font-medium">{shipment.pickupDate.toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Time Window</p>
                <p className="font-medium">{shipment.pickupTimeWindow}</p>
              </div>
            </div>

            {/* Cargo Description */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cargo Description</p>
              <p className="rounded bg-muted/50 p-2 text-sm">{shipment.cargoDescription}</p>
            </div>

            {shipment.specialInstructions && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Special Instructions</p>
                <p className="rounded bg-yellow-500/10 p-2 text-sm text-yellow-400">{shipment.specialInstructions}</p>
              </div>
            )}

            {/* Shipper Info */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div>
                <p className="text-sm text-muted-foreground">Posted by</p>
                <p className="font-medium">{shipment.shipperName}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">4.7</span>
              </div>
            </div>

            {/* Bid Form */}
            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="space-y-2">
                <Label htmlFor="bidPrice">Your Bid (MWK)</Label>
                <Input
                  id="bidPrice"
                  type="number"
                  placeholder={shipment.price.toString()}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Leave empty to accept the offered price</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidMessage">Message (optional)</Label>
                <Textarea
                  id="bidMessage"
                  placeholder="Add a note to the shipper..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                Cancel
              </Button>
              {bidPrice ? (
                <Button className="flex-1" onClick={handleSubmitBid} disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Bid"}
                </Button>
              ) : (
                <Button className="flex-1" onClick={handleAcceptPrice} disabled={isSubmitting}>
                  {isSubmitting ? "Accepting..." : "Accept Price"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
