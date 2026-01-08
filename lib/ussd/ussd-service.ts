/**
 * USSD Service - Complete State Machine Implementation
 * Handles all USSD flows according to MATOLA LOGISTICS PLATFORM specification
 */

import { prisma } from "@/lib/db/prisma"
import { malawiLocations } from "@/lib/malawi-data"
import type { Language } from "@/lib/translations"

export interface USSDSession {
  phone: string
  userId?: string
  state: string
  context: Record<string, any>
  stepCount: number
  language: "en" | "ny"
  createdAt: number
  updatedAt: number
}

export interface USSDResponse {
  response: string // "CON ..." or "END ..."
  newState: string
  context: Record<string, any>
}

/**
 * Validate and normalize phone number
 */
export function normalizePhone(phone: string): string {
  // Remove spaces, dashes, etc.
  let normalized = phone.replace(/[\s\-\(\)]/g, "")
  
  // Add country code if missing
  if (normalized.startsWith("0")) {
    normalized = "+265" + normalized.substring(1)
  } else if (!normalized.startsWith("+265")) {
    normalized = "+265" + normalized
  }
  
  return normalized
}

/**
 * Find or create user by phone
 */
export async function getOrCreateUser(phone: string): Promise<{ id: string; name: string; role: string } | null> {
  const normalizedPhone = normalizePhone(phone)
  
  let user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
    select: { id: true, name: true, role: true, preferredLanguage: true },
  })

  if (!user) {
    // Auto-register user (USSD users don't need full registration)
    user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        name: `User ${normalizedPhone.slice(-4)}`, // Temporary name
        role: "shipper", // Default role
        pinHash: "", // No PIN required for USSD
        preferredLanguage: "en",
        verificationLevel: "phone",
        verified: false,
      },
      select: { id: true, name: true, role: true, preferredLanguage: true },
    })
  }

  return user
}

/**
 * Validate location input against Malawi locations
 */
export function validateLocation(input: string): { name: string; district: string; region: "Northern" | "Central" | "Southern"; lat?: number; lng?: number } | null {
  const normalized = input.toLowerCase().trim()
  
  // Check against known locations
  const match = malawiLocations.find(
    (loc) =>
      loc.name.toLowerCase() === normalized ||
      loc.name.toLowerCase().includes(normalized) ||
      normalized.includes(loc.name.toLowerCase()),
  )

  if (match) {
    return {
      name: match.name,
      district: match.district,
      region: match.region as "Northern" | "Central" | "Southern",
    }
  }

  // If no match, return input as-is (user can enter custom location)
  return {
    name: input,
    district: "Unknown",
    region: "Central", // Default
  }
}

/**
 * Get cargo type from selection
 */
export function getCargoType(selection: string): string {
  const cargoMap: Record<string, string> = {
    "1": "maize",
    "2": "construction",
    "3": "general",
    "4": "livestock",
    "5": "general",
  }
  return cargoMap[selection] || "general"
}

/**
 * Format USSD menu text (max 160 chars, keep under 140 for safety)
 */
export function formatMenu(text: string): string {
  // Remove extra whitespace
  return text.trim().replace(/\n\s*\n/g, "\n")
}

/**
 * Main Menu Handler
 */
