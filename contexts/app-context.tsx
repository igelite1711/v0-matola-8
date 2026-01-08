"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Shipment, Transporter, Bid } from "@/lib/types"
import { getRecommendedLoads } from "@/lib/matching-engine"
import { api, setTokens, clearTokens, getAccessToken } from "@/lib/api/client"

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
  preferredLanguage?: "en" | "ny"
  verificationLevel?: string
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
  logout: () => Promise<void>

  // Shipments
  shipments: Shipment[]
  userShipments: Shipment[]
  addShipment: (shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt">) => Promise<Shipment>
  updateShipment: (id: string, updates: Partial<Shipment>) => Promise<void>
  getShipment: (id: string) => Shipment | undefined
  refreshShipments: () => Promise<void>

  // Bids
  bids: Bid[]
  getBidsForShipment: (shipmentId: string) => Bid[]
  acceptBid: (bidId: string) => Promise<void>
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
  driverCapacity: number
  setDriverCapacity: (capacity: number) => void

  pendingLoadOffer: PendingLoadOffer | null
  acceptLoadOffer: (shipmentId: string) => Promise<void>
  declineLoadOffer: (shipmentId: string) => void
  recommendedLoads: Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [transporters] = useState<Transporter[]>([]) // Would fetch from API if needed
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const [isDriverOnline, setIsDriverOnline] = useState(true)
  const [driverCapacity, setDriverCapacity] = useState(100)
  const [pendingLoadOffer, setPendingLoadOffer] = useState<PendingLoadOffer | null>(null)
  const [recommendedLoads, setRecommendedLoads] = useState<
    Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }>
  >([])

  // Verify token and load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getAccessToken()
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await api.verify()
        if (response.success && response.user) {
          setUser({
            id: response.user.id,
            name: response.user.name,
            phone: response.user.phone,
            email: response.user.email,
            role: response.user.role,
            verified: response.user.verified,
            rating: response.user.rating || 0,
            preferredLanguage: response.user.preferredLanguage || "en",
            verificationLevel: response.user.verificationLevel,
            vehicleType: response.user.transporterProfile?.vehicleType,
            vehicleCapacity: response.user.transporterProfile?.vehicleCapacity,
          })
        }
      } catch (error) {
        // Client-side error logging
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to verify token:", error)
      }
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Load shipments when user is authenticated
  useEffect(() => {
    if (user) {
      refreshShipments()
    }
  }, [user])

  // Update recommended loads for transporters
  useEffect(() => {
    if (!user || user.role !== "transporter" || !isDriverOnline) {
      setRecommendedLoads([])
      return
    }

    // Use matching engine with available shipments
    const availableShipments = shipments.filter((s) => s.status === "posted")
    if (availableShipments.length === 0) {
      setRecommendedLoads([])
      return
    }

    // Create transporter object for matching
    const transporter: Transporter = {
      id: user.id,
      role: "transporter",
      name: user.name,
      phone: user.phone,
      rating: user.rating,
      totalRatings: 50,
      verified: user.verified,
      verificationLevel: (user.verificationLevel as any) || "phone",
      preferredLanguage: user.preferredLanguage || "en",
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

    const recommendations = getRecommendedLoads(transporter, availableShipments, 5)
    setRecommendedLoads(recommendations)
  }, [user, shipments, isDriverOnline, driverCapacity])

  const refreshShipments = async () => {
    if (!user) return

    try {
      const fetchedShipments = await api.getShipments()
      // Transform API response to match Shipment type
      const transformed = fetchedShipments.map((s: any) => ({
        id: s.id,
        shipperId: s.shipperId,
        shipperName: s.shipper?.name || "Unknown",
        origin: {
          city: s.originCity,
          district: s.originDistrict,
          region: s.originRegion,
          coordinates: s.originLat && s.originLng ? { lat: s.originLat, lng: s.originLng } : undefined,
          landmark: s.originLandmark,
          admarc: s.originAdmarc,
        },
        destination: {
          city: s.destinationCity,
          district: s.destinationDistrict,
          region: s.destinationRegion,
          coordinates:
            s.destinationLat && s.destinationLng
              ? { lat: s.destinationLat, lng: s.destinationLng }
              : undefined,
          landmark: s.destinationLandmark,
          admarc: s.destinationAdmarc,
        },
        cargoType: s.cargoType,
        cargoDescription: s.cargoDescription,
        cargoDescriptionNy: s.cargoDescriptionNy,
        weight: s.weight,
        dimensions:
          s.length && s.width && s.height
            ? { length: s.length, width: s.width, height: s.height }
            : undefined,
        requiredVehicleType: s.requiredVehicleType,
        pickupDate: new Date(s.pickupDate),
        pickupTimeWindow: s.pickupTimeWindow,
        deliveryDate: s.deliveryDate ? new Date(s.deliveryDate) : undefined,
        price: s.price,
        currency: s.currency || "MWK",
        paymentMethod: s.paymentMethod,
        status: s.status,
        isBackhaul: s.isBackhaul,
        backhaulDiscount: s.backhaulDiscount,
        specialInstructions: s.specialInstructions,
        checkpoints: s.checkpoints || [],
        borderCrossing: s.borderCrossingRequired
          ? {
              required: true,
              borderPost: s.borderPost || "",
              estimatedClearanceHours: s.estimatedClearanceHours || 0,
            }
          : undefined,
        seasonalCategory: s.seasonalCategory,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      })) as Shipment[]

      setShipments(transformed)

      // Extract bids from matches
      const allBids: Bid[] = []
      fetchedShipments.forEach((s: any) => {
        if (s.bids) {
          s.bids.forEach((bid: any) => {
            allBids.push({
              id: bid.id,
              shipmentId: bid.shipmentId,
              transporterId: bid.transporterId,
              transporterName: bid.transporter?.name || "Unknown",
              transporterRating: bid.transporter?.rating || 0,
              proposedPrice: bid.proposedPrice,
              message: bid.message,
              messageNy: bid.messageNy,
              estimatedPickup: new Date(bid.estimatedPickup),
              status: bid.status,
              createdAt: new Date(bid.createdAt),
            })
          })
        }
      })
      setBids(allBids)
    } catch (error) {
      // Client-side error logging
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load shipments:", error)
      }
      showToast("Failed to load shipments", "error")
    }
  }

  const login = async (phone: string, pin: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await api.login(phone, pin, role)
      if (response.success && response.user) {
        setUser({
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          email: response.user.email,
          role: response.user.role,
          verified: response.user.verified,
          rating: response.user.rating || 0,
          preferredLanguage: response.user.preferredLanguage || "en",
          verificationLevel: response.user.verificationLevel,
        })
        showToast("Login successful!", "success")
        return true
      }
      showToast("Invalid phone or PIN", "error")
      return false
    } catch (error: any) {
      showToast(error.message || "Login failed", "error")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    name: string
    phone: string
    pin: string
    role: UserRole
  }): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await api.register({
        ...data,
        preferredLanguage: "en",
      })
      if (response.success && response.user) {
        setUser({
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          email: response.user.email,
          role: response.user.role,
          verified: response.user.verified,
          rating: 0,
          preferredLanguage: response.user.preferredLanguage || "en",
          verificationLevel: response.user.verificationLevel,
        })
        addNotification({
          type: "system",
          title: "Welcome to Matola!",
          message: "Your account has been created. Complete verification to unlock all features.",
          link: "/dashboard/verification",
        })
        showToast("Registration successful!", "success")
        return true
      }
      showToast("Registration failed", "error")
      return false
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      // Client-side error logging
      if (process.env.NODE_ENV === "development") {
        console.error("Logout error:", error)
      }
    } finally {
      setUser(null)
      setShipments([])
      setBids([])
      clearTokens()
    }
  }

  const userShipments = shipments.filter((s) => s.shipperId === user?.id)

  const addShipment = async (
    shipmentData: Omit<Shipment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Shipment> => {
    try {
      // Transform to API format
      const apiData = {
        originCity: shipmentData.origin.city,
        originDistrict: shipmentData.origin.district,
        originRegion: shipmentData.origin.region,
        originLat: shipmentData.origin.coordinates?.lat,
        originLng: shipmentData.origin.coordinates?.lng,
        originLandmark: shipmentData.origin.landmark,
        originAdmarc: shipmentData.origin.admarc,
        destinationCity: shipmentData.destination.city,
        destinationDistrict: shipmentData.destination.district,
        destinationRegion: shipmentData.destination.region,
        destinationLat: shipmentData.destination.coordinates?.lat,
        destinationLng: shipmentData.destination.coordinates?.lng,
        destinationLandmark: shipmentData.destination.landmark,
        destinationAdmarc: shipmentData.destination.admarc,
        cargoType: shipmentData.cargoType,
        cargoDescription: shipmentData.cargoDescription,
        cargoDescriptionNy: shipmentData.cargoDescriptionNy,
        weight: shipmentData.weight,
        length: shipmentData.dimensions?.length,
        width: shipmentData.dimensions?.width,
        height: shipmentData.dimensions?.height,
        requiredVehicleType: shipmentData.requiredVehicleType,
        pickupDate: shipmentData.pickupDate.toISOString(),
        pickupTimeWindow: shipmentData.pickupTimeWindow,
        price: shipmentData.price,
        paymentMethod: shipmentData.paymentMethod,
        isBackhaul: shipmentData.isBackhaul,
        backhaulDiscount: shipmentData.backhaulDiscount,
        specialInstructions: shipmentData.specialInstructions,
        borderCrossingRequired: shipmentData.borderCrossing?.required || false,
        borderPost: shipmentData.borderCrossing?.borderPost,
        estimatedClearanceHours: shipmentData.borderCrossing?.estimatedClearanceHours,
        seasonalCategory: shipmentData.seasonalCategory,
      }

      const created = await api.createShipment(apiData)

      // Transform back to Shipment type
      const newShipment: Shipment = {
        ...shipmentData,
        id: created.id,
        shipperName: user?.name || "Unknown",
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      }

      setShipments((prev) => [newShipment, ...prev])
      addNotification({
        type: "shipment",
        title: "Shipment Posted",
        message: `Your shipment from ${shipmentData.origin.city} to ${shipmentData.destination.city} is now live`,
        link: `/dashboard/shipments/${newShipment.id}`,
      })
      showToast("Shipment posted successfully!", "success")

      return newShipment
    } catch (error: any) {
      showToast(error.message || "Failed to create shipment", "error")
      throw error
    }
  }

  const updateShipment = async (id: string, updates: Partial<Shipment>): Promise<void> => {
    try {
      // Transform updates to API format
      const apiUpdates: any = {}
      if (updates.origin) {
        apiUpdates.originCity = updates.origin.city
        apiUpdates.originDistrict = updates.origin.district
        apiUpdates.originRegion = updates.origin.region
      }
      if (updates.destination) {
        apiUpdates.destinationCity = updates.destination.city
        apiUpdates.destinationDistrict = updates.destination.district
        apiUpdates.destinationRegion = updates.destination.region
      }
      if (updates.status) apiUpdates.status = updates.status
      if (updates.price) apiUpdates.price = updates.price

      await api.updateShipment(id, apiUpdates)
      await refreshShipments()
      showToast("Shipment updated successfully!", "success")
    } catch (error: any) {
      showToast(error.message || "Failed to update shipment", "error")
    }
  }

  const getShipment = (id: string) => shipments.find((s) => s.id === id)

  const getBidsForShipment = (shipmentId: string) => bids.filter((b) => b.shipmentId === shipmentId)

  const acceptBid = async (bidId: string): Promise<void> => {
    try {
      const bid = bids.find((b) => b.id === bidId)
      if (!bid) return

      // Accept match (bid acceptance creates a match)
      await api.acceptMatch(bidId)

      setBids((prev) =>
        prev.map((b) =>
          b.id === bidId
            ? { ...b, status: "accepted" }
            : b.shipmentId === bid.shipmentId
              ? { ...b, status: "rejected" }
              : b,
        ),
      )

      await updateShipment(bid.shipmentId, { status: "matched" })

      addNotification({
        type: "shipment",
        title: "Bid Accepted",
        message: `You accepted ${bid.transporterName}'s bid for MK ${bid.proposedPrice.toLocaleString()}`,
      })

      showToast("Bid accepted successfully!", "success")
    } catch (error: any) {
      showToast(error.message || "Failed to accept bid", "error")
    }
  }

  const rejectBid = (bidId: string) => {
    setBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b)))
    showToast("Bid rejected", "info")
  }

  const submitBid = async (bidData: Omit<Bid, "id" | "createdAt" | "status">) => {
    try {
      const submitted = await api.bids.submit({
        shipmentId: bidData.shipmentId,
        amount: bidData.proposedPrice,
        message: bidData.message,
        messageNy: bidData.messageNy,
        estimatedPickup: bidData.estimatedPickup.toISOString(),
      })

      const newBid: Bid = {
        id: submitted.id,
        shipmentId: submitted.shipmentId,
        transporterId: submitted.transporterId,
        transporterName: submitted.transporterName,
        transporterRating: submitted.transporterRating,
        proposedPrice: submitted.amount || submitted.proposedPrice,
        message: submitted.message,
        messageNy: submitted.messageNy,
        estimatedPickup: submitted.estimatedPickup 
          ? new Date(submitted.estimatedPickup) 
          : bidData.estimatedPickup,
        status: submitted.status,
        createdAt: new Date(submitted.createdAt),
      }

      setBids((prev) => [...prev, newBid])
      showToast("Bid submitted successfully!", "success")
    } catch (error: any) {
      showToast(error.message || "Failed to submit bid", "error")
      throw error
    }
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

  const acceptLoadOffer = async (shipmentId: string): Promise<void> => {
    if (!pendingLoadOffer || pendingLoadOffer.shipment.id !== shipmentId) return

    try {
      // Find match for this shipment
      const shipment = shipments.find((s) => s.id === shipmentId)
      if (shipment) {
        // Accept the match (would need match ID from API)
        await updateShipment(shipmentId, { status: "matched" })

        addNotification({
          type: "shipment",
          title: "Load Accepted",
          message: `You've accepted the load from ${pendingLoadOffer.shipment.origin.city} to ${pendingLoadOffer.shipment.destination.city}`,
          link: "/dashboard/transporter/my-jobs",
        })

        setPendingLoadOffer(null)
        showToast("Load accepted successfully!", "success")
      }
    } catch (error: any) {
      showToast(error.message || "Failed to accept load", "error")
    }
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
        refreshShipments,
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
