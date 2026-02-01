# Matola Logistics Platform - Deployment Guide

## Overview

This guide covers deploying the Matola Logistics Platform to production. The platform is built with Next.js, uses Prisma for database ORM, and relies on external services for payments, SMS, and storage.

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (production) or SQLite (development)
- Redis instance (local or managed like Upstash)
- Vercel account (for deployment)
- Configured API keys for:
  - Airtel Money API
  - TNM Mpamba API
  - Twilio (SMS/WhatsApp)
  - Sentry (error tracking)
  - Mapbox (optional, for location services)

## Environment Variables

Create a `.env.local` file with all required variables. See `.env.example` for the full list.

### Critical Variables (Must be set)

```env
# Authentication - MUST generate secure random strings
JWT_SECRET=<generate with: openssl rand -hex 32>
REFRESH_SECRET=<generate with: openssl rand -hex 32>

# Database
DATABASE_URL=postgresql://user:password@host:5432/matola_prod

# Redis
UPSTASH_REDIS_URL=https://[user]:[password]@[host]:[port]

# CORS
ALLOWED_ORIGINS=https://matola.mw,https://app.matola.mw

# Airtel Money
AIRTEL_API_KEY=<your-airtel-key>
AIRTEL_API_SECRET=<your-airtel-secret>
AIRTEL_WEBHOOK_SECRET=<webhook-secret>

# TNM Mpamba
TNM_API_KEY=<your-tnm-key>
TNM_API_SECRET=<your-tnm-secret>

# Twilio
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_FROM_NUMBER=<your-number>

# Sentry (error tracking)
SENTRY_DSN=<your-sentry-dsn>

# Application
NODE_ENV=production
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Using Neon (recommended for Vercel)
# Create a new database at https://console.neon.tech

# Or use another PostgreSQL provider (Supabase, etc)
```

### 2. Run Migrations

```bash
# After setting DATABASE_URL
pnpm run db:migrate:deploy

# Or for Prisma push (development/prototyping only)
pnpm run db:push
```

### 3. Seed Initial Data (Optional)

```bash
# Seed achievements (recommended)
pnpm run db:seed

# Seed full test data (optional)
pnpm run db:seed:full
```

## Deployment to Vercel

### 1. Connect Repository

```bash
vercel link
```

### 2. Set Environment Variables in Vercel Dashboard

Navigate to Vercel Project Settings → Environment Variables and add all variables from `.env.example`.

**Important:** Store sensitive values (JWT_SECRET, API keys) in Vercel's Secret environment variables, not standard ones.

### 3. Configure Vercel Settings

In `vercel.json` or Vercel dashboard:

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "devCommand": "pnpm run dev",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4. Deploy

```bash
vercel --prod
```

Or configure GitHub integration for automatic deployments on push to main.

## Post-Deployment

### 1. Verify Health Endpoints

```bash
curl https://your-app.com/api/health
curl https://your-app.com/api/health/ready
```

Both should return status 200 with service health information.

### 2. Test Core Functionality

- Register a new user
- Login and receive JWT tokens
- Create a shipment
- Verify notifications are queued

### 3. Start Background Workers

In production, start the background workers process:

```bash
# On a separate machine or container
pnpm run workers:start
```

Or deploy workers to a service like Railway, Render, or AWS Lambda.

### 4. Configure Monitoring

#### Sentry Error Tracking

Once deployed, Sentry will automatically track errors. Configure:

1. Go to https://sentry.io
2. Create a Next.js project
3. Copy DSN to `SENTRY_DSN`
4. Redeploy

#### Logs

Logs are written to stdout. Configure log aggregation:

- **Option 1:** Vercel Logs (built-in)
- **Option 2:** Datadog, NewRelic, or CloudWatch
- **Option 3:** Export logs to your favorite service

## Security Checklist

- [ ] JWT_SECRET and REFRESH_SECRET are secure random strings (not default)
- [ ] ALLOWED_ORIGINS excludes localhost and development domains
- [ ] CSRF_SECRET is set (for CSRF protection)
- [ ] All API keys are stored as Vercel Secrets, not in `.env.local`
- [ ] DATABASE_URL uses secure connection string
- [ ] REDIS_URL uses secure connection (TLS)
- [ ] Content Security Policy headers are configured
- [ ] HSTS header is enabled (should be set automatically)
- [ ] Webhook signatures are verified for Airtel/TNM

## Scaling Considerations

### Database

For high traffic:
- Enable read replicas in PostgreSQL
- Use connection pooling (e.g., PgBouncer)
- Index frequently queried fields

### Redis

- Monitor memory usage
- Configure eviction policy
- Consider managed service (Upstash, Redis Cloud)

### Workers

- Run workers on separate machines/containers
- Monitor job queue depth
- Set up dead-letter queue for failed jobs

### CDN

- Use Vercel's Edge Network (included)
- Cache static assets at edge
- Use ISR (Incremental Static Regeneration) for dynamic content

## Disaster Recovery

### Database Backup

```bash
# Daily backups of PostgreSQL
pg_dump postgresql://user:password@host/matola_prod > backup-$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
psql postgresql://user:password@host/matola_prod < backup-YYYYMMDD.sql
```

### Data Retention

Configure retention policies:
- Keep audit logs for 90 days
- Keep failed jobs for 7 days
- Keep completed jobs for 1 day

## Troubleshooting

### JWT Errors

If users can't login:
1. Verify JWT_SECRET and REFRESH_SECRET are set correctly
2. Check that secrets are identical across all deployed instances
3. Restart the server

### Payment Webhooks Not Working

1. Verify webhook URLs in Airtel/TNM dashboard
2. Verify webhook secrets match configured values
3. Check Sentry for webhook processing errors
4. Verify SSL certificates (webhooks require HTTPS)

### Database Connection Issues

1. Check DATABASE_URL is correct
2. Verify firewall allows connections
3. Check database user has proper permissions
4. Test connection manually: `psql [DATABASE_URL]`

### Missing Notifications

1. Verify Redis is accessible
2. Check notification worker is running
3. Verify Twilio credentials
4. Check Sentry for notification job errors

## Support

For issues:

1. Check health endpoints: `/api/health`, `/api/health/ready`
2. Check Sentry dashboard for errors
3. Check application logs in Vercel
4. Create an issue on GitHub with logs and reproduction steps

## Performance Targets

- Homepage load time: < 2 seconds
- API response time: < 200ms (p95)
- Database query time: < 100ms (p99)
- Payment webhook processing: < 5 seconds
- Notification delivery: < 2 minutes

## Monitoring Commands

```bash
# Check database
SELECT COUNT(*) FROM "User";

# Check Redis
redis-cli PING
redis-cli INFO memory

# Monitor job queues
npm run db:studio  # View Prisma data
```

---

**Version:** 1.0.0  
**Last Updated:** $(date)  
**Status:** Ready for Production
