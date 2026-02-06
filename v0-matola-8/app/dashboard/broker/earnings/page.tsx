"use client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, ArrowUpRight, Wallet, Calendar, Download, Phone } from "lucide-react"

const mockEarnings = [
  { id: "e1", date: "2024-01-15", description: "Lilongwe-Blantyre match", amount: 9250, status: "pending" },
  { id: "e2", date: "2024-01-14", description: "Blantyre-Zomba match", amount: 3750, status: "paid" },
  { id: "e3", date: "2024-01-13", description: "Mzuzu-Lilongwe match", amount: 16000, status: "paid" },
  { id: "e4", date: "2024-01-10", description: "Lilongwe-Kasungu match", amount: 4500, status: "paid" },
  { id: "e5", date: "2024-01-08", description: "Blantyre-Mulanje match", amount: 6200, status: "paid" },
]

const monthlyStats = {
  thisMonth: 39700,
  lastMonth: 32500,
  growth: 22.2,
  pendingPayout: 9250,
  totalMatches: 12,
}

function BrokerEarningsContent() {
  const { showToast } = useApp()

  const handleWithdraw = () => {
    showToast("Withdrawal request submitted! Funds will be sent to your mobile money.", "success")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commissions & Earnings</h1>
          <p className="text-muted-foreground">Track your broker commissions</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">MK {monthlyStats.thisMonth.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>{monthlyStats.growth}% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold">MK {monthlyStats.pendingPayout.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Wallet className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={handleWithdraw}
              disabled={monthlyStats.pendingPayout === 0}
            >
              Withdraw to Mobile Money
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Month</p>
                <p className="text-2xl font-bold">MK {monthlyStats.lastMonth.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{monthlyStats.totalMatches}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payout Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Airtel Money</p>
                  <p className="text-sm text-muted-foreground">0884 123 456</p>
                </div>
              </div>
              <Badge>Primary</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Phone className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">TNM Mpamba</p>
                  <p className="text-sm text-muted-foreground">0884 123 456</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEarnings.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${earning.status === "paid" ? "bg-green-100" : "bg-amber-100"}`}
                  >
                    <DollarSign
                      className={`h-4 w-4 ${earning.status === "paid" ? "text-green-600" : "text-amber-600"}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{earning.description}</p>
                    <p className="text-sm text-muted-foreground">{earning.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+MK {earning.amount.toLocaleString()}</p>
                  <Badge variant={earning.status === "paid" ? "default" : "outline"}>{earning.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BrokerEarningsPage() {
  return (
    <DashboardShell>
      <BrokerEarningsContent />
    </DashboardShell>
  )
}
