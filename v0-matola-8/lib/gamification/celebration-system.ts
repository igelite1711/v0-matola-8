// Matola Celebration & Gamification System
// Designed for African cultural context where community recognition matters

export interface Achievement {
  id: string
  type: "badge" | "milestone" | "streak" | "community" | "seasonal"
  name: string
  nameNy: string
  description: string
  descriptionNy: string
  icon: string
  points: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

export interface UserStats {
  totalTrips: number
  totalEarnings: number
  totalKilometers: number
  currentStreak: number
  longestStreak: number
  onTimeDeliveries: number
  fiveStarRatings: number
  backhaulsCompleted: number
  communityVouches: number
  routesExplored: string[]
  monthlyRank?: number
  weeklyRank?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  trustScore: number
  weeklyTrips: number
  weeklyEarnings: number
  badges: string[]
  isYou?: boolean
}

// Achievement Definitions
export const ACHIEVEMENTS: Record<string, Achievement> = {
  // First-time achievements
  first_load: {
    id: "first_load",
    type: "milestone",
    name: "First Load",
    nameNy: "Katundu Woyamba",
    description: "Posted your first shipment on Matola",
    descriptionNy: "Mwalemba katundu wanu woyamba pa Matola",
    icon: "📦",
    points: 50,
    rarity: "common",
  },
  first_delivery: {
    id: "first_delivery",
    type: "milestone",
    name: "First Delivery",
    nameNy: "Kutumiza Koyamba",
    description: "Completed your first successful delivery",
    descriptionNy: "Mwatumiza katundu woyamba bwino",
    icon: "🚚",
    points: 100,
    rarity: "common",
  },
  first_payment: {
    id: "first_payment",
    type: "milestone",
    name: "First Earnings",
    nameNy: "Ndalama Zoyamba",
    description: "Received your first payment through Matola",
    descriptionNy: "Mwalandira ndalama zanu zoyamba kudzera pa Matola",
    icon: "💰",
    points: 100,
    rarity: "common",
  },

  // Trip milestones
  trips_5: {
    id: "trips_5",
    type: "milestone",
    name: "Road Starter",
    nameNy: "Woyamba Ulendo",
    description: "Completed 5 trips",
    descriptionNy: "Mwamaliza maulendo 5",
    icon: "🛤️",
    points: 150,
    rarity: "common",
  },
  trips_25: {
    id: "trips_25",
    type: "milestone",
    name: "Regular Driver",
    nameNy: "Oyendetsa Wodziwika",
    description: "Completed 25 trips",
    descriptionNy: "Mwamaliza maulendo 25",
    icon: "🚛",
    points: 300,
    rarity: "uncommon",
  },
  trips_100: {
    id: "trips_100",
    type: "milestone",
    name: "Road Warrior",
    nameNy: "Nkhondo ya Misewu",
    description: "Completed 100 trips",
    descriptionNy: "Mwamaliza maulendo 100",
    icon: "⚔️",
    points: 1000,
    rarity: "rare",
  },
  trips_500: {
    id: "trips_500",
    type: "milestone",
    name: "Transport Legend",
    nameNy: "Chitsanzo cha Mayendedwe",
    description: "Completed 500 trips - You are a legend!",
    descriptionNy: "Mwamaliza maulendo 500 - Ndinu chitsanzo!",
    icon: "👑",
    points: 5000,
    rarity: "legendary",
  },

  // Streak achievements
  streak_7: {
    id: "streak_7",
    type: "streak",
    name: "Week Warrior",
    nameNy: "Wankhondo wa Sabata",
    description: "7-day delivery streak",
    descriptionNy: "Kutumiza masiku 7 osalekeza",
    icon: "🔥",
    points: 200,
    rarity: "uncommon",
  },
  streak_30: {
    id: "streak_30",
    type: "streak",
    name: "Monthly Master",
    nameNy: "Mbuye wa Mwezi",
    description: "30-day delivery streak",
    descriptionNy: "Kutumiza masiku 30 osalekeza",
    icon: "⚡",
    points: 1000,
    rarity: "rare",
  },

  // Quality achievements
  five_star_10: {
    id: "five_star_10",
    type: "milestone",
    name: "Star Performer",
    nameNy: "Wochita Bwino",
    description: "Received 10 five-star ratings",
    descriptionNy: "Mwalandira nyenyezi 5 nthawi 10",
    icon: "⭐",
    points: 300,
    rarity: "uncommon",
  },
  on_time_50: {
    id: "on_time_50",
    type: "milestone",
    name: "Punctual Pro",
    nameNy: "Wosunga Nthawi",
    description: "50 on-time deliveries",
    descriptionNy: "Kutumiza pa nthawi nthawi 50",
    icon: "⏰",
    points: 500,
    rarity: "uncommon",
  },

  // Route achievements
  route_lilongwe_blantyre: {
    id: "route_lilongwe_blantyre",
    type: "milestone",
    name: "M1 Master",
    nameNy: "Mbuye wa M1",
    description: "Completed 10 trips on Lilongwe-Blantyre route",
    descriptionNy: "Maulendo 10 pa njira ya Lilongwe-Blantyre",
    icon: "🛣️",
    points: 300,
    rarity: "uncommon",
  },
  route_explorer: {
    id: "route_explorer",
    type: "milestone",
    name: "Route Explorer",
    nameNy: "Wofufuza Njira",
    description: "Delivered to 10 different districts",
    descriptionNy: "Munatumiza ku maboma 10 osiyana",
    icon: "🗺️",
    points: 500,
    rarity: "rare",
  },

  // Seasonal achievements
  harvest_hero: {
    id: "harvest_hero",
    type: "seasonal",
    name: "Harvest Hero",
    nameNy: "Ngwazi ya Zokolola",
    description: "Completed 20 farm produce deliveries during harvest season",
    descriptionNy: "Mautumizo 20 a zokolola pa nthawi yokolola",
    icon: "🌾",
    points: 500,
    rarity: "rare",
  },
  tobacco_titan: {
    id: "tobacco_titan",
    type: "seasonal",
    name: "Tobacco Titan",
    nameNy: "Chitsanzo cha Fodya",
    description: "Delivered 50 tobacco loads during auction season",
    descriptionNy: "Mautumizo 50 a fodya pa nthawi ya malonda",
    icon: "🍃",
    points: 1000,
    rarity: "epic",
  },
  rainy_warrior: {
    id: "rainy_warrior",
    type: "seasonal",
    name: "Rainy Warrior",
    nameNy: "Wankhondo wa Mvula",
    description: "Maintained deliveries through rainy season",
    descriptionNy: "Munapitiliza kutumiza pa nthawi ya mvula",
    icon: "🌧️",
    points: 400,
    rarity: "uncommon",
  },

  // Community achievements
  community_vouched: {
    id: "community_vouched",
    type: "community",
    name: "Community Trusted",
    nameNy: "Wokhulupilika",
    description: "Received 5 vouches from other users",
    descriptionNy: "Mwalandira chikhulupiliro kuchokera kwa anthu 5",
    icon: "🤝",
    points: 300,
    rarity: "uncommon",
  },
  helpful_member: {
    id: "helpful_member",
    type: "community",
    name: "Helpful Member",
    nameNy: "Wothandiza",
    description: "Vouched for 10 other users",
    descriptionNy: "Mwathandiza anthu 10 ena",
    icon: "💪",
    points: 200,
    rarity: "common",
  },
  union_member: {
    id: "union_member",
    type: "community",
    name: "Union Verified",
    nameNy: "Wotsimikizidwa ndi Union",
    description: "Verified membership in a transport union",
    descriptionNy: "Ubale wanu ndi union wotsimikizidwa",
    icon: "🏛️",
    points: 500,
    rarity: "rare",
  },

  // Backhaul achievements
  backhaul_5: {
    id: "backhaul_5",
    type: "milestone",
    name: "Smart Returner",
    nameNy: "Wobwerera Mwanzeru",
    description: "Completed 5 backhaul trips",
    descriptionNy: "Maulendo 5 obwerera ndi katundu",
    icon: "🔄",
    points: 200,
    rarity: "common",
  },
  backhaul_25: {
    id: "backhaul_25",
    type: "milestone",
    name: "Efficiency Expert",
    nameNy: "Katswiri",
    description: "Completed 25 backhaul trips - never return empty!",
    descriptionNy: "Maulendo 25 obwerera - osamabwerera opanda!",
    icon: "💎",
    points: 750,
    rarity: "rare",
  },

  // Earnings milestones (in MWK)
  earnings_100k: {
    id: "earnings_100k",
    type: "milestone",
    name: "First 100K",
    nameNy: "Zoyamba 100K",
    description: "Earned MK 100,000 through Matola",
    descriptionNy: "Mwapeza MK 100,000 kudzera pa Matola",
    icon: "💵",
    points: 200,
    rarity: "common",
  },
  earnings_1m: {
    id: "earnings_1m",
    type: "milestone",
    name: "Millionaire Road",
    nameNy: "Njira ya Chuma",
    description: "Earned MK 1,000,000 through Matola",
    descriptionNy: "Mwapeza MK 1,000,000 kudzera pa Matola",
    icon: "💎",
    points: 1000,
    rarity: "rare",
  },
  earnings_10m: {
    id: "earnings_10m",
    type: "milestone",
    name: "Transport Mogul",
    nameNy: "Chitsanzo cha Mayendedwe",
    description: "Earned MK 10,000,000 through Matola",
    descriptionNy: "Mwapeza MK 10,000,000 kudzera pa Matola",
    icon: "🏆",
    points: 5000,
    rarity: "legendary",
  },
}

// Celebration messages by language
export const CELEBRATION_MESSAGES = {
  en: {
    badge_earned: [
      "Amazing work! You've earned a new badge!",
      "Congratulations! New achievement unlocked!",
      "You're on fire! New badge earned!",
      "Incredible! Look what you've achieved!",
    ],
    milestone_reached: ["Major milestone reached!", "Look how far you've come!", "This is huge! Milestone achieved!"],
    streak_continued: [
      "Streak continues! Keep it going!",
      "On fire! Your streak is alive!",
      "Unstoppable! Another day, another delivery!",
    ],
    leaderboard_climb: ["Moving up! You're climbing the leaderboard!", "Rising star! Your rank improved!"],
    new_record: ["Personal best! You've set a new record!", "Outstanding! New personal record!"],
  },
  ny: {
    badge_earned: [
      "Ntchito yabwino! Mwapeza badge yatsopano!",
      "Zikomo! Mwapeza chinthu chatsopano!",
      "Mukuchita bwino! Badge yatsopano!",
      "Bwinobwino! Onani chomwe mwapeza!",
    ],
    milestone_reached: [
      "Mwakwaniritsa cholinga chachikulu!",
      "Onani komwe mwafika!",
      "Izi ndi zazikulu! Mwakwaniritsa!",
    ],
    streak_continued: [
      "Streak ikupitilira! Pitirizani!",
      "Mukuyaka! Streak yanu ili moyo!",
      "Osayimitsidwa! Tsiku lina, kutumiza kwina!",
    ],
    leaderboard_climb: ["Mukwera! Mukwera pa leaderboard!", "Nyenyezi yotuluka! Ulemerero wanu wakwera!"],
    new_record: ["Bwino koposa! Mwakhazikitsa rekodi yatsopano!", "Zochititsa chidwi! Rekodi yatsopano!"],
  },
}

// Points to level mapping
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: "Newcomer", titleNy: "Watsopano" },
  { level: 2, points: 100, title: "Beginner", titleNy: "Woyamba" },
  { level: 3, points: 300, title: "Regular", titleNy: "Wodziwika" },
  { level: 4, points: 600, title: "Experienced", titleNy: "Wodziwa" },
  { level: 5, points: 1000, title: "Professional", titleNy: "Katswiri" },
  { level: 6, points: 1500, title: "Expert", titleNy: "Wapadera" },
  { level: 7, points: 2500, title: "Master", titleNy: "Mbuye" },
  { level: 8, points: 4000, title: "Champion", titleNy: "Chitsanzo" },
  { level: 9, points: 6000, title: "Legend", titleNy: "Ngwazi" },
  { level: 10, points: 10000, title: "Transport King", titleNy: "Mfumu ya Mayendedwe" },
]

