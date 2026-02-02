"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Check, CheckCheck, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "bot"
  content: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
  isQuickReply?: boolean
  quickReplies?: string[]
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "bot",
    content:
      "Muli bwanji! Takulandirani ku Matola.\n\nNditha kukuthandizani ndi:\n\n1. Tumiza katundu (Ship goods)\n2. Peza katundu (Find loads)\n3. Tsatani (Track shipment)\n4. Ndalama zanga (Balance)\n5. Nyengo ya malonda (Season info)\n\nLembani nambala kapena fotokozani chomwe mukufuna.",
    timestamp: new Date(Date.now() - 60000),
    quickReplies: ["Tumiza katundu", "Peza katundu", "Tsatani", "Ndalama"],
  },
]

const botResponses: Record<string, { reply: string; quickReplies?: string[] }> = {
  tumiza: {
    reply:
      "Bwino! Tiyeni titumize katundu wanu.\n\nMukuchokera kuti?\n\n1. Lilongwe (Central)\n2. Blantyre (Southern)\n3. Mzuzu (Northern)\n4. Kasungu (Central)\n5. Zomba (Southern)\n\nKapena lembani dzina la mzinda.",
    quickReplies: ["Lilongwe", "Blantyre", "Mzuzu", "Kasungu"],
  },
  ship: {
    reply:
      "Bwino! Tiyeni titumize katundu wanu.\n\nMukuchokera kuti?\n\n1. Lilongwe (Central)\n2. Blantyre (Southern)\n3. Mzuzu (Northern)\n4. Kasungu (Central)\n5. Zomba (Southern)\n\nKapena lembani dzina la mzinda.",
    quickReplies: ["Lilongwe", "Blantyre", "Mzuzu", "Kasungu"],
  },
  lilongwe: {
    reply:
      "Lilongwe - bwino!\n\nMalo enieni (landmark)?\n\n1. Kanengo Industrial\n2. Lizulu Market\n3. Area 25\n4. Old Town\n5. Bwandilo Market",
    quickReplies: ["Kanengo", "Lizulu", "Area 25", "Old Town"],
  },
  kanengo: {
    reply: "Kanengo ADMARC - Lilongwe\n\nMukupita kuti? (Destination)",
    quickReplies: ["Blantyre", "Mzuzu", "Zomba", "Mwanza Border"],
  },
  blantyre: {
    reply:
      "Lilongwe → Blantyre\n311km via M1 Highway\n\nNdi katundu wanji?\n\n1. Chimanga (Maize)\n2. Fodya (Tobacco)\n3. Simenti (Cement)\n4. Feteleza (Fertilizer)\n5. Malonda wamba (General)\n6. Zina (Other)",
    quickReplies: ["Chimanga", "Fodya", "Simenti", "Malonda"],
  },
  chimanga: {
    reply: "Chimanga (Maize) - bwino!\n\nKulemera bwanji? (Weight in kg)\n\nExample: 5000",
    quickReplies: ["1000 kg", "2000 kg", "5000 kg", "10000 kg"],
  },
  "5000 kg": {
    reply:
      "MTENGO WOYEMBEKEZEKA:\n━━━━━━━━━━━━━━━━\nLilongwe (Kanengo) → Blantyre (Limbe)\n\nChimanga - 5,000 kg\n\nMtengo: MK 185,000\n━━━━━━━━━━━━━━━━\n\nZikuphatikiza:\n✓ Insurance\n✓ GPS tracking\n✓ 24hr support\n\nNyengo ya Chimanga:\nApr-Jun = High demand!\n\nKodi mupeze oyendetsa?",
    quickReplies: ["Inde, pezani", "Sinthani", "Lepherani"],
  },
  "inde, pezani": {
    reply:
      "Tikupeza oyendetsa otsimikizirika...\n\nTAPEZA 3:\n━━━━━━━━━━━━━━━━\n\n1. James Banda\nRating: 4.8 (156 reviews)\nVehicle: Canter BT-4521\nMtengo: MK 182,000\nRTOA Verified\nAvailable: Panopa\n\n2. Grace Phiri\nRating: 4.9 (89 reviews)\nVehicle: FUSO LL-7832\nMtengo: MK 185,000\nRTOA Verified\nAvailable: 2hrs\n\n3. Kondwani Chirwa\nRating: 4.4 (38 reviews)\nVehicle: Canter KU-5678\nMtengo: MK 178,000\nCommunity Verified\nAvailable: Mawa\n\nSankhani nambala:",
    quickReplies: ["1", "2", "3", "Zambiri"],
  },
  "1": {
    reply:
      'MWASANKHA JAMES BANDA!\n━━━━━━━━━━━━━━━━\n\nOrder ID: #MAT-7823\n\nDriver:\nJames Banda\nFoni: 0991 234 567\nPlate: BT 4521\n\nPickup:\nKanengo ADMARC, Lilongwe\nLero, 6:00 AM\n\nPayment:\nMK 182,000\nvia Airtel Money/Cash\n\nJames adzakuimbirani kutsimikizira pickup location.\n\nMutha kutsatira shipment yanu nthawi iliyonse:\n"Tsatani #MAT-7823"',
    quickReplies: ["Tsatani shipment", "Imbani driver", "Menu"],
  },
  peza: {
    reply: "Muli kuti panopa? (Current location)",
    quickReplies: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"],
  },
  find: {
    reply: "Muli kuti panopa? (Current location)",
    quickReplies: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"],
  },
  "loads blantyre": {
    reply:
      "KATUNDU KU BLANTYRE:\n━━━━━━━━━━━━━━━━\n\n1. BT → LL Electronics\n   500kg | MK 95,000\n   BACKHAUL -40%!\n   Shipper: 4.6\n\n2. BT → ZA Simenti\n   4,000kg | MK 45,000\n   Shipper: 4.8\n\n3. BT → MW Export\n   12T | MK 420,000\n   BORDER (6-8hrs)\n   Shipper: 4.9\n\nSankhani nambala kuona zambiri:",
    quickReplies: ["1", "2", "3", "Zina"],
  },
  backhaul: {
    reply:
      "BACKHAUL - CHEPETSANI MTENGO!\n━━━━━━━━━━━━━━━━\n\nBackhaul ndi katundu wa kubwerera.\n\nMukapita LL→BT ndi chimanga,\nmutha kubwerera BT→LL ndi katundu\npa mtengo wotsika -40%!\n\nMosavuta:\n• Musayende chopanda kanthu\n• Mupeza ndalama zina\n• Shipper apeza mtengo wabwino\n\nPanopa pali 15 backhaul loads\nzomwe zikuyendera njira yanu!",
    quickReplies: ["Peza backhaul", "Menu"],
  },
  tsatani: {
    reply: "Lowetsani Order ID yanu:\n\nExample: MAT-7823",
  },
  track: {
    reply: "Lowetsani Order ID yanu:\n\nExample: MAT-7823",
  },
  "mat-7823": {
    reply:
      "SHIPMENT #MAT-7823\n━━━━━━━━━━━━━━━━\nStatus: PA NJIRA (In Transit)\n\nDriver: James Banda\nFoni: 0991 234 567\nPlate: BT 4521\n\nCheckpoints:\n✓ Lilongwe (Kanengo) 6:15 AM\n✓ Dedza Boma 8:30 AM\n→ Ntcheu (Panopa - Now)\n○ Blantyre (Limbe) ETA 11:00 AM\n\nKutali Kotsala: 85 km\nMaola: ~1.5 hrs\n\nMap Link: maps.matola.mw/7823",
    quickReplies: ["Imbani driver", "Fotokozani vuto", "Menu"],
  },
  ndalama: {
    reply:
      "NDALAMA ZANU:\n━━━━━━━━━━━━━━━━\nBalance: MK 485,000\nEscrow: MK 365,000\n\nMwezi Uno:\nTotal: MK 850,000\nBackhaul Saved: MK 125,000\n\nTulutsani ku:\n1. Airtel Money\n2. TNM Mpamba\n3. Bank Account",
    quickReplies: ["Tulutsani", "Mbiri ya ndalama", "Menu"],
  },
  balance: {
    reply:
      "NDALAMA ZANU:\n━━━━━━━━━━━━━━━━\nBalance: MK 485,000\nEscrow: MK 365,000\n\nMwezi Uno:\nTotal: MK 850,000\nBackhaul Saved: MK 125,000\n\nTulutsani ku:\n1. Airtel Money\n2. TNM Mpamba\n3. Bank Account",
    quickReplies: ["Tulutsani", "Mbiri ya ndalama", "Menu"],
  },
  nyengo: {
    reply:
      "NYENGO YA MALONDA:\n━━━━━━━━━━━━━━━━\n\nPANOPA - HIGH SEASON:\n🌿 Fodya (Tobacco)\nJan - Apr\nDemand: VERY HIGH\nRates: +40% premium\n\nZIKUBWERA:\n🌽 Chimanga (Apr-Jun)\n🍃 Tiyi/Tea (Sep-Nov)\n🌱 Feteleza (Sep-Nov)\n🍬 Shuga (Jul-Oct)\n\nTIP: Backhaul loads\nsave 40% year-round!\n\nMajor Routes Now:\n• Lilongwe↔Auction Floors\n• Kasungu→Kanengo\n• Mchinji Border runs",
    quickReplies: ["Peza katundu wa nyengo", "Menu"],
  },
  season: {
    reply:
      "NYENGO YA MALONDA:\n━━━━━━━━━━━━━━━━\n\nPANOPA - HIGH SEASON:\n🌿 Fodya (Tobacco)\nJan - Apr\nDemand: VERY HIGH\nRates: +40% premium\n\nZIKUBWERA:\n🌽 Chimanga (Apr-Jun)\n🍃 Tiyi/Tea (Sep-Nov)\n🌱 Feteleza (Sep-Nov)\n🍬 Shuga (Jul-Oct)\n\nTIP: Backhaul loads\nsave 40% year-round!\n\nMajor Routes Now:\n• Lilongwe↔Auction Floors\n• Kasungu→Kanengo\n• Mchinji Border runs",
    quickReplies: ["Peza katundu wa nyengo", "Menu"],
  },
  menu: {
    reply:
      "Takulandirani ku Matola!\n\n1. Tumiza katundu (Ship)\n2. Peza katundu (Find loads)\n3. Tsatani (Track)\n4. Ndalama zanga (Balance)\n5. Nyengo ya malonda (Season)\n6. Thandizo (Help)\n\nLembani nambala kapena fotokozani.",
    quickReplies: ["Tumiza katundu", "Peza katundu", "Tsatani", "Ndalama"],
  },
  thandizo: {
    reply:
      "THANDIZO / HELP:\n━━━━━━━━━━━━━━━━\n\nImbani (Call):\n0888 MATOLA\n\nWhatsApp:\n0991 MATOLA\n\nEmail:\nhelp@matola.mw\n\nMaola a ntchito:\n6AM - 10PM tsiku lililonse\n\nEmergency (24/7):\n0999 HELP MW\n\nOffices:\nLilongwe - Area 3\nBlantyre - Ginnery Corner\nMzuzu - Katoto",
    quickReplies: ["Fotokozani vuto", "FAQ", "Menu"],
  },
  help: {
    reply:
      "THANDIZO / HELP:\n━━━━━━━━━━━━━━━━\n\nImbani (Call):\n0888 MATOLA\n\nWhatsApp:\n0991 MATOLA\n\nEmail:\nhelp@matola.mw\n\nMaola a ntchito:\n6AM - 10PM tsiku lililonse\n\nEmergency (24/7):\n0999 HELP MW\n\nOffices:\nLilongwe - Area 3\nBlantyre - Ginnery Corner\nMzuzu - Katoto",
    quickReplies: ["Fotokozani vuto", "FAQ", "Menu"],
  },
  default: {
    reply:
      'Pepani, sindinamvetse bwino.\n\nMutha kunena:\n• "Tumiza" - kutumiza katundu\n• "Peza" - kupeza katundu\n• "Tsatani" + Order ID\n• "Ndalama" - kuona balance\n• "Nyengo" - seasonal info\n• "Thandizo" - help\n\nKapena imbani 0888 MATOLA',
    quickReplies: ["Tumiza", "Peza", "Thandizo"],
  },
}

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "delivered" } : m)))
    }, 500)

    // Simulate message read
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" } : m)))
    }, 1000)

    // Bot response
    setTimeout(() => {
      const inputLower = input.toLowerCase().trim()
      const response = botResponses[inputLower] || botResponses.default

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        content: response.reply,
        timestamp: new Date(),
        quickReplies: response.quickReplies,
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1500)

    setInput("")
  }

  const handleQuickReply = (reply: string) => {
    setInput(reply)
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: reply,
        timestamp: new Date(),
        status: "sent",
      }

      setMessages((prev) => [...prev, userMessage])

      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" } : m)))
      }, 800)

      setTimeout(() => {
        const inputLower = reply.toLowerCase().trim()
        const response = botResponses[inputLower] || botResponses.default

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          content: response.reply,
          timestamp: new Date(),
          quickReplies: response.quickReplies,
        }

        setMessages((prev) => [...prev, botMessage])
      }, 1500)

      setInput("")
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  return (
    <Card className="mx-auto max-w-sm overflow-hidden border-0 shadow-xl">
      {/* WhatsApp Header */}
      <CardHeader className="flex flex-row items-center gap-3 bg-[#075E54] p-3 text-white">
        <Avatar className="h-10 w-10 border-2 border-white/20">
          <AvatarFallback className="bg-[#25D366] text-white font-bold">M</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">Matola</h3>
          <p className="text-xs text-white/80">online</p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Chat Area */}
        <div
          className="h-[400px] overflow-y-auto p-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e5ddd5' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: "#ECE5DD",
          }}
        >
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 shadow-sm",
                      message.sender === "user" ? "rounded-br-none bg-[#DCF8C6]" : "rounded-bl-none bg-white",
                    )}
                  >
                    <p className="whitespace-pre-line text-sm text-gray-800">{message.content}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.sender === "user" && (
                        <span className="text-[#53BDEB]">
                          {message.status === "read" ? (
                            <CheckCheck className="h-3.5 w-3.5" />
                          ) : message.status === "delivered" ? (
                            <CheckCheck className="h-3.5 w-3.5 text-gray-400" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Quick Replies */}
                {message.quickReplies && message.sender === "bot" && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-2">
                    {message.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="rounded-full border border-[#25D366] bg-white px-3 py-1 text-xs font-medium text-[#075E54] transition-colors hover:bg-[#25D366] hover:text-white"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 border-t bg-[#F0F0F0] p-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Lembani mawu anu..."
              className="rounded-full border-0 bg-white pr-10 shadow-sm"
            />
            <Mic className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          <Button
            onClick={handleSend}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-[#25D366] hover:bg-[#128C7E]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