export function handleMainMenu(input: string, language: Language, userShipmentCount?: number): USSDResponse {
  const isChichewa = language === "ny"
  
  if (input === "0" || input === "") {
    const countText = userShipmentCount ? ` (${userShipmentCount} active)` : ""
    const menu = isChichewa
      ? `Moni ku Matola
1. Lemba katundu
2. Peza galimoto
3. Katundu wanga${countText}
4. Akaunti
5. Thandizo
0. Tuluka`
      : `Welcome to Matola
1. Post a load
2. Find transport
3. My shipments${countText}
4. Account
5. Help
0. Exit`

    return {
      response: `CON ${formatMenu(menu)}`,
      newState: "MAIN_MENU",
      context: {},
    }
  }

  const stateMap: Record<string, string> = {
    "1": "POST_SHIPMENT_ORIGIN",
    "2": "FIND_TRANSPORT_ORIGIN",
    "3": "MY_SHIPMENTS_LIST",
    "4": "ACCOUNT_MENU",
    "5": "HELP_MENU",
  }

  const newState = stateMap[input]
  if (!newState) {
    return {
      response: `CON ${isChichewa ? "Sankhani 1-5" : "Select 1-5"}\n\n${handleMainMenu("", language, userShipmentCount).response.replace("CON ", "")}`,
      newState: "MAIN_MENU",
      context: {},
    }
  }

  // Handle each menu option
  if (input === "1") {
    return {
      response: `CON ${isChichewa ? "Lemberani malo otengerera:" : "Enter pickup location:"}\n(e.g. Lilongwe, Area 25)\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_ORIGIN",
      context: {},
    }
  }

  if (input === "2") {
    return {
      response: `CON ${isChichewa ? "Mukufuna katundu kuti?" : "Where do you need transport?"}\n1. Lilongwe\n2. Blantyre\n3. Mzuzu\n4. Zomba\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "FIND_TRANSPORT_ORIGIN",
      context: {},
    }
  }

  if (input === "3") {
    return {
      response: `CON ${isChichewa ? "Mukukonza katundu..." : "Loading shipments..."}`,
      newState: "MY_SHIPMENTS_LOADING",
      context: {},
    }
  }

  if (input === "4") {
    return {
      response: `CON ${isChichewa ? "Akaunti yanu:" : "Your account:"}\n1. Dzina (Name)\n2. Nambala (Phone)\n3. Sinthani chilankhulo\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "ACCOUNT_MENU",
      context: {},
    }
  }

  if (input === "5") {
    return {
      response: `CON ${isChichewa ? "Thandizo:" : "Help:"}\n1. Momwe mukugwiritsa\n2. Malipiro\n3. Lumikizanani\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "HELP_MENU",
      context: {},
    }
  }

  return handleMainMenu("", language, userShipmentCount)
}

/**
 * Post Shipment - Origin Handler
 */
export function handlePostShipmentOrigin(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return handleMainMenu("", language)
  }

  if (!input || input.trim().length < 2) {
    return {
      response: `CON ${isChichewa ? "Lemberani dzina la malo" : "Please enter location"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_ORIGIN",
      context,
    }
  }

  const location = validateLocation(input)
  if (!location) {
    return {
      response: `CON ${isChichewa ? "Malonda alibe. Yesaninso." : "Location not found. Try again."}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_ORIGIN",
      context,
    }
  }

  return {
    response: `CON ${isChichewa ? "Lemberani malo ofika:" : "Enter destination:"}\n(e.g. Blantyre, Limbe)\n0. ${isChichewa ? "Bwerera" : "Back"}`,
    newState: "POST_SHIPMENT_DESTINATION",
    context: {
      ...context,
      origin: location.name,
      originDistrict: location.district,
      originRegion: location.region,
    },
  }
}

/**
 * Post Shipment - Destination Handler
 */
