/**
 * Seed Achievements
 * Run this script to populate the achievements table
 * Usage: tsx scripts/seed-achievements.ts
 */

import { prisma } from "../lib/db/prisma"

const achievements = [
  // Milestone achievements
  {
    code: "trips_1",
    name: "First Trip",
    nameNy: "Ulendo Woyamba",
    description: "Complete your first shipment",
    descriptionNy: "Maliza ulendo wanu woyamba",
    category: "milestone",
    icon: "🎉",
    points: 10,
  },
  {
    code: "trips_5",
    name: "Getting Started",
    nameNy: "Kuyamba",
    description: "Complete 5 trips",
    descriptionNy: "Maliza maulendo 5",
    category: "milestone",
    icon: "⭐",
    points: 25,
  },
  {
    code: "trips_10",
    name: "Experienced",
    nameNy: "Wokhoza",
    description: "Complete 10 trips",
    descriptionNy: "Maliza maulendo 10",
    category: "milestone",
    icon: "🌟",
    points: 50,
  },
  {
    code: "trips_25",
    name: "Veteran",
    nameNy: "Wamkulu",
    description: "Complete 25 trips",
    descriptionNy: "Maliza maulendo 25",
    category: "milestone",
    icon: "🏆",
    points: 100,
  },
  {
    code: "trips_50",
    name: "Expert",
    nameNy: "Katswiri",
    description: "Complete 50 trips",
    descriptionNy: "Maliza maulendo 50",
    category: "milestone",
    icon: "💎",
    points: 200,
  },
  {
    code: "trips_100",
    name: "Master",
    nameNy: "Mphunzitsi",
    description: "Complete 100 trips",
    descriptionNy: "Maliza maulendo 100",
    category: "milestone",
    icon: "👑",
    points: 500,
  },
  // Earnings achievements
  {
    code: "earnings_10k",
    name: "First Earnings",
    nameNy: "Ndalama Zoyamba",
    description: "Earn MWK 10,000",
    descriptionNy: "Pezani MWK 10,000",
    category: "earnings",
    icon: "💰",
    points: 20,
  },
  {
    code: "earnings_50k",
    name: "Growing Income",
    nameNy: "Ndalama Zikukula",
    description: "Earn MWK 50,000",
    descriptionNy: "Pezani MWK 50,000",
    category: "earnings",
    icon: "💵",
    points: 50,
  },
  {
    code: "earnings_100k",
    name: "Successful",
    nameNy: "Wopambana",
    description: "Earn MWK 100,000",
    descriptionNy: "Pezani MWK 100,000",
    category: "earnings",
    icon: "💸",
    points: 100,
  },
  {
    code: "earnings_500k",
    name: "Wealthy",
    nameNy: "Wachuma",
    description: "Earn MWK 500,000",
    descriptionNy: "Pezani MWK 500,000",
    category: "earnings",
    icon: "💴",
    points: 250,
  },
  {
    code: "earnings_1m",
    name: "Millionaire",
    nameNy: "Wamillion",
    description: "Earn MWK 1,000,000",
    descriptionNy: "Pezani MWK 1,000,000",
    category: "earnings",
    icon: "💶",
    points: 500,
  },
  // Streak achievements
  {
    code: "streak_7",
    name: "Week Warrior",
    nameNy: "Wamasiku 7",
    description: "Active for 7 days",
    descriptionNy: "Khalani ndi masiku 7",
    category: "streak",
    icon: "🔥",
    points: 30,
  },
  {
    code: "streak_30",
    name: "Month Master",
    nameNy: "Wamwezi",
    description: "Active for 30 days",
    descriptionNy: "Khalani ndi masiku 30",
    category: "streak",
    icon: "🔥🔥",
    points: 100,
  },
  // Rating achievements
  {
    code: "first_5star",
    name: "Five Star",
    nameNy: "Nyenyezi 5",
    description: "Receive your first 5-star rating",
    descriptionNy: "Pezani mavoti 5",
    category: "community",
    icon: "⭐",
    points: 50,
  },
]

async function seed() {
  console.log("Seeding achievements...")

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    })
  }

  console.log(`✅ Seeded ${achievements.length} achievements`)
}

seed()
  .catch((error) => {
    console.error("Error seeding achievements:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