export function getUserLevel(totalPoints: number): {
  level: number
  title: string
  titleNy: string
  progress: number
  pointsToNext: number
} {
  let currentLevel = LEVEL_THRESHOLDS[0]
  let nextLevel = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i].points) {
      currentLevel = LEVEL_THRESHOLDS[i]
      nextLevel = LEVEL_THRESHOLDS[i + 1] || currentLevel
      break
    }
  }

  const pointsInCurrentLevel = totalPoints - currentLevel.points
  const pointsForNextLevel = nextLevel.points - currentLevel.points
  const progress = pointsForNextLevel > 0 ? (pointsInCurrentLevel / pointsForNextLevel) * 100 : 100

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    titleNy: currentLevel.titleNy,
    progress: Math.min(progress, 100),
    pointsToNext: Math.max(0, nextLevel.points - totalPoints),
  }
}

export function checkAchievements(stats: UserStats, existingAchievements: string[]): Achievement[] {
  const newAchievements: Achievement[] = []

  // Trip milestones
  if (stats.totalTrips >= 5 && !existingAchievements.includes("trips_5")) {
    newAchievements.push(ACHIEVEMENTS.trips_5)
  }
  if (stats.totalTrips >= 25 && !existingAchievements.includes("trips_25")) {
    newAchievements.push(ACHIEVEMENTS.trips_25)
  }
  if (stats.totalTrips >= 100 && !existingAchievements.includes("trips_100")) {
    newAchievements.push(ACHIEVEMENTS.trips_100)
  }
  if (stats.totalTrips >= 500 && !existingAchievements.includes("trips_500")) {
    newAchievements.push(ACHIEVEMENTS.trips_500)
  }

  // Streak achievements
  if (stats.currentStreak >= 7 && !existingAchievements.includes("streak_7")) {
    newAchievements.push(ACHIEVEMENTS.streak_7)
  }
  if (stats.currentStreak >= 30 && !existingAchievements.includes("streak_30")) {
    newAchievements.push(ACHIEVEMENTS.streak_30)
  }

  // Quality achievements
  if (stats.fiveStarRatings >= 10 && !existingAchievements.includes("five_star_10")) {
    newAchievements.push(ACHIEVEMENTS.five_star_10)
  }
  if (stats.onTimeDeliveries >= 50 && !existingAchievements.includes("on_time_50")) {
    newAchievements.push(ACHIEVEMENTS.on_time_50)
  }

  // Backhaul achievements
  if (stats.backhaulsCompleted >= 5 && !existingAchievements.includes("backhaul_5")) {
    newAchievements.push(ACHIEVEMENTS.backhaul_5)
  }
  if (stats.backhaulsCompleted >= 25 && !existingAchievements.includes("backhaul_25")) {
    newAchievements.push(ACHIEVEMENTS.backhaul_25)
  }

  // Community achievements
  if (stats.communityVouches >= 5 && !existingAchievements.includes("community_vouched")) {
    newAchievements.push(ACHIEVEMENTS.community_vouched)
  }

  // Route explorer
  if (stats.routesExplored.length >= 10 && !existingAchievements.includes("route_explorer")) {
    newAchievements.push(ACHIEVEMENTS.route_explorer)
  }

  // Earnings milestones
  if (stats.totalEarnings >= 100000 && !existingAchievements.includes("earnings_100k")) {
    newAchievements.push(ACHIEVEMENTS.earnings_100k)
  }
  if (stats.totalEarnings >= 1000000 && !existingAchievements.includes("earnings_1m")) {
    newAchievements.push(ACHIEVEMENTS.earnings_1m)
  }
  if (stats.totalEarnings >= 10000000 && !existingAchievements.includes("earnings_10m")) {
    newAchievements.push(ACHIEVEMENTS.earnings_10m)
  }

  return newAchievements
}

export function getRandomCelebrationMessage(
  type: keyof (typeof CELEBRATION_MESSAGES)["en"],
  language: "en" | "ny",
): string {
  const messages = CELEBRATION_MESSAGES[language][type]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-muted-foreground"
    case "uncommon":
      return "text-success"
    case "rare":
      return "text-primary"
    case "epic":
      return "text-purple-500"
    case "legendary":
      return "text-warning"
    default:
      return "text-foreground"
  }
}

export function getRarityBgColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "bg-muted/50"
    case "uncommon":
      return "bg-success/10"
    case "rare":
      return "bg-primary/10"
    case "epic":
      return "bg-purple-500/10"
    case "legendary":
      return "bg-warning/10"
    default:
      return "bg-card"
  }
}