export function handlePostShipmentDestination(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return {
      response: `CON ${isChichewa ? "Lemberani malo otengerera:" : "Enter pickup location:"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_ORIGIN",
      context,
    }
  }

  if (!input || input.trim().length < 2) {
    return {
      response: `CON ${isChichewa ? "Lemberani dzina la malo" : "Please enter location"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_DESTINATION",
      context,
    }
  }

  const location = validateLocation(input)
  if (!location) {
    return {
      response: `CON ${isChichewa ? "Malonda alibe. Yesaninso." : "Location not found. Try again."}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_DESTINATION",
      context,
    }
  }

  return {
    response: `CON ${isChichewa ? "Sankhani mtundu wa katundu:" : "Select cargo type:"}\n1. ${isChichewa ? "Chakudya" : "Food"} (maize, rice)\n2. ${isChichewa ? "Zipangizo zomangira" : "Building materials"}\n3. ${isChichewa ? "Zinthu" : "Furniture"}\n4. ${isChichewa ? "Ziweto" : "Livestock"}\n5. ${isChichewa ? "Zina" : "Other"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
    newState: "POST_SHIPMENT_CARGO_TYPE",
    context: {
      ...context,
      destination: location.name,
      destinationDistrict: location.district,
      destinationRegion: location.region,
    },
  }
}

/**
 * Post Shipment - Cargo Type Handler
 */
export function handlePostShipmentCargoType(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return {
      response: `CON ${isChichewa ? "Lemberani malo ofika:" : "Enter destination:"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_DESTINATION",
      context,
    }
  }

  const cargoType = getCargoType(input)
  if (!cargoType) {
    return {
      response: `CON ${isChichewa ? "Sankhani 1-5" : "Select 1-5"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_CARGO_TYPE",
      context,
    }
  }

  return {
    response: `CON ${isChichewa ? "Katundu ali ndi kulemera kwa kg kodi?" : "How much does cargo weigh in kg?"}\nLemberani nambala\n0. ${isChichewa ? "Bwerera" : "Back"}`,
    newState: "POST_SHIPMENT_WEIGHT",
    context: {
      ...context,
      cargoType,
    },
  }
}

/**
 * Post Shipment - Weight Handler
 */
export function handlePostShipmentWeight(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return {
      response: `CON ${isChichewa ? "Sankhani mtundu wa katundu:" : "Select cargo type:"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_CARGO_TYPE",
      context,
    }
  }

  const weight = parseInt(input)
  if (isNaN(weight) || weight <= 0 || weight > 50000) {
    return {
      response: `CON ${isChichewa ? "Lemberani nambala yabwino (1-50000kg)" : "Enter valid number (1-50000kg)"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_WEIGHT",
      context,
    }
  }

  return {
    response: `CON ${isChichewa ? "Mukufuna kulipira ndalama zingati? (MWK)" : "How much are you willing to pay? (MWK)"}\nLemberani nambala\n0. ${isChichewa ? "Bwerera" : "Back"}`,
    newState: "POST_SHIPMENT_PRICE",
    context: {
      ...context,
      weight,
    },
  }
}

/**
 * Post Shipment - Price Handler
 */
export function handlePostShipmentPrice(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return {
      response: `CON ${isChichewa ? "Katundu ali ndi kulemera kwa kg kodi?" : "How much does cargo weigh in kg?"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_WEIGHT",
      context,
    }
  }

  const price = parseInt(input)
  if (isNaN(price) || price <= 0 || price > 10000000) {
    return {
      response: `CON ${isChichewa ? "Lemberani nambala yabwino" : "Enter valid amount"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_PRICE",
      context,
    }
  }

  const summary = isChichewa
    ? `CON Vomerezani katundu:
Kuchokera: ${context.origin}
Kufika: ${context.destination}
Katundu: ${context.weight}kg ${context.cargoType}
Ndalama: MK ${price.toLocaleString()}

1. Vomereza & Ikani
2. Sinthani
0. Tuluka`
    : `CON Confirm shipment:
From: ${context.origin}
To: ${context.destination}
Cargo: ${context.weight}kg ${context.cargoType}
Price: MK ${price.toLocaleString()}

1. Confirm & Post
2. Edit
0. Cancel`

  return {
    response: formatMenu(summary),
    newState: "POST_SHIPMENT_CONFIRM",
    context: {
      ...context,
      price,
    },
  }
}

/**
 * Post Shipment - Confirmation Handler
 */
export async function handlePostShipmentConfirm(
  input: string,
  context: Record<string, any>,
  language: Language,
  phone: string,
  userId: string,
): Promise<USSDResponse> {
  const isChichewa = language === "ny"

  if (input === "0") {
    return handleMainMenu("", language)
  }

  if (input === "2") {
    // Edit - go back to origin
    return {
      response: `CON ${isChichewa ? "Lemberani malo otengerera:" : "Enter pickup location:"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "POST_SHIPMENT_ORIGIN",
      context: {},
    }
  }

  if (input === "1") {
    // Create shipment
    try {
      const reference = `ML${Date.now().toString().slice(-6)}`
      
      const shipment = await prisma.shipment.create({
        data: {
          shipperId: userId,
          reference,
          originCity: context.origin,
          originDistrict: context.originDistrict,
          originRegion: context.originRegion,
          destinationCity: context.destination,
          destinationDistrict: context.destinationDistrict,
          destinationRegion: context.destinationRegion,
          cargoType: context.cargoType as any,
          cargoDescription: `${context.weight}kg ${context.cargoType}`,
          weight: context.weight,
          requiredVehicleType: "medium_truck", // Default
          pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          pickupTimeWindow: "8:00 AM - 5:00 PM",
          price: context.price,
          currency: "MWK",
          paymentMethod: "cash",
          status: "posted",
          isBackhaul: false,
        },
      })

      const successMsg = isChichewa
        ? `END Katundu walembedwa!
Ref: #${reference}
Tidzakuuzirani transporter akavomereza.

Dial *384*628652# kuti muwone zambiri.`
        : `END Shipment posted!
Ref: #${reference}
We'll notify you when a transporter accepts.

Dial *384*628652# to check status.`

      return {
        response: formatMenu(successMsg),
        newState: "ENDED",
        context: {},
      }
    } catch (error) {
      const errorMsg = isChichewa
        ? "END Cholakwika chachitika. Yesaninso posachedwapa."
        : "END Error occurred. Please try again later."
      
      return {
        response: errorMsg,
        newState: "ENDED",
        context: {},
      }
    }
  }

  // Invalid input
  return {
    response: `CON ${isChichewa ? "Sankhani 1 kapena 2" : "Select 1 or 2"}\n\n1. ${isChichewa ? "Vomereza" : "Confirm"}\n2. ${isChichewa ? "Sinthani" : "Edit"}\n0. ${isChichewa ? "Tuluka" : "Cancel"}`,
    newState: "POST_SHIPMENT_CONFIRM",
    context,
  }
}

/**
 * Find Transport - Origin Handler
 */
export function handleFindTransportOrigin(input: string, context: Record<string, any>, language: Language): USSDResponse {
  const isChichewa = language === "ny"

  if (input === "0") {
    return handleMainMenu("", language)
  }

  const cityMap: Record<string, string> = {
    "1": "Lilongwe",
    "2": "Blantyre",
    "3": "Mzuzu",
    "4": "Zomba",
  }

  const originCity = cityMap[input]
  if (!originCity) {
    return {
      response: `CON ${isChichewa ? "Sankhani 1-4" : "Select 1-4"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "FIND_TRANSPORT_ORIGIN",
      context,
    }
  }

  return {
    response: `CON ${isChichewa ? "Mukufuna kufika kuti?" : "Where do you want to go?"}\n1. Lilongwe\n2. Blantyre\n3. Mzuzu\n4. Zomba\n0. ${isChichewa ? "Bwerera" : "Back"}`,
    newState: "FIND_TRANSPORT_DESTINATION",
    context: {
      ...context,
      originCity,
    },
  }
}

/**
 * Find Transport - Show Available Loads
 */
export async function handleFindTransportDestination(
  input: string,
  context: Record<string, any>,
  language: Language,
  phone: string,
): Promise<USSDResponse> {
  const isChichewa = language === "ny"

  if (input === "0") {
    return {
      response: `CON ${isChichewa ? "Mukufuna katundu kuti?" : "Where do you need transport?"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "FIND_TRANSPORT_ORIGIN",
      context: {},
    }
  }

  const cityMap: Record<string, string> = {
    "1": "Lilongwe",
    "2": "Blantyre",
    "3": "Mzuzu",
    "4": "Zomba",
  }

  const destinationCity = cityMap[input]
  if (!destinationCity) {
    return {
      response: `CON ${isChichewa ? "Sankhani 1-4" : "Select 1-4"}\n0. ${isChichewa ? "Bwerera" : "Back"}`,
      newState: "FIND_TRANSPORT_DESTINATION",
      context,
    }
  }

  // Find available shipments
  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        status: "posted",
        originCity: context.originCity,
        destinationCity,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        shipper: {
          select: {
            name: true,
            phone: true,
            rating: true,
          },
        },
      },
    })

    if (shipments.length === 0) {
      const noLoadsMsg = isChichewa
        ? `END Palibe katundu pano.
${context.originCity} → ${destinationCity}

Dial *384*628652# kuti muwone zambiri.`
        : `END No loads available now.
${context.originCity} → ${destinationCity}

Dial *384*628652# for more.`

      return {
        response: formatMenu(noLoadsMsg),
        newState: "ENDED",
        context: {},
      }
    }

    // Format first shipment
    const shipment = shipments[0]
    const detailMsg = isChichewa
      ? `CON Load #${shipment.reference}
Njira: ${shipment.originCity} → ${shipment.destinationCity}
Katundu: ${shipment.weight}kg ${shipment.cargoType}
Ndalama: MK ${shipment.price.toLocaleString()}
Wotumiza: ${shipment.shipper.name}

1. Vomereza
2. Onani zina
0. Bwerera`
      : `CON Load #${shipment.reference}
Route: ${shipment.originCity} → ${shipment.destinationCity}
Cargo: ${shipment.weight}kg ${shipment.cargoType}
Price: MK ${shipment.price.toLocaleString()}
Shipper: ${shipment.shipper.name}

1. Accept
2. More options
0. Back`

    return {
      response: formatMenu(detailMsg),
      newState: "FIND_TRANSPORT_DETAIL",
      context: {
        ...context,
        destinationCity,
        shipmentId: shipment.id,
        shipmentIndex: 0,
        allShipments: shipments.map((s) => s.id),
      },
    }
  } catch (error) {
    const errorMsg = isChichewa
      ? "END Cholakwika. Yesaninso."
      : "END Error. Please try again."
    
    return {
      response: errorMsg,
      newState: "ENDED",
      context: {},
    }
  }
}

