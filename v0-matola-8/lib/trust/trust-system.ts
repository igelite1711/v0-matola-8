// African Trust System - Community-based verification
// In Africa, trust is built through community connections, not just algorithms

export interface TrustProfile {
  userId: string
  overallScore: number // 0-100

  // Verification levels
  phoneVerified: boolean
  idVerified: boolean // National ID
  addressVerified: boolean

  // Community trust
  communityVouches: CommunityVouch[]
  unionMembership?: UnionMembership
  cooperativeMembership?: CooperativeMembership

  // Track record
  tripsCompleted: number
  tripsAsShipper: number
  tripsAsTransporter: number
  disputesRaised: number
  disputesLost: number

  // Ratings
  averageRating: number
  totalRatings: number

  // Badges
  badges: TrustBadge[]

  // Account age
  memberSince: Date
  lastActive: Date
}

export interface CommunityVouch {
  id: string
  voucherId: string
  voucherName: string
  voucherPhone: string
  relationship: "family" | "neighbor" | "colleague" | "church" | "chief" | "other"
  message?: string
  createdAt: Date
  verified: boolean // We call to verify the relationship
}

export interface UnionMembership {
  unionId: string
  unionName: string // e.g., "Malawi Transporters Union"
  memberNumber: string
  verifiedAt: Date
  expiresAt: Date
}

export interface CooperativeMembership {
  cooperativeId: string
  cooperativeName: string // e.g., "NASFAM"
  memberNumber: string
  verifiedAt: Date
}

export type BadgeType =
  | "first_trip"
  | "trips_10"
  | "trips_50"
  | "trips_100"
  | "trips_500"
  | "top_rated"
  | "zero_disputes"
  | "community_trusted"
  | "union_member"
  | "fast_responder"
  | "route_expert"
  | "harvest_hero" // For moving farm produce during harvest
  | "rainy_warrior" // For working during rainy season

export interface TrustBadge {
  type: BadgeType
  earnedAt: Date
  description: string
  icon: string
}

// Calculate trust score based on multiple factors
export function calculateTrustScore(profile: Partial<TrustProfile>): number {
  let score = 0

  // Base verification (30 points max)
  if (profile.phoneVerified) score += 10
  if (profile.idVerified) score += 15
  if (profile.addressVerified) score += 5

  // Community vouches (25 points max)
  const verifiedVouches = profile.communityVouches?.filter((v) => v.verified) || []
  score += Math.min(verifiedVouches.length * 5, 25)

  // Union/Cooperative membership (15 points max)
  if (profile.unionMembership) score += 10
  if (profile.cooperativeMembership) score += 5

  // Track record (20 points max)
  const trips = profile.tripsCompleted || 0
  if (trips >= 100) score += 20
  else if (trips >= 50) score += 15
  else if (trips >= 20) score += 10
  else if (trips >= 5) score += 5
  else if (trips >= 1) score += 2

  // Dispute ratio penalty
  const disputes = profile.disputesLost || 0
  if (disputes > 0 && trips > 0) {
    const disputeRatio = disputes / trips
    if (disputeRatio > 0.1)
      score -= 10 // More than 10% disputes
    else if (disputeRatio > 0.05) score -= 5
  }

  // Ratings (10 points max)
  const rating = profile.averageRating || 0
  const ratingCount = profile.totalRatings || 0
  if (ratingCount >= 5) {
    score += Math.round((rating / 5) * 10)
  }

  return Math.max(0, Math.min(100, score))
}

