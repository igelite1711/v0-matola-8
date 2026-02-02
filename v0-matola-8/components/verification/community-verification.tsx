"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Shield, Users, Star, Phone, Clock, UserPlus, Award, FileCheck, Truck } from "lucide-react"

interface VerificationStep {
  id: string
  title: string
  titleNy: string
  description: string
  descriptionNy: string
  status: "completed" | "pending" | "not_started"
  icon: typeof Shield
}

const verificationSteps: VerificationStep[] = [
  {
    id: "phone",
    title: "Phone Verification",
    titleNy: "Kutsimikizira Foni",
    description: "Verify your phone number via SMS",
    descriptionNy: "Tsimikizirani nambala yanu ya foni kudzera pa SMS",
    status: "completed",
    icon: Phone,
  },
  {
    id: "id",
    title: "ID Document",
    titleNy: "Kalata Yodziwikira",
    description: "Upload your national ID or passport",
    descriptionNy: "Tumizani chithunzi cha ID kapena passport",
    status: "completed",
    icon: FileCheck,
  },
  {
    id: "vehicle",
    title: "Vehicle Registration",
    titleNy: "Kalata ya Galimoto",
    description: "Provide vehicle registration documents",
    descriptionNy: "Perekani zikalata za galimoto",
    status: "pending",
    icon: Truck,
  },
  {
    id: "reference",
    title: "Community Reference",
    titleNy: "Umboni wa Anthu",
    description: "Get vouched by 2 verified users",
    descriptionNy: "Pezani umboni kuchokera kwa anthu awiri ovomerezeka",
    status: "not_started",
    icon: Users,
  },
  {
    id: "union",
    title: "Transport Union",
    titleNy: "Bungwe la Oyendetsa",
    description: "Optional: Verified union membership",
    descriptionNy: "Kusankha: Kakhala membala wa bungwe",
    status: "not_started",
    icon: Award,
  },
]

interface Reference {
  id: string
  name: string
  phone: string
  relationship: string
  status: "pending" | "verified" | "rejected"
  date: string
}

const mockReferences: Reference[] = [
  {
    id: "1",
    name: "James Banda",
    phone: "+265 991 234 567",
    relationship: "Fellow transporter - worked together for 3 years",
    status: "verified",
    date: "2024-01-10",
  },
  {
    id: "2",
    name: "Grace Phiri",
    phone: "+265 888 345 678",
    relationship: "Previous employer at ABC Transport",
    status: "pending",
    date: "2024-01-15",
  },
]

