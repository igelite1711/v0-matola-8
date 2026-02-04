/**
 * Environment Configuration Documentation & Validation
 * PRD Requirements: All integrations require proper configuration
 * 
 * This file documents all required environment variables and validates
 * them at runtime to provide clear error messages.
 */

export interface EnvironmentConfig {
    // Authentication
    JWT_SECRET: string
    REFRESH_SECRET: string
    JWT_EXPIRES_IN?: string

    // Database
    DATABASE_URL: string

    // Redis (Session & Caching)
    UPSTASH_REDIS_REST_URL?: string
    UPSTASH_REDIS_REST_TOKEN?: string

    // Africa's Talking (USSD & SMS)
    AFRICASTALKING_API_KEY?: string
    AFRICASTALKING_USERNAME?: string
    AFRICASTALKING_SHORTCODE?: string

    // Twilio (WhatsApp)
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_WHATSAPP_NUMBER?: string

    // Payment Providers
    AIRTEL_MONEY_API_KEY?: string
    AIRTEL_MONEY_API_SECRET?: string
    AIRTEL_MONEY_WEBHOOK_SECRET?: string

    TNM_MPAMBA_API_KEY?: string
    TNM_MPAMBA_API_SECRET?: string
    TNM_MPAMBA_WEBHOOK_SECRET?: string

    // File Storage (S3)
    AWS_ACCESS_KEY_ID?: string
    AWS_SECRET_ACCESS_KEY?: string
    AWS_S3_BUCKET?: string
    AWS_REGION?: string

    // Monitoring
    SENTRY_DSN?: string
}

interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * Required variables for basic operation
 */
const REQUIRED_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REFRESH_SECRET',
] as const

/**
 * Required variables for USSD channel (PRIMARY - 60% of users per PRD)
 */
const USSD_REQUIRED_VARS = [
    'AFRICASTALKING_API_KEY',
    'AFRICASTALKING_USERNAME',
] as const

/**
 * Required variables for WhatsApp channel (SECONDARY - 25% of users per PRD)
 */
const WHATSAPP_REQUIRED_VARS = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER',
] as const

/**
 * Required variables for payment processing
 */
const PAYMENT_REQUIRED_VARS = [
    'AIRTEL_MONEY_API_KEY',
    'AIRTEL_MONEY_API_SECRET',
] as const

/**
 * Validates environment configuration
 * Logs warnings but does not block startup for optional integrations
 */
export function validateEnvironment(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required variables
    for (const varName of REQUIRED_VARS) {
        if (!process.env[varName]) {
            errors.push(`Missing required environment variable: ${varName}`)
        }
    }

    // Check USSD configuration (warn if missing - PRD PRIMARY channel)
    const hasUSSD = USSD_REQUIRED_VARS.every(v => process.env[v])
    if (!hasUSSD) {
        warnings.push(
            '⚠️  USSD not configured. This is the PRIMARY channel (60% of users). ' +
            'Set AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME to enable.'
        )
    }

    // Check WhatsApp configuration (warn if missing - PRD SECONDARY channel)
    const hasWhatsApp = WHATSAPP_REQUIRED_VARS.every(v => process.env[v])
    if (!hasWhatsApp) {
        warnings.push(
            '⚠️  WhatsApp not configured. This is the SECONDARY channel (25% of users). ' +
            'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to enable.'
        )
    }

    // Check Redis (required for session management)
    if (!process.env.UPSTASH_REDIS_REST_URL) {
        warnings.push(
            '⚠️  Redis not configured. USSD and WhatsApp sessions will not persist. ' +
            'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.'
        )
    }

    // Check payment providers
    const hasAirtel = process.env.AIRTEL_MONEY_API_KEY && process.env.AIRTEL_MONEY_API_SECRET
    const hasTNM = process.env.TNM_MPAMBA_API_KEY && process.env.TNM_MPAMBA_API_SECRET

    if (!hasAirtel && !hasTNM) {
        warnings.push(
            '⚠️  No mobile money providers configured. ' +
            'Cash-only mode enabled. Configure Airtel Money or TNM Mpamba for digital payments.'
        )
    }

    // Check S3 for file uploads
    if (!process.env.AWS_S3_BUCKET) {
        warnings.push(
            '⚠️  S3 not configured. Photo verification for cash payments will not work. ' +
            'Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET.'
        )
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Logs validation results and optionally throws on critical errors
 */
export function validateAndLog(throwOnError = false): void {
    const result = validateEnvironment()

    if (result.warnings.length > 0) {
        console.log('\n📋 Environment Warnings:')
        result.warnings.forEach(w => console.log(w))
        console.log('')
    }

    if (result.errors.length > 0) {
        console.error('\n❌ Critical Environment Errors:')
        result.errors.forEach(e => console.error(`  - ${e}`))
        console.error('')

        if (throwOnError) {
            throw new Error(`Missing required environment variables: ${result.errors.join(', ')}`)
        }
    }

    if (result.valid && result.warnings.length === 0) {
        console.log('✅ Environment configuration validated successfully')
    }
}

/**
 * Get channel availability based on configuration
 */
export function getChannelAvailability(): {
    ussd: boolean
    whatsapp: boolean
    sms: boolean
    webPwa: boolean
} {
    return {
        ussd: Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME),
        whatsapp: Boolean(
            process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_WHATSAPP_NUMBER
        ),
        sms: Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME),
        webPwa: true, // Always available
    }
}

/**
 * Get payment method availability based on configuration
 */
export function getPaymentMethodAvailability(): {
    cash: boolean
    airtelMoney: boolean
    tnmMpamba: boolean
    bankTransfer: boolean
} {
    return {
        cash: true, // Always available
        airtelMoney: Boolean(process.env.AIRTEL_MONEY_API_KEY && process.env.AIRTEL_MONEY_API_SECRET),
        tnmMpamba: Boolean(process.env.TNM_MPAMBA_API_KEY && process.env.TNM_MPAMBA_API_SECRET),
        bankTransfer: false, // Phase 2
    }
}

// Export for use in middleware or startup
export default {
    validateEnvironment,
    validateAndLog,
    getChannelAvailability,
    getPaymentMethodAvailability,
}
