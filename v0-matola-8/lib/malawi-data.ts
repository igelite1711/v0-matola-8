// Comprehensive Malawi logistics data aligned with real-world context

// ========================================
// MALAWI TRADE CORRIDORS
// As a landlocked country, Malawi depends on three main corridors
// ========================================
export const tradeCorridors = {
  nacala: {
    name: "Nacala Corridor",
    description: "Primary route through Mozambique to Nacala Port",
    distance: "880km from Blantyre",
    borderCrossing: "Mwanza (Malawi) / Zobue (Mozambique)",
    avgTransitDays: 3,
    keyProducts: ["tobacco", "tea", "sugar", "imports"],
  },
  beira: {
    name: "Beira Corridor",
    description: "Route through Mozambique to Beira Port",
    distance: "820km from Blantyre",
    borderCrossing: "Mwanza (Malawi) / Zobue (Mozambique)",
    avgTransitDays: 2,
    keyProducts: ["fuel", "fertilizer", "machinery", "general cargo"],
  },
  dar: {
    name: "Dar es Salaam Corridor",
    description: "Northern route through Tanzania",
    distance: "1,100km from Lilongwe",
    borderCrossing: "Songwe (Malawi) / Kasumulu (Tanzania)",
    avgTransitDays: 4,
    keyProducts: ["imports", "transit cargo", "northern region supplies"],
  },
} as const

// ========================================
// MALAWI CITIES & TRADING HUBS
// Real locations with landmarks used for directions
// ========================================
export const malawiLocations = [
  // Major Cities
  { name: "Lilongwe", district: "Lilongwe City", region: "Central", type: "city", population: 1122000 },
  { name: "Blantyre", district: "Blantyre City", region: "Southern", type: "city", population: 808000 },
  { name: "Mzuzu", district: "Mzimba", region: "Northern", type: "city", population: 221000 },
  { name: "Zomba", district: "Zomba City", region: "Southern", type: "city", population: 105000 },

  // Key Trading Towns
  { name: "Kasungu", district: "Kasungu", region: "Central", type: "trading", population: 56000 },
  { name: "Mangochi", district: "Mangochi", region: "Southern", type: "trading", population: 54000 },
  { name: "Salima", district: "Salima", region: "Central", type: "trading", population: 42000 },
  { name: "Karonga", district: "Karonga", region: "Northern", type: "trading", population: 48000 },
  { name: "Nkhotakota", district: "Nkhotakota", region: "Central", type: "trading", population: 33000 },
  { name: "Machinga", district: "Machinga", region: "Southern", type: "trading", population: 31000 },
  { name: "Dedza", district: "Dedza", region: "Central", type: "trading", population: 28000 },
  { name: "Ntcheu", district: "Ntcheu", region: "Central", type: "trading", population: 35000 },

  // Border Towns (Critical for landlocked logistics)
  { name: "Mchinji", district: "Mchinji", region: "Central", type: "border", population: 32000, borderWith: "Zambia" },
  {
    name: "Mwanza",
    district: "Mwanza",
    region: "Southern",
    type: "border",
    population: 18000,
    borderWith: "Mozambique",
  },
  {
    name: "Mulanje",
    district: "Mulanje",
    region: "Southern",
    type: "border",
    population: 47000,
    borderWith: "Mozambique",
  },
  {
    name: "Songwe",
    district: "Karonga",
    region: "Northern",
    type: "border",
    population: 12000,
    borderWith: "Tanzania",
  },
  {
    name: "Chiponde",
    district: "Mulanje",
    region: "Southern",
    type: "border",
    population: 8000,
    borderWith: "Mozambique",
  },

  // Agricultural Hubs (ADMARC depots)
  {
    name: "Kanengo",
    district: "Lilongwe City",
    region: "Central",
    type: "industrial",
    population: null,
    note: "Industrial area & ADMARC HQ",
  },
  {
    name: "Limbe",
    district: "Blantyre City",
    region: "Southern",
    type: "industrial",
    population: null,
    note: "Industrial & commercial hub",
  },
  {
    name: "Liwonde",
    district: "Machinga",
    region: "Southern",
    type: "trading",
    population: 37000,
    note: "Rail junction",
  },
  { name: "Balaka", district: "Balaka", region: "Southern", type: "trading", population: 29000 },
  {
    name: "Dwangwa",
    district: "Nkhotakota",
    region: "Central",
    type: "industrial",
    population: 24000,
    note: "Sugar estate",
  },
] as const

