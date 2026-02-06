"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  MessageSquare,
  DollarSign,
  User,
  Calendar,
  Scale,
} from "lucide-react"

const mockDisputes = [
  {
    id: "d1",
    shipmentId: "s5",
    type: "damage",
    title: "Cargo damaged during transit",
    description: "Tea bags were wet due to rain exposure",
    shipper: "Tea Estate Ltd",
    transporter: "Mary Chirwa",
    amount: 15000,
    status: "open",
    created: "2024-01-14",
    priority: "high",
  },
  {
    id: "d2",
    shipmentId: "s8",
    type: "delay",
    title: "Late delivery - 2 days",
    description: "Delivery was supposed to be on Monday but arrived Wednesday",
    shipper: "Banda Trading",
    transporter: "Peter Mwale",
    amount: 8000,
    status: "investigating",
    created: "2024-01-12",
    priority: "medium",
  },
  {
    id: "d3",
    shipmentId: "s12",
    type: "payment",
    title: "Payment not received",
    description: "Shipper claims payment was made but transporter didn't receive",
    shipper: "NASFAM Lilongwe",
    transporter: "James Phiri",
    amount: 185000,
    status: "resolved",
    created: "2024-01-08",
    priority: "high",
    resolution: "Payment was stuck in escrow - released to transporter",
  },
]

function AdminDisputesContent() {
  const { showToast } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [resolution, setResolution] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" /> Open
          </Badge>
        )
      case "investigating":
        return (
          <Badge className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" /> Investigating
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            High Priority
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return null
    }
  }

  const filteredDisputes = mockDisputes.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.transporter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || d.status === activeTab
    return matchesSearch && matchesTab
  })

  const stats = {
    total: mockDisputes.length,
    open: mockDisputes.filter((d) => d.status === "open").length,
    investigating: mockDisputes.filter((d) => d.status === "investigating").length,
    resolved: mockDisputes.filter((d) => d.status === "resolved").length,
  }

  const handleResolve = (disputeId: string) => {
    showToast(`Dispute ${disputeId} has been resolved`, "success")
    setResolution("")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="admin" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="admin" />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Dispute Resolution</h1>
            <p className="text-muted-foreground">Manage and resolve platform disputes</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Scale className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Disputes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.investigating}</p>
                    <p className="text-xs text-muted-foreground">Investigating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs and Dispute List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="open">Open ({stats.open})</TabsTrigger>
              <TabsTrigger value="investigating">Investigating</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <Card key={dispute.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(dispute.status)}
                            {getPriorityBadge(dispute.priority)}
                            <span className="text-sm text-muted-foreground">#{dispute.id}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{dispute.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{dispute.description}</p>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4 text-blue-600" />
                              Shipper: {dispute.shipper}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4 text-green-600" />
                              Transporter: {dispute.transporter}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {dispute.created}
                            </span>
                          </div>

                          {dispute.resolution && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-800">
                                <strong>Resolution:</strong> {dispute.resolution}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Disputed Amount</p>
                            <p className="text-xl font-bold flex items-center gap-1">
                              <DollarSign className="h-5 w-5" />
                              MK {dispute.amount.toLocaleString()}
                            </p>
                          </div>

                          {dispute.status !== "resolved" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Resolve Dispute</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Dispute #{dispute.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <p className="font-medium">{dispute.title}</p>
                                    <p className="text-sm text-muted-foreground">{dispute.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Resolution</label>
                                    <Textarea
                                      placeholder="Describe the resolution..."
                                      value={resolution}
                                      onChange={(e) => setResolution(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button className="flex-1" onClick={() => handleResolve(dispute.id)}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </Button>
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Contact Parties
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
