/**
 * API Client
 * Centralized API client with offline support
 */

import { offlineStorage } from '../offline/indexeddb'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // If offline, queue for sync
      if (!navigator.onLine && typeof window !== 'undefined') {
        await offlineStorage.addToSyncQueue(
          options.method === 'POST' ? 'create' : 'update',
          endpoint.includes('shipment') ? 'shipment' : 'bid',
          JSON.parse(options.body as string || '{}'),
        )
      }
      throw error
    }
  }

  auth = {
    login: async (data: { phone: string; pin: string }) => {
      return this.request<{ user: any; accessToken: string; refreshToken: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      )
    },
    register: async (data: { name: string; phone: string; pin: string; role: string }) => {
      return this.request<{ user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    logout: async () => {
      return this.request('/auth/logout', { method: 'POST' })
    },
    verify: async () => {
      return this.request<{ user: any }>('/auth/verify')
    },
  }

  shipments = {
    create: async (data: any) => {
      const result = await this.request<{ shipment: any }>('/shipments', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Save to offline storage
      if (typeof window !== 'undefined') {
        await offlineStorage.saveShipment(result.shipment)
      }

      return result
    },
    update: async (id: string, data: any) => {
      return this.request<{ shipment: any }>(`/shipments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    get: async (id: string) => {
      return this.request<{ shipment: any }>(`/shipments/${id}`)
    },
    list: async (params?: any) => {
      const query = new URLSearchParams(params).toString()
      return this.request<{ shipments: any[] }>(`/shipments?${query}`)
    },
  }

  bids = {
    submit: async (data: {
      shipmentId: string
      amount: number
      message?: string
      messageNy?: string
      estimatedPickup?: string
    }) => {
      const response = await this.request<{ success: boolean; bid: any }>('/bids', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.bid
    },
    list: async (params?: {
      shipmentId?: string
      transporterId?: string
      status?: string
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).reduce((acc, [key, value]) => {
          if (value !== undefined) acc[key] = String(value)
          return acc
        }, {} as Record<string, string>)
      ).toString()
      const response = await this.request<{ bids: any[] }>(`/bids?${query}`)
      return response.bids || []
    },
  }

  // User profile methods
  users = {
    getProfile: async () => {
      return this.request<{ user: any }>('/users/profile')
    },
    updateProfile: async (data: any) => {
      return this.request<{ user: any }>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
  }

  // Wallet methods
  wallet = {
    getBalance: async () => {
      return this.request<{ wallet: any }>('/wallet')
    },
    getTransactions: async (params?: any) => {
      const query = new URLSearchParams(params).toString()
      return this.request<{ transactions: any[] }>(`/wallet/transactions?${query}`)
    },
  }

  // Search methods
  search = {
    shipments: async (params: any) => {
      const query = new URLSearchParams(params).toString()
      return this.request<{ shipments: any[] }>(`/search?type=shipments&${query}`)
    },
    locations: async (query: string) => {
      return this.request<{ locations: any[] }>(`/search?type=locations&q=${query}`)
    },
  }

  // Tracking methods
  tracking = {
    getShipmentInfo: async (shipmentId: string) => {
      return this.request<{ shipment: any }>(`/shipments/${shipmentId}/track`)
    },
    updateLocation: async (shipmentId: string, data: any) => {
      return this.request<{ success: boolean }>(`/shipments/${shipmentId}/track`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  }

  // Admin methods
  admin = {
    getAnalytics: async () => {
      return this.request<{ analytics: any }>('/admin/analytics')
    },
    getUsers: async (params?: any) => {
      const query = new URLSearchParams(params).toString()
      return this.request<{ users: any[] }>(`/admin/users?${query}`)
    },
  }

  // Convenience methods for auth
  login = async (phone: string, pin: string, role?: string) => {
    const response = await this.auth.login({ phone, pin })
    return {
      success: true,
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  }

  register = async (data: { name: string; phone: string; pin: string; role: string; preferredLanguage?: string }) => {
    const response = await this.auth.register(data)
    return {
      success: true,
      user: response.user,
    }
  }

  logout = async () => {
    await this.auth.logout()
    return { success: true }
  }

  verify = async () => {
    const response = await this.auth.verify()
    return {
      success: true,
      user: response.user,
    }
  }

  // Shipment convenience methods
  getShipments = async (params?: {
    status?: string
    limit?: number
    offset?: number
    originCity?: string
    destinationCity?: string
    cargoType?: string
  }) => {
    const response = await this.shipments.list(params)
    return response.shipments || []
  }

  createShipment = async (data: any) => {
    const response = await this.shipments.create(data)
    return response.shipment
  }

  updateShipment = async (id: string, data: any) => {
    const response = await this.shipments.update(id, data)
    return response.shipment
  }

  // Match methods
  acceptMatch = async (matchId: string) => {
    const response = await this.request<{ success: boolean; message?: string; matchId?: string; match?: any }>(
      `/matching/${matchId}/accept`,
      {
        method: 'POST',
      },
    )
    return response
  }

  rejectMatch = async (matchId: string) => {
    return this.request<{ success: boolean; message: string }>(
      `/matching/${matchId}/reject`,
      {
        method: 'POST',
      },
    )
  }
}

export const api = new APIClient()

// Token management functions
export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }
}

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}
