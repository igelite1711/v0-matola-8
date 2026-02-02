// Rating and Review Engine for Matola Platform
import type { Rating, UserRatingStats } from "./types"

// Mock ratings store
const ratings: Rating[] = []
const userStats: Map<string, UserRatingStats> = new Map()

// Rating tags for quick feedback
export const RATING_TAGS = {
  transporter: {
    positive: [
      { id: "punctual", label: { en: "Punctual", ny: "Anafika nthawi" } },
      { id: "safe_driver", label: { en: "Safe Driver", ny: "Woyendetsa bwino" } },
      { id: "good_comms", label: { en: "Good Communication", ny: "Amayankhula bwino" } },
      { id: "cargo_care", label: { en: "Careful with Cargo", ny: "Amasamala katundu" } },
      { id: "professional", label: { en: "Professional", ny: "Wa ulemu" } },
    ],
    negative: [
      { id: "late", label: { en: "Late", ny: "Anachedwa" } },
      { id: "rude", label: { en: "Rude", ny: "Wopanda ulemu" } },
      { id: "poor_comms", label: { en: "Poor Communication", ny: "Samayankhula bwino" } },
      { id: "cargo_damage", label: { en: "Damaged Cargo", ny: "Anaononga katundu" } },
    ],
  },
  shipper: {
    positive: [
      { id: "quick_payment", label: { en: "Quick Payment", ny: "Analipira msanga" } },
      { id: "easy_loading", label: { en: "Easy Loading Access", ny: "Malo abwino otenga" } },
      { id: "responsive", label: { en: "Responsive", ny: "Amayankha msanga" } },
      { id: "accurate_info", label: { en: "Accurate Info", ny: "Zambiri zolondola" } },
    ],
    negative: [
      { id: "late_payment", label: { en: "Late Payment", ny: "Anachedwa kulipira" } },
      { id: "wrong_weight", label: { en: "Wrong Weight Info", ny: "Kulemera kulakwika" } },
      { id: "unresponsive", label: { en: "Unresponsive", ny: "Samayankha" } },
      { id: "difficult_access", label: { en: "Difficult Access", ny: "Malo ovuta" } },
    ],
  },
}

// Rating categories
export const RATING_CATEGORIES = {
  transporter: [
    { id: "punctuality", label: { en: "Punctuality", ny: "Kusunga nthawi" } },
    { id: "communication", label: { en: "Communication", ny: "Kuyankhulana" } },
    { id: "cargo_care", label: { en: "Cargo Care", ny: "Kusamala katundu" } },
    { id: "professionalism", label: { en: "Professionalism", ny: "Ukadaulo" } },
  ],
  shipper: [
    { id: "load_accuracy", label: { en: "Load Accuracy", ny: "Katundu wolondola" } },
    { id: "communication", label: { en: "Communication", ny: "Kuyankhulana" } },
    { id: "payment_speed", label: { en: "Payment Speed", ny: "Kulipira msanga" } },
    { id: "accessibility", label: { en: "Loading Access", ny: "Malo otenga" } },
  ],
}

// Initialize user rating stats
export function initializeUserStats(userId: string): UserRatingStats {
  const stats: UserRatingStats = {
    averageRating: 0,
    totalRatings: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    tags: {},
    isProbation: false,
  }
  userStats.set(userId, stats)
  return stats
}

// Get user rating stats
export function getUserRatingStats(userId: string): UserRatingStats {
  return userStats.get(userId) || initializeUserStats(userId)
}

// Submit a rating
export function submitRating(ratingData: Omit<Rating, "id" | "createdAt">): Rating {
  const rating: Rating = {
    ...ratingData,
    id: `rating-${Date.now()}`,
    createdAt: new Date(),
  }

  ratings.push(rating)

  // Update recipient's stats
  updateUserStats(rating.toUserId, rating)

  // Check probation status
  checkProbationStatus(rating.toUserId)

  return rating
}