// ========================================
// LANDMARK-BASED LOCATIONS
// In Malawi, people navigate by landmarks, not addresses
// ========================================
export const commonLandmarks: Record<string, string[]> = {
  Lilongwe: [
    "Kanengo Industrial Area",
    "Lizulu Market (Area 2)",
    "Bwandilo Market",
    "Old Town",
    "City Mall Area",
    "Area 25 Market",
    "Area 47",
    "Kawale",
    "Lilongwe ADMARC",
    "Mchinji Road Filling Station",
  ],
  Blantyre: [
    "Limbe Market",
    "Wenela Bus Depot",
    "Chichiri Shopping Mall",
    "Ginnery Corner",
    "Ndirande Market",
    "Zingwangwa",
    "Maselema",
    "Chileka Road",
    "Blantyre ADMARC",
    "Auction Floors (Tobacco)",
  ],
  Mzuzu: ["Mzuzu Bus Depot", "Katoto Market", "Luwinga", "Mzuzu ADMARC", "Viphya Filling Station"],
  Zomba: ["Zomba Market", "Chancellor College", "Zomba Plateau Road", "Zomba ADMARC"],
}

// ========================================
// SEASONAL CARGO PATTERNS
// Malawi's economy is agriculture-driven with clear seasons
// ========================================
export const seasonalCargo = {
  maize: {
    name: "Chimanga (Maize)",
    peakMonths: ["April", "May", "June"],
    description: "Main harvest season - high demand for transport from farms to ADMARC depots",
    routes: ["Rural areas → District markets → Lilongwe/Blantyre"],
    priceMultiplier: 1.3, // Higher demand = higher rates
  },
  tobacco: {
    name: "Fodya (Tobacco)",
    peakMonths: ["January", "February", "March", "April"],
    description: "Auction season - tobacco from farms to auction floors",
    routes: ["Kasungu/Mchinji → Lilongwe Auction Floors", "Ntcheu/Dedza → Blantyre Auction Floors"],
    priceMultiplier: 1.4,
  },
  tea: {
    name: "Tiyi (Tea)",
    peakMonths: ["September", "October", "November"],
    description: "Peak tea production in Mulanje/Thyolo estates",
    routes: ["Mulanje/Thyolo → Blantyre → Beira Port"],
    priceMultiplier: 1.2,
  },
  sugar: {
    name: "Shuga (Sugar)",
    peakMonths: ["July", "August", "September", "October"],
    description: "Crushing season at Illovo estates",
    routes: ["Dwangwa/Nchalo → Lilongwe/Blantyre → Export"],
    priceMultiplier: 1.25,
  },
  fertilizer: {
    name: "Feteleza (Fertilizer)",
    peakMonths: ["September", "October", "November"],
    description: "Pre-planting season - high import demand via ports",
    routes: ["Beira/Nacala Ports → Border → Lilongwe/Blantyre → Districts"],
    priceMultiplier: 1.35,
  },
  general: {
    name: "Katundu Wamba (General Goods)",
    peakMonths: ["All year"],
    description: "Consumer goods, construction materials, etc.",
    routes: ["Various"],
    priceMultiplier: 1.0,
  },
} as const

// ========================================
// TRANSPORT ASSOCIATIONS
// Real organizations in Malawi
// ========================================
export const transportAssociations = {
  rtoa: {
    name: "Road Transport Operators Association (RTOA)",
    description: "Main transport union for trucking companies",
    contact: "+265 1 871 XXX",
    benefits: ["Rate negotiations", "License assistance", "Dispute resolution", "Training"],
  },
  masta: {
    name: "Malawi Bus and Taxi Association",
    description: "For passenger and light goods transport",
    contact: "+265 1 XXX XXX",
  },
  // Individual transport cooperatives
  cooperatives: [
    { name: "Lilongwe Transport Cooperative", region: "Central" },
    { name: "Blantyre Haulage Association", region: "Southern" },
    { name: "Northern Region Transporters", region: "Northern" },
  ],
} as const

