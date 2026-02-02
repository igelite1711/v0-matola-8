"use client"

import { useState } from "react"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RatingModalProps {
  open: boolean
  onClose: () => void
  recipientName: string
  recipientRole: "shipper" | "transporter"
  shipmentId: string
}

const ratingCategories = {
  transporter: [
    { id: "punctuality", label: "Punctuality" },
    { id: "communication", label: "Communication" },
    { id: "cargo_care", label: "Cargo Care" },
    { id: "professionalism", label: "Professionalism" },
  ],
  shipper: [
    { id: "accuracy", label: "Load Accuracy" },
    { id: "communication", label: "Communication" },
    { id: "payment", label: "Payment Speed" },
    { id: "accessibility", label: "Loading Accessibility" },
  ],
}

export function RatingModal({ open, onClose, recipientName, recipientRole, shipmentId }: RatingModalProps) {
  const [overallRating, setOverallRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({})
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ratingCategories[recipientRole]

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings((prev) => ({ ...prev, [categoryId]: rating }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {recipientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall Experience</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || overallRating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {overallRating > 0 && (
              <p className="mt-2 text-sm font-medium">
                {overallRating === 5
                  ? "Excellent!"
                  : overallRating === 4
                    ? "Very Good"
                    : overallRating === 3
                      ? "Good"
                      : overallRating === 2
                        ? "Fair"
                        : "Poor"}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Rate specific areas</p>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{category.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleCategoryRating(category.id, star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          star <= (categoryRatings[category.id] || 0)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Write a review (optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick feedback</p>
            <div className="flex flex-wrap gap-2">
              {recipientRole === "transporter" ? (
                <>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <ThumbsUp className="h-3 w-3" /> On Time
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <ThumbsUp className="h-3 w-3" /> Great Care
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <MessageSquare className="h-3 w-3" /> Good Comms
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <ThumbsUp className="h-3 w-3" /> Quick Payment
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <ThumbsUp className="h-3 w-3" /> Easy Loading
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <MessageSquare className="h-3 w-3" /> Responsive
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Skip
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={overallRating === 0 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
