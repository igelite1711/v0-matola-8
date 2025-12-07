"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  FileText,
  ArrowRight,
  ImageIcon,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { DisputeForm } from "./dispute-form"
import type { DisputeType, DisputeStatus } from "@/lib/types"

const disputeTypeLabels: Record<DisputeType, { en: string; ny: string }> = {
  delayed_delivery: { en: "Delayed Delivery", ny: "Kuchedwa Kufika" },
  damaged_goods: { en: "Damaged Goods", ny: "Katundu Woipa" },
  wrong_pickup: { en: "Wrong Pickup Location", ny: "Malo Olakwika" },
  payment_issue: { en: "Payment Issue", ny: "Vuto la Malipiro" },
  no_show: { en: "No Show", ny: "Sanabwere" },
  overcharge: { en: "Overcharge", ny: "Kulipiritsa Kwambiri" },
  other: { en: "Other", ny: "Zina" },
}

const statusConfig: Record<DisputeStatus, { label: { en: string; ny: string }; color: string; icon: typeof Clock }> = {
  open: { label: { en: "Open", ny: "Yatseguka" }, color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  investigating: {
    label: { en: "Investigating", ny: "Akufufuza" },
    color: "bg-blue-500/20 text-blue-400",
    icon: Search,
  },
  resolved: {
    label: { en: "Resolved", ny: "Yathetsedwa" },
    color: "bg-green-500/20 text-green-400",
    icon: CheckCircle,
  },
  escalated: { label: { en: "Escalated", ny: "Yakwezedwa" }, color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
  closed: { label: { en: "Closed", ny: "Yatsekedwa" }, color: "bg-muted text-muted-foreground", icon: XCircle },
}

export function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isNewDisputeOpen, setIsNewDisputeOpen] = useState(false)

  const { showToast, shipments } = useApp()
  const { language } = useLanguage()

  const [disputes, setDisputes] = useState([
    {
      id: "DSP-001",
      shipmentId: "MAT-7823",
      shipmentRoute: "Lilongwe → Blantyre",
      reportedBy: "sh1",
      reportedByRole: "shipper" as const,
      againstUser: "t1",
      againstUserRole: "transporter" as const,
      otherPartyName: "James Banda",
      type: "delayed_delivery" as DisputeType,
      description: "Delivery was 4 hours late. Driver said there was traffic but other transporters arrived on time.",
      status: "investigating" as DisputeStatus,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      images: [] as string[],
    },
    {
      id: "DSP-002",
      shipmentId: "MAT-7819",
      shipmentRoute: "Blantyre → Zomba",
      reportedBy: "t2",
      reportedByRole: "transporter" as const,
      againstUser: "sh2",
      againstUserRole: "shipper" as const,
      otherPartyName: "BuildMart Hardware",
      type: "payment_issue" as DisputeType,
      description:
        "Shipper has not paid for delivery completed 5 days ago. Mobile money payment was agreed but not sent.",
      status: "open" as DisputeStatus,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      images: [] as string[],
    },
    {
      id: "DSP-003",
      shipmentId: "MAT-7815",
      shipmentRoute: "Mzuzu → Lilongwe",
      reportedBy: "sh3",
      reportedByRole: "shipper" as const,
      againstUser: "t3",
      againstUserRole: "transporter" as const,
      otherPartyName: "Peter Mwale",
      type: "damaged_goods" as DisputeType,
      description: "Some maize bags were damaged due to rain. Truck cover was not properly secured.",
      voiceNoteUrl: "/voice-notes/dsp-003.mp3",
      images: ["/dispute-images/dsp-003-1.jpg", "/dispute-images/dsp-003-2.jpg"],
      status: "resolved" as DisputeStatus,
      resolution: "Transporter agreed to compensate MK 25,000 for damaged goods. Amount deducted from earnings.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ])

  const handleDisputeSubmit = (disputeData: {
    shipmentId: string
    type: DisputeType
    description: string
    images: string[]
    voiceNoteUrl?: string
  }) => {
    const newDisputeEntry = {
      id: `DSP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      shipmentId: disputeData.shipmentId,
      shipmentRoute: "Route TBD",
      reportedBy: "user",
      reportedByRole: "shipper" as const,
      againstUser: "other",
      againstUserRole: "transporter" as const,
      otherPartyName: "Other Party",
      type: disputeData.type,
      description: disputeData.description,
      images: disputeData.images,
      voiceNoteUrl: disputeData.voiceNoteUrl,
      status: "open" as DisputeStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setDisputes((prev) => [newDisputeEntry, ...prev])
    showToast(
      language === "en"
        ? "Dispute submitted successfully. Our team will review it within 24 hours."
        : "Dandaulo latumizidwa bwino. Gulu lathu lidzaliona mkati mwa maola 24.",
      "success",
    )
    setIsNewDisputeOpen(false)
  }

  const handleMessage = (disputeId: string) => {
    showToast(language === "en" ? "Opening message thread..." : "Kutsegula mauthenga...", "info")
  }

  const handleCallSupport = () => {
    showToast(
      language === "en" ? "Connecting to support: +265 999 000 000" : "Kulumikizana ndi athandizi: +265 999 000 000",
      "info",
    )
  }

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && dispute.status === activeTab
  })

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return language === "en" ? "Today" : "Lero"
    if (days === 1) return language === "en" ? "Yesterday" : "Dzulo"
    return language === "en" ? `${days} days ago` : `Masiku ${days} apitawo`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Dispute Resolution" : "Kuthetsa Mavuto"}
          </h2>
          <p className="text-muted-foreground">
            {language === "en" ? "Report and resolve issues with shipments" : "Nenani ndi kuthetsa mavuto a katundu"}
          </p>
        </div>
        <Dialog open={isNewDisputeOpen} onOpenChange={setIsNewDisputeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {language === "en" ? "Report Issue" : "Nenani Vuto"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{language === "en" ? "Report an Issue" : "Nenani Vuto"}</DialogTitle>
              <DialogDescription>
                {language === "en"
                  ? "Describe the problem you experienced. You can also record a voice note or upload images as evidence."
                  : "Fotokozani vuto lomwe munakumana nalo. Mungatepenso mawu kapena zithunzi ngati umboni."}
              </DialogDescription>
            </DialogHeader>
            <DisputeForm onSubmit={handleDisputeSubmit} onCancel={() => setIsNewDisputeOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search disputes..." : "Sakani mavuto..."}
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={handleCallSupport}>
          <Phone className="h-4 w-4" />
          {language === "en" ? "Call Support" : "Imbani Athandizi"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">{language === "en" ? "All" : "Zonse"}</TabsTrigger>
          <TabsTrigger value="open">{language === "en" ? "Open" : "Zotseguka"}</TabsTrigger>
          <TabsTrigger value="investigating">{language === "en" ? "Investigating" : "Zikufufuzidwa"}</TabsTrigger>
          <TabsTrigger value="resolved">{language === "en" ? "Resolved" : "Zothetsedwa"}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {filteredDisputes.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No disputes found" : "Palibe mavuto apezeka"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDisputes.map((dispute) => {
              const StatusIcon = statusConfig[dispute.status].icon
              return (
                <Card
                  key={dispute.id}
                  className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-muted-foreground">{dispute.id}</span>
                          <Badge className={statusConfig[dispute.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[dispute.status].label[language]}
                          </Badge>
                          <Badge variant="outline">{disputeTypeLabels[dispute.type][language]}</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{dispute.shipmentRoute}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{dispute.shipmentId}</span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>

                        {(dispute.images?.length > 0 || dispute.voiceNoteUrl) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {dispute.images?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                {dispute.images.length} {language === "en" ? "photos" : "zithunzi"}
                              </span>
                            )}
                            {dispute.voiceNoteUrl && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {language === "en" ? "Voice note" : "Mawu"}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {language === "en" ? "Against" : "Motsutsana ndi"}: {dispute.otherPartyName}
                          </span>
                          <span>•</span>
                          <span>{getRelativeTime(dispute.createdAt)}</span>
                        </div>

                        {dispute.resolution && (
                          <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-green-400">
                              <strong>{language === "en" ? "Resolution" : "Yankho"}:</strong> {dispute.resolution}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 sm:flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none bg-transparent"
                          onClick={() => handleMessage(dispute.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {language === "en" ? "Message" : "Uthenga"}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
