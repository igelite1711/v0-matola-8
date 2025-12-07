"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Mic, MicOff, Camera, Upload, X, FileImage, CheckCircle, Clock } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import type { DisputeType } from "@/lib/types"

interface DisputeFormProps {
  shipmentId?: string
  onSubmit?: () => void
  onCancel?: () => void
}

const disputeTypes: Array<{
  value: DisputeType
  label: { en: string; ny: string }
  description: { en: string; ny: string }
}> = [
  {
    value: "damaged_goods",
    label: { en: "Damaged Goods", ny: "Katundu Woipa" },
    description: { en: "Cargo was damaged during transport", ny: "Katundu anaonongeka poyenda" },
  },
  {
    value: "delayed_delivery",
    label: { en: "Delayed Delivery", ny: "Kuchedwa Kufika" },
    description: { en: "Delivery took longer than agreed", ny: "Kufika kunatenga nthawi yochuluka" },
  },
  {
    value: "driver_no_show",
    label: { en: "Driver No Show", ny: "Driver Sanabwere" },
    description: { en: "Driver did not arrive for pickup", ny: "Driver sanafike kudzatenga" },
  },
  {
    value: "payment_issue",
    label: { en: "Payment Issue", ny: "Vuto la Malipiro" },
    description: { en: "Problems with payment", ny: "Mavuto okhudza malipiro" },
  },
  {
    value: "wrong_pickup",
    label: { en: "Wrong Pickup", ny: "Malo Olakwika" },
    description: { en: "Driver went to wrong location", ny: "Driver anapita kumalo olakwika" },
  },
  {
    value: "cargo_lost",
    label: { en: "Cargo Lost", ny: "Katundu Watayika" },
    description: { en: "Cargo is missing or lost", ny: "Katundu watayika" },
  },
  {
    value: "overcharge",
    label: { en: "Overcharge", ny: "Kulipiritsa Kwambiri" },
    description: { en: "Charged more than agreed", ny: "Analipiritsidwa kwambiri kuposa mgwirizano" },
  },
  {
    value: "other",
    label: { en: "Other", ny: "Zina" },
    description: { en: "Other issues not listed", ny: "Mavuto ena osatchulidwa" },
  },
]

export function DisputeForm({ shipmentId = "", onSubmit, onCancel }: DisputeFormProps) {
  const { language } = useLanguage()
  const { showToast, shipments } = useApp()

  const [formData, setFormData] = useState({
    shipmentId: shipmentId,
    disputeType: "" as DisputeType | "",
    description: "",
  })

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceNote, setVoiceNote] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Recording timer
  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    const timer = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 60) {
          clearInterval(timer)
          handleStopRecording()
          return prev
        }
        return prev + 1
      })
    }, 1000)

    showToast(language === "en" ? "Recording started..." : "Kutepa kwayamba...", "info")
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setVoiceNote(`voice-note-${Date.now()}.mp3`)
    showToast(language === "en" ? "Voice note saved" : "Mawu asungidwa", "success")
  }

  const handleImageUpload = () => {
    // Simulate file selection
    const mockImages = [`/dispute-images/damage-${Date.now()}-1.jpg`, `/dispute-images/damage-${Date.now()}-2.jpg`]

    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImages((prev) => [...prev, ...mockImages.slice(0, 1)])
          showToast(language === "en" ? "Image uploaded" : "Chithunzi chatumizidwa", "success")
          return 0
        }
        return prev + 20
      })
    }, 200)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.shipmentId || !formData.disputeType || !formData.description) {
      showToast(language === "en" ? "Please fill all required fields" : "Chonde lowetsani zambiri zonse", "error")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    showToast(
      language === "en"
        ? "Dispute submitted successfully. Our team will review it within 24 hours."
        : "Dandaulo latumizidwa bwino. Gulu lathu lidzaliona mkati mwa maola 24.",
      "success",
    )

    setIsSubmitting(false)
    onSubmit?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {language === "en" ? "Report an Issue" : "Nenani Vuto"}
        </CardTitle>
        <CardDescription>
          {language === "en"
            ? "Provide details about the issue. You can add voice notes and photos as evidence."
            : "Perekani zambiri za vuto. Mutha kuwonjezera mawu ndi zithunzi."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipment ID */}
        <div className="space-y-2">
          <Label>{language === "en" ? "Shipment ID *" : "Nambala ya Katundu *"}</Label>
          <Input
            placeholder="e.g., MAT-7823"
            value={formData.shipmentId}
            onChange={(e) => setFormData((prev) => ({ ...prev, shipmentId: e.target.value }))}
          />
        </div>

        {/* Dispute Type */}
        <div className="space-y-2">
          <Label>{language === "en" ? "Issue Type *" : "Mtundu wa Vuto *"}</Label>
          <Select
            value={formData.disputeType}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, disputeType: v as DisputeType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === "en" ? "Select issue type" : "Sankhani vuto"} />
            </SelectTrigger>
            <SelectContent>
              {disputeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <span className="font-medium">{type.label[language]}</span>
                    <span className="text-xs text-muted-foreground ml-2">- {type.description[language]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>{language === "en" ? "Description *" : "Kufotokoza *"}</Label>
          <Textarea
            placeholder={
              language === "en"
                ? "Describe what happened in detail. Be specific about dates, times, and amounts if applicable..."
                : "Fotokozani chomwe chinachitika mwatsatanetsatane..."
            }
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Voice Note */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            {language === "en" ? "Voice Note (Optional)" : "Mawu (Ngati Mukufuna)"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {language === "en"
              ? "Record a voice message explaining the issue in Chichewa or English (max 60 seconds)"
              : "Tepani mawu ofotokoza vuto mu Chichewa kapena Chingerezi (max sekonde 60)"}
          </p>

          <div className="flex items-center gap-3">
            {!voiceNote ? (
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                className="gap-2"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    {language === "en" ? "Stop" : "Imitsani"} ({formatTime(recordingTime)})
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    {language === "en" ? "Record Voice Note" : "Tepani Mawu"}
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {language === "en" ? "Voice note recorded" : "Mawu atepedwa"}
                </Badge>
                <Button type="button" variant="ghost" size="sm" onClick={() => setVoiceNote(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                <span className="text-sm text-destructive">{language === "en" ? "Recording..." : "Akutepa..."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {language === "en" ? "Photos (Optional)" : "Zithunzi (Ngati Mukufuna)"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {language === "en"
              ? "Upload photos of damaged cargo or other evidence"
              : "Ikani zithunzi za katundu woipa kapena umboni wina"}
          </p>

          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <div className="h-20 w-20 rounded-lg bg-secondary/50 flex items-center justify-center border border-border">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={handleImageUpload}
                className="h-20 w-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{language === "en" ? "Add" : "Onjezani"}</span>
              </button>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Uploading..." : "Akutumiza..."} {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Time Estimate */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-400 text-sm">
          <Clock className="h-4 w-4" />
          <span>
            {language === "en"
              ? "Our team typically responds within 24 hours"
              : "Gulu lathu limayankhira mkati mwa maola 24"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
              {language === "en" ? "Cancel" : "Lekani"}
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.shipmentId || !formData.disputeType || !formData.description}
          >
            {isSubmitting
              ? language === "en"
                ? "Submitting..."
                : "Akutumiza..."
              : language === "en"
                ? "Submit Report"
                : "Tumizani"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