// Update user rating stats
function updateUserStats(userId: string, newRating: Rating): void {
  const stats = getUserRatingStats(userId)

  // Update rating breakdown
  const ratingKey = Math.round(newRating.overallRating) as 1 | 2 | 3 | 4 | 5
  stats.ratingBreakdown[ratingKey]++
  stats.totalRatings++

  // Recalculate average
  const totalSum = Object.entries(stats.ratingBreakdown).reduce(
    (sum, [rating, count]) => sum + Number(rating) * count,
    0,
  )
  stats.averageRating = Math.round((totalSum / stats.totalRatings) * 10) / 10

  // Update tags
  newRating.tags.forEach((tag) => {
    stats.tags[tag] = (stats.tags[tag] || 0) + 1
  })

  userStats.set(userId, stats)
}

// Check if user should be placed on probation
export function checkProbationStatus(userId: string): boolean {
  const stats = getUserRatingStats(userId)

  // Probation rules:
  // 1. Average rating below 3.5 with at least 5 ratings
  // 2. More than 30% 1-2 star ratings
  // 3. Multiple negative tags

  if (stats.totalRatings < 5) return false

  const lowRatings = stats.ratingBreakdown[1] + stats.ratingBreakdown[2]
  const lowRatingPercentage = lowRatings / stats.totalRatings

  const negativeTags = Object.entries(stats.tags)
    .filter(
      ([tag]) =>
        RATING_TAGS.transporter.negative.some((t) => t.id === tag) ||
        RATING_TAGS.shipper.negative.some((t) => t.id === tag),
    )
    .reduce((sum, [, count]) => sum + count, 0)

  if (stats.averageRating < 3.5 || lowRatingPercentage > 0.3 || negativeTags > 5) {
    stats.isProbation = true
    stats.probationReason =
      stats.averageRating < 3.5
        ? "Low average rating"
        : lowRatingPercentage > 0.3
          ? "High percentage of low ratings"
          : "Multiple negative feedback reports"
    stats.probationUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    userStats.set(userId, stats)
    return true
  }

  return false
}

// Get ratings for a user
export function getUserRatings(userId: string, limit = 10): Rating[] {
  return ratings
    .filter((r) => r.toUserId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}

// Get ratings by shipment
export function getShipmentRatings(shipmentId: string): Rating[] {
  return ratings.filter((r) => r.shipmentId === shipmentId)
}

// Check if rating exists for shipment
export function hasRatedShipment(shipmentId: string, fromUserId: string): boolean {
  return ratings.some((r) => r.shipmentId === shipmentId && r.fromUserId === fromUserId)
}

// Calculate trust score
export function calculateTrustScore(userId: string): number {
  const stats = getUserRatingStats(userId)

  if (stats.totalRatings === 0) return 50 // Default for new users

  // Base score from average rating (0-50 points)
  const ratingScore = (stats.averageRating / 5) * 50

  // Bonus for volume (0-20 points)
  const volumeScore = Math.min(stats.totalRatings / 50, 1) * 20

  // Bonus for positive tags (0-20 points)
  const positiveTags = Object.entries(stats.tags)
    .filter(
      ([tag]) =>
        RATING_TAGS.transporter.positive.some((t) => t.id === tag) ||
        RATING_TAGS.shipper.positive.some((t) => t.id === tag),
    )
    .reduce((sum, [, count]) => sum + count, 0)
  const tagScore = Math.min(positiveTags / 20, 1) * 20

  // Penalty for probation (-10 points)
  const probationPenalty = stats.isProbation ? 10 : 0

  // Consistency bonus (0-10 points) - lower std dev = higher score
  const ratings5 = stats.ratingBreakdown[5] + stats.ratingBreakdown[4]
  const consistencyScore = (ratings5 / stats.totalRatings) * 10

  const totalScore = ratingScore + volumeScore + tagScore + consistencyScore - probationPenalty

  return Math.round(Math.max(0, Math.min(100, totalScore)))
}
