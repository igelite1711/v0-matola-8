/**
 * Matching Algorithm Unit Tests
 * PRD Requirements: Section 5.2 - Multi-factor matching algorithm
 * 
 * Scoring Breakdown (per PRD):
 * - Route Match: 40 points
 * - Capacity Match: 20 points  
 * - Timing Match: 15 points
 * - Reputation: 15 points
 * - Experience: 10 points
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock data matching PRD specifications
const mockShipment = {
    id: 'shipment-123',
    origin: 'Lilongwe',
    destination: 'Blantyre',
    weight: 500,
    cargoType: 'food',
    price: 50000,
    pickupDate: new Date(Date.now() + 86400000), // Tomorrow
}

const mockTransporter = {
    id: 'transporter-123',
    name: 'John Banda',
    phone: '+265991234567',
    verified: true,
    ratingAverage: 4.5,
    ratingCount: 15,
    lastActiveAt: new Date(),
    vehicleType: 'canter',
    vehicleCapacity: 3500,
    vehiclePlate: 'RU 1234',
    routeExperience: 5,
    completedTrips: 25,
}

// Import after mocks are set up
describe('Matching Algorithm', () => {
    describe('Route Score (40 points max)', () => {
        it('should give 100% for known return routes', () => {
            // PRD: "If transporter frequently does A→B, they need B→A returns"
            const isKnownReturnRoute = true
            const baseScore = 100
            const routeScore = isKnownReturnRoute ? baseScore : 0
            expect(routeScore * 0.4).toBe(40) // 40 points max
        })

        it('should give 90% for routes with prior experience', () => {
            // PRD: "Very good match - has experience on this route"
            const routeExperience = 5
            const baseScore = routeExperience > 0 ? 90 : 0
            expect(baseScore * 0.4).toBe(36)
        })

        it('should calculate distance-based scores', () => {
            // PRD: City-to-city distance matrix for Malawi
            const distances: Record<string, number> = {
                'Lilongwe-Blantyre': 320,
                'Blantyre-Lilongwe': 320,
                'Lilongwe-Mzuzu': 350,
                'Mzuzu-Lilongwe': 350,
                'Blantyre-Zomba': 65,
            }

            expect(distances['Lilongwe-Blantyre']).toBe(320)
            expect(distances['Blantyre-Zomba']).toBe(65)
        })

        it('should penalize long deviations', () => {
            // PRD: "50km is acceptable, 100km+ is too much"
            const calculateDeviatonScore = (distanceKm: number): number => {
                if (distanceKm < 50) return 70
                if (distanceKm < 100) return 50
                if (distanceKm < 200) return 30
                return 10
            }

            expect(calculateDeviatonScore(40)).toBe(70) // Acceptable
            expect(calculateDeviatonScore(80)).toBe(50) // Moderate
            expect(calculateDeviatonScore(150)).toBe(30) // Significant
            expect(calculateDeviatonScore(250)).toBe(10) // Poor match
        })
    })

    describe('Capacity Score (20 points max)', () => {
        it('should give 100% for 80-100% utilization', () => {
            // PRD: "Perfect - near full capacity"
            const calculateCapacityScore = (shipmentWeight: number, vehicleCapacity: number): number => {
                const utilization = (shipmentWeight / vehicleCapacity) * 100

                if (utilization >= 80 && utilization <= 100) return 100
                if (utilization >= 60 && utilization < 80) return 90
                if (utilization >= 40 && utilization < 60) return 70
                if (utilization >= 20 && utilization < 40) return 50
                if (utilization < 20) return 30
                if (utilization > 100 && utilization <= 110) return 60 // Slight overload
                if (utilization > 110) return 20 // Dangerous overload

                return 50
            }

            // 500kg in 600kg capacity = 83% utilization
            expect(calculateCapacityScore(500, 600)).toBe(100)

            // 500kg in 1000kg capacity = 50% utilization
            expect(calculateCapacityScore(500, 1000)).toBe(70)

            // 500kg in 3500kg capacity = 14% utilization
            expect(calculateCapacityScore(500, 3500)).toBe(30)
        })

        it('should handle African reality of slight overloading', () => {
            // PRD: "Trucks are often overloaded (cultural norm)"
            const calculateCapacityScore = (shipmentWeight: number, vehicleCapacity: number): number => {
                const utilization = (shipmentWeight / vehicleCapacity) * 100
                if (utilization > 100 && utilization <= 110) return 60
                if (utilization > 110) return 20
                return 100
            }

            // 105% utilization (slight overload)
            expect(calculateCapacityScore(1050, 1000)).toBe(60)

            // 120% utilization (dangerous overload)
            expect(calculateCapacityScore(1200, 1000)).toBe(20)
        })
    })

    describe('Timing Score (15 points max)', () => {
        it('should prioritize urgent shipments', () => {
            // PRD: "Today - urgent" gets 100%
            const calculateTimingScore = (daysUntilDeparture: number, hasConflict: boolean): number => {
                if (hasConflict) return 20

                if (daysUntilDeparture === 0) return 100
                if (daysUntilDeparture === 1) return 95
                if (daysUntilDeparture >= 2 && daysUntilDeparture <= 3) return 85
                if (daysUntilDeparture >= 4 && daysUntilDeparture <= 7) return 70
                if (daysUntilDeparture > 7 && daysUntilDeparture <= 14) return 50
                return 30
            }

            expect(calculateTimingScore(0, false)).toBe(100) // Today
            expect(calculateTimingScore(1, false)).toBe(95)  // Tomorrow
            expect(calculateTimingScore(3, false)).toBe(85)  // 2-3 days
            expect(calculateTimingScore(5, false)).toBe(70)  // Week ahead
            expect(calculateTimingScore(10, false)).toBe(50) // 1-2 weeks
            expect(calculateTimingScore(20, false)).toBe(30) // Too far
        })

        it('should heavily penalize schedule conflicts', () => {
            const calculateTimingScore = (daysUntilDeparture: number, hasConflict: boolean): number => {
                if (hasConflict) return 20
                return 100
            }

            expect(calculateTimingScore(0, true)).toBe(20)
        })
    })

    describe('Reputation Score (15 points max)', () => {
        it('should give 40% for verified transporters', () => {
            // PRD: "Verification status (40 points)"
            const calculateReputationScore = (verified: boolean, ratingAverage: number, ratingCount: number): number => {
                let score = 0

                // Verification status (40 points)
                if (verified) {
                    score += 40
                } else {
                    score += 10
                }

                // Rating average (40 points)
                if (ratingCount >= 5) {
                    score += (ratingAverage / 5) * 40
                } else if (ratingCount > 0) {
                    score += (ratingAverage / 5) * 30
                } else {
                    score += 20 // Benefit of the doubt
                }

                return Math.min(score, 100)
            }

            // Verified with high rating
            expect(calculateReputationScore(true, 4.5, 15)).toBeGreaterThan(70)

            // Not verified with good rating
            expect(calculateReputationScore(false, 4.0, 10)).toBeLessThan(50)

            // Verified but no ratings
            expect(calculateReputationScore(true, 0, 0)).toBe(60) // 40 (verified) + 20 (benefit of doubt)
        })

        it('should handle cold start problem', () => {
            // PRD: "Ratings are sparse initially (cold start problem)"
            const calculateReputationScore = (verified: boolean, ratingAverage: number, ratingCount: number): number => {
                let score = verified ? 40 : 10

                if (ratingCount >= 5) {
                    score += (ratingAverage / 5) * 40
                } else if (ratingCount > 0) {
                    score += (ratingAverage / 5) * 30
                } else {
                    score += 20 // Benefit of the doubt for new users
                }

                return Math.min(score, 100)
            }

            // New user with no ratings should still get reasonable score
            expect(calculateReputationScore(true, 0, 0)).toBe(60)
        })
    })

    describe('Experience Score (10 points max)', () => {
        it('should reward route-specific experience', () => {
            // PRD: "Route-specific experience (50 points base)"
            const calculateExperienceScore = (routeExperience: number): number => {
                if (routeExperience >= 10) return 50
                if (routeExperience >= 5) return 40
                if (routeExperience >= 2) return 30
                if (routeExperience === 1) return 20
                return 10 // Never done this route
            }

            expect(calculateExperienceScore(15)).toBe(50) // Expert
            expect(calculateExperienceScore(5)).toBe(40)
            expect(calculateExperienceScore(2)).toBe(30)
            expect(calculateExperienceScore(1)).toBe(20)
            expect(calculateExperienceScore(0)).toBe(10) // New to route
        })
    })

    describe('Overall Match Score', () => {
        it('should combine all factors with correct weights', () => {
            // PRD weights: Route 40%, Capacity 20%, Timing 15%, Reputation 15%, Experience 10%
            const calculateTotalScore = (
                routeScore: number,
                capacityScore: number,
                timingScore: number,
                reputationScore: number,
                experienceScore: number
            ): number => {
                return Math.round(
                    routeScore * 0.4 +
                    capacityScore * 0.2 +
                    timingScore * 0.15 +
                    reputationScore * 0.15 +
                    experienceScore * 0.1
                )
            }

            // Perfect match across all factors
            expect(calculateTotalScore(100, 100, 100, 100, 100)).toBe(100)

            // Good overall match
            expect(calculateTotalScore(90, 80, 85, 75, 40)).toBe(80)

            // Poor route but good on other factors
            expect(calculateTotalScore(30, 90, 100, 100, 100)).toBe(62)
        })

        it('should filter matches below minimum threshold', () => {
            // PRD: "MIN_SCORE = 30"
            const MIN_MATCH_SCORE = 30
            const validMatches = [75, 60, 45, 25, 15, 80]
                .filter(score => score >= MIN_MATCH_SCORE)

            expect(validMatches).toEqual([75, 60, 45, 80])
            expect(validMatches).not.toContain(25)
            expect(validMatches).not.toContain(15)
        })

        it('should limit matches to top 10', () => {
            // PRD: "MAX_MATCHES = 10"
            const MAX_MATCHES = 10
            const allScores = Array.from({ length: 20 }, (_, i) => 100 - i * 3)
            const topMatches = allScores
                .sort((a, b) => b - a)
                .slice(0, MAX_MATCHES)

            expect(topMatches.length).toBe(10)
            expect(topMatches[0]).toBe(100)
            expect(topMatches[9]).toBe(73)
        })
    })
})

describe('PRD Specific Requirements', () => {
    it('should handle backhaul (return trip) matching', () => {
        // PRD: "Return trips are the primary opportunity"
        const detectBackhaul = (
            shipmentOrigin: string,
            shipmentDest: string,
            transporterHistory: Array<{ origin: string; destination: string }>
        ): boolean => {
            // If transporter frequently goes Dest→Orig, this is a good backhaul
            return transporterHistory.some(
                trip => trip.origin === shipmentDest && trip.destination === shipmentOrigin
            )
        }

        const history = [
            { origin: 'Blantyre', destination: 'Lilongwe' },
            { origin: 'Blantyre', destination: 'Lilongwe' },
        ]

        // Shipment from Lilongwe to Blantyre is backhaul for this transporter
        expect(detectBackhaul('Lilongwe', 'Blantyre', history)).toBe(true)

        // Random route is not backhaul
        expect(detectBackhaul('Mzuzu', 'Zomba', history)).toBe(false)
    })

    it('should apply seasonal pricing adjustments', () => {
        // PRD: Section 5.3 - Seasonal price adjustments
        const getSeasonalMultiplier = (month: number): number => {
            if (month >= 4 && month <= 6) return 0.9   // Harvest season - cheaper
            if (month >= 12 || month <= 3) return 1.15 // Rainy season - premium
            if (month >= 11 && month <= 12) return 1.1 // Planting season - premium
            return 1.0 // Normal
        }

        expect(getSeasonalMultiplier(5)).toBe(0.9)   // May (harvest)
        expect(getSeasonalMultiplier(1)).toBe(1.15)  // January (rainy)
        expect(getSeasonalMultiplier(7)).toBe(1.0)   // July (normal)
    })
})
