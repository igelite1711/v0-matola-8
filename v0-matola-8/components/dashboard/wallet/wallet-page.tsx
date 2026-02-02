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
  Shield,
  Lock,
  Unlock,
  TrendingUp,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/matching-engine"
import {
  getWallet,
  getUserTransactions,
  requestWithdrawal,
  addPaymentMethod,
  triggerMobileMoneyPush,
  getUserEscrows,
} from "@/lib/wallet-engine"
import { EscrowStatusCard } from "./escrow-status-card"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import type { WalletTransaction, PaymentMethod } from "@/lib/types"

export function WalletPage() {
  const { user, showToast, shipments } = useApp()
  const { language } = useLanguage()

  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod | "">("")
  const [withdrawPhone, setWithdrawPhone] = useState("")
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false)
  const [ussdPromptDialogOpen, setUssdPromptDialogOpen] = useState(false)
  const [ussdCode, setUssdCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [newMethodType, setNewMethodType] = useState<PaymentMethod | "">("")
  const [newMethodPhone, setNewMethodPhone] = useState("")

  // Get wallet data
  const wallet = user ? getWallet(user.id) : null
  const transactions = user ? getUserTransactions(user.id) : []
  const userEscrows = user ? getUserEscrows(user.id) : []

  // Mock wallet data for demo
  const balance = {
    available: wallet?.availableBalance || 485000,
    pending: wallet?.pendingBalance || 0,
    escrow: wallet?.escrowBalance || 365000,
    total: wallet?.totalEarned || 850000,
  }

  const mockEscrows =
    userEscrows.length > 0
      ? userEscrows
      : [
          {
            id: "esc1",
            shipmentId: "s1",
            amount: 185000,
            status: "held" as const,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            releaseConditions: ["Delivery confirmed by shipper", "No disputes within 24 hours"],
          },
          {
            id: "esc2",
            shipmentId: "s3",
            amount: 180000,
            status: "held" as const,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            releaseConditions: ["Delivery confirmed by shipper"],
          },
        ]

  const getShipmentRoute = (shipmentId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId)
    return shipment ? `${shipment.origin.city} → ${shipment.destination.city}` : "Unknown Route"
  }

  const paymentMethods = wallet?.paymentMethods || [
    {
      id: "pm1",
      type: "airtel_money" as const,
      phoneNumber: "0888345678",
      isPrimary: true,
      verified: true,
      addedAt: new Date(),
    },
    {
      id: "pm2",
      type: "tnm_mpamba" as const,
      phoneNumber: "0884567890",
      isPrimary: false,
      verified: true,
      addedAt: new Date(),
    },
  ]

  const mockTransactions: WalletTransaction[] =
    transactions.length > 0
      ? transactions
      : [
          {
            id: "TXN-001",
            userId: user?.id || "",
            type: "escrow_release",
            description: "Earnings from shipment #S1",
            amount: 175750,
            status: "completed",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            method: "airtel_money",
            reference: "Malawi Grains Ltd → Blantyre",
            metadata: { grossAmount: 185000, netAmount: 175750, commissionRate: 0.05 },
          },
          {
            id: "TXN-002",
            userId: user?.id || "",
            type: "payout",
            description: "Withdrawal to Airtel Money",
            amount: 150000,
            status: "completed",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            method: "airtel_money",
            reference: "0888345678",
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000),
          },
          {
            id: "TXN-003",
            userId: user?.id || "",
            type: "escrow_hold",
            description: "Payment held for shipment #S3",
            amount: 320000,
            status: "held",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            method: "bank_transfer",
            reference: "Released on delivery confirmation",
            metadata: { grossAmount: 320000, netAmount: 304000, commissionRate: 0.05 },
          },
        ]

  // ... existing code for handlers ...
  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawMethod || !withdrawPhone) {
      showToast(language === "en" ? "Please fill all fields" : "Lowetsani zambiri zonse", "error")
      return
    }

    const amount = Number.parseInt(withdrawAmount)
    if (amount > balance.available) {
      showToast(language === "en" ? "Insufficient balance" : "Ndalama sizikwana", "error")
      return
    }

    if (amount < 1000) {
      showToast(language === "en" ? "Minimum withdrawal is MK 1,000" : "Zochepa ndizokutulutsa ndi MK 1,000", "error")
      return
    }

    setIsProcessing(true)

    if (withdrawMethod === "airtel_money" || withdrawMethod === "tnm_mpamba") {
      const { ussdPrompt } = triggerMobileMoneyPush(withdrawMethod, withdrawPhone, amount, `MATOLA-${Date.now()}`)
      setUssdCode(ussdPrompt)
      setUssdPromptDialogOpen(true)
    }

    const result = requestWithdrawal(user?.id || "", amount, withdrawMethod as PaymentMethod, withdrawPhone)

    setIsProcessing(false)

    if (result.success) {
      showToast(
        language === "en"
          ? `Withdrawal of ${formatPrice(amount)} initiated. Check your ${withdrawMethod === "airtel_money" ? "Airtel Money" : "TNM Mpamba"} for confirmation.`
          : `Kutulutsa ${formatPrice(amount)} kwayamba. Yang'anani ${withdrawMethod === "airtel_money" ? "Airtel Money" : "TNM Mpamba"} kuti mutsimikize.`,
        "success",
      )
      setWithdrawDialogOpen(false)
      setWithdrawAmount("")
      setWithdrawMethod("")
      setWithdrawPhone("")
    } else {
      showToast(result.error || "Withdrawal failed", "error")
    }
  }

  const handleAddPaymentMethod = () => {
    if (!newMethodType || !newMethodPhone) {
      showToast(language === "en" ? "Please fill all fields" : "Lowetsani zambiri zonse", "error")
      return
    }

    addPaymentMethod(user?.id || "", {
      type: newMethodType,
      phoneNumber: newMethodPhone,
      isPrimary: false,
    })

    showToast(
      language === "en"
        ? "Payment method added. Verification SMS sent."
        : "Njira yolipirira yawonjezedwa. SMS yotsimikizira yatumizidwa.",
      "success",
    )
    setAddMethodDialogOpen(false)
    setNewMethodType("")
    setNewMethodPhone("")
  }

  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    failed: <AlertCircle className="h-4 w-4 text-destructive" />,
    held: <Lock className="h-4 w-4 text-blue-500" />,
    released: <Unlock className="h-4 w-4 text-green-500" />,
  }

  const typeIcons = {
    payment: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
    payout: <ArrowUpRight className="h-4 w-4 text-primary" />,
    refund: <ArrowDownLeft className="h-4 w-4 text-blue-500" />,
    escrow_hold: <Lock className="h-4 w-4 text-blue-500" />,
    escrow_release: <Unlock className="h-4 w-4 text-green-500" />,
    commission: <TrendingUp className="h-4 w-4 text-amber-500" />,
    tip: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  }

  const methodIcons = {
    mobile_money: <Smartphone className="h-4 w-4" />,
    airtel_money: <Smartphone className="h-4 w-4 text-red-500" />,
    tnm_mpamba: <Smartphone className="h-4 w-4 text-blue-500" />,
    cash: <Wallet className="h-4 w-4" />,
    bank_transfer: <Building2 className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "en" ? "Wallet & Payments" : "Wallet ndi Malipiro"}
        </h2>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Manage your earnings with secure escrow protection"
            : "Yanganirani ndalama zanu ndi chitetezo cha escrow"}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Available Balance */}
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
                  {language === "en" ? "Withdraw" : "Tulutsa"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "en" ? "Withdraw Funds" : "Tulutsa Ndalama"}</DialogTitle>
                  <DialogDescription>
                    {language === "en"
                      ? "Funds will be sent to your mobile money account instantly"
                      : "Ndalama zitumizidwa ku akaunti yanu ya mobile money mwachangu"}
                  </DialogDescription>
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
                      {language === "en" ? "Available" : "Zopezeka"}: {formatPrice(balance.available)} •
                      {language === "en" ? " Min" : " Zochepa"}: MK 1,000
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Withdrawal Method" : "Njira Yotulutsa"}</Label>
                    <Select value={withdrawMethod} onValueChange={(v) => setWithdrawMethod(v as PaymentMethod)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select method" : "Sankhani njira"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airtel_money">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-red-500" />
                            Airtel Money
                          </div>
                        </SelectItem>
                        <SelectItem value="tnm_mpamba">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-500" />
                            TNM Mpamba
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {withdrawMethod && (
                    <div className="space-y-2">
                      <Label>
                        {withdrawMethod === "bank_transfer"
                          ? language === "en"
                            ? "Account Number"
                            : "Nambala ya Akaunti"
                          : language === "en"
                            ? "Phone Number"
                            : "Nambala ya Foni"}
                      </Label>
                      <Input
                        placeholder={withdrawMethod === "bank_transfer" ? "Enter account number" : "e.g., 0888123456"}
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                      />
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || !withdrawMethod || !withdrawPhone || isProcessing}
                  >
                    {isProcessing
                      ? language === "en"
                        ? "Processing..."
                        : "Akugwira ntchito..."
                      : language === "en"
                        ? "Confirm Withdrawal"
                        : "Tsimikizani Kutulutsa"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Escrow Balance */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {language === "en" ? "In Escrow" : "Mu Escrow"}
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-400">{formatPrice(balance.escrow)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Lock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {language === "en" ? "Released automatically on delivery confirmation" : "Zimatulutsidwa katundu akafika"}
            </p>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Pending Withdrawal" : "Zikudikira Kutulutsa"}
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-400">{formatPrice(balance.pending)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {language === "en" ? "Processing withdrawals" : "Zikugwiridwa ntchito"}
            </p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "en" ? "Total Earned" : "Zonse Zopeza"}</p>
                <p className="mt-1 text-3xl font-bold text-green-400">{formatPrice(balance.total)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {language === "en" ? "Lifetime earnings" : "Ndalama zonse moyo wanu"}
            </p>
          </CardContent>
        </Card>
      </div>

      {mockEscrows.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{language === "en" ? "Active Escrows" : "Escrow Zikugwira Ntchito"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {mockEscrows.map((escrow) => (
              <EscrowStatusCard key={escrow.id} escrow={escrow} shipmentRoute={getShipmentRoute(escrow.shipmentId)} />
            ))}
          </div>
        </div>
      )}

      {/* Escrow Explainer */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              {language === "en" ? "Secure Escrow Protection" : "Chitetezo cha Escrow Chotsimikizika"}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "en"
                ? "Shipper payments are held securely in escrow. Funds are automatically released to your wallet once delivery is confirmed. This protects both parties and ensures you always get paid."
                : "Malipiro a shipper amasungidwa mwa chitetezo mu escrow. Ndalama zimatulutsidwa ku wallet yanu katundu akatsimikiziridwa kufika. Izi zimateteza mbali zonse ndipo zimawonetsetsa kuti mumalandila nthawi zonse."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Transactions Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="transactions">{language === "en" ? "Transactions" : "Malonda"}</TabsTrigger>
          <TabsTrigger value="methods">{language === "en" ? "Payment Methods" : "Njira Zolipirira"}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {mockTransactions.map((tx) => (
            <Card key={tx.id} className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      {typeIcons[tx.type]}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tx.reference}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === "payout" ? "text-primary" : "text-green-500"}`}>
                      {tx.type === "payout" ? "-" : "+"}
                      {formatPrice(tx.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {statusIcons[tx.status]}
                      <span className="text-xs text-muted-foreground capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
                {tx.metadata && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{language === "en" ? "Gross Amount" : "Ndalama Zonse"}</span>
                      <span>{formatPrice(tx.metadata.grossAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === "en" ? "Platform Fee (5%)" : "Ndalama za Platform (5%)"}</span>
                      <span className="text-amber-500">
                        -{formatPrice(tx.metadata.grossAmount - tx.metadata.netAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-medium text-foreground">
                      <span>{language === "en" ? "Net Earnings" : "Ndalama Zenizeni"}</span>
                      <span className="text-green-500">{formatPrice(tx.metadata.netAmount)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">
                {language === "en" ? "Your Payment Methods" : "Njira Zanu Zolipirira"}
              </CardTitle>
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
                    <DialogDescription>
                      {language === "en"
                        ? "Add your mobile money number for withdrawals"
                        : "Onjezani nambala yanu ya mobile money kuti mutulutse ndalama"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Method Type" : "Mtundu wa Njira"}</Label>
                      <Select value={newMethodType} onValueChange={(v) => setNewMethodType(v as PaymentMethod)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select type" : "Sankhani"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airtel_money">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-red-500" />
                              Airtel Money
                            </div>
                          </SelectItem>
                          <SelectItem value="tnm_mpamba">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-blue-500" />
                              TNM Mpamba
                            </div>
                          </SelectItem>
                          <SelectItem value="bank_transfer">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Bank Account
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Phone Number" : "Nambala ya Foni"}</Label>
                      <Input
                        placeholder="e.g., 0888123456"
                        value={newMethodPhone}
                        onChange={(e) => setNewMethodPhone(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddPaymentMethod}>
                      {language === "en" ? "Add Payment Method" : "Onjezani Njira"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    {methodIcons[method.type]}
                    <div>
                      <p className="font-medium capitalize">{method.type.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">{method.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isPrimary && <Badge variant="secondary">{language === "en" ? "Primary" : "Yoyamba"}</Badge>}
                    {method.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* USSD Prompt Dialog */}
      <Dialog open={ussdPromptDialogOpen} onOpenChange={setUssdPromptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "en" ? "Complete Payment" : "Maliza Kulipira"}</DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "A USSD prompt has been sent to your phone. Enter your PIN to confirm."
                : "USSD yatumizidwa ku foni yanu. Lowetsani PIN yanu kuti mutsimikize."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Phone className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="font-mono text-lg">{ussdCode}</p>
            <p className="text-sm text-muted-foreground text-center">
              {language === "en"
                ? "Check your phone for the payment prompt"
                : "Yang'anani foni yanu kuti mulandire uthenga"}
            </p>
          </div>
          <Button onClick={() => setUssdPromptDialogOpen(false)}>{language === "en" ? "Done" : "Ndatheka"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
