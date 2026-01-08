/**
 * Alerting Service
 * PRD Requirements: Critical (SMS/call), Warning (email), Info (dashboard)
 */
import { logger } from "./logger"

export type AlertSeverity = "critical" | "warning" | "info"

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  message: string
  metric?: string
  threshold?: number
  currentValue?: number
  timestamp: Date
  acknowledged: boolean
}

interface AlertRule {
  name: string
  metric: string
  condition: "gt" | "lt" | "eq"
  threshold: number
  duration: number // minutes
  severity: AlertSeverity
}

class AlertingService {
  private alerts: Alert[] = []
  private rules: AlertRule[] = [
    // Critical alerts (SMS/call)
    {
      name: "High Error Rate",
      metric: "api.error_rate",
      condition: "gt",
      threshold: 1,
      duration: 5,
      severity: "critical",
    },
    {
      name: "Database Down",
      metric: "db.connections",
      condition: "lt",
      threshold: 1,
      duration: 1,
      severity: "critical",
    },
    {
      name: "USSD Service Down",
      metric: "ussd.health",
      condition: "eq",
      threshold: 0,
      duration: 1,
      severity: "critical",
    },
    {
      name: "Payment Failures",
      metric: "payments.failure_rate",
      condition: "gt",
      threshold: 5,
      duration: 5,
      severity: "critical",
    },

    // Warning alerts (email)
    {
      name: "Slow API Response",
      metric: "api.response_time_p95",
      condition: "gt",
      threshold: 2000,
      duration: 5,
      severity: "warning",
    },
    {
      name: "Queue Backlog",
      metric: "queue.depth",
      condition: "gt",
      threshold: 1000,
      duration: 5,
      severity: "warning",
    },
    {
      name: "High Disk Usage",
      metric: "system.disk_usage",
      condition: "gt",
      threshold: 80,
      duration: 5,
      severity: "warning",
    },
    {
      name: "High Memory Usage",
      metric: "system.memory_usage",
      condition: "gt",
      threshold: 90,
      duration: 5,
      severity: "warning",
    },

    // Info alerts (dashboard)
    {
      name: "Business Metric Deviation",
      metric: "business.deviation",
      condition: "gt",
      threshold: 20,
      duration: 60,
      severity: "info",
    },
  ]

  async checkAndAlert(metric: string, value: number): Promise<void> {
    for (const rule of this.rules) {
      if (rule.metric !== metric) continue

      const triggered = this.evaluateCondition(rule.condition, value, rule.threshold)

      if (triggered) {
        await this.triggerAlert(rule, value)
      }
    }
  }

  private evaluateCondition(condition: "gt" | "lt" | "eq", value: number, threshold: number): boolean {
    switch (condition) {
      case "gt":
        return value > threshold
      case "lt":
        return value < threshold
      case "eq":
        return value === threshold
      default:
        return false
    }
  }

  private async triggerAlert(rule: AlertRule, currentValue: number): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: rule.severity,
      title: rule.name,
      message: `${rule.name}: ${rule.metric} is ${currentValue} (threshold: ${rule.threshold})`,
      metric: rule.metric,
      threshold: rule.threshold,
      currentValue,
      timestamp: new Date(),
      acknowledged: false,
    }

    this.alerts.push(alert)

    // Log the alert
    logger.warn(`Alert triggered: ${alert.title}`, {
      alertId: alert.id,
      severity: alert.severity,
      metric: alert.metric,
      currentValue,
      threshold: rule.threshold,
    })

    // Send notifications based on severity
    await this.sendNotification(alert)
  }

  private async sendNotification(alert: Alert): Promise<void> {
    switch (alert.severity) {
      case "critical":
        await this.sendSMSAlert(alert)
        await this.sendEmailAlert(alert)
        break
      case "warning":
        await this.sendEmailAlert(alert)
        break
      case "info":
        // Info alerts only show on dashboard
        break
    }
  }

  private async sendSMSAlert(alert: Alert): Promise<void> {
    try {
      // Get admin phone numbers from environment or database
      const adminPhones = process.env.ALERT_ADMIN_PHONES?.split(",") || []
      
      if (adminPhones.length === 0) {
        logger.warn("No admin phones configured for SMS alerts", { alertId: alert.id })
        return
      }

      const { sendSMS } = await import("@/lib/notifications/sms-service")
      const message = `🚨 CRITICAL ALERT: ${alert.title}\n${alert.message}\nTime: ${alert.timestamp.toISOString()}`

      // Send to all admin phones
      const results = await Promise.allSettled(
        adminPhones.map((phone) => sendSMS(phone.trim(), message))
      )

      const successCount = results.filter((r) => r.status === "fulfilled" && r.value).length
      
      logger.audit("SMS alert sent", {
        alertId: alert.id,
        severity: alert.severity,
        title: alert.title,
        recipients: adminPhones.length,
        successful: successCount,
      })
    } catch (error) {
      logger.error("Failed to send SMS alert", {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    try {
      // Get admin email addresses from environment
      const adminEmails = process.env.ALERT_ADMIN_EMAILS?.split(",") || []
      
      if (adminEmails.length === 0) {
        logger.warn("No admin emails configured for email alerts", { alertId: alert.id })
        return
      }

      // For now, log the email intent
      // In production, integrate with SendGrid, AWS SES, or similar
      const emailContent = {
        to: adminEmails,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: `
          <h2>${alert.title}</h2>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          ${alert.metric ? `<p><strong>Metric:</strong> ${alert.metric}</p>` : ""}
          ${alert.currentValue !== undefined ? `<p><strong>Current Value:</strong> ${alert.currentValue}</p>` : ""}
          ${alert.threshold !== undefined ? `<p><strong>Threshold:</strong> ${alert.threshold}</p>` : ""}
          <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://matola.mw"}/dashboard/admin/alerts">View in Dashboard</a></p>
        `,
        text: `${alert.title}\n\n${alert.message}\n\nSeverity: ${alert.severity}\nTime: ${alert.timestamp.toISOString()}`,
      }

      // TODO: In production, use actual email service
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail')
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      // await sgMail.send(emailContent)

      // For now, log the email intent
      logger.audit("Email alert queued", {
        alertId: alert.id,
        severity: alert.severity,
        title: alert.title,
        recipients: adminEmails.length,
        emails: adminEmails,
      })
    } catch (error) {
      logger.error("Failed to send email alert", {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged)
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      logger.audit("Alert acknowledged", { alertId })
    }
  }

  getAlertHistory(hours = 24): Alert[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000
    return this.alerts.filter((a) => a.timestamp.getTime() > cutoff)
  }
}

export const alerting = new AlertingService()
