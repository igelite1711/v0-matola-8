// Wallet and Escrow Engine for Matola Platform
import type { Wallet, WalletTransaction, EscrowHold, PaymentMethod, PaymentMethodConfig } from "./types"
import { PLATFORM_COMMISSION_RATE } from "./pricing-engine"
import { invariantEngine } from "./safety/invariant-engine"

// Mock wallet data store
const wallets: Map<string, Wallet> = new Map()
const transactions: WalletTransaction[] = []
const escrowHolds: EscrowHold[] = []

// Initialize wallet for user
export function initializeWallet(userId: string): Wallet {
  const existingWallet = wallets.get(userId)
  if (existingWallet) return existingWallet

  const wallet: Wallet = {
    userId,
    availableBalance: 0,
    pendingBalance: 0,
    escrowBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    paymentMethods: [],
    lastUpdated: new Date(),
  }
  wallets.set(userId, wallet)
  return wallet
}

// Get wallet balance
export function getWallet(userId: string): Wallet {
  return wallets.get(userId) || initializeWallet(userId)
}

// Add payment method
export function addPaymentMethod(
  userId: string,
  method: Omit<PaymentMethodConfig, "id" | "addedAt" | "verified">,
): PaymentMethodConfig {
  const wallet = getWallet(userId)

  const newMethod: PaymentMethodConfig = {
    ...method,
    id: `pm-${Date.now()}`,
    verified: false,
    addedAt: new Date(),
  }

  // Set as primary if it's the first method
  if (wallet.paymentMethods.length === 0) {
    newMethod.isPrimary = true
  }

  wallet.paymentMethods.push(newMethod)
  wallet.lastUpdated = new Date()

  return newMethod
}

// Create escrow hold for shipment payment
export async function createEscrowHold(
  shipmentId: string,
  shipperId: string,
  transporterId: string,
  grossAmount: number,
  vehicleType: string = "medium_truck", // Default for safety if not provided
  paymentMethod: 'cash' | 'digital' = 'digital'
): Promise<EscrowHold> {
  const shipperWallet = getWallet(shipperId)

  // Snapshots for rollback
  const walletSnapshots = new Map<string, string>()
  const storeSnapshot = () => {
    wallets.forEach((v, k) => walletSnapshots.set(k, JSON.stringify(v)))
  }
  const restoreSnapshot = () => {
    walletSnapshots.forEach((v, k) => wallets.set(k, JSON.parse(v)))
  }

  return await invariantEngine.execute(
    ["INV-ESCROW-SOLVENCY", "INV-PRICE-MIN-TRUCK"],
    {
      method: paymentMethod,
      availableBalance: shipperWallet.availableBalance,
      grossPrice: grossAmount,
      cashVerified: false, // Default to false for new holds
      vehicleType,
      price: grossAmount
    },
    async () => {
      storeSnapshot()
      try {
        const platformFee = Math.round(grossAmount * PLATFORM_COMMISSION_RATE)
        const netAmount = grossAmount - platformFee

        const escrow: EscrowHold = {
          id: `escrow-${shipmentId}`,
          shipmentId,
          shipperId,
          transporterId,
          grossAmount,
          platformFee,
          netAmount,
          status: "held",
          heldAt: new Date(),
          releaseCondition: "delivery_confirmed",
        }

        escrowHolds.push(escrow)

        // Deduct from shipper wallet
        shipperWallet.escrowBalance += grossAmount
        shipperWallet.lastUpdated = new Date()

        // Record transaction
        recordTransaction({
          userId: shipperId,
          type: "escrow_hold",
          amount: grossAmount,
          status: "completed",
          shipmentId,
          method: paymentMethod === 'digital' ? "airtel_money" : "cash",
          reference: `Escrow for shipment ${shipmentId}`,
          description: `Payment held in escrow until delivery confirmation`,
          metadata: {
            escrowId: escrow.id,
            grossAmount,
            netAmount,
            commissionRate: PLATFORM_COMMISSION_RATE,
          },
        })

        return escrow
      } catch (error) {
        restoreSnapshot()
        throw error
      }
    }
  )
}

