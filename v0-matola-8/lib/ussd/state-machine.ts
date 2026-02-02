// USSD State Machine with Redis-backed sessions
// Compliant with Africa's Talking USSD Gateway

import { formatMWK, type Language } from "@/lib/translations"

// USSD States aligned with PRD menu structure
export type UssdState =
  | "WELCOME"
  | "MAIN_MENU"
  // Post Shipment Flow
  | "POST_PICKUP"
  | "POST_DESTINATION"
  | "POST_CARGO_TYPE"
  | "POST_WEIGHT"
  | "POST_PRICE"
  | "POST_CONFIRM"
  // Find Load Flow
  | "FIND_LOADS_LIST"
  | "FIND_LOAD_DETAIL"
  | "FIND_LOAD_ACCEPT"
  // My Shipments
  | "MY_SHIPMENTS"
  | "SHIPMENT_DETAIL"
  // Account
  | "ACCOUNT"
  | "ACCOUNT_BALANCE"
  | "ACCOUNT_WITHDRAW"
  // Error states
  | "ERROR_RETRY"
  | "SESSION_TIMEOUT"

export interface UssdSession {
  sessionId: string
  phone: string
  state: UssdState
  language: Language
  context: UssdContext
  retryCount: number
  createdAt: number
  updatedAt: number
}

export interface UssdContext {
  // Post shipment data
  origin?: string
  destination?: string
  cargoType?: number
  weightKg?: number
  priceMwk?: number

  // Find loads pagination
  loadPage?: number
  selectedLoadId?: string

  // User data
  userId?: string
  role?: "shipper" | "transporter"

  // History for back navigation
  history?: UssdState[]
}

// PRD-compliant menu text (max 160 characters per screen)
const MENUS: Record<UssdState, Record<Language, (ctx: UssdContext) => string>> = {
  WELCOME: {
    en: () => "Welcome to Matola\n1. Post Shipment\n2. Find Load\n3. My Shipments\n4. Account\n0. Exit",
    ny: () => "Takulandirani ku Matola\n1. Ikani Katundu\n2. Pezani Katundu\n3. Katundu Wanga\n4. Akaunti\n0. Tulukani",
  },
  MAIN_MENU: {
    en: () => "Main Menu\n1. Post Shipment\n2. Find Load\n3. My Shipments\n4. Account\n0. Exit",
    ny: () => "Menu Yaikulu\n1. Ikani Katundu\n2. Pezani Katundu\n3. Katundu Wanga\n4. Akaunti\n0. Tulukani",
  },
  POST_PICKUP: {
    en: () => "Enter pickup location:",
    ny: () => "Lembani malo otenga katundu:",
  },
  POST_DESTINATION: {
    en: () => "Enter destination:",
    ny: () => "Lembani malo operekera:",
  },
  POST_CARGO_TYPE: {
    en: () => "Enter cargo type:\n1. Food\n2. Building Materials\n3. Other",
    ny: () => "Sankhani mtundu:\n1. Chakudya\n2. Zomangira\n3. Zina",
  },
  POST_WEIGHT: {
    en: () => "Enter weight (kg):",
    ny: () => "Lembani kulemera (kg):",
  },
  POST_PRICE: {
    en: () => "Enter price (MWK):",
    ny: () => "Lembani mtengo (MWK):",
  },
  POST_CONFIRM: {
    en: (ctx) =>
      `Confirm shipment:\n${ctx.origin} to ${ctx.destination}\n${ctx.weightKg}kg, ${formatMWK(ctx.priceMwk || 0)}\n1. Yes\n2. Edit`,
    ny: (ctx) =>
      `Tsimikizirani:\n${ctx.origin} ku ${ctx.destination}\n${ctx.weightKg}kg, ${formatMWK(ctx.priceMwk || 0)}\n1. Inde\n2. Sinthani`,
  },
  FIND_LOADS_LIST: {
    en: () =>
      "Available Loads:\n1. LL-BT Maize 5T MK185K\n2. MZ-LL Cement 3T MK95K\n3. BT-ZA Goods 2T MK45K\n0. Back\n#. Next Page",
    ny: () =>
      "Katundu Wopezeka:\n1. LL-BT Chimanga 5T MK185K\n2. MZ-LL Simenti 3T MK95K\n3. BT-ZA Malonda 2T MK45K\n0. Bwerera\n#. Tsamba lina",
  },
  FIND_LOAD_DETAIL: {
    en: (ctx) =>
      `Load Details:\nRoute: LL to BT\nCargo: Maize 5000kg\nPrice: MK 185,000\nRating: 4.9/5\n1. Accept\n2. Back`,
    ny: (ctx) =>
      `Zambiri:\nNjira: LL ku BT\nKatundu: Chimanga 5000kg\nMtengo: MK 185,000\nMayiko: 4.9/5\n1. Tengani\n2. Bwerera`,
  },
  FIND_LOAD_ACCEPT: {
    en: () => "Load accepted!\nYou will receive SMS with pickup details.\nContact shipper: 0888123456",
    ny: () => "Mwatenga!\nMudzalandira SMS ndi zambiri.\nImbani shipper: 0888123456",
  },
  MY_SHIPMENTS: {
    en: () => "My Shipments:\n1. #MAT-7823 In Transit\n2. #MAT-7801 Pending\n0. Back",
    ny: () => "Katundu Wanga:\n1. #MAT-7823 Pa Njira\n2. #MAT-7801 Akudikira\n0. Bwerera",
  },
  SHIPMENT_DETAIL: {
    en: () => "Shipment #MAT-7823\nStatus: In Transit\nDriver: James\nETA: 2 hours\n1. Call Driver\n0. Back",
    ny: () => "Katundu #MAT-7823\nStatus: Pa Njira\nDriver: James\nKufika: Maola 2\n1. Imbani Driver\n0. Bwerera",
  },
  ACCOUNT: {
    en: () => "Account Menu:\n1. Check Balance\n2. Withdraw\n3. Transaction History\n0. Back",
    ny: () => "Akaunti:\n1. Onani Ndalama\n2. Tulutsani\n3. Mbiri ya Ndalama\n0. Bwerera",
  },
  ACCOUNT_BALANCE: {
    en: () => "Your Balance: MK 485,000\nEscrow: MK 365,000\n1. Withdraw\n0. Back",
    ny: () => "Ndalama Zanu: MK 485,000\nZodikira: MK 365,000\n1. Tulutsani\n0. Bwerera",
  },
  ACCOUNT_WITHDRAW: {
    en: () => "Withdraw to:\n1. Airtel Money\n2. TNM Mpamba\n0. Cancel",
    ny: () => "Tulutsani ku:\n1. Airtel Money\n2. TNM Mpamba\n0. Lekani",
  },
  ERROR_RETRY: {
    en: () => "Invalid input. Please try again.\n0. Main Menu",
    ny: () => "Cholakwika. Yesaninso.\n0. Menu Yaikulu",
  },
  SESSION_TIMEOUT: {
    en: () => "Session timed out.\nDial *384*628652# to continue.",
    ny: () => "Nthawi yatha.\nImbani *384*628652# kuti mupitirize.",
  },
}

