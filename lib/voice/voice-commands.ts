"use client"

// Voice command system for low-literacy users
// Uses Web Speech API with Chichewa support

export type VoiceCommandType = "destination" | "origin" | "cargo" | "confirm" | "cancel" | "help" | "emergency"

interface VoiceCommandResult {
  type: VoiceCommandType
  value: string
  confidence: number
}

// Chichewa city name mappings (phonetic variations)
const CITY_MAPPINGS: Record<string, string> = {
  // Lilongwe variations
  lilongwe: "Lilongwe",
  lilongway: "Lilongwe",
  "li long way": "Lilongwe",
  capital: "Lilongwe",

  // Blantyre variations
  blantyre: "Blantyre",
  blantire: "Blantyre",
  "blan tire": "Blantyre",
  "commercial city": "Blantyre",

  // Mzuzu variations
  mzuzu: "Mzuzu",
  "m zuzu": "Mzuzu",
  northern: "Mzuzu",

  // Other cities
  zomba: "Zomba",
  salima: "Salima",
  mangochi: "Mangochi",
  kasungu: "Kasungu",
  karonga: "Karonga",
  "nkhata bay": "Nkhata Bay",
  nkhatabay: "Nkhata Bay",
  dedza: "Dedza",
}

// Cargo type mappings
const CARGO_MAPPINGS: Record<string, string> = {
  // Farm produce
  maize: "farm",
  chimanga: "farm", // Chichewa for maize
  tobacco: "farm",
  fodya: "farm", // Chichewa for tobacco
  tomatoes: "farm",
  vegetables: "farm",
  farm: "farm",
  zokolola: "farm", // Chichewa for harvest

  // General goods
  goods: "goods",
  katundu: "goods", // Chichewa
  general: "goods",

  // Building materials
  cement: "building",
  bricks: "building",
  njerwa: "building", // Chichewa for bricks
  "iron sheets": "building",
  malata: "building", // Chichewa for iron sheets
  building: "building",
  zomangira: "building", // Chichewa

  // Furniture
  furniture: "furniture",
  mipando: "furniture", // Chichewa
  chairs: "furniture",
  beds: "furniture",

  // Equipment
  equipment: "equipment",
  machines: "equipment",
  zipangizo: "equipment", // Chichewa
}

// Command keywords
const COMMAND_KEYWORDS = {
  confirm: ["yes", "inde", "okay", "confirm", "vomereza", "chabwino"],
  cancel: ["no", "ayi", "cancel", "leka", "stop", "imani"],
  help: ["help", "thandizo", "ndifune thandizo"],
  emergency: ["emergency", "sos", "police", "apolisi", "help me", "ndithandizeni"],
}

// Declare SpeechRecognition if it's not available
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

class VoiceCommandService {
  private recognition: any | null = null
  private isListening = false
  private onResultCallback: ((result: VoiceCommandResult) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        // Support both English and Chichewa (fallback to English if Chichewa not available)
        this.recognition.lang = "en-MW" // English (Malawi)

        this.recognition.onresult = (event) => {
          const result = event.results[0][0]
          const transcript = result.transcript.toLowerCase().trim()
          const confidence = result.confidence

          const parsed = this.parseCommand(transcript)
          if (this.onResultCallback && parsed) {
            this.onResultCallback({ ...parsed, confidence })
          }
        }

        this.recognition.onerror = (event) => {
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error)
          }
        }

        this.recognition.onend = () => {
          this.isListening = false
        }
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  startListening(onResult: (result: VoiceCommandResult) => void, onError: (error: string) => void): boolean {
    if (!this.recognition) {
      onError("Voice recognition not supported")
      return false
    }

    if (this.isListening) {
      return true
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError
    this.isListening = true

    try {
      this.recognition.start()
      return true
    } catch (error) {
      this.isListening = false
      onError("Failed to start voice recognition")
      return false
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  private parseCommand(transcript: string): Omit<VoiceCommandResult, "confidence"> | null {
    // Check for command keywords first
    for (const [type, keywords] of Object.entries(COMMAND_KEYWORDS)) {
      if (keywords.some((kw) => transcript.includes(kw))) {
        return { type: type as VoiceCommandType, value: transcript }
      }
    }

    // Check for city names (destination/origin)
    for (const [pattern, city] of Object.entries(CITY_MAPPINGS)) {
      if (transcript.includes(pattern)) {
        return { type: "destination", value: city }
      }
    }

    // Check for cargo types
    for (const [pattern, cargoType] of Object.entries(CARGO_MAPPINGS)) {
      if (transcript.includes(pattern)) {
        return { type: "cargo", value: cargoType }
      }
    }

    // Default: return as raw text
    return { type: "destination", value: transcript }
  }
}

export const voiceService = new VoiceCommandService()

// Text-to-Speech for feedback
export function speak(text: string, lang: "en" | "ny" = "en"): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === "ny" ? "en-MW" : "en-US"
    utterance.rate = 0.9 // Slightly slower for clarity
    window.speechSynthesis.speak(utterance)
  }
}
