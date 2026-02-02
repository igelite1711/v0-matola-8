// Comprehensive translations for English and Chichewa

export type Language = "en" | "ny"

export const translations = {
  // ========================================
  // COMMON / GENERAL
  // ========================================
  common: {
    welcome: { en: "Welcome", ny: "Takulandirani" },
    hello: { en: "Hello", ny: "Muli bwanji" },
    goodbye: { en: "Goodbye", ny: "Tiwonaneso" },
    thankYou: { en: "Thank you", ny: "Zikomo kwambiri" },
    yes: { en: "Yes", ny: "Inde" },
    no: { en: "No", ny: "Ayi" },
    help: { en: "Help", ny: "Thandizo" },
    search: { en: "Search", ny: "Sakani" },
    filter: { en: "Filter", ny: "Sankhani" },
    viewAll: { en: "View All", ny: "Onani Zonse" },
    submit: { en: "Submit", ny: "Tumizani" },
    cancel: { en: "Cancel", ny: "Lekani" },
    confirm: { en: "Confirm", ny: "Vomerezani" },
    back: { en: "Back", ny: "Bwerani" },
    next: { en: "Next", ny: "Mberi" },
    loading: { en: "Loading...", ny: "Ikukonzeka..." },
    error: { en: "Error", ny: "Cholakwika" },
    success: { en: "Success", ny: "Zabwino" },
    call: { en: "Call", ny: "Imbani" },
    message: { en: "Message", ny: "Mawu" },
    settings: { en: "Settings", ny: "Zokonza" },
    profile: { en: "Profile", ny: "Mbiri Yanu" },
    logout: { en: "Logout", ny: "Tulukanipo" },
    signOut: { en: "Sign Out", ny: "Tulukani" },
    language: { en: "Language", ny: "Chilankhulo" },
    notifications: { en: "Notifications", ny: "Zidziwitso" },
    markAllRead: { en: "Mark all read", ny: "Onetsani zonse" },
    noNotifications: { en: "No notifications", ny: "Palibe zidziwitso" },
    english: { en: "English", ny: "Chingelezi" },
    chichewa: { en: "Chichewa", ny: "Chichewa" },
  },

  // ========================================
  // NAVIGATION
  // ========================================
  nav: {
    home: { en: "Home", ny: "Kunyumba" },
    dashboard: { en: "Dashboard", ny: "Patsogolo" },
    overview: { en: "Overview", ny: "Patsogolo" },
    shipments: { en: "Shipments", ny: "Katundu" },
    newShipment: { en: "New Shipment", ny: "Katundu Watsopano" },
    myShipments: { en: "My Shipments", ny: "Katundu Wanga" },
    tracking: { en: "Tracking", ny: "Kutsatira" },
    payments: { en: "Payments", ny: "Malipiro" },
    messages: { en: "Messages", ny: "Mauthenga" },
    disputes: { en: "Disputes", ny: "Mikangano" },
    verification: { en: "Verification", ny: "Kutsimikizira" },
    channels: { en: "Access Channels", ny: "Njira Zolumikizira" },
    findLoads: { en: "Find Loads", ny: "Pezani Katundu" },
    myJobs: { en: "My Jobs", ny: "Ntchito Zanga" },
    earnings: { en: "Earnings", ny: "Ndalama Zopezeka" },
    ratings: { en: "Ratings", ny: "Mavoti" },
    network: { en: "My Network", ny: "Gulu Langa" },
    matches: { en: "Matches", ny: "Zofananira" },
    commissions: { en: "Commissions", ny: "Ndalama za Commission" },
    analytics: { en: "Analytics", ny: "Kafukufuku" },
    users: { en: "Users", ny: "Ogwiritsa Ntchito" },
  },

  // ========================================
  // SHIPPER DASHBOARD
  // ========================================
  shipper: {
    title: { en: "Shipper Dashboard", ny: "Patsogolo pa Wotumiza" },
    greeting: { en: "Hello", ny: "Muli bwanji" },
    overview: { en: "Here's your shipment overview", ny: "Nawa momwe zikuyendera katundu wanu" },
    newShipment: { en: "New Shipment", ny: "Tumizani Katundu" },
    postLoad: { en: "Post a Load", ny: "Ikani Katundu" },
    trackShipment: { en: "Track Shipment", ny: "Tsatani Katundu" },
    shipmentHistory: { en: "Shipment History", ny: "Mbiri ya Katundu" },
    recentShipments: { en: "Recent Shipments", ny: "Katundu Wapanopa" },
    recentActivity: { en: "Recent activity", ny: "Zomwe mukuchita posachedwapa" },
    yourRecentActivity: { en: "Your recent activity", ny: "Zomwe mukuchita posachedwapa" },
    createFirstShipment: { en: "Create Your First Shipment", ny: "Pangani Katundu Woyamba" },
    noShipments: { en: "No shipments yet", ny: "Palibe katundu pano" },
    driver: { en: "Driver", ny: "Woyendetsa" },
    searching: { en: "Searching...", ny: "Akusaka..." },
    viewPastShipments: { en: "View past shipments", ny: "Onani zakale" },
    findTransporters: { en: "Find transporters", ny: "Pezani oyendetsa" },
    realTimeLocation: { en: "Real-time location", ny: "Malo enieni" },

    // Stats
    active: { en: "Active", ny: "Zikuyenda" },
    inTransit: { en: "In Transit", ny: "Pa Njira" },
    pending: { en: "Pending", ny: "Zikudikira" },
    delivered: { en: "Delivered", ny: "Zafika" },
    onRoute: { en: "On route", ny: "Pa Njira" },

    // Seasonal alerts
    currentSeason: { en: "Current Season", ny: "Nyengo ya Panopa" },
    tobaccoSeason: { en: "Tobacco Season", ny: "Nyengo ya Fodya" },
    maizeSeason: { en: "Maize Harvest", ny: "Nyengo ya Chimanga" },
    teaSeason: { en: "Tea Season", ny: "Nyengo ya Tiyi" },
    fertilizerSeason: { en: "Fertilizer Season", ny: "Nyengo ya Feteleza" },
    regularSeason: { en: "Regular Season", ny: "Nyengo Yamba" },
    vehicleDemand: { en: "Vehicle demand", ny: "Kufuna kwa magalimoto" },
    high: { en: "High", ny: "Yokwera" },
    veryHigh: { en: "Very High", ny: "Yokwera Kwambiri" },
    medium: { en: "Medium", ny: "Pakati" },
    low: { en: "Low", ny: "Yotsika" },
    normal: { en: "Normal", ny: "Yabwinobwino" },

    // Market info
    marketPrices: { en: "Market Prices", ny: "Mitengo m'Msika" },
    admarcPrices: { en: "ADMARC Market Prices", ny: "Mitengo ya ADMARC" },
    updatedToday: { en: "Updated today", ny: "Yasinthidwa lero" },
    admarcDepots: { en: "ADMARC Depots", ny: "Ma Depot a ADMARC" },
    tradingCenters: { en: "Trading Centers", ny: "Malo Ochitira Malonda" },

    // Cargo types
    selectCargo: { en: "Select Cargo Type", ny: "Sankhani Mtundu wa Katundu" },
    maize: { en: "Maize", ny: "Chimanga" },
    tobacco: { en: "Tobacco", ny: "Fodya" },
    tea: { en: "Tea", ny: "Tiyi" },
    sugar: { en: "Sugar", ny: "Shuga" },
    fertilizer: { en: "Fertilizer", ny: "Feteleza" },
    cement: { en: "Cement", ny: "Simenti" },
    fuel: { en: "Fuel", ny: "Mafuta" },
    generalGoods: { en: "General Goods", ny: "Katundu Wamba" },
    buildingMaterials: { en: "Building Materials", ny: "Zipangizo Zomangira" },
    electronics: { en: "Electronics", ny: "Zida za Magetsi" },
    perishables: { en: "Perishables", ny: "Zowola Msanga" },
    groundnuts: { en: "Groundnuts", ny: "Mtedza" },

    // Shipment form
    pickupLocation: { en: "Pickup Location", ny: "Malo Otenga" },
    deliveryLocation: { en: "Delivery Location", ny: "Malo Operekera" },
    selectDistrict: { en: "Select District", ny: "Sankhani Boma" },
    selectLandmark: { en: "Select Landmark", ny: "Sankhani Chizindikiro" },
    cargoWeight: { en: "Cargo Weight (kg)", ny: "Kulemera kwa Katundu (kg)" },
    cargoDescription: { en: "Cargo Description", ny: "Kufotokoza Katundu" },
    urgentDelivery: { en: "Urgent Delivery", ny: "Mwachangu" },
    schedulePickup: { en: "Schedule Pickup", ny: "Konzani Nthawi Yotenga" },
    estimatedPrice: { en: "Estimated Price", ny: "Mtengo Woyembekezeka" },

    // Tips
    backhaulTip: { en: "Backhaul loads are 40% cheaper!", ny: "Katundu wobwerera ndi wotchipa 40%!" },
    seasonalTip: { en: "Book early during peak seasons", ny: "Konzekerani msanga m'nyengo yothatha" },
    saveMoneyBackhaul: { en: "Save Money with Backhaul", ny: "Sungani Ndalama ndi Backhaul" },
    backhaulDesc: {
      en: "Backhaul shipments are 40% cheaper! These are trucks returning from their destination that have empty space.",
      ny: "Katundu wa backhaul ndi wotchipa 40%! Awa ndi magalimoto omwe akubwerera kuchokera kumalo ena ndipo ali ndi malo opanda kanthu."
    },
  },

  // ========================================
  // TRANSPORTER/DRIVER DASHBOARD
  // ========================================
  driver: {
    title: { en: "Driver Dashboard", ny: "Patsogolo pa Woyendetsa" },
    greeting: { en: "Hello", ny: "Muli bwanji" },
    overview: { en: "Find loads and earn more", ny: "Pezani katundu ndipo mupeze ndalama zambiri" },
    findLoads: { en: "Find Loads", ny: "Pezani Katundu" },
    goOnline: { en: "Go Online", ny: "Yambani Kulandira" },
    goOffline: { en: "Go Offline", ny: "Imitsani" },

    // Stats
    activeJobs: { en: "Active Jobs", ny: "Ntchito Zikuyenda" },
    availableLoads: { en: "Available Loads", ny: "Katundu Wopezeka" },
    thisMonth: { en: "This Month", ny: "Mwezi Uno" },
    rating: { en: "Rating", ny: "Mayiko" },
    totalTrips: { en: "Total Trips", ny: "Maulendo Onse" },
    completedJobs: { en: "Completed Jobs", ny: "Ntchito Zomaliza" },

    // Vehicle info
    myVehicle: { en: "My Vehicle", ny: "Galimoto Yanga" },
    vehicleType: { en: "Vehicle Type", ny: "Mtundu wa Galimoto" },
    capacity: { en: "Capacity", ny: "Kukula" },
    licensePlate: { en: "License Plate", ny: "Nambala ya Galimoto" },

    // Verification
    rtoaVerified: { en: "RTOA Verified", ny: "Wotsimikizirika ndi RTOA" },
    rtoaMembership: { en: "RTOA Membership", ny: "Membala wa RTOA" },
    communityVerified: { en: "Community Verified", ny: "Wotsimikizirika ndi Mudzi" },
    verificationPending: { en: "Verification Pending", ny: "Kutsimikiziridwa Kukudikira" },

    // Fuel info
    fuelPrices: { en: "Fuel Prices", ny: "Mitengo ya Mafuta" },
    diesel: { en: "Diesel", ny: "Dizelo" },
    petrol: { en: "Petrol", ny: "Petirolo" },
    perLiter: { en: "per liter", ny: "pa lita" },
    estimatedCostPerKm: { en: "Est. cost per km", ny: "Mtengo pafupifupi pa km" },

    // Jobs
    currentJobs: { en: "Current Jobs", ny: "Ntchito za Panopa" },
    jobDetails: { en: "Job Details", ny: "Zambiri za Ntchito" },
    acceptJob: { en: "Accept Job", ny: "Vomerezani Ntchito" },
    rejectJob: { en: "Reject Job", ny: "Kanani Ntchito" },
    startTrip: { en: "Start Trip", ny: "Yambani Ulendo" },
    completeTrip: { en: "Complete Trip", ny: "Maliza Ulendo" },
    updateStatus: { en: "Update Status", ny: "Sinthani Status" },

    // Backhaul
    backhaulLoads: { en: "Backhaul Loads", ny: "Katundu wa Kubwerera" },
    backhaulTip: {
      en: "Don't return empty - save MK 45,000+ per round trip!",
      ny: "Musabwerere chopanda kanthu - sungani MK 45,000+ pa ulendo!",
    },
    backhaulDiscount: { en: "Backhaul -40%", ny: "Wobwerera -40%" },
    emptyReturn: { en: "Empty Return", ny: "Kubwerera Chopanda" },
    reduceEmptyTrips: { en: "Reduce empty trips", ny: "Chepetsani maulendo opanda katundu" },

    // Routes
    preferredRoutes: { en: "Preferred Routes", ny: "Njira Zomwe Mumakonda" },
    currentLocation: { en: "Current Location", ny: "Malo Omwe Muli" },
    routeDistance: { en: "Distance", ny: "Mtunda" },
    estimatedTime: { en: "Est. Time", ny: "Nthawi Yoyembekezeka" },

    // Earnings
    earnings: { en: "Earnings", ny: "Ndalama Zopezeka" },
    todayEarnings: { en: "Today", ny: "Lero" },
    weekEarnings: { en: "This Week", ny: "Mulungu Uno" },
    monthEarnings: { en: "This Month", ny: "Mwezi Uno" },
    withdraw: { en: "Withdraw", ny: "Tulutsani" },

    // Tips for drivers
    tips: { en: "Tips", ny: "Malangizo" },
    fuelTip: { en: "Fuel accounts for ~40% of costs", ny: "Mafuta ndi 40% ya ndalama zonse" },
    maintenanceTip: { en: "Regular maintenance saves money", ny: "Kukonza galimoto nthawi zonse kumasunga ndalama" },
  },

  // ========================================
  // BROKER/AGENT DASHBOARD
  // ========================================
  agent: {
    title: { en: "Agent Dashboard", ny: "Patsogolo pa Ejenti" },
    greeting: { en: "Hello", ny: "Muli bwanji" },
    overview: {
      en: "Manage your network and facilitate shipments",
      ny: "Konzekerani network yanu ndipo muthandize kutumiza katundu",
    },

    // Stats
    networkSize: { en: "Network Size", ny: "Kukula kwa Network" },
    activeTransporters: { en: "Active Transporters", ny: "Oyendetsa Ogwira" },
    activeShippers: { en: "Active Shippers", ny: "Otumiza Ogwira" },
    commission: { en: "Commission", ny: "Ndalama za Commission" },
    totalEarnings: { en: "Total Earnings", ny: "Ndalama Zonse" },

    // Network
    myNetwork: { en: "My Network", ny: "Network Yanga" },
    addMember: { en: "Add Member", ny: "Onjezani Membala" },
    transporters: { en: "Transporters", ny: "Oyendetsa" },
    shippers: { en: "Shippers", ny: "Otumiza" },
    pendingMembers: { en: "Pending", ny: "Akudikira" },

    // Matching
    createMatch: { en: "Create Match", ny: "Pangani Match" },
    pendingMatches: { en: "Pending Matches", ny: "Matches Zikudikira" },
    awaitingConfirmation: { en: "Awaiting Confirmation", ny: "Ikudikira Kuvomerezedwa" },
    negotiating: { en: "Negotiating", ny: "Ikunegotiate" },
    confirmed: { en: "Confirmed", ny: "Yavomerezedwa" },

    // Commission
    commissionEarned: { en: "Commission Earned", ny: "Commission Yopezeka" },
    commissionRate: { en: "Your rate: 5% per match", ny: "Mumalandira 5% pa match iliyonse" },
    totalMatches: { en: "Total Matches", ny: "Matches Zonse" },

    // Member details
    memberSince: { en: "Member since", ny: "Membala kuyambira" },
    completedJobs: { en: "Completed jobs", ny: "Ntchito zomaliza" },
    region: { en: "Region", ny: "Chigawo" },
    earnedThroughYou: { en: "Earned through you", ny: "Apeza kudzera inu" },

    // Verification
    verifyMember: { en: "Verify Member", ny: "Tsimikizirani Membala" },
    referenceCheck: { en: "Reference Check", ny: "Funsani za Membala" },
    chiefReference: { en: "Chief/Headman Reference", ny: "Reference ya Mfumu/Mwini Mudzi" },

    // Regional info
    centralRegion: { en: "Central Region", ny: "Chigawo cha Pakati" },
    southernRegion: { en: "Southern Region", ny: "Chigawo cha Kumwera" },
    northernRegion: { en: "Northern Region", ny: "Chigawo cha Kumpoto" },
  },

  // ========================================
  // PAYMENTS
  // ========================================
  payments: {
    title: { en: "Payments", ny: "Malipiro" },
    balance: { en: "Balance", ny: "Ndalama Zanu" },
    withdraw: { en: "Withdraw", ny: "Tulutsani" },
    deposit: { en: "Deposit", ny: "Ikani" },
    transfer: { en: "Transfer", ny: "Tumizani" },

    // Methods
    paymentMethod: { en: "Payment Method", ny: "Njira Yolipirira" },
    cash: { en: "Cash", ny: "Ndalama Zenizeni" },
    mobileMoney: { en: "Mobile Money", ny: "Ndalama za M'foni" },
    airtelMoney: { en: "Airtel Money", ny: "Airtel Money" },
    tnmMpamba: { en: "TNM Mpamba", ny: "TNM Mpamba" },
    bankTransfer: { en: "Bank Transfer", ny: "Banki" },

    // Status
    paid: { en: "Paid", ny: "Yalipidwa" },
    unpaid: { en: "Unpaid", ny: "Siinalipidwe" },
    processing: { en: "Processing", ny: "Ikuchitika" },
    failed: { en: "Failed", ny: "Yalephereka" },

    // Escrow
    escrow: { en: "Escrow Protection", ny: "Chitetezo cha Ndalama" },
    escrowInfo: { en: "Your money is protected until delivery", ny: "Ndalama zanu zili bwino mpaka katundu afike" },
    releasePayment: { en: "Release Payment", ny: "Tulutsani Malipiro" },

    // Transaction
    transactionHistory: { en: "Transaction History", ny: "Mbiri ya Ndalama" },
    amount: { en: "Amount", ny: "Ndalama" },
    date: { en: "Date", ny: "Tsiku" },
    reference: { en: "Reference", ny: "Nambala" },
  },

  // ========================================
  // LOCATIONS
  // ========================================
  locations: {
    from: { en: "From", ny: "Kuchokera" },
    to: { en: "To", ny: "Kupita" },
    pickup: { en: "Pickup", ny: "Kutenga" },
    delivery: { en: "Delivery", ny: "Kupereka" },

    // Regions
    centralRegion: { en: "Central Region", ny: "Chigawo cha Pakati" },
    southernRegion: { en: "Southern Region", ny: "Chigawo cha Kumwera" },
    northernRegion: { en: "Northern Region", ny: "Chigawo cha Kumpoto" },

    // Common landmarks
    market: { en: "Market", ny: "Msika" },
    busDepot: { en: "Bus Depot", ny: "Siteshoni" },
    fillingStation: { en: "Filling Station", ny: "Malo Othirira Mafuta" },
    industrialArea: { en: "Industrial Area", ny: "Malo a Mafakitale" },
    auctionFloors: { en: "Auction Floors", ny: "Malo Ogulitsira Fodya" },
    admarcDepot: { en: "ADMARC Depot", ny: "Depot ya ADMARC" },
    borderPost: { en: "Border Post", ny: "Malire" },

    // Major cities
    lilongwe: { en: "Lilongwe", ny: "Lilongwe" },
    blantyre: { en: "Blantyre", ny: "Blantyre" },
    mzuzu: { en: "Mzuzu", ny: "Mzuzu" },
    zomba: { en: "Zomba", ny: "Zomba" },
  },

  // ========================================
  // STATUS
  // ========================================
  status: {
    pending: { en: "Pending", ny: "Ikudikira" },
    confirmed: { en: "Confirmed", ny: "Yavomerezedwa" },
    inTransit: { en: "In Transit", ny: "Pa Njira" },
    delivered: { en: "Delivered", ny: "Yafika" },
    completed: { en: "Completed", ny: "Yamaliza" },
    cancelled: { en: "Cancelled", ny: "Yalepheretsedwa" },
    active: { en: "Active", ny: "Yagwira" },
    inactive: { en: "Inactive", ny: "Sinagwire" },
    online: { en: "Online", ny: "Pansi pa Intaneti" },
    offline: { en: "Offline", ny: "Popanda Intaneti" },
    nearLocation: { en: "Near", ny: "Pafupi ndi" },
  },

  // ========================================
  // TIME
  // ========================================
  time: {
    now: { en: "Now", ny: "Panopa" },
    today: { en: "Today", ny: "Lero" },
    yesterday: { en: "Yesterday", ny: "Dzulo" },
    thisWeek: { en: "This Week", ny: "Mulungu Uno" },
    thisMonth: { en: "This Month", ny: "Mwezi Uno" },
    hours: { en: "hours", ny: "maola" },
    minutes: { en: "minutes", ny: "mphindi" },
    days: { en: "days", ny: "masiku" },
    ago: { en: "ago", ny: "apitawo" },
    eta: { en: "ETA", ny: "Kufika" },
  },

  // ========================================
  // TRADE CORRIDORS
  // ========================================
  corridors: {
    title: { en: "Trade Corridors", ny: "Njira za Malonda" },
    nacala: { en: "Nacala Corridor", ny: "Njira ya Nacala" },
    beira: { en: "Beira Corridor", ny: "Njira ya Beira" },
    dar: { en: "Dar es Salaam Corridor", ny: "Njira ya Dar es Salaam" },
    borderCrossing: { en: "Border Crossing", ny: "Kudutsa Malire" },
    transitDays: { en: "Transit Days", ny: "Masiku a Pa Njira" },
    exportRoute: { en: "Export Route", ny: "Njira Yotumizira Kunja" },
  },

  // ========================================
  // USSD/WHATSAPP
  // ========================================
  ussd: {
    welcome: { en: "Welcome to Matola", ny: "Takulandirani ku Matola" },
    selectOption: { en: "Select option", ny: "Sankhani" },
    enterPhone: { en: "Enter phone number", ny: "Lembani nambala ya foni" },
    enterWeight: { en: "Enter weight in kg", ny: "Lembani kulemera (kg)" },
    confirmDetails: { en: "Confirm details", ny: "Tsimikizirani" },
    invalidInput: { en: "Invalid input", ny: "Cholakwika" },
    tryAgain: { en: "Try again", ny: "Yesaninso" },
  },
} as const

// Helper type for accessing translations
export type TranslationKey = keyof typeof translations
export type TranslationSubKey<T extends TranslationKey> = keyof (typeof translations)[T]

// Helper function to get translation
export function t(section: TranslationKey, key: string, lang: Language = "en"): string {
  const sectionData = translations[section] as Record<string, Record<Language, string>>
  if (sectionData && sectionData[key]) {
    return sectionData[key][lang] || sectionData[key]["en"] || key
  }
  return key
}

// Format price in Malawi Kwacha
export function formatMWK(amount: number, lang: Language = "en"): string {
  return `MK ${amount.toLocaleString()}`
}

// Format distance
export function formatDistance(km: number, lang: Language = "en"): string {
  return `${km} km`
}

// Format time ago
export function formatTimeAgo(hours: number, lang: Language = "en"): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60)
    return `${mins} ${t("time", "minutes", lang)} ${t("time", "ago", lang)}`
  }
  return `${hours} ${t("time", "hours", lang)} ${t("time", "ago", lang)}`
}