// Cargo type mapping
const CARGO_TYPES: Record<number, string> = {
  1: "food",
  2: "building_materials",
  3: "other",
}

// State transitions based on input
export function processInput(
  session: UssdSession,
  input: string,
): { newState: UssdState; newContext: UssdContext; isEnd: boolean } {
  const { state, context, language } = session
  let newState: UssdState = state
  const newContext: UssdContext = { ...context }
  let isEnd = false

  // Global shortcuts
  if (input === "*") {
    // Return to main menu
    newState = "MAIN_MENU"
    newContext.history = []
    return { newState, newContext, isEnd }
  }

  // Push current state to history for back navigation
  if (!newContext.history) newContext.history = []

  switch (state) {
    case "WELCOME":
    case "MAIN_MENU":
      switch (input) {
        case "1":
          newContext.history.push(state)
          newState = "POST_PICKUP"
          break
        case "2":
          newContext.history.push(state)
          newState = "FIND_LOADS_LIST"
          newContext.loadPage = 1
          break
        case "3":
          newContext.history.push(state)
          newState = "MY_SHIPMENTS"
          break
        case "4":
          newContext.history.push(state)
          newState = "ACCOUNT"
          break
        case "0":
          isEnd = true
          break
        default:
          newState = "ERROR_RETRY"
      }
      break

    case "POST_PICKUP":
      if (input === "0") {
        newState = newContext.history?.pop() || "MAIN_MENU"
      } else if (input.trim().length > 0) {
        newContext.origin = input.trim()
        newContext.history.push(state)
        newState = "POST_DESTINATION"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "POST_DESTINATION":
      if (input === "0") {
        newState = newContext.history?.pop() || "POST_PICKUP"
      } else if (input.trim().length > 0) {
        newContext.destination = input.trim()
        newContext.history.push(state)
        newState = "POST_CARGO_TYPE"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "POST_CARGO_TYPE":
      if (input === "0") {
        newState = newContext.history?.pop() || "POST_DESTINATION"
      } else if (["1", "2", "3"].includes(input)) {
        newContext.cargoType = Number.parseInt(input)
        newContext.history.push(state)
        newState = "POST_WEIGHT"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "POST_WEIGHT":
      if (input === "0") {
        newState = newContext.history?.pop() || "POST_CARGO_TYPE"
      } else {
        const weight = Number.parseFloat(input)
        if (!isNaN(weight) && weight > 0) {
          newContext.weightKg = weight
          newContext.history.push(state)
          newState = "POST_PRICE"
        } else {
          newState = "ERROR_RETRY"
        }
      }
      break

    case "POST_PRICE":
      if (input === "0") {
        newState = newContext.history?.pop() || "POST_WEIGHT"
      } else {
        const price = Number.parseFloat(input)
        if (!isNaN(price) && price > 0) {
          newContext.priceMwk = price
          newContext.history.push(state)
          newState = "POST_CONFIRM"
        } else {
          newState = "ERROR_RETRY"
        }
      }
      break

    case "POST_CONFIRM":
      if (input === "1") {
        // Create shipment - this will be handled by the callback route
        isEnd = true
      } else if (input === "2") {
        newState = "POST_PICKUP"
        newContext.history = []
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "FIND_LOADS_LIST":
      if (input === "0") {
        newState = newContext.history?.pop() || "MAIN_MENU"
      } else if (input === "#") {
        newContext.loadPage = (newContext.loadPage || 1) + 1
      } else if (["1", "2", "3", "4", "5", "6", "7"].includes(input)) {
        newContext.selectedLoadId = `load-${input}`
        newContext.history.push(state)
        newState = "FIND_LOAD_DETAIL"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "FIND_LOAD_DETAIL":
      if (input === "0" || input === "2") {
        newState = newContext.history?.pop() || "FIND_LOADS_LIST"
      } else if (input === "1") {
        newContext.history.push(state)
        newState = "FIND_LOAD_ACCEPT"
        isEnd = true // Acceptance is end of flow
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "MY_SHIPMENTS":
      if (input === "0") {
        newState = newContext.history?.pop() || "MAIN_MENU"
      } else if (["1", "2"].includes(input)) {
        newContext.history.push(state)
        newState = "SHIPMENT_DETAIL"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "SHIPMENT_DETAIL":
      if (input === "0") {
        newState = newContext.history?.pop() || "MY_SHIPMENTS"
      } else if (input === "1") {
        // Call driver - end session
        isEnd = true
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "ACCOUNT":
      if (input === "0") {
        newState = newContext.history?.pop() || "MAIN_MENU"
      } else if (input === "1") {
        newContext.history.push(state)
        newState = "ACCOUNT_BALANCE"
      } else if (input === "2") {
        newContext.history.push(state)
        newState = "ACCOUNT_WITHDRAW"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "ACCOUNT_BALANCE":
      if (input === "0") {
        newState = newContext.history?.pop() || "ACCOUNT"
      } else if (input === "1") {
        newContext.history.push(state)
        newState = "ACCOUNT_WITHDRAW"
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "ACCOUNT_WITHDRAW":
      if (input === "0") {
        newState = newContext.history?.pop() || "ACCOUNT_BALANCE"
      } else if (["1", "2"].includes(input)) {
        // Initiate withdrawal - end session
        isEnd = true
      } else {
        newState = "ERROR_RETRY"
      }
      break

    case "ERROR_RETRY":
      if (input === "0") {
        newState = "MAIN_MENU"
        newContext.history = []
      } else {
        // Retry previous state
        newState = newContext.history?.pop() || "MAIN_MENU"
      }
      break

    default:
      newState = "WELCOME"
  }

  return { newState, newContext, isEnd }
}

// Generate USSD response text
export function generateResponse(state: UssdState, context: UssdContext, language: Language): string {
  const menuFn = MENUS[state]?.[language] || MENUS[state]?.en
  if (menuFn) {
    const text = menuFn(context)
    // Ensure max 160 characters
    return text.length > 160 ? text.substring(0, 157) + "..." : text
  }
  return MENUS.WELCOME[language](context)
}
