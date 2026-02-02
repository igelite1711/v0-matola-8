"use client"

import { useState } from "react"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Building2,
  Plus,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/matching-engine"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"

interface Transaction {
  id: string
  type: "payment" | "payout" | "refund" | "escrow"
  description: string
  amount: number
  status: "completed" | "pending" | "failed"
  date: Date
  method: "mobile_money" | "cash" | "bank_transfer"
  reference?: string
}

export function PaymentsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [withdrawPhone, setWithdrawPhone] = useState("")
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false)

  const { showNotification } = useApp()
  const { language } = useLanguage()

  const balance = {
    available: 485000,
    pending: 365000,
    total: 850000,
  }

  const [transactions, setTransactions] = useState([
    {
      id: "TXN-001",
      type: "payment" as const,
      description: "Payment for shipment #S1",
      amount: 185000,
      status: "completed" as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      method: "mobile_money" as const,
      reference: "Malawi Grains Ltd",
    },
    {
      id: "TXN-002",
      type: "payout" as const,
      description: "Earnings withdrawal",
      amount: 150000,
      status: "completed" as const,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      method: "mobile_money" as const,
      reference: "Airtel Money - 0888345678",
    },
    {
      id: "TXN-003",
      type: "escrow" as const,
      description: "Held for shipment #S3",
      amount: 320000,
      status: "pending" as const,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      method: "bank_transfer" as const,
      reference: "Released on delivery",
    },
    {
      id: "TXN-004",
      type: "payment" as const,
      description: "Payment for shipment #S2",
      amount: 45000,
      status: "pending" as const,
      date: new Date(),
      method: "cash" as const,
      reference: "BuildMart Hardware",
    },
  ])

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawMethod || !withdrawPhone) {
      showNotification(language === "en" ? "Please fill all fields" : "Lowetsani zambiri zonse", "error")
      return
    }

    const amount = Number.parseInt(withdrawAmount)
    if (amount > balance.available) {
      showNotification(language === "en" ? "Insufficient balance" : "Ndalama sizikwana", "error")
      return
    }

    const newTransaction = {
      id: `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: "payout" as const,
      description: language === "en" ? "Withdrawal request" : "Kupempha kutulutsa",
      amount: amount,
      status: "pending" as const,
      date: new Date(),
      method: "mobile_money" as const,
      reference: `${withdrawMethod === "airtel" ? "Airtel Money" : withdrawMethod === "tnm" ? "TNM Mpamba" : "Bank"} - ${withdrawPhone}`,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    showNotification(
      language === "en"
        ? `Withdrawal of MK ${amount.toLocaleString()} initiated. You will receive it within 24 hours.`
        : `Kutulutsa MK ${amount.toLocaleString()} kwayamba. Mudzalandira mkati mwa maola 24.`,
      "success",
    )
    setWithdrawDialogOpen(false)
    setWithdrawAmount("")
    setWithdrawMethod("")
    setWithdrawPhone("")
  }

  const handleAddPaymentMethod = () => {
    showNotification(
      language === "en" ? "Payment method added successfully" : "Njira yolipirira yawonjezedwa bwino",
      "success",
    )
    setAddMethodDialogOpen(false)
  }

  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    failed: <AlertCircle className="h-4 w-4 text-destructive" />,
  }

  const typeIcons = {
    payment: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
    payout: <ArrowUpRight className="h-4 w-4 text-primary" />,
    refund: <ArrowDownLeft className="h-4 w-4 text-blue-500" />,
    escrow: <Clock className="h-4 w-4 text-yellow-500" />,
  }

  const methodIcons = {
    mobile_money: <Smartphone className="h-4 w-4" />,
    cash: <Wallet className="h-4 w-4" />,
    bank_transfer: <Building2 className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{language === "en" ? "Payments" : "Malipiro"}</h2>
        <p className="text-muted-foreground">
          {language === "en" ? "Manage your earnings and transactions" : "Yanganirani ndalama zanu"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Available Balance" : "Ndalama Zopezeka"}
                </p>
                <p className="mt-1 text-3xl font-bold text-primary">{formatPrice(balance.available)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {language === "en" ? "Withdraw Funds" : "Tulutsa Ndalama"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "en" ? "Withdraw Funds" : "Tulutsa Ndalama"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Amount (MWK)" : "Ndalama (MWK)"}</Label>
                    <Input
                      type="number"
                      placeholder={language === "en" ? "Enter amount" : "Lowetsani ndalama"}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Available" : "Zopezeka"}: {formatPrice(balance.available)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Withdrawal Method" : "Njira Yotulutsa"}</Label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select method" : "Sankhani njira"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airtel">Airtel Money</SelectItem>
                        <SelectItem value="tnm">TNM Mpamba</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {withdrawMethod && (
                    <div className="space-y-2">
                      <Label>
                        {withdrawMethod === "bank"
                          ? language === "en"
                            ? "Account Number"
                            : "Nambala ya Akaunti"
                          : language === "en"
                            ? "Phone Number"
                            : "Nambala ya Foni"}
                      </Label>
                      <Input
                        placeholder={withdrawMethod === "bank" ? "Enter account number" : "e.g., 0888123456"}
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                      />
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || !withdrawMethod || !withdrawPhone}
                  >
                    {language === "en" ? "Confirm Withdrawal" : "Tsimikizani Kutulutsa"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Pending (Escrow)" : "Zikudikira (Escrow)"}
                </p>
                <p className="mt-1 text-3xl font-bold">{formatPrice(balance.pending)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {language === "en" ? "Released after delivery confirmation" : "Zimatulutsidwa katundu akafika"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "en" ? "Total Earned" : "Zonse Zopeza"}</p>
                <p className="mt-1 text-3xl font-bold">{formatPrice(balance.total)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <ArrowDownLeft className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {language === "en" ? "Lifetime earnings" : "Ndalama zonse"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{language === "en" ? "Payment Methods" : "Njira Zolipirira"}</CardTitle>
          <Dialog open={addMethodDialogOpen} onOpenChange={setAddMethodDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {language === "en" ? "Add Method" : "Onjezani"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === "en" ? "Add Payment Method" : "Onjezani Njira Yolipirira"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Method Type" : "Mtundu wa Njira"}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "Select type" : "Sankhani"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                      <SelectItem value="tnm">TNM Mpamba</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Phone/Account Number" : "Nambala"}</Label>
                  <Input placeholder="e.g., 0888123456" />
                </div>
                <Button className="w-full" onClick={handleAddPaymentMethod}>
                  {language === "en" ? "Add Payment Method" : "Onjezani Njira"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <Smartphone className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Airtel Money</p>
                  <p className="text-sm text-muted-foreground">0888 345 678</p>
                </div>
              </div>
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                {language === "en" ? "Primary" : "Yoyamba"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">TNM Mpamba</p>
                  <p className="text-sm text-muted-foreground">0884 567 890</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  showNotification(
                    language === "en" ? "Set as primary payment method" : "Yasinthidwa kukhala yoyamba",
                    "success",
                  )
                }
              >
                {language === "en" ? "Set Primary" : "Ikani Yoyamba"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{language === "en" ? "Transaction History" : "Mbiri ya Malipiro"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">{language === "en" ? "All" : "Onse"}</TabsTrigger>
              <TabsTrigger value="payments">{language === "en" ? "Payments" : "Malipiro"}</TabsTrigger>
              <TabsTrigger value="payouts">{language === "en" ? "Payouts" : "Zotulutsa"}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {typeIcons[txn.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{txn.description}</p>
                        {statusIcons[txn.status]}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {methodIcons[txn.method]}
                        <span>{txn.reference}</span>
                        <span>•</span>
                        <span>{txn.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      txn.type === "payout"
                        ? "text-primary"
                        : txn.type === "payment" || txn.type === "refund"
                          ? "text-green-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {txn.type === "payout" ? "-" : "+"}
                    {formatPrice(txn.amount)}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="payments" className="space-y-3">
              {transactions
                .filter((t) => t.type === "payment")
                .map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {typeIcons[txn.type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{txn.description}</p>
                          {statusIcons[txn.status]}
                        </div>
                        <p className="text-sm text-muted-foreground">{txn.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-500">+{formatPrice(txn.amount)}</p>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="payouts" className="space-y-3">
              {transactions
                .filter((t) => t.type === "payout")
                .map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {typeIcons[txn.type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{txn.description}</p>
                          {statusIcons[txn.status]}
                        </div>
                        <p className="text-sm text-muted-foreground">{txn.reference}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">-{formatPrice(txn.amount)}</p>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
