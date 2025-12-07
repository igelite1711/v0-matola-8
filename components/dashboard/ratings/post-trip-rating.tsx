"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown, Award, AlertTriangle } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { RATING_TAGS, RATING_CATEGORIES, submitRating, getUserRatingStats } from "@/lib/rating-engine"
import type { UserRole } from "@/lib/types"

interface PostTripRatingProps {
  open: boolean
  onClose: () => void
  shipmentId: string
  recipientId: string
  recipientName: string
  recipientRole: "shipper" | "transporter"
  onRatingSubmitted?: () => void
}

export function PostTripRating({
  open,
  onClose,
  shipmentId,
  recipientId,
  recipientName,
  recipientRole,
  onRatingSubmitted,
}: PostTripRatingProps) {
  const { language } = useLanguage()
  const { user, showToast } = useApp()

  const [overallRating, setOverallRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNegativeTags, setShowNegativeTags] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setOverallRating(0)
      setHoveredRating(0)
      setCategoryRatings({})
      setSelectedTags([])
      setReview("")
      setShowNegativeTags(false)
    }
  }, [open])

  // Show negative tags if rating is low
  useEffect(() => {
    setShowNegativeTags(overallRating > 0 && overallRating <= 2)
  }, [overallRating])

  const categories = RATING_CATEGORIES[recipientRole]
  const positiveTags = RATING_TAGS[recipientRole].positive
  const negativeTags = RATING_TAGS[recipientRole].negative

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings((prev) => ({ ...prev, [categoryId]: rating }))
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  const handleSubmit = async () => {
    if (overallRating === 0) {
      showToast(language === "en" ? "Please select an overall rating" : "Chonde sankhani mayiko", "error")
      return
    }

    setIsSubmitting(true)

    try {
      // Submit rating
      submitRating({
        shipmentId,
        fromUserId: user?.id || "",
        toUserId: recipientId,
        fromRole: user?.role as UserRole,
        toRole: recipientRole,
        overallRating,
        categoryRatings,
        tags: selectedTags,
        review: review.trim() || undefined,
      })

      // Check if recipient is now on probation
      const stats = getUserRatingStats(recipientId)

      if (stats.isProbation) {
        showToast(
          language === "en"
            ? "Rating submitted. This user has been flagged for review."
            : "Mayiko atumizidwa. Munthu ameneyu akuyang'aniridwa.",
          "info",
        )
      } else {
        showToast(language === "en" ? "Thank you for your feedback!" : "Zikomo chifukwa cha mayankho anu!", "success")
      }

      onRatingSubmitted?.()
      onClose()
    } catch {
      showToast(language === "en" ? "Failed to submit rating" : "Sindikupeza kutumiza mayiko", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return { en: "Excellent!", ny: "Zabwino kwambiri!" }
    if (rating === 4) return { en: "Very Good", ny: "Zabwino" }
    if (rating === 3) return { en: "Good", ny: "Bwino" }
    if (rating === 2) return { en: "Fair", ny: "Pang'ono" }
    if (rating === 1) return { en: "Poor", ny: "Zoipa" }
    return { en: "", ny: "" }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {language === "en" ? `Rate ${recipientName}` : `Patsani mayiko ${recipientName}`}
          </DialogTitle>
          <DialogDescription>
            {language === "en"
              ? "Your feedback helps maintain quality service on Matola"
              : "Mayankho anu amathandiza kusunga ntchito yabwino pa Matola"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating Stars */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {language === "en" ? "Overall Experience" : "Zonse Mwachidule"}
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || overallRating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {overallRating > 0 && (
              <p className="mt-2 text-sm font-medium text-primary">{getRatingLabel(overallRating)[language]}</p>
            )}
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {language === "en" ? "Rate specific areas" : "Patsani mayiko m'malo osiyanasiyana"}
            </p>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{category.label[language]}</span>
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
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tags - Positive */}
          {overallRating >= 3 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                {language === "en" ? "What went well?" : "Chinachitika bwino?"}
              </p>
              <div className="flex flex-wrap gap-2">
                {positiveTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "hover:bg-green-500/10"
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label[language]}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Tags - Negative */}
          {showNegativeTags && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                {language === "en" ? "What could be improved?" : "Chingathe kukonzeka?"}
              </p>
              <div className="flex flex-wrap gap-2">
                {negativeTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : "hover:bg-red-500/10"
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label[language]}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Written Review */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "en" ? "Write a review (optional)" : "Lembani ndemanga (ngati mukufuna)"}
            </label>
            <Textarea
              placeholder={language === "en" ? "Share your experience with this trip..." : "Tiuzeni za ulendo wanu..."}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Low rating warning */}
          {overallRating > 0 && overallRating <= 2 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-500 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {language === "en"
                  ? "Low ratings impact the user's standing on the platform. Please ensure your feedback is accurate."
                  : "Mayiko ochepa amakhudza mmene munthu amawonekera pa platform. Onetsetsani kuti mayankho anu ndi olondola."}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            {language === "en" ? "Skip" : "Dumphani"}
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={overallRating === 0 || isSubmitting}>
            {isSubmitting
              ? language === "en"
                ? "Submitting..."
                : "Akutumiza..."
              : language === "en"
                ? "Submit Rating"
                : "Tumizani Mayiko"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