// ========================================
// VEHICLE TYPES - MALAWI SPECIFIC
// ========================================
export const vehicleTypes = {
  pickup: {
    name: "Pickup/Bakkie",
    capacity: "500-1500 kg",
    common: "Toyota Hilux, Isuzu KB",
    useCase: "Urban deliveries, small cargo",
  },
  minibus: {
    name: "Minibus (Matola)",
    capacity: "500-1000 kg",
    common: "Toyota HiAce",
    useCase: "Mixed passenger/cargo",
  },
  canter: {
    name: "Canter/Small Truck",
    capacity: "3-5 tons",
    common: "Mitsubishi Canter, Isuzu NQR",
    useCase: "Medium cargo, inter-city",
  },
  medium: {
    name: "Medium Truck",
    capacity: "5-10 tons",
    common: "FUSO Fighter, Hino",
    useCase: "Agricultural produce, building materials",
  },
  heavy: {
    name: "Heavy Truck",
    capacity: "20-30 tons",
    common: "Scania, Mercedes Actros",
    useCase: "Long-haul, port cargo",
  },
  tanker: { name: "Tanker", capacity: "30,000-45,000 liters", common: "Various", useCase: "Fuel transport" },
  flatbed: { name: "Flatbed", capacity: "15-25 tons", common: "Various", useCase: "Construction materials, machinery" },
  refrigerated: {
    name: "Reefer/Cold Chain",
    capacity: "5-15 tons",
    common: "Various",
    useCase: "Perishables, fish, meat",
  },
} as const

// ========================================
// PRICING STRUCTURE - MALAWI KWACHA
// Based on real market rates (2024 estimates)
// ========================================
export const pricingGuide = {
  // Base rate per ton per kilometer (MWK)
  baseTonKm: 45, // ~MK 45 per ton per km for standard cargo

  // Route-specific rates (one-way prices in MWK)
  standardRoutes: {
    "Lilongwe-Blantyre": { distance: 311, basePrice: 75000, perTon: 35000 },
    "Lilongwe-Mzuzu": { distance: 365, basePrice: 85000, perTon: 40000 },
    "Blantyre-Zomba": { distance: 65, basePrice: 25000, perTon: 12000 },
    "Blantyre-Mwanza": { distance: 85, basePrice: 35000, perTon: 18000 }, // Border route
    "Lilongwe-Mchinji": { distance: 109, basePrice: 40000, perTon: 20000 }, // Border route
    "Mzuzu-Karonga": { distance: 230, basePrice: 65000, perTon: 32000 },
  },

  // Multipliers
  multipliers: {
    backhaul: 0.6, // 40% discount for return loads
    urgent: 1.5, // 50% premium for same-day
    perishable: 1.3, // 30% premium for cold chain
    hazardous: 1.4, // 40% premium for hazmat
    oversized: 1.35, // 35% premium for oversized
  },

  // Fuel surcharge (updated based on fuel prices)
  fuelSurchargePercent: 15, // Added on top when fuel prices spike
} as const

// ========================================
// MOBILE MONEY DETAILS
// ========================================
export const mobileMoneyProviders = {
  airtel: {
    name: "Airtel Money",
    code: "*778#",
    transactionLimit: 1000000, // MK 1M per transaction
    dailyLimit: 3000000, // MK 3M per day
    charges: {
      deposit: "Free",
      withdrawal: "2% (min MK 150)",
      transfer: "1.5% (min MK 100)",
    },
    payBillCode: "MATOLA01",
  },
  tnm: {
    name: "TNM Mpamba",
    code: "*712#",
    transactionLimit: 1000000,
    dailyLimit: 3000000,
    charges: {
      deposit: "Free",
      withdrawal: "2% (min MK 150)",
      transfer: "1.5% (min MK 100)",
    },
    payBillCode: "MATOLA02",
  },
} as const

// ========================================
// COMMUNITY VERIFICATION LEVELS
// Trust-building mechanism for Malawi context
// ========================================
export const verificationLevels = {
  none: { level: 0, name: "Unverified", trustScore: 0, description: "New user, not yet verified" },
  phone: { level: 1, name: "Phone Verified", trustScore: 25, description: "Phone number confirmed via OTP" },
  id: { level: 2, name: "ID Verified", trustScore: 50, description: "National ID or Driver's License verified" },
  community: {
    level: 3,
    name: "Community Verified",
    trustScore: 75,
    description: "Vouched for by 3+ verified users or local chief/headman reference",
  },
  full: {
    level: 4,
    name: "Fully Verified",
    trustScore: 100,
    description: "Complete verification including RTOA membership (for transporters) or business registration",
  },
} as const

