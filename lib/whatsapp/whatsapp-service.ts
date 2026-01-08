/**
 * WhatsApp Service - Message Processing
 * Handles WhatsApp conversation flows for Twilio
 */

import { prisma } from "@/lib/db/prisma"
import { normalizePhone } from "@/lib/ussd/ussd-service"

export interface WhatsAppContext {
  phone: string
  userId?: string
  state: string
  context: Record<string, any>
  language: "en" | "ny"
}

/**
 * Get or create user by phone
 */
export async function getOrCreateWhatsAppUser(phone: string): Promise<{ id: string; name: string; role: string } | null> {
  const normalizedPhone = normalizePhone(phone)
  
  let user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
    select: { id: true, name: true, role: true, preferredLanguage: true },
  })

  if (!user) {
    // Auto-register user for WhatsApp
    user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        name: `User ${normalizedPhone.slice(-4)}`,
        role: "shipper",
        pinHash: "",
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
 * Process WhatsApp message based on state
 */
export async function processWhatsAppMessage(
  phone: string,
  message: string,
  context?: WhatsAppContext,
): Promise<{ response: string; newState: string; newContext: Record<string, any> }> {
  const user = await getOrCreateWhatsAppUser(phone)
  if (!user) {
    return {
      response: "Sorry, there was an error. Please try again.",
      newState: "ERROR",
      newContext: {},
    }
  }

  const language = (user.preferredLanguage as "en" | "ny") || "en"
  const isChichewa = language === "ny"
  const upperMessage = message.trim().toUpperCase()

  // Registration flow
  if (!context || context.state === "REGISTRATION_NAME") {
    if (upperMessage === "HI" || upperMessage === "HELLO" || upperMessage === "START" || !context) {
      return {
        response: isChichewa
          ? `Moni ku Matola! 👋
Ndikuthandizani kuti mupeze katundu kapena galimoto.

Lembani dzina lanu:`
          : `Welcome to Matola! 👋
I'm here to help you find transport or cargo.

Let's get you set up:
Reply with your NAME`,
        newState: "REGISTRATION_NAME",
        newContext: { phone, userId: user.id },
      }
    }

    if (message.length > 2 && message.length < 50 && context?.state === "REGISTRATION_NAME") {
      // Update user name
      await prisma.user.update({
        where: { id: user.id },
        data: { name: message },
      })

      return {
        response: isChichewa
          ? `Zabwino, ${message}! 

Muli ndi:
1️⃣ WOTUMIZA (Muli ndi katundu)
2️⃣ WOTENGERA (Muli ndi galimoto)

Lembani 1 kapena 2`
          : `Nice to meet you, ${message}! 

Are you a:
1️⃣ SHIPPER (I have cargo to send)
2️⃣ TRANSPORTER (I have a vehicle)

Reply with 1 or 2`,
        newState: "REGISTRATION_ROLE",
        newContext: { phone, userId: user.id, name: message },
      }
    }
  }

  // Role selection
  if (context?.state === "REGISTRATION_ROLE") {
    if (upperMessage === "1" || upperMessage.includes("SHIPPER")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "shipper" },
      })
      return {
        response: isChichewa
          ? `✅ Mwalembetsedwa ngati Wotumiza!

Lembani "POST" kuti mulembe katundu woyamba.`
          : `✅ You're registered as a Shipper!

Reply "POST" to create your first shipment.`,
        newState: "MAIN_MENU",
        newContext: { phone, userId: user.id },
      }
    }

    if (upperMessage === "2" || upperMessage.includes("TRANSPORTER")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "transporter" },
      })
      return {
        response: isChichewa
          ? `✅ Mwalembetsedwa ngati Wotengera!

Lembani "FIND" kuti mupeze katundu.`
          : `✅ You're registered as a Transporter!

Reply "FIND" to find available loads.`,
        newState: "MAIN_MENU",
        newContext: { phone, userId: user.id },
      }
    }
  }

  // Main menu
  if (!context || context.state === "MAIN_MENU" || upperMessage === "MENU" || upperMessage === "HELP") {
    const shipmentCount = await prisma.shipment.count({
      where: { shipperId: user.id, status: { in: ["posted", "matched", "in_transit"] } },
    })

    return {
      response: isChichewa
        ? `Moni ${user.name}! 

Mukufuna chiyani?
1️⃣ Lemba katundu
2️⃣ Peza galimoto
3️⃣ Katundu wanga${shipmentCount > 0 ? ` (${shipmentCount})` : ""}
4️⃣ Thandizo

Lembani nambala kapena mawu.`
        : `Welcome back, ${user.name}! 

What would you like to do?
1️⃣ Post a shipment
2️⃣ Find transport
3️⃣ My shipments${shipmentCount > 0 ? ` (${shipmentCount})` : ""}
4️⃣ Help

Reply with number or text.`,
      newState: "MAIN_MENU",
      newContext: { phone, userId: user.id },
    }
  }

  // Post shipment
  if (upperMessage.startsWith("POST") || upperMessage === "1" || context?.state === "POST_SHIPMENT") {
    if (context?.state === "POST_SHIPMENT_ORIGIN") {
      if (message.length < 2) {
        return {
          response: isChichewa
            ? "Lemberani malo otengerera:\n(e.g. Lilongwe, Area 25)"
            : "What's your pickup location?\n(e.g. Lilongwe, Area 25)",
          newState: "POST_SHIPMENT_ORIGIN",
          newContext: context.newContext || {},
        }
      }

      return {
        response: isChichewa
          ? `Zabwino! Kuchokera ku ${message}.\n\nLemberani malo ofika:\n(e.g. Blantyre, Limbe)`
          : `Got it! From ${message}.\n\nWhat's your destination?\n(e.g. Blantyre, Limbe)`,
        newState: "POST_SHIPMENT_DESTINATION",
        newContext: { ...context.newContext, origin: message },
      }
    }

    if (context?.state === "POST_SHIPMENT_DESTINATION") {
      if (message.length < 2) {
        return {
          response: isChichewa
            ? "Lemberani malo ofika:\n(e.g. Blantyre, Limbe)"
            : "What's your destination?\n(e.g. Blantyre, Limbe)",
          newState: "POST_SHIPMENT_DESTINATION",
          newContext: context.newContext || {},
        }
      }

      return {
        response: isChichewa
          ? `Njira: ${context.newContext.origin} → ${message}\n\nKatundu ali ndi kulemera kwa kg kodi?\nLemberani nambala`
          : `Route: ${context.newContext.origin} → ${message}\n\nHow much does cargo weigh in kg?\nEnter number`,
        newState: "POST_SHIPMENT_WEIGHT",
        newContext: { ...context.newContext, destination: message },
      }
    }

    if (context?.state === "POST_SHIPMENT_WEIGHT") {
      const weight = parseInt(message)
      if (isNaN(weight) || weight <= 0) {
        return {
          response: isChichewa
            ? "Lemberani nambala yabwino\n(e.g. 500)"
            : "Enter valid number\n(e.g. 500)",
          newState: "POST_SHIPMENT_WEIGHT",
          newContext: context.newContext || {},
        }
      }

      return {
        response: isChichewa
          ? `${weight}kg katundu\n\nMukufuna kulipira ndalama zingati? (MWK)\nLemberani nambala`
          : `${weight}kg cargo\n\nHow much are you willing to pay? (MWK)\nEnter amount`,
        newState: "POST_SHIPMENT_PRICE",
        newContext: { ...context.newContext, weight },
      }
    }

    if (context?.state === "POST_SHIPMENT_PRICE") {
      const price = parseInt(message)
      if (isNaN(price) || price <= 0) {
        return {
          response: isChichewa
            ? "Lemberani nambala yabwino\n(e.g. 50000)"
            : "Enter valid amount\n(e.g. 50000)",
          newState: "POST_SHIPMENT_PRICE",
          newContext: context.newContext || {},
        }
      }

      // Create shipment
      try {
        const reference = `ML${Date.now().toString().slice(-6)}`
        await prisma.shipment.create({
          data: {
            shipperId: user.id,
            reference,
            originCity: context.newContext.origin,
            originDistrict: "Unknown",
            originRegion: "Central",
            destinationCity: context.newContext.destination,
            destinationDistrict: "Unknown",
            destinationRegion: "Central",
            cargoType: "general",
            cargoDescription: `${context.newContext.weight}kg cargo`,
            weight: context.newContext.weight,
            requiredVehicleType: "medium_truck",
            pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            pickupTimeWindow: "8:00 AM - 5:00 PM",
            price,
            currency: "MWK",
            paymentMethod: "cash",
            status: "posted",
          },
        })

        return {
          response: isChichewa
            ? `✅ Katundu walembedwa!\n\nRef: #${reference}\nTidzakuuzirani transporter akavomereza.\n\nTrack: https://matola.mw/track/${reference}`
            : `✅ Shipment posted!\n\nRef: #${reference}\nWe'll notify you when a transporter accepts.\n\nTrack: https://matola.mw/track/${reference}`,
          newState: "MAIN_MENU",
          newContext: { phone, userId: user.id },
        }
      } catch (error) {
        return {
          response: isChichewa
            ? "Cholakwika chachitika. Yesaninso."
            : "Error occurred. Please try again.",
          newState: "MAIN_MENU",
          newContext: { phone, userId: user.id },
        }
      }
    }

    // Start post shipment flow
    return {
      response: isChichewa
        ? "Lemberani malo otengerera:\n(e.g. Lilongwe, Area 25)"
        : "What's your pickup location?\n(e.g. Lilongwe, Area 25)",
      newState: "POST_SHIPMENT_ORIGIN",
      newContext: { phone, userId: user.id },
    }
  }

  // Find transport
  if (upperMessage.startsWith("FIND") || upperMessage === "2") {
    const shipments = await prisma.shipment.findMany({
      where: { status: "posted" },
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
      return {
        response: isChichewa
          ? "Palibe katundu pano.\n\nTidzakuuzirani katundu watsopano akayikidwa! 📦"
          : "No available loads right now.\n\nI'll notify you when new loads are posted! 📦",
        newState: "MAIN_MENU",
        newContext: { phone, userId: user.id },
      }
    }

    let response = isChichewa
      ? `Mapeza katundu ${shipments.length}:\n\n`
      : `Found ${shipments.length} available loads:\n\n`

    shipments.forEach((shipment, index) => {
      response += `${index + 1}️⃣ ${shipment.originCity} → ${shipment.destinationCity}\n📦 ${shipment.weight}kg ${shipment.cargoType}\n💰 MWK ${shipment.price.toLocaleString()}\n📅 ${shipment.pickupDate.toLocaleDateString()}\n\n`
    })

    response += isChichewa
      ? "Lembani nambala kuti muwone zambiri."
      : "Reply with number to see details."

    return {
      response,
      newState: "FIND_TRANSPORT_LIST",
      newContext: { phone, userId: user.id, shipments: shipments.map((s) => s.id) },
    }
  }

  // My shipments
  if (upperMessage === "MY SHIPMENTS" || upperMessage === "3") {
    const userShipments = await prisma.shipment.findMany({
      where: { shipperId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    })

    if (userShipments.length === 0) {
      return {
        response: isChichewa
          ? "Mulibe katundu pano.\n\nLembani \"POST\" kuti mulembe katundu woyamba! 📦"
          : "You have no shipments yet.\n\nReply \"POST\" to create your first shipment! 📦",
        newState: "MAIN_MENU",
        newContext: { phone, userId: user.id },
      }
    }

    let response = isChichewa ? "Katundu wanu:\n\n" : "Your shipments:\n\n"
    userShipments.forEach((shipment) => {
      response += `📦 #${shipment.reference}\n${shipment.originCity} → ${shipment.destinationCity}\nStatus: ${shipment.status}\n💰 MWK ${shipment.price.toLocaleString()}\n\n`
    })

    return {
      response,
      newState: "MAIN_MENU",
      newContext: { phone, userId: user.id },
    }
  }

  // Default response
  return {
    response: isChichewa
      ? "Ndikuthandizani! 😊\n\nLembani:\n• \"MENU\" - Menyu yayikulu\n• \"POST\" - Lemba katundu\n• \"FIND\" - Peza galimoto\n• \"HELP\" - Thandizo"
      : "I'm here to help! 😊\n\nReply:\n• \"MENU\" - Main menu\n• \"POST\" - Post a shipment\n• \"FIND\" - Find transport\n• \"HELP\" - Get help",
    newState: "MAIN_MENU",
    newContext: { phone, userId: user.id },
  }
}