// Get trust level label
export function getTrustLevel(score: number): {
  level: "new" | "building" | "trusted" | "highly_trusted" | "community_leader"
  label: string
  labelNy: string // Chichewa
  color: string
} {
  if (score >= 90) {
    return {
      level: "community_leader",
      label: "Community Leader",
      labelNy: "Mtsogoleri wa Anthu",
      color: "gold",
    }
  }
  if (score >= 70) {
    return {
      level: "highly_trusted",
      label: "Highly Trusted",
      labelNy: "Wokhulupirira Kwambiri",
      color: "green",
    }
  }
  if (score >= 50) {
    return {
      level: "trusted",
      label: "Trusted",
      labelNy: "Wokhulupirira",
      color: "blue",
    }
  }
  if (score >= 25) {
    return {
      level: "building",
      label: "Building Trust",
      labelNy: "Kumanga Chikhulupiriro",
      color: "yellow",
    }
  }
  return {
    level: "new",
    label: "New Member",
    labelNy: "Membala Watsopano",
    color: "gray",
  }
}

// Badge definitions
export const BADGE_DEFINITIONS: Record<
  BadgeType,
  {
    name: string
    nameNy: string
    description: string
    descriptionNy: string
    icon: string
  }
> = {
  first_trip: {
    name: "First Trip",
    nameNy: "Ulendo Woyamba",
    description: "Completed your first trip",
    descriptionNy: "Mwamaliza ulendo woyamba",
    icon: "🚚",
  },
  trips_10: {
    name: "Road Warrior",
    nameNy: "Ngwazi ya Msewu",
    description: "Completed 10 trips",
    descriptionNy: "Mwamaliza maulendo 10",
    icon: "🛣️",
  },
  trips_50: {
    name: "Transport Pro",
    nameNy: "Katswiri wa Mayendedwe",
    description: "Completed 50 trips",
    descriptionNy: "Mwamaliza maulendo 50",
    icon: "⭐",
  },
  trips_100: {
    name: "Transport Hero",
    nameNy: "Ngwazi ya Mayendedwe",
    description: "Completed 100 trips",
    descriptionNy: "Mwamaliza maulendo 100",
    icon: "🏆",
  },
  trips_500: {
    name: "Legend",
    nameNy: "Mwambo",
    description: "Completed 500 trips",
    descriptionNy: "Mwamaliza maulendo 500",
    icon: "👑",
  },
  top_rated: {
    name: "Top Rated",
    nameNy: "Wopambana",
    description: "Maintained 4.8+ rating",
    descriptionNy: "Mfundo 4.8+",
    icon: "🌟",
  },
  zero_disputes: {
    name: "Peacekeeper",
    nameNy: "Wosunga Mtendere",
    description: "50+ trips with zero disputes",
    descriptionNy: "Maulendo 50+ opanda mavuto",
    icon: "🕊️",
  },
  community_trusted: {
    name: "Community Trusted",
    nameNy: "Wokhulupirira Ndi Anthu",
    description: "Vouched by 5+ community members",
    descriptionNy: "Otsimikizidwa ndi anthu 5+",
    icon: "🤝",
  },
  union_member: {
    name: "Union Member",
    nameNy: "Membala wa Union",
    description: "Verified union member",
    descriptionNy: "Membala wotsimikizidwa",
    icon: "🏛️",
  },
  fast_responder: {
    name: "Fast Responder",
    nameNy: "Woyankha Msanga",
    description: "Responds within 5 minutes",
    descriptionNy: "Amayankha mu mphindi 5",
    icon: "⚡",
  },
  route_expert: {
    name: "Route Expert",
    nameNy: "Katswiri wa Njira",
    description: "10+ trips on same route",
    descriptionNy: "Maulendo 10+ pa njira imodzi",
    icon: "🗺️",
  },
  harvest_hero: {
    name: "Harvest Hero",
    nameNy: "Ngwazi ya Zokolola",
    description: "Moved 100+ tons during harvest",
    descriptionNy: "Mwanyamula ma ton 100+ pa nthawi yokolola",
    icon: "🌾",
  },
  rainy_warrior: {
    name: "Rainy Warrior",
    nameNy: "Ngwazi ya Mvula",
    description: "Completed trips during rainy season",
    descriptionNy: "Mwamaliza maulendo nthawi ya mvula",
    icon: "🌧️",
  },
}