// Release escrow on delivery confirmation
export async function releaseEscrow(
  shipmentId: string,
  actualPrice?: number,
  exceptionReason?: string
): Promise<{
  success: boolean
  transaction?: WalletTransaction
  error?: string
}> {
  const escrow = escrowHolds.find((e) => e.shipmentId === shipmentId && e.status === "held")

  if (!escrow) {
    return { success: false, error: "No held escrow found for this shipment" }
  }

  // Snapshots for rollback
  const walletSnapshots = new Map<string, string>()
  const storeSnapshot = () => {
    wallets.forEach((v, k) => walletSnapshots.set(k, JSON.stringify(v)))
  }
  const restoreSnapshot = () => {
    walletSnapshots.forEach((v, k) => wallets.set(k, JSON.parse(v)))
  }

  try {
    return await invariantEngine.execute(
      ["INV-PRICE-BIND", "INV-ESCROW-RELEASE"],
      {
        isAccepted: true,
        oldPrice: escrow.grossAmount,
        newPrice: actualPrice ?? escrow.grossAmount,
        hasException: !!exceptionReason,
        shipmentStatus: escrow.status === 'held' ? 'delivered' : 'unknown', // Simplified check
        isConfirmedByShipper: true, // Assuming call only happens after confirmation
        paymentStatus: "released"
      },
      async () => {
        storeSnapshot()
        try {
          // Update escrow status
          escrow.status = "released"
          escrow.releasedAt = new Date()

          const finalPrice = actualPrice ?? escrow.grossAmount
          const platformFee = Math.round(finalPrice * PLATFORM_COMMISSION_RATE)
          const netAmount = finalPrice - platformFee

          // Update shipper wallet - remove from escrow
          const shipperWallet = getWallet(escrow.shipperId)
          shipperWallet.escrowBalance -= escrow.grossAmount
          shipperWallet.lastUpdated = new Date()

          // Update transporter wallet - add net earnings
          const transporterWallet = getWallet(escrow.transporterId)
          transporterWallet.availableBalance += netAmount
          transporterWallet.totalEarned += netAmount
          transporterWallet.lastUpdated = new Date()

          // Record escrow release transaction
          const transaction = recordTransaction({
            userId: escrow.transporterId,
            type: "escrow_release",
            amount: escrow.netAmount,
            status: "completed",
            shipmentId,
            method: "airtel_money",
            reference: `Earnings from shipment ${shipmentId}`,
            description: `Payment released after delivery confirmation`,
            metadata: {
              escrowId: escrow.id,
              grossAmount: escrow.grossAmount,
              netAmount: escrow.netAmount,
              commissionRate: PLATFORM_COMMISSION_RATE,
            },
          })

          // Record platform commission
          recordTransaction({
            userId: "platform",
            type: "commission",
            amount: escrow.platformFee,
            status: "completed",
            shipmentId,
            method: "bank_transfer",
            reference: `Commission from shipment ${shipmentId}`,
            description: `Platform commission (${PLATFORM_COMMISSION_RATE * 100}%)`,
            metadata: {
              escrowId: escrow.id,
              commissionRate: PLATFORM_COMMISSION_RATE,
            },
          })

          return { success: true, transaction }
        } catch (error) {
          restoreSnapshot()
          throw error
        }
      }
    )
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Internal error" }
  }
}

// Process withdrawal request
export function requestWithdrawal(
  userId: string,
  amount: number,
  method: PaymentMethod,
  destination: string,
): { success: boolean; transaction?: WalletTransaction; error?: string } {
  const wallet = getWallet(userId)

  if (amount > wallet.availableBalance) {
    return { success: false, error: "Insufficient balance" }
  }

  if (amount < 1000) {
    return { success: false, error: "Minimum withdrawal is MK 1,000" }
  }

  // Deduct from available balance, add to pending
  wallet.availableBalance -= amount
  wallet.pendingBalance += amount
  wallet.lastUpdated = new Date()

  const transaction = recordTransaction({
    userId,
    type: "payout",
    amount,
    status: "pending",
    method,
    reference: `${method === "airtel_money" ? "Airtel Money" : method === "tnm_mpamba" ? "TNM Mpamba" : "Bank"} - ${destination}`,
    description: "Withdrawal request",
  })

  // Simulate async processing
  setTimeout(() => {
    completeWithdrawal(transaction.id)
  }, 3000)

  return { success: true, transaction }
}

// Complete withdrawal (simulate mobile money push)
function completeWithdrawal(transactionId: string): void {
  const transaction = transactions.find((t) => t.id === transactionId)
  if (!transaction) return

  const wallet = getWallet(transaction.userId)

  // Move from pending to withdrawn
  wallet.pendingBalance -= transaction.amount
  wallet.totalWithdrawn += transaction.amount
  wallet.lastUpdated = new Date()

  // Update transaction status
  transaction.status = "completed"
  transaction.completedAt = new Date()
}

// Record a transaction
function recordTransaction(data: Omit<WalletTransaction, "id" | "createdAt">): WalletTransaction {
  const transaction: WalletTransaction = {
    ...data,
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date(),
  }
  transactions.push(transaction)
  return transaction
}

// Get user transactions
export function getUserTransactions(userId: string, limit = 20): WalletTransaction[] {
  return transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}

// Get escrow for shipment
export function getEscrowForShipment(shipmentId: string): EscrowHold | undefined {
  return escrowHolds.find((e) => e.shipmentId === shipmentId)
}

export function getUserEscrows(userId: string): EscrowHold[] {
  return escrowHolds.filter((e) => (e.shipperId === userId || e.transporterId === userId) && e.status === "held")
}

// Simulate mobile money USSD push
export function triggerMobileMoneyPush(
  method: "airtel_money" | "tnm_mpamba",
  phoneNumber: string,
  amount: number,
  reference: string,
): { success: boolean; ussdPrompt: string } {
  // In real implementation, this would call Airtel/TNM API
  const ussdPrompt = method === "airtel_money" ? `*394*${amount}*${reference}#` : `*384*${amount}*${reference}#`

  return {
    success: true,
    ussdPrompt,
  }
}
