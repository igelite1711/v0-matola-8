// Malawi boundaries
const MALAWI_BOUNDS = {
  north: -9.2,
  south: -17.8,
  east: 35.9,
  west: 28.2,
}

export const geoValidator = {
  isMalawiCoordinate(lat: number, lng: number): boolean {
    return (
      lat >= MALAWI_BOUNDS.south &&
      lat <= MALAWI_BOUNDS.north &&
      lng >= MALAWI_BOUNDS.west &&
      lng <= MALAWI_BOUNDS.east
    )
  },

  validateShipmentCoordinates(originLat: number, originLng: number, destLat: number, destLng: number): boolean {
    if (!this.isMalawiCoordinate(originLat, originLng)) {
      throw new Error('Origin coordinates outside Malawi')
    }

    if (!this.isMalawiCoordinate(destLat, destLng)) {
      throw new Error('Destination coordinates outside Malawi')
    }

    return true
  },

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },
}