/**
 * My Shipments Handler
 */
export async function handleMyShipments(phone: string, language: Language, page: number = 0): Promise<USSDResponse> {
  const isChichewa = language === "ny"

  try {
    const user = await prisma.user.findUnique({
      where: { phone: normalizePhone(phone) },
    })

    if (!user) {
      return {
        response: isChichewa
          ? "END Muli ndi vuto. Yesaninso."
          : "END Error. Please try again.",
        newState: "ENDED",
        context: {},
      }
    }

    const shipments = await prisma.shipment.findMany({
      where: { shipperId: user.id },
      take: 3,
      skip: page * 3,
      orderBy: { createdAt: "desc" },
    })

    if (shipments.length === 0) {
      const noShipmentsMsg = isChichewa
        ? "END Mulibe katundu pano.\n\nDial *384*628652# kuti mulembe."
        : "END You have no shipments.\n\nDial *384*628652# to post one."

      return {
        response: noShipmentsMsg,
        newState: "ENDED",
        context: {},
      }
    }

    let listMsg = isChichewa ? "CON Katundu wanu:\n\n" : "CON Your shipments:\n\n"
    
    shipments.forEach((shipment, index) => {
      const status = isChichewa
        ? shipment.status === "posted"
          ? "Yayikidwa"
          : shipment.status === "matched"
            ? "Yavomerezedwa"
            : shipment.status === "in_transit"
              ? "Pa njira"
              : shipment.status
        : shipment.status

      listMsg += `${index + 1}. #${shipment.reference} - ${status}\n${shipment.originCity} → ${shipment.destinationCity}\n\n`
    })

    listMsg += shipments.length >= 3
      ? isChichewa
        ? "3. Onani zambiri\n0. Bwerera"
        : "3. View more\n0. Back"
      : isChichewa
        ? "0. Bwerera"
        : "0. Back"

    return {
      response: formatMenu(listMsg),
      newState: "MY_SHIPMENTS_LIST",
      context: { page },
    }
  } catch (error) {
    return {
      response: isChichewa ? "END Cholakwika." : "END Error.",
      newState: "ENDED",
      context: {},
    }
  }
}