export function CommunityVerification() {
  const [language, setLanguage] = useState<"en" | "ny">("en")
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false)

  const completedSteps = verificationSteps.filter((s) => s.status === "completed").length
  const verificationProgress = (completedSteps / verificationSteps.length) * 100

  const translations = {
    en: {
      title: "Trust & Verification",
      subtitle: "Build your reputation in the Matola community",
      verificationLevel: "Verification Level",
      trustScore: "Trust Score",
      addReference: "Add Reference",
      communityReferences: "Community References",
      referencesDesc: "People who can vouch for your reliability",
      verificationSteps: "Verification Steps",
      stepsDesc: "Complete these steps to get fully verified",
      verified: "Verified",
      pending: "Pending",
      notStarted: "Not Started",
      complete: "Complete",
      requestReference: "Request Reference",
      referenceNameLabel: "Reference Name",
      referencePhoneLabel: "Phone Number",
      referenceRelationshipLabel: "How do you know them?",
      sendRequest: "Send Request",
      cancel: "Cancel",
    },
    ny: {
      title: "Kukhulupirira & Kutsimikizira",
      subtitle: "Mangani mbiri yanu mu gulu la Matola",
      verificationLevel: "Gawo Lotsimikizira",
      trustScore: "Chiwerengero cha Kukhulupirira",
      addReference: "Onjezani Umboni",
      communityReferences: "Umboni wa Anthu",
      referencesDesc: "Anthu omwe angathe kuvomereza kukhulupiririka kwanu",
      verificationSteps: "Masitepe Otsimikizira",
      stepsDesc: "Tsirizirani masitepe awa kuti mutsimikiziridwe",
      verified: "Watsimikiziridwa",
      pending: "Ikudikirira",
      notStarted: "Siyanayamba",
      complete: "Tsiriza",
      requestReference: "Pemphani Umboni",
      referenceNameLabel: "Dzina la Umboni",
      referencePhoneLabel: "Nambala ya Foni",
      referenceRelationshipLabel: "Mumamadziwana bwanji?",
      sendRequest: "Tumizani Pempho",
      cancel: "Siyani",
    },
  }

  const t = translations[language]

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <button
            onClick={() => setLanguage("en")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("ny")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              language === "ny" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chichewa
          </button>
        </div>
      </div>

      {/* Trust Score Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.verificationLevel}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-foreground">Silver</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to Gold</span>
                    <span className="text-primary">{Math.round(verificationProgress)}%</span>
                  </div>
                  <Progress value={verificationProgress} className="h-2" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t.trustScore}</p>
                <p className="mt-1 text-4xl font-bold text-primary">87</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex justify-center">
                  <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div>
                <div className="flex justify-center">
                  <Package className="h-8 w-8 text-chart-2" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">234</p>
                <p className="text-xs text-muted-foreground">Trips</p>
              </div>
              <div>
                <div className="flex justify-center">
                  <Clock className="h-8 w-8 text-chart-3" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">94%</p>
                <p className="text-xs text-muted-foreground">On-Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Steps */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t.verificationSteps}</CardTitle>
          <CardDescription>{t.stepsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                step.status === "completed"
                  ? "border-green-500/30 bg-green-500/5"
                  : step.status === "pending"
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step.status === "completed"
                      ? "bg-green-500/20"
                      : step.status === "pending"
                        ? "bg-yellow-500/20"
                        : "bg-secondary"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <step.icon
                      className={`h-5 w-5 ${step.status === "pending" ? "text-yellow-500" : "text-muted-foreground"}`}
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{language === "en" ? step.title : step.titleNy}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? step.description : step.descriptionNy}
                  </p>
                </div>
              </div>
              <div>
                {step.status === "completed" && <Badge className="bg-green-500/20 text-green-400">{t.verified}</Badge>}
                {step.status === "pending" && <Badge className="bg-yellow-500/20 text-yellow-400">{t.pending}</Badge>}
                {step.status === "not_started" && (
                  <Button size="sm" variant="outline">
                    {t.complete}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Community References */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.communityReferences}</CardTitle>
            <CardDescription>{t.referencesDesc}</CardDescription>
          </div>
          <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                {t.addReference}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.requestReference}</DialogTitle>
                <DialogDescription>
                  {language === "en"
                    ? "Ask someone you've worked with to verify your reputation"
                    : "Pemphani munthu womwe mwagwirira nawo ntchito kuti avomereze mbiri yanu"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t.referenceNameLabel}</Label>
                  <Input placeholder={language === "en" ? "e.g., John Doe" : "m.e., John Doe"} />
                </div>
                <div className="space-y-2">
                  <Label>{t.referencePhoneLabel}</Label>
                  <Input placeholder="+265 999 123 456" />
                </div>
                <div className="space-y-2">
                  <Label>{t.referenceRelationshipLabel}</Label>
                  <Textarea
                    placeholder={
                      language === "en"
                        ? "e.g., We worked together at ABC Transport for 2 years..."
                        : "m.e., Tinagwira ntchito limodzi pa ABC Transport kwa zaka 2..."
                    }
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsReferenceDialogOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button className="flex-1" onClick={() => setIsReferenceDialogOpen(false)}>
                    {t.sendRequest}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockReferences.map((ref) => (
            <div
              key={ref.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                ref.status === "verified" ? "border-green-500/30 bg-green-500/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    ref.status === "verified" ? "bg-green-500/20" : "bg-secondary"
                  }`}
                >
                  {ref.status === "verified" ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{ref.name}</p>
                  <p className="text-sm text-muted-foreground">{ref.relationship}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{ref.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={
                    ref.status === "verified" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }
                >
                  {ref.status === "verified" ? t.verified : t.pending}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">{ref.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
