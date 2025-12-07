// Seasonal Intelligence for Malawi
// Tracks agricultural seasons, weather, and demand patterns

export type Season = "dry_cool" | "dry_hot" | "rainy"
export type CropSeason = "maize_harvest" | "tobacco_harvest" | "tea_season" | "off_season"

export interface SeasonalData {
  currentSeason: Season
  currentCropSeason: CropSeason
  demandLevel: "low" | "medium" | "high" | "peak"
  priceMultiplier: number // 1.0 = normal, 1.3 = 30% higher
  weatherAlert?: WeatherAlert
  roadConditions: Record<string, RoadCondition>
}

export interface WeatherAlert {
  type: "rain" | "flood" | "heat"
  severity: "low" | "medium" | "high"
  message: string
  messageNy: string // Chichewa
  affectedRoutes: string[]
}

export interface RoadCondition {
  route: string
  condition: "good" | "fair" | "poor" | "impassable"
  reason?: string
  updatedAt: Date
}

// Malawi's seasons
// May-August: Cool dry season
// September-November: Hot dry season
// December-April: Rainy season

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1-12

  if (month >= 5 && month <= 8) return "dry_cool"
  if (month >= 9 && month <= 11) return "dry_hot"
  return "rainy"
}

// Crop calendar for Malawi
// Maize: Plant Nov-Dec, Harvest April-June
// Tobacco: Plant Sep-Nov, Harvest Jan-March
// Tea: Year-round but peak March-October

export function getCurrentCropSeason(): CropSeason {
  const month = new Date().getMonth() + 1

  if (month >= 4 && month <= 6) return "maize_harvest"
  if (month >= 1 && month <= 3) return "tobacco_harvest"
  if (month >= 3 && month <= 10) return "tea_season"
  return "off_season"
}

// Major routes in Malawi
export const MAJOR_ROUTES = [
  { id: "ll-bt", name: "Lilongwe - Blantyre", distance: 320, highway: "M1" },
  { id: "ll-mz", name: "Lilongwe - Mzuzu", distance: 350, highway: "M1" },
  { id: "bt-zm", name: "Blantyre - Zomba", distance: 65, highway: "M3" },
  { id: "ll-sa", name: "Lilongwe - Salima", distance: 100, highway: "M5" },
  { id: "bt-mg", name: "Blantyre - Mangochi", distance: 160, highway: "M3" },
  { id: "mz-nb", name: "Mzuzu - Nkhata Bay", distance: 50, highway: "M5" },
  { id: "ll-ks", name: "Lilongwe - Kasungu", distance: 130, highway: "M1" },
  { id: "mz-kr", name: "Mzuzu - Karonga", distance: 230, highway: "M1" },
]

// Demand patterns by region and season
const DEMAND_PATTERNS: Record<CropSeason, Record<string, number>> = {
  maize_harvest: {
    Lilongwe: 1.5,
    Kasungu: 1.8, // Major maize region
    Mzuzu: 1.4,
    Salima: 1.3,
    Blantyre: 1.2,
    default: 1.3,
  },
  tobacco_harvest: {
    Kasungu: 2.0, // Tobacco heartland
    Lilongwe: 1.6,
    Mzuzu: 1.5,
    Blantyre: 1.4,
    default: 1.4,
  },
  tea_season: {
    Blantyre: 1.4, // Near tea estates
    Zomba: 1.5,
    Mulanje: 1.8,
    default: 1.1,
  },
  off_season: {
    default: 1.0,
  },
}

export function getDemandMultiplier(city: string): number {
  const cropSeason = getCurrentCropSeason()
  const patterns = DEMAND_PATTERNS[cropSeason]
  return patterns[city] || patterns["default"]
}

export function getSeasonalData(): SeasonalData {
  const season = getCurrentSeason()
  const cropSeason = getCurrentCropSeason()

  // Calculate overall demand level
  let demandLevel: SeasonalData["demandLevel"] = "medium"
  if (cropSeason === "maize_harvest" || cropSeason === "tobacco_harvest") {
    demandLevel = "peak"
  } else if (cropSeason === "tea_season") {
    demandLevel = "high"
  } else if (season === "rainy") {
    demandLevel = "low"
  }

  // Get road conditions based on season
  const roadConditions: Record<string, RoadCondition> = {}
  for (const route of MAJOR_ROUTES) {
    let condition: RoadCondition["condition"] = "good"
    let reason: string | undefined

    if (season === "rainy") {
      // Rainy season affects road conditions
      if (route.highway === "M5" || route.id === "mz-kr") {
        condition = "fair"
        reason = "Seasonal rains affecting road surface"
      }
    }

    roadConditions[route.id] = {
      route: route.name,
      condition,
      reason,
      updatedAt: new Date(),
    }
  }

  // Weather alert during rainy season
  let weatherAlert: WeatherAlert | undefined
  if (season === "rainy") {
    const month = new Date().getMonth() + 1
    if (month >= 1 && month <= 3) {
      weatherAlert = {
        type: "rain",
        severity: "medium",
        message: "Heavy rains expected. Plan for delays on unpaved roads.",
        messageNy: "Mvula yambiri ikuyembekedzedwa. Konzekerani kuchedwa pa misewu ya fumbi.",
        affectedRoutes: ["Mzuzu - Nkhata Bay", "Mzuzu - Karonga"],
      }
    }
  }

  return {
    currentSeason: season,
    currentCropSeason: cropSeason,
    demandLevel,
    priceMultiplier: demandLevel === "peak" ? 1.3 : demandLevel === "high" ? 1.15 : 1.0,
    weatherAlert,
    roadConditions,
  }
}

// Seasonal tips for users
export const SEASONAL_TIPS = {
  maize_harvest: {
    en: "Peak maize season! High demand for transport from Kasungu, Lilongwe, and Central Region farms.",
    ny: "Nthawi yokolola chimanga! Kufuna kwakukulu kwa mayendedwe kuchokera ku Kasungu, Lilongwe, ndi minda ya Central Region.",
  },
  tobacco_harvest: {
    en: "Tobacco auction season. Expect high activity on routes to Lilongwe auction floors.",
    ny: "Nthawi yogulitsa fodya. Dziwani kuti padzakhala ntchito yambiri pa njira zopita ku msika wa fodya ku Lilongwe.",
  },
  tea_season: {
    en: "Tea harvesting in Thyolo and Mulanje. Good opportunities for southern region routes.",
    ny: "Kukolola tiyi ku Thyolo ndi Mulanje. Mwayi wabwino pa njira za kummwera.",
  },
  rainy: {
    en: "Rainy season. Check road conditions before travel. Some routes may be affected.",
    ny: "Nthawi ya mvula. Onani momwe misewu ilili musanayende. Njira zina zitha kukhudza.",
  },
}
