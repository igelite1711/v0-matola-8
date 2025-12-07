# Matola Database Migration Guide

## Overview

This document describes the database schema for the Matola logistics platform, aligned with the Production Requirements Document (PRD).

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_initial_schema.sql` | Core tables, indexes, and constraints | Required |
| `002_triggers_and_functions.sql` | Triggers, stored procedures, utility functions | Required |
| `003_scheduled_jobs.sql` | Data retention jobs and cleanup procedures | Required |
| `004_seed_data.sql` | Development/test seed data | Optional |

## PRD Compliance Checklist

### Required Tables

| Table | PRD Required | Implemented | Notes |
|-------|--------------|-------------|-------|
| users | Yes | Yes | Extended with Malawi-specific fields |
| vehicles | Yes | Yes | Added Malawi vehicle types |
| shipments | Yes | Yes | Extended with checkpoint/border tracking |
| matches | Yes | Yes | Full compliance |
| payments | Yes | Yes | Added escrow support |
| ussd_sessions | Yes | Yes | Full compliance |
| audit_logs | Yes | Yes | Full compliance |

### Additional Tables (Not in PRD, but needed)

| Table | Purpose |
|-------|---------|
| checkpoints | Track shipment progress at Malawi checkpoints |
| disputes | Handle conflict resolution |
| ratings | Store user ratings and reviews |
| wallets | User wallet balances |
| wallet_transactions | Transaction history |
| escrow_holds | Escrow payment tracking |
| payment_methods | Saved payment methods |

## Index Strategy

### Primary Indexes (PRD Required)

\`\`\`sql
-- users.phone (unique)
CREATE INDEX idx_users_phone ON users(phone);

-- shipments.status, shipments.departure_date (composite)
CREATE INDEX idx_shipments_status_pickup_date ON shipments(status, pickup_date);

-- matches.shipment_id, matches.transporter_id
CREATE INDEX idx_matches_shipment_transporter ON matches(shipment_id, transporter_id);

-- payments.reference (unique)
CREATE INDEX idx_payments_reference ON payments(reference);

-- ussd_sessions.phone, ussd_sessions.updated_at
CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone);
CREATE INDEX idx_ussd_sessions_updated_at ON ussd_sessions(updated_at);

-- audit_logs.user_id, audit_logs.timestamp
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
\`\`\`

## Data Retention

| Entity | Retention Period | Cleanup Method |
|--------|------------------|----------------|
| ussd_sessions | 7 days | Automatic via `clean_old_ussd_sessions()` |
| audit_logs (non-critical) | 30 days | Automatic via `clean_old_audit_logs()` |
| audit_logs (payments, users) | Indefinite | Not deleted |
| pending matches | 24 hours | Auto-expired via scheduled job |

## Running Migrations

### Using psql

\`\`\`bash
# Connect to database
psql -h $DB_HOST -U $DB_USER -d matola

# Run migrations in order
\i scripts/migrations/001_initial_schema.sql
\i scripts/migrations/002_triggers_and_functions.sql
\i scripts/migrations/003_scheduled_jobs.sql
\i scripts/migrations/004_seed_data.sql  # Optional for dev
\`\`\`

### Verification Queries

\`\`\`sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Run cleanup (manual)
SELECT * FROM run_scheduled_cleanup();
\`\`\`

## Rollback

Each migration should be reversed in reverse order:

\`\`\`sql
-- Rollback 004 (seed data)
TRUNCATE users, vehicles, shipments CASCADE;

-- Rollback 003 (scheduled jobs)
DROP FUNCTION IF EXISTS run_scheduled_cleanup();

-- Rollback 002 (triggers)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- ... repeat for all triggers
DROP FUNCTION IF EXISTS update_updated_at_column();
-- ... repeat for all functions

-- Rollback 001 (schema)
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS escrow_holds CASCADE;
-- ... drop all tables in reverse dependency order
DROP TYPE IF EXISTS user_role;
-- ... drop all types
DROP EXTENSION IF EXISTS "uuid-ossp";
\`\`\`

## Environment Variables Required

\`\`\`env
DATABASE_URL=postgresql://user:password@host:5432/matola
DB_POOL_MIN=10
DB_POOL_MAX=100
