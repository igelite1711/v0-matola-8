/**
 * Structured JSON Logger with CloudWatch integration
 * PRD Requirements: Structured JSON format, CloudWatch Logs, Request ID propagation
 */

export type LogLevel = "info" | "warn" | "error" | "audit"

export interface LogContext {
  userId?: string
  requestId?: string
  ip?: string
  method?: string
  path?: string
  duration?: number
  statusCode?: number
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  environment: string
  service: string
  version: string
}

class Logger {
  private service = "matola-api"
  private version: string = process.env.APP_VERSION || "1.0.0"
  private environment: string = process.env.NODE_ENV || "development"

  private formatEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        requestId: context.requestId || this.generateRequestId(),
        ...context,
      },
      environment: this.environment,
      service: this.service,
      version: this.version,
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private output(entry: LogEntry): void {
    const json = JSON.stringify(entry)

    // In production, this would go to CloudWatch via stdout
    // AWS CloudWatch Logs agent captures stdout/stderr automatically
    if (entry.level === "error") {
      console.error(json)
    } else {
      console.log(json)
    }

    // TODO: In production, also send to CloudWatch Logs directly if needed
    // this.sendToCloudWatch(entry)
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatEntry("info", message, context))
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatEntry("warn", message, context))
  }

  error(message: string, context?: LogContext & { error?: Error }): void {
    const entry = this.formatEntry("error", message, {
      ...context,
      stack: context?.error?.stack,
      errorMessage: context?.error?.message,
    })
    this.output(entry)
  }

  audit(message: string, context?: LogContext): void {
    this.output(this.formatEntry("audit", message, context))
  }

  // Request logging middleware helper
  logRequest(
    requestId: string,
    method: string,
    path: string,
    userId?: string,
    ip?: string,
  ): { end: (statusCode: number) => void } {
    const startTime = Date.now()

    return {
      end: (statusCode: number) => {
        const duration = Date.now() - startTime
        this.info("API Request", {
          requestId,
          method,
          path,
          userId,
          ip,
          statusCode,
          duration,
        })
      },
    }
  }
}

export const logger = new Logger()
