/**
 * Device Fingerprinting for fraud detection
 * PRD Requirement: Device fingerprinting for authentication
 */
import crypto from "crypto"
import type { NextRequest } from "next/server"

export interface DeviceFingerprint {
  hash: string
  userAgent: string
  language: string
  timezone: string
  screenResolution?: string
  ip: string
  createdAt: Date
}

export function generateDeviceFingerprint(
  request: NextRequest,
  clientData?: { screenResolution?: string; timezone?: string },
): DeviceFingerprint {
  const userAgent = request.headers.get("user-agent") || "unknown"
  const language = request.headers.get("accept-language") || "en"
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"

  // Create fingerprint hash from available data
  const fingerprintData = [
    userAgent,
    language,
    clientData?.timezone || "unknown",
    clientData?.screenResolution || "unknown",
    ip,
  ].join("|")

  const hash = crypto.createHash("sha256").update(fingerprintData).digest("hex")

  return {
    hash,
    userAgent,
    language,
    timezone: clientData?.timezone || "unknown",
    screenResolution: clientData?.screenResolution,
    ip,
    createdAt: new Date(),
  }
}

// Store known device fingerprints per user (in production, use Redis/DB)
const knownDevices = new Map<string, Set<string>>()

export function isKnownDevice(userId: string, fingerprintHash: string): boolean {
  const devices = knownDevices.get(userId)
  return devices?.has(fingerprintHash) || false
}

export function registerDevice(userId: string, fingerprintHash: string): void {
  let devices = knownDevices.get(userId)
  if (!devices) {
    devices = new Set()
    knownDevices.set(userId, devices)
  }
  devices.add(fingerprintHash)
}

export function flagSuspiciousDevice(userId: string, fingerprint: DeviceFingerprint): boolean {
  const devices = knownDevices.get(userId)
  if (!devices || devices.size === 0) {
    // First device, not suspicious
    return false
  }

  // Flag if this is a new device
  return !devices.has(fingerprint.hash)
}