// ========================================
// CHICHEWA TRANSLATIONS
// Key phrases for the app
// ========================================
export const chichewaTranslations = {
  // Common phrases
  welcome: "Takulandirani",
  thankYou: "Zikomo kwambiri",
  hello: "Muli bwanji",
  goodbye: "Tiwonaneso",
  yes: "Inde",
  no: "Ayi",
  help: "Thandizo",

  // App-specific
  shipGoods: "Tumizani Katundu",
  findLoads: "Pezani Katundu",
  trackShipment: "Tsatani Katundu",
  myBalance: "Ndalama Zanga",
  withdraw: "Tulutsani",

  // Cargo types
  maize: "Chimanga",
  tobacco: "Fodya",
  tea: "Tiyi",
  sugar: "Shuga",
  fertilizer: "Feteleza",
  cement: "Simenti",
  fuel: "Mafuta",
  generalGoods: "Katundu Wamba",

  // Locations
  from: "Kuchokera",
  to: "Kupita",
  pickup: "Kutenga",
  delivery: "Kupereka",

  // Status
  pending: "Ikudikira",
  inTransit: "Pa Njira",
  delivered: "Yafika",
  cancelled: "Yalepheretsedwa",

  // Payments
  cash: "Ndalama Zenizeni",
  mobileMoney: "Ndalama za M'foni",
  price: "Mtengo",
  paid: "Yalipidwa",

  // Vehicle types
  pickup: "Galimoto Yaing'ono",
  truck: "Lole",
  bigTruck: "Lole Lalikulu",
} as const

// ========================================
// ROUTE DISTANCES (KM) - MAJOR ROUTES
// ========================================
export const routeDistances: Record<string, Record<string, number>> = {
  Lilongwe: {
    Blantyre: 311,
    Mzuzu: 365,
    Zomba: 286,
    Kasungu: 127,
    Mchinji: 109,
    Salima: 104,
    Dedza: 85,
    Mangochi: 200,
  },
  Blantyre: {
    Lilongwe: 311,
    Mzuzu: 576,
    Zomba: 65,
    Mulanje: 75,
    Limbe: 8,
    Mwanza: 85,
    Mangochi: 190,
    Machinga: 120,
  },
  Mzuzu: {
    Lilongwe: 365,
    Blantyre: 576,
    Karonga: 230,
    "Nkhata Bay": 54,
    Rumphi: 70,
  },
}

// ========================================
// COMMON CARGO FOR EACH ROUTE
// ========================================
export const routeCargoPatterns = {
  "Lilongwe-Blantyre": {
    outbound: ["maize", "tobacco", "general_goods", "passengers"],
    inbound: ["imports", "retail_goods", "fuel", "beverages"],
    backHaulOpportunity: "High - balanced trade",
  },
  "Lilongwe-Mzuzu": {
    outbound: ["fuel", "beverages", "retail_goods", "building_materials"],
    inbound: ["rice", "fish", "cassava", "beans"],
    backHaulOpportunity: "Medium - more northbound loads",
  },
  "Blantyre-Mwanza (Border)": {
    outbound: ["tobacco_export", "tea", "sugar"],
    inbound: ["fuel", "imports", "transit_cargo"],
    backHaulOpportunity: "High - import/export balance",
  },
  "Blantyre-Mulanje": {
    outbound: ["building_materials", "retail_goods"],
    inbound: ["tea", "macadamia", "farm_produce"],
    backHaulOpportunity: "Seasonal - peak during tea harvest",
  },
}

// ========================================
// FUEL PRICES (Updated periodically)
// Malawi has some of highest fuel prices in SADC
// ========================================
export const fuelPrices = {
  petrol: 2200, // MWK per liter
  diesel: 2150, // MWK per liter
  lastUpdated: "2024-01-15",
  note: "Fuel accounts for ~40% of transport costs in Malawi",
}

// Helper function to calculate estimated price
export function calculateEstimatedPrice(
  origin: string,
  destination: string,
  weightKg: number,
  cargoType: keyof typeof seasonalCargo = "general",
  isBackhaul = false,
): number {
  const baseRates = pricingGuide.standardRoutes
  const routeKey = `${origin}-${destination}` as keyof typeof baseRates
  const reverseRouteKey = `${destination}-${origin}` as keyof typeof baseRates

  let basePrice = 50000 // Default if route not found
  let perTonRate = 25000

  if (baseRates[routeKey]) {
    basePrice = baseRates[routeKey].basePrice
    perTonRate = baseRates[routeKey].perTon
  } else if (baseRates[reverseRouteKey]) {
    basePrice = baseRates[reverseRouteKey].basePrice
    perTonRate = baseRates[reverseRouteKey].perTon
  }

  const tons = weightKg / 1000
  let totalPrice = basePrice + tons * perTonRate

  // Apply seasonal multiplier
  const season = seasonalCargo[cargoType]
  if (season) {
    totalPrice *= season.priceMultiplier
  }

  // Apply backhaul discount
  if (isBackhaul) {
    totalPrice *= pricingGuide.multipliers.backhaul
  }

  return Math.round(totalPrice)
}
