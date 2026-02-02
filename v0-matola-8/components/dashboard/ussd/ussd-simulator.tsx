"use client"

import { useState } from "react"
import { Phone, Hash, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface USSDScreen {
  id: string
  title: string
  content: string
  options: { key: string; label: string; next: string }[]
}

const ussdScreens: Record<string, USSDScreen> = {
  main: {
    id: "main",
    title: "Matola",
    content: "Takulandirani ku Matola!\nWelcome to Matola\n\nNjira yotumizira katundu ku Malawi",
    options: [
      { key: "1", label: "Tumiza Katundu (Ship)", next: "ship_origin" },
      { key: "2", label: "Peza Katundu (Find Loads)", next: "find_location" },
      { key: "3", label: "Tsatani (Track)", next: "track" },
      { key: "4", label: "Ndalama Zanga (Balance)", next: "balance" },
      { key: "5", label: "Nyengo ya Malonda (Season)", next: "season_info" },
      { key: "6", label: "Thandizo (Help)", next: "help" },
    ],
  },
  ship_origin: {
    id: "ship_origin",
    title: "Tumiza - Kuchokera",
    content: "Mukuchokera kuti?\nFrom where?",
    options: [
      { key: "1", label: "Lilongwe (Central)", next: "ship_origin_ll" },
      { key: "2", label: "Blantyre (Southern)", next: "ship_origin_bt" },
      { key: "3", label: "Mzuzu (Northern)", next: "ship_dest" },
      { key: "4", label: "Kasungu (Central)", next: "ship_dest" },
      { key: "5", label: "Zomba (Southern)", next: "ship_dest" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  ship_origin_ll: {
    id: "ship_origin_ll",
    title: "Lilongwe - Malo",
    content: "Malo enieni ku Lilongwe:\nSpecific location:",
    options: [
      { key: "1", label: "Kanengo Industrial", next: "ship_dest" },
      { key: "2", label: "Lizulu Market (Area 2)", next: "ship_dest" },
      { key: "3", label: "Area 25 Market", next: "ship_dest" },
      { key: "4", label: "Old Town", next: "ship_dest" },
      { key: "5", label: "Bwandilo Market", next: "ship_dest" },
      { key: "0", label: "Bwerera (Back)", next: "ship_origin" },
    ],
  },
  ship_origin_bt: {
    id: "ship_origin_bt",
    title: "Blantyre - Malo",
    content: "Malo enieni ku Blantyre:\nSpecific location:",
    options: [
      { key: "1", label: "Limbe Market", next: "ship_dest" },
      { key: "2", label: "Ginnery Corner", next: "ship_dest" },
      { key: "3", label: "Wenela Bus Depot", next: "ship_dest" },
      { key: "4", label: "Ndirande Market", next: "ship_dest" },
      { key: "5", label: "Auction Floors", next: "ship_dest" },
      { key: "0", label: "Bwerera (Back)", next: "ship_origin" },
    ],
  },
  ship_dest: {
    id: "ship_dest",
    title: "Kupita Kuti",
    content: "Mukupita kuti?\nDestination:",
    options: [
      { key: "1", label: "Lilongwe (Central)", next: "ship_cargo" },
      { key: "2", label: "Blantyre (Southern)", next: "ship_cargo" },
      { key: "3", label: "Mzuzu (Northern)", next: "ship_cargo" },
      { key: "4", label: "Zomba (Southern)", next: "ship_cargo" },
      { key: "5", label: "Mwanza Border (Moz)", next: "ship_cargo" },
      { key: "6", label: "Mchinji Border (Zam)", next: "ship_cargo" },
      { key: "0", label: "Bwerera (Back)", next: "ship_origin" },
    ],
  },
  ship_cargo: {
    id: "ship_cargo",
    title: "Mtundu wa Katundu",
    content: "Ndi chiyani mukutumiza?\nCargo type:",
    options: [
      { key: "1", label: "Chimanga (Maize)", next: "ship_weight" },
      { key: "2", label: "Fodya (Tobacco)", next: "ship_weight" },
      { key: "3", label: "Simenti (Cement)", next: "ship_weight" },
      { key: "4", label: "Feteleza (Fertilizer)", next: "ship_weight" },
      { key: "5", label: "Malonda (Goods)", next: "ship_weight" },
      { key: "6", label: "Zina (Other)", next: "ship_weight" },
      { key: "0", label: "Bwerera (Back)", next: "ship_dest" },
    ],
  },
  ship_weight: {
    id: "ship_weight",
    title: "Kulemera",
    content: "Kulemera bwanji (kg)?\nEnter weight in kg:\n\nExample: 5000",
    options: [{ key: "0", label: "Bwerera (Back)", next: "ship_cargo" }],
  },
  ship_confirm: {
    id: "ship_confirm",
    title: "Tsimikizirani",
    content:
      "ZONSE:\n━━━━━━━━━━━━\nLilongwe (Kanengo)\n→ Blantyre (Limbe)\n\nChimanga 5,000kg\n\nMTENGO: MK 185,000\n━━━━━━━━━━━━\n\nKodi muvomereza?",
    options: [
      { key: "1", label: "Inde, Vomereza (Yes)", next: "ship_payment" },
      { key: "2", label: "Sinthani (Change)", next: "ship_origin" },
      { key: "0", label: "Bwerera (Back)", next: "ship_weight" },
    ],
  },
  ship_payment: {
    id: "ship_payment",
    title: "Njira Yolipirira",
    content: "Mulipira bwanji?\nPayment method:",
    options: [
      { key: "1", label: "Airtel Money (*778#)", next: "ship_success" },
      { key: "2", label: "TNM Mpamba (*712#)", next: "ship_success" },
      { key: "3", label: "Ndalama Zenizeni (Cash)", next: "ship_success" },
      { key: "4", label: "Bank Transfer", next: "ship_success" },
      { key: "0", label: "Bwerera (Back)", next: "ship_confirm" },
    ],
  },
  ship_success: {
    id: "ship_success",
    title: "Zatheka!",
    content:
      "Zikomo! Talandira.\nOrder ID: #MAT-7823\n━━━━━━━━━━━━\n\nTikupezera oyendetsa\notsimikizirika...\n\nMudzalandira SMS\nndi WhatsApp message\nmkati mwa maola 2.\n\nNyengo ya Fodya:\nKufuna kwakwera!",
    options: [{ key: "0", label: "Menu Yaikulu", next: "main" }],
  },
  find_location: {
    id: "find_location",
    title: "Peza Katundu",
    content: "Muli kuti panopa?\nYour current location:",
    options: [
      { key: "1", label: "Lilongwe", next: "find_loads_ll" },
      { key: "2", label: "Blantyre", next: "find_loads_bt" },
      { key: "3", label: "Mzuzu", next: "find_loads_mz" },
      { key: "4", label: "Zomba", next: "find_loads" },
      { key: "5", label: "Kasungu", next: "find_loads" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  find_loads_ll: {
    id: "find_loads_ll",
    title: "Katundu - Lilongwe",
    content:
      "Katundu wopezeka:\n━━━━━━━━━━━━\n1. LL→BT Chimanga 5T\n   MK185K ★★★★★\n\n2. LL→MZ Feteleza 8T\n   MK285K ★★★★☆\n   \n3. LL→KU Malonda 2T\n   MK65K ★★★★★\n   ◆BACKHAUL -40%",
    options: [
      { key: "1", label: "Onani #1 (LL→BT)", next: "load_detail_1" },
      { key: "2", label: "Onani #2 (LL→MZ)", next: "load_detail" },
      { key: "3", label: "Onani #3 Backhaul", next: "load_detail_backhaul" },
      { key: "0", label: "Bwerera (Back)", next: "find_location" },
    ],
  },
  find_loads_bt: {
    id: "find_loads_bt",
    title: "Katundu - Blantyre",
    content:
      "Katundu wopezeka:\n━━━━━━━━━━━━\n1. BT→LL Electronics\n   MK95K ★★★★☆\n   ◆BACKHAUL -40%\n\n2. BT→ZA Simenti 4T\n   MK45K ★★★★★\n   \n3. BT→MW Export\n   MK420K ★★★★★\n   ⚠BORDER",
    options: [
      { key: "1", label: "Onani #1 Backhaul", next: "load_detail_backhaul" },
      { key: "2", label: "Onani #2 (BT→ZA)", next: "load_detail" },
      { key: "3", label: "Onani #3 Border", next: "load_detail_border" },
      { key: "0", label: "Bwerera (Back)", next: "find_location" },
    ],
  },
  find_loads_mz: {
    id: "find_loads_mz",
    title: "Katundu - Mzuzu",
    content:
      "Katundu wopezeka:\n━━━━━━━━━━━━\n1. MZ→LL Mpunga 6T\n   MK195K ★★★★☆\n\n2. MZ→KR Fish 2T\n   MK85K ★★★★★\n   ⚡MSANGA (Urgent)",
    options: [
      { key: "1", label: "Onani #1 (MZ→LL)", next: "load_detail" },
      { key: "2", label: "Onani #2 Urgent", next: "load_detail" },
      { key: "0", label: "Bwerera (Back)", next: "find_location" },
    ],
  },
  load_detail_1: {
    id: "load_detail_1",
    title: "Zambiri",
    content:
      "LILONGWE → BLANTYRE\n━━━━━━━━━━━━\nKatundu: Chimanga\nKulemera: 5,000 kg\nMtengo: MK 185,000\n\nShipper: Malawi Grains\n★★★★★ (4.9)\nJobs: 89\n\nPickup: Kanengo ADMARC\nNthawi: Lero 6AM\n\nNjira: M1 Highway\nKutali: 311km\nMaola: 4-5 hrs",
    options: [
      { key: "1", label: "Tengani (Accept)", next: "load_accepted" },
      { key: "2", label: "Imbani Shipper", next: "find_loads_ll" },
      { key: "0", label: "Bwerera (Back)", next: "find_loads_ll" },
    ],
  },
  load_detail_backhaul: {
    id: "load_detail_backhaul",
    title: "Backhaul Deal!",
    content:
      "◆ BACKHAUL SPECIAL ◆\n━━━━━━━━━━━━\nBLANTYRE → LILONGWE\n\nElectronics 500kg\nMtengo: MK 95,000\n(Chepetsa -40%!)\n\nMtengo wamba: MK158K\nMusunga: MK 63,000!\n\nShipper: TechMart\n★★★★☆ (4.6)\n\nPickup: Limbe\nDelivery: Kanengo",
    options: [
      { key: "1", label: "Tengani Backhaul!", next: "load_accepted" },
      { key: "0", label: "Bwerera (Back)", next: "find_loads_bt" },
    ],
  },
  load_detail_border: {
    id: "load_detail_border",
    title: "Border Shipment",
    content:
      "⚠ BORDER CROSSING ⚠\n━━━━━━━━━━━━\nBLANTYRE → MWANZA\n\nExport Cargo 12T\nMtengo: MK 420,000\n\nBorder: Mwanza/Zobue\nClearance: 6-8 hrs\n\nShipper: Southern Import\n★★★★★ (4.8)\n\nMa documents:\n✓ Customs\n✓ Export permit\n✓ Border pass",
    options: [
      { key: "1", label: "Tengani", next: "load_accepted" },
      { key: "0", label: "Bwerera (Back)", next: "find_loads_bt" },
    ],
  },
  load_detail: {
    id: "load_detail",
    title: "Zambiri",
    content:
      "SHIPMENT DETAILS\n━━━━━━━━━━━━\nKatundu wabwino!\n\nShipper rating:\n★★★★★ (4.8)\n\nPrevious jobs: 156\nOn-time: 94%\n\nPayment: Airtel Money\nescrow protected",
    options: [
      { key: "1", label: "Tengani (Accept)", next: "load_accepted" },
      { key: "2", label: "Imbani Shipper", next: "find_location" },
      { key: "0", label: "Bwerera (Back)", next: "find_location" },
    ],
  },
  load_accepted: {
    id: "load_accepted",
    title: "Mwavomereza!",
    content:
      "✓ LOAD ACCEPTED!\n━━━━━━━━━━━━\n\nShipper:\nMalawi Grains Ltd\nFoni: 0888 123 456\n\nPickup Location:\nKanengo ADMARC\nLilongwe\n\nPickup Time:\nLero, 6:00 AM\n\nMudzalandira SMS\nya pickup details.\n\nZikomo! Thank you!",
    options: [{ key: "0", label: "Menu Yaikulu", next: "main" }],
  },
  track: {
    id: "track",
    title: "Tsatani Katundu",
    content: "Lowetsani Order ID:\nEnter shipment ID:\n\nExample: MAT-7823",
    options: [{ key: "0", label: "Bwerera (Back)", next: "main" }],
  },
  track_result: {
    id: "track_result",
    title: "Status",
    content:
      "#MAT-7823\n━━━━━━━━━━━━\nStatus: PA NJIRA\n(In Transit)\n\nDriver: James Banda\n★★★★★ (4.8)\nFoni: 0991 234 567\nPlate: BT 4521\n\nCheckpoints:\n✓ Lilongwe 6:15AM\n✓ Dedza 8:30AM\n→ Ntcheu (panopa)\n○ Blantyre (ETA 11AM)\n\nKutali Kotsala: 85km\nMaola: ~1.5 hrs",
    options: [
      { key: "1", label: "Imbani Driver", next: "track" },
      { key: "2", label: "Fotokozani Vuto", next: "dispute_start" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  balance: {
    id: "balance",
    title: "Ndalama Zanga",
    content:
      "NDALAMA ZANU\n━━━━━━━━━━━━\n\nZopezeka:\nMK 485,000\n\nZodikira (Escrow):\nMK 365,000\n\nMwezi Uno:\nMK 850,000\n\nBackhaul Savings:\nMK 125,000 saved!\n━━━━━━━━━━━━",
    options: [
      { key: "1", label: "Tulutsani (Withdraw)", next: "withdraw" },
      { key: "2", label: "Mbiri (History)", next: "balance" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  withdraw: {
    id: "withdraw",
    title: "Tulutsani",
    content: "Tulutsani ku:\nWithdraw to:\n\nCharges:\nAirtel/TNM: 2%\nBank: MK 500",
    options: [
      { key: "1", label: "Airtel Money", next: "withdraw_amount" },
      { key: "2", label: "TNM Mpamba", next: "withdraw_amount" },
      { key: "3", label: "Bank Account", next: "withdraw_amount" },
      { key: "0", label: "Bwerera (Back)", next: "balance" },
    ],
  },
  withdraw_amount: {
    id: "withdraw_amount",
    title: "Ndalama",
    content: "Ndalama zingati?\nAmount (MWK):\n\nMax: MK 485,000\nMin: MK 1,000",
    options: [{ key: "0", label: "Bwerera (Back)", next: "withdraw" }],
  },
  season_info: {
    id: "season_info",
    title: "Nyengo ya Malonda",
    content:
      "NYENGO PANOPA:\n━━━━━━━━━━━━\n◆ FODYA (Tobacco)\nJan - Apr\nKufuna: KWAKWERA!\nRates: +40%\n\nNyengo Zikubwera:\n○ Chimanga (Apr-Jun)\n○ Tiyi (Sep-Nov)\n○ Feteleza (Sep-Nov)\n○ Shuga (Jul-Oct)\n\nTip: Backhaul loads\nsave 40% always!",
    options: [
      { key: "1", label: "Peza Katundu wa Nyengo", next: "find_location" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  help: {
    id: "help",
    title: "Thandizo",
    content:
      "THANDIZO:\n━━━━━━━━━━━━\n\n1. Imbani:\n   0888 MATOLA\n\n2. WhatsApp:\n   0991 MATOLA\n\n3. Email:\n   help@matola.mw\n\nMaola a Ntchito:\n6AM - 10PM daily\n\nEmergency 24/7:\n0999 HELP MW",
    options: [
      { key: "1", label: "Fotokozani Vuto", next: "dispute_start" },
      { key: "2", label: "Momwe Zikugwirira (FAQ)", next: "faq" },
      { key: "0", label: "Bwerera (Back)", next: "main" },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    content:
      "MAFUNSO AMBIRI:\n━━━━━━━━━━━━\n1. Ndalama zimabwera liti?\n   24-48 hrs\n\n2. Backhaul ndi chiyani?\n   Katundu wa kubwerera\n   -40% discount!\n\n3. RTOA verification?\n   Oyendetsa otsimikizirika\n   ku transport union",
    options: [{ key: "0", label: "Bwerera (Back)", next: "help" }],
  },
  dispute_start: {
    id: "dispute_start",
    title: "Fotokozani Vuto",
    content: "Lowetsani Order ID:\nEnter Order ID:\n\nKapena tumizani\nvoice note ku WhatsApp",
    options: [{ key: "0", label: "Bwerera (Back)", next: "help" }],
  },
}

export function USSDSimulator() {
  const [currentScreen, setCurrentScreen] = useState<USSDScreen>(ussdScreens.main)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>(["main"])

  const handleInput = (key: string) => {
    const option = currentScreen.options.find((o) => o.key === key)
    if (option) {
      if (option.next === "ship_weight" && key !== "0") {
        setCurrentScreen(ussdScreens.ship_confirm)
        setHistory([...history, "ship_confirm"])
      } else if (option.next === "track" && currentScreen.id === "track" && input) {
        setCurrentScreen(ussdScreens.track_result)
        setHistory([...history, "track_result"])
      } else {
        setCurrentScreen(ussdScreens[option.next])
        setHistory([...history, option.next])
      }
    }
    setInput("")
  }

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop()
      const previousScreen = newHistory[newHistory.length - 1]
      setCurrentScreen(ussdScreens[previousScreen])
      setHistory(newHistory)
    }
  }

  const handleSend = () => {
    if (input) {
      const option = currentScreen.options.find((o) => o.key === input)
      if (option) {
        handleInput(input)
      } else if (
        currentScreen.id === "ship_weight" ||
        currentScreen.id === "track" ||
        currentScreen.id === "withdraw_amount"
      ) {
        if (currentScreen.id === "ship_weight") {
          setCurrentScreen(ussdScreens.ship_confirm)
          setHistory([...history, "ship_confirm"])
        } else if (currentScreen.id === "track") {
          setCurrentScreen(ussdScreens.track_result)
          setHistory([...history, "track_result"])
        } else if (currentScreen.id === "withdraw_amount") {
          setCurrentScreen(ussdScreens.balance)
          setHistory([...history, "balance"])
        }
        setInput("")
      }
    }
  }

  return (
    <Card className="mx-auto max-w-sm border-2 border-primary/30 bg-card">
      <CardHeader className="border-b border-border bg-secondary/50 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">USSD *384*MATOLA#</CardTitle>
              <p className="text-xs text-muted-foreground">Airtel / TNM</p>
            </div>
          </div>
          {history.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Screen Display */}
        <div className="min-h-[320px] bg-background p-4 font-mono text-sm">
          <p className="mb-3 font-bold text-primary">{currentScreen.title}</p>
          <p className="whitespace-pre-line text-foreground">{currentScreen.content}</p>
          <div className="mt-4 space-y-1">
            {currentScreen.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleInput(option.key)}
                className="block w-full text-left text-muted-foreground transition-colors hover:text-primary"
              >
                {option.key}. {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keypad */}
        <div className="border-t border-border bg-secondary/30 p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter option..."
                className="pl-9 font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
            </div>
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
