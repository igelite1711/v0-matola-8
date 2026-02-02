"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Truck,
  Package,
  Handshake,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  Star,
  Phone,
  Shield,
  Ban,
  Eye,
} from "lucide-react"

const mockUsers = [
  {
    id: "u1",
    name: "James Phiri",
    phone: "0888123456",
    role: "transporter",
    rating: 4.9,
    trips: 145,
    status: "verified",
    joined: "2023-06-15",
  },
  {
    id: "u2",
    name: "Grace Banda",
    phone: "0888234567",
    role: "transporter",
    rating: 4.7,
    trips: 98,
    status: "verified",
    joined: "2023-08-20",
  },
  {
    id: "u3",
    name: "John Banda",
    phone: "0999123456",
    role: "shipper",
    rating: 4.8,
    trips: 45,
    status: "verified",
    joined: "2023-05-10",
  },
  {
    id: "u4",
    name: "Mary Chirwa",
    phone: "0884123456",
    role: "broker",
    rating: 4.7,
    trips: 67,
    status: "verified",
    joined: "2023-09-01",
  },
  {
    id: "u5",
    name: "Peter Mwale",
    phone: "0888345678",
    role: "transporter",
    rating: 4.8,
    trips: 67,
    status: "pending",
    joined: "2024-01-10",
  },
  {
    id: "u6",
    name: "Sarah Kamanga",
    phone: "0999345678",
    role: "shipper",
    rating: 0,
    trips: 0,
    status: "pending",
    joined: "2024-01-14",
  },
  {
    id: "u7",
    name: "David Nyirenda",
    phone: "0888567890",
    role: "transporter",
    rating: 3.2,
    trips: 12,
    status: "suspended",
    joined: "2023-11-05",
  },
]

export default function AdminUsersPage() {
  const { user, showToast } = useApp()
  const userName = user?.name || "Admin"
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "shipper":
        return (
          <Badge className="bg-blue-500">
            <Package className="h-3 w-3 mr-1" /> Shipper
          </Badge>
        )
      case "transporter":
        return (
          <Badge className="bg-green-500">
            <Truck className="h-3 w-3 mr-1" /> Transporter
          </Badge>
        )
      case "broker":
        return (
          <Badge className="bg-purple-500">
            <Handshake className="h-3 w-3 mr-1" /> Broker
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <Ban className="h-3 w-3 mr-1" /> Suspended
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery)
    const matchesTab = activeTab === "all" || u.role === activeTab || u.status === activeTab
    return matchesSearch && matchesTab
  })

  const stats = {
    total: mockUsers.length,
    transporters: mockUsers.filter((u) => u.role === "transporter").length,
    shippers: mockUsers.filter((u) => u.role === "shipper").length,
    brokers: mockUsers.filter((u) => u.role === "broker").length,
    pending: mockUsers.filter((u) => u.status === "pending").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="admin" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="admin" />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.transporters}</p>
                    <p className="text-xs text-muted-foreground">Transporters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.shippers}</p>
                    <p className="text-xs text-muted-foreground">Shippers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Handshake className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.brokers}</p>
                    <p className="text-xs text-muted-foreground">Brokers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs and User List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="transporter">Transporters</TabsTrigger>
              <TabsTrigger value="shipper">Shippers</TabsTrigger>
              <TabsTrigger value="broker">Brokers</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {u.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{u.name}</p>
                              {getRoleBadge(u.role)}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {u.phone}
                              </span>
                              {u.rating > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {u.rating}
                                </span>
                              )}
                              <span>{u.trips} trips</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(u.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              {u.status === "pending" && (
                                <DropdownMenuItem onClick={() => showToast(`${u.name} has been verified`, "success")}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {u.status !== "suspended" ? (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => showToast(`${u.name} has been suspended`, "info")}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => showToast(`${u.name} has been reactivated`, "success")}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
