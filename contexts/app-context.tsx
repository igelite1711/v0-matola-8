"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Shipment, Transporter, Bid } from "@/lib/types"
import { mockShipments, mockTransporters, mockBids } from "@/lib/mock-data"
import { getRecommendedLoads } from "@/lib/matching-engine"

export type UserRole = "shipper" | "transporter" | "broker" | "admin"

export interface AppUser {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  verified: boolean
  rating: number
  avatar?: string
  vehicleType?: string
  vehicleCapacity?: number
  isOnline?: boolean
  currentLocation?: { city: string; district: string; region: string }
}

export interface Notification {
  id: string
  type: "shipment" | "payment" | "message" | "system" | "load_offer"
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
  loadOffer?: {
    shipmentId: string
    matchScore: number
    isBackhaul: boolean
    expiresAt: Date
  }
}

export interface PendingLoadOffer {
  shipment: Shipment
  matchScore: number
  isBackhaul: boolean
  expiresAt: Date
}

interface AppContextType {
  // Auth state
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, pin: string, role?: UserRole) => Promise<boolean>
  register: (data: { name: string; phone: string; pin: string; role: UserRole }) => Promise<boolean>
  logout: () => void

  // Shipments
  shipments: Shipment[]
  userShipments: Shipment[]
  addShipment: (shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt">) => Promise<Shipment>
  updateShipment: (id: string, updates: Partial<Shipment>) => void
  getShipment: (id: string) => Shipment | undefined

  // Bids
  bids: Bid[]
  getBidsForShipment: (shipmentId: string) => Bid[]
  acceptBid: (bidId: string) => void
  rejectBid: (bidId: string) => void
  submitBid: (bid: Omit<Bid, "id" | "createdAt" | "status">) => void

  // Transporters
  transporters: Transporter[]

  // Notifications
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void

  // Toast/Alerts
  showToast: (message: string, type?: "success" | "error" | "info") => void
  toast: { message: string; type: "success" | "error" | "info" } | null
  clearToast: () => void

  isDriverOnline: boolean
  setDriverOnline: (online: boolean) => void
  driverCapacity: number // 0-100 percentage of available space
  setDriverCapacity: (capacity: number) => void

  pendingLoadOffer: PendingLoadOffer | null
  acceptLoadOffer: (shipmentId: string) => void
  declineLoadOffer: (shipmentId: string) => void
  recommendedLoads: Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mock users for demo
const mockUsers: Record<string, AppUser> = {
  shipper: {
    id: "sh1",
    name: "John Banda",
    phone: "0999123456",
    email: "john@example.com",
    role: "shipper",
    verified: true,
    rating: 4.8,
  },
  transporter: {
    id: "t1",
    name: "James Phiri",
    phone: "0888123456",
    role: "transporter",
    verified: true,
    rating: 4.9,
    vehicleType: "medium_truck",
    vehicleCapacity: 10000,
    isOnline: true,
    currentLocation: { city: "Lilongwe", district: "Lilongwe", region: "Central" },
  },
  broker: {
    id: "b1",
    name: "Mary Chirwa",
    phone: "0884123456",
    role: "broker",
    verified: true,
    rating: 4.7,
  },
  admin: {
    id: "a1",
    name: "Admin User",
    phone: "0991111111",
    role: "admin",
    verified: true,
    rating: 5.0,
  },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments)
  const [bids, setBids] = useState<Bid[]>(mockBids)
  const [transporters] = useState<Transporter[]>(mockTransporters)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      type: "shipment",
      title: "New Bid Received",
      message: "Grace Phiri has submitted a bid for your Lilongwe to Blantyre shipment",
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      link: "/dashboard/shipments/s1",
    },
    {
      id: "n2",
      type: "payment",
      title: "Payment Received",
      message: "MK 185,000 has been deposited to your escrow account",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      link: "/dashboard/payments",
    },
    {
      id: "n3",
      type: "system",
      title: "Verification Complete",
      message: "Your RTOA verification has been approved",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const [isDriverOnline, setIsDriverOnline] = useState(true)
  const [driverCapacity, setDriverCapacity] = useState(100) // 100% available
  const [pendingLoadOffer, setPendingLoadOffer] = useState<PendingLoadOffer | null>(null)
  const [recommendedLoads, setRecommendedLoads] = useState<
    Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }>
  >([])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("matola-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("matola-user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!user || user.role !== "transporter" || !isDriverOnline) {
      setRecommendedLoads([])
      return
    }

    // Create a mock transporter from user data
    const mockTransporter: Transporter = {
      id: user.id,
      role: "transporter",
      name: user.name,
      phone: user.phone,
      rating: user.rating,
      totalRatings: 50,
      verified: user.verified,
      verificationLevel: "rtoa",
      preferredLanguage: "en",
      createdAt: new Date(),
      vehicleType: (user.vehicleType as any) || "medium_truck",
      vehiclePlate: "BT 4567",
      vehicleCapacity: user.vehicleCapacity || 10000,
      currentLocation: user.currentLocation as any,
      isAvailable: isDriverOnline && driverCapacity > 0,
      completedTrips: 45,
      onTimeRate: 0.95,
      preferredRoutes: ["Lilongwe-Blantyre", "Lilongwe-Mzuzu"],
    }

    const recommendations = getRecommendedLoads(mockTransporter, shipments, 5)
    setRecommendedLoads(recommendations)
  }, [user, shipments, isDriverOnline, driverCapacity])

  useEffect(() => {
    if (!user || user.role !== "transporter" || !isDriverOnline || driverCapacity === 0) {
      return
    }

    // Simulate a new load offer every 30-60 seconds
    const offerInterval = setInterval(() => {
      if (pendingLoadOffer) return // Don't send new offers if one is pending

      const availableLoads = shipments.filter((s) => s.status === "posted")
      if (availableLoads.length === 0) return

      const randomLoad = availableLoads[Math.floor(Math.random() * availableLoads.length)]
      const isBackhaul = user.currentLocation?.city === randomLoad.destination.city
      const matchScore = 70 + Math.floor(Math.random() * 25) // 70-95%

      setPendingLoadOffer({
        shipment: randomLoad,
        matchScore,
        isBackhaul,
        expiresAt: new Date(Date.now() + 60000), // 60 seconds
      })

      // Add notification
      addNotification({
        type: "load_offer",
        title: "New Load Available!",
        message: `${randomLoad.origin.city} → ${randomLoad.destination.city} - MK ${randomLoad.price.toLocaleString()}`,
        link: "/dashboard/transporter",
        loadOffer: {
          shipmentId: randomLoad.id,
          matchScore,
          isBackhaul,
          expiresAt: new Date(Date.now() + 60000),
        },
      })
    }, 45000) // Check every 45 seconds

    return () => clearInterval(offerInterval)
  }, [user, isDriverOnline, driverCapacity, pendingLoadOffer, shipments])

  const login = async (phone: string, pin: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo, accept any 4-digit PIN and determine role from phone or param
    if (pin.length === 4) {
      const userRole = role || (phone.startsWith("088") ? "transporter" : "shipper")
      const mockUser = mockUsers[userRole]
      setUser({ ...mockUser, phone })
      localStorage.setItem("matola-user", JSON.stringify({ ...mockUser, phone }))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (data: { name: string; phone: string; pin: string; role: UserRole }): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      role: data.role,
      verified: false,
      rating: 0,
    }

    setUser(newUser)
    localStorage.setItem("matola-user", JSON.stringify(newUser))
    addNotification({
      type: "system",
      title: "Welcome to Matola!",
      message: "Your account has been created. Complete verification to unlock all features.",
      link: "/dashboard/verification",
    })
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("matola-user")
  }

  const userShipments = shipments.filter(
    (s) => s.shipperId === user?.id || (user?.role === "shipper" && s.shipperId.startsWith("sh")),
  )

  const addShipment = async (shipmentData: Omit<Shipment, "id" | "createdAt" | "updatedAt">): Promise<Shipment> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newShipment: Shipment = {
      ...shipmentData,
      id: `s${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setShipments((prev) => [newShipment, ...prev])
    addNotification({
      type: "shipment",
      title: "Shipment Posted",
      message: `Your shipment from ${shipmentData.origin.city} to ${shipmentData.destination.city} is now live`,
      link: `/dashboard/shipments/${newShipment.id}`,
    })

    return newShipment
  }

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s)))
  }

  const getShipment = (id: string) => shipments.find((s) => s.id === id)

  const getBidsForShipment = (shipmentId: string) => bids.filter((b) => b.shipmentId === shipmentId)

  const acceptBid = (bidId: string) => {
    const bid = bids.find((b) => b.id === bidId)
    if (!bid) return

    setBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? { ...b, status: "accepted" }
          : b.shipmentId === bid.shipmentId
            ? { ...b, status: "rejected" }
            : b,
      ),
    )

    updateShipment(bid.shipmentId, { status: "matched" })

    addNotification({
      type: "shipment",
      title: "Bid Accepted",
      message: `You accepted ${bid.transporterName}'s bid for MK ${bid.proposedPrice.toLocaleString()}`,
    })

    showToast("Bid accepted successfully!", "success")
  }

  const rejectBid = (bidId: string) => {
    setBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b)))
    showToast("Bid rejected", "info")
  }

  const submitBid = (bidData: Omit<Bid, "id" | "createdAt" | "status">) => {
    const newBid: Bid = {
      ...bidData,
      id: `b${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    }

    setBids((prev) => [...prev, newBid])
    showToast("Bid submitted successfully!", "success")
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      read: false,
      createdAt: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const clearToast = () => setToast(null)

  const setDriverOnline = (online: boolean) => {
    setIsDriverOnline(online)
    if (online) {
      showToast("You are now online and receiving load offers", "success")
    } else {
      showToast("You are now offline", "info")
      setPendingLoadOffer(null)
    }
  }

  const acceptLoadOffer = (shipmentId: string) => {
    if (!pendingLoadOffer || pendingLoadOffer.shipment.id !== shipmentId) return

    // Update shipment status
    updateShipment(shipmentId, { status: "matched" })

    addNotification({
      type: "shipment",
      title: "Load Accepted",
      message: `You've accepted the load from ${pendingLoadOffer.shipment.origin.city} to ${pendingLoadOffer.shipment.destination.city}`,
      link: "/dashboard/transporter/my-jobs",
    })

    setPendingLoadOffer(null)
  }

  const declineLoadOffer = (shipmentId: string) => {
    if (!pendingLoadOffer || pendingLoadOffer.shipment.id !== shipmentId) return
    setPendingLoadOffer(null)
    showToast("Load declined - you'll receive more offers soon", "info")
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        shipments,
        userShipments,
        addShipment,
        updateShipment,
        getShipment,
        bids,
        getBidsForShipment,
        acceptBid,
        rejectBid,
        submitBid,
        transporters,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        showToast,
        toast,
        clearToast,
        isDriverOnline,
        setDriverOnline,
        driverCapacity,
        setDriverCapacity,
        pendingLoadOffer,
        acceptLoadOffer,
        declineLoadOffer,
        recommendedLoads,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
