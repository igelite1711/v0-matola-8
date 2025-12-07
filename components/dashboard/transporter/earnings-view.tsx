"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Wallet, CreditCard, ArrowUpRight, Calendar } from "lucide-react"

export function EarningsView() {
  const [period, setPeriod] = useState("month")

  const stats = {
    totalEarnings: "MK 485,000",
    pendingPayouts: "MK 120,000",
    completedJobs: 12,
    avgPerJob: "MK 40,417",
  }

  const recentEarnings = [
    { id: "JOB-003", route: "Mzuzu → Lilongwe", amount: "MK 95,000", date: "Jan 10", status: "paid" },
    { id: "JOB-001", route: "Lilongwe → Blantyre", amount: "MK 85,000", date: "Jan 15", status: "pending" },
    { id: "JOB-002", route: "Blantyre → Zomba", amount: "MK 35,000", date: "Jan 17", status: "pending" },
  ]

  const payoutHistory = [
    { id: "PAY-001", amount: "MK 180,000", method: "Airtel Money", date: "Jan 5", status: "completed" },
    { id: "PAY-002", amount: "MK 220,000", method: "TNM Mpamba", date: "Dec 28", status: "completed" },
    { id: "PAY-003", amount: "MK 150,000", method: "Bank Transfer", date: "Dec 15", status: "completed" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Earnings</h2>
        <p className="text-muted-foreground">Track your income and request payouts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalEarnings}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-chart-3">
                  <ArrowUpRight className="h-3 w-3" />
                  +15% from last month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingPayouts}</p>
                <p className="mt-1 text-xs text-muted-foreground">Available for withdrawal</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                <Wallet className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.completedJobs}</p>
                <p className="mt-1 text-xs text-muted-foreground">This month</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <Calendar className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Per Job</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgPerJob}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-chart-3">
                  <ArrowUpRight className="h-3 w-3" />
                  +8% improvement
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <CreditCard className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-foreground">Ready to withdraw?</h3>
            <p className="text-sm text-muted-foreground">
              You have {stats.pendingPayouts} available for payout via mobile money or bank transfer.
            </p>
          </div>
          <Button>Request Payout</Button>
        </CardContent>
      </Card>

      {/* Tabs for Earnings and Payouts */}
      <Tabs defaultValue="earnings">
        <TabsList>
          <TabsTrigger value="earnings">Recent Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Job Earnings</CardTitle>
              <CardDescription>Earnings from completed deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEarnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{earning.id}</p>
                      <p className="text-sm text-muted-foreground">{earning.route}</p>
                      <p className="text-xs text-muted-foreground">{earning.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{earning.amount}</p>
                      <Badge
                        className={
                          earning.status === "paid" ? "bg-chart-3/20 text-chart-3" : "bg-chart-4/20 text-chart-4"
                        }
                      >
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your withdrawal history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{payout.id}</p>
                      <p className="text-sm text-muted-foreground">{payout.method}</p>
                      <p className="text-xs text-muted-foreground">{payout.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{payout.amount}</p>
                      <Badge className="bg-chart-3/20 text-chart-3">{payout.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
