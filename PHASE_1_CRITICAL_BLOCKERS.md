# PHASE 1: CRITICAL BLOCKERS (Getting App Running Locally)
## Estimated Time: 4-6 hours | Priority: DO THIS FIRST

This phase focuses on getting the app **booting and running locally** with all critical dependencies working. Nothing proceeds until Phase 1 is complete.

---

## Task 1.1: Fix Database Migrations (1.5 hours)

### Current State
```
✗ prisma/migrations/ folder empty
✗ Database tables don't exist
✗ Cannot initialize Prisma Client
✗ App fails on startup
```

### What Needs to Happen

**Step 1a: Generate Prisma Migrations**
```bash
# Reset database (if already attempted init)
npx prisma migrate reset --force

# Generate initial migration from schema
npx prisma migrate dev --name init

# This creates:
# - prisma/migrations/[timestamp]_init/
# - migration.sql with all table definitions
# - _prisma_migrations tracking table
```

**Step 1b: Seed Test Data**
```bash
# Populate with test users and shipments
npm run seed-database

# Verify with:
npx prisma studio  # Open visual database explorer
```

**Step 1c: Verify All Constraints**
Run this SQL to verify invariants are enforced:
```sql
-- Verify unique phone numbers
SELECT COUNT(*) FROM information_schema.table_constraints 
WHERE constraint_name = 'users_phone_key' AND table_name = 'users';

-- Should return: 1

-- Verify positive weight constraint
SELECT constraint_name FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%weight%';

-- Should return at least one row

-- Verify foreign keys
SELECT COUNT(*) FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'payments';

-- Should return multiple rows
```

### Files to Check
- [ ] `prisma/schema.prisma` - Defines all tables
- [ ] `prisma/migrations/` - Should not be empty after running
- [ ] `scripts/seed-database.ts` - Creates test data
- [ ] Database connects without errors

### Verification Checklist
- [ ] `npm run dev` starts without database errors
- [ ] `npx prisma studio` opens and shows tables
- [ ] Test users exist in database
- [ ] All constraints show in `PRAGMA foreign_key_list`

---

## Task 1.2: Configure Environment Variables (30 minutes)

### Current State
```
✗ .env.local doesn't exist
✗ Process.env vars undefined
✗ Services can't authenticate
✗ App crashes trying to reach external APIs
```

### What Needs to Happen

**Step 1a: Copy Template**
```bash
cp .env.example .env.local
```

**Step 1b: Fill Minimum Required Variables**
```bash
# Database (required for app to start)
DATABASE_URL="postgresql://user:password@localhost:5432/matola"

# JWT & Security (required for auth)
JWT_SECRET="dev_secret_key_min_32_chars_long_12345"
ENCRYPTION_KEY="dev_encrypt_key_min_32_chars_12345"
CSRF_SECRET="dev_csrf_key_min_32_chars_long_12345"

# Admin account (required for admin dashboard)
ADMIN_PHONE="+265999999999"
ADMIN_PASSWORD_HASH="hash_generated_below"

# Optional (but recommended for dev)
REDIS_URL="redis://localhost:6379"
LOG_LEVEL="debug"

# For testing (required to bypass external APIs in dev)
NODE_ENV="development"
```

**Step 1c: Generate Admin Password Hash**
```bash
# Run this in Node REPL
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('dev_password_123', 10);
console.log(hash);
// Copy output into ADMIN_PASSWORD_HASH
```

**Step 1d: Verify Environment**
```bash
# Check that env vars load correctly
node -e "console.log(process.env.DATABASE_URL)"
# Should output your database URL

node -e "console.log(process.env.JWT_SECRET ? 'OK' : 'MISSING')"
# Should output: OK
```

### Files to Check
- [ ] `.env.local` exists in root
- [ ] All REQUIRED vars are set
- [ ] No credentials in git (check `.gitignore`)
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` connects successfully

### Critical Variables for Phase 1
| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost/matola` |
| `JWT_SECRET` | Sign authentication tokens | `dev_secret_key_min_32_chars_long_12345` |
| `ENCRYPTION_KEY` | Encrypt sensitive data | `dev_encrypt_key_min_32_chars_12345` |
| `CSRF_SECRET` | Prevent CSRF attacks | `dev_csrf_key_min_32_chars_long_12345` |
| `ADMIN_PHONE` | Default admin account | `+265999999999` |
| `ADMIN_PASSWORD_HASH` | Admin password (hashed) | `$2a$10$...` |
| `REDIS_URL` | Session/cache storage | `redis://localhost:6379` |
| `NODE_ENV` | Environment type | `development` |

### Verification Checklist
- [ ] `cat .env.local` shows all vars are set
- [ ] No "undefined" values in output
- [ ] Database URL is valid PostgreSQL format
- [ ] JWT_SECRET length >= 32 characters
- [ ] No credentials visible in `git status`

---

## Task 1.3: Set Up Redis (Optional but Recommended) (1.5 hours)

### Current State
```
✗ Redis not running
✗ Background jobs fail silently
✗ USSD sessions lost after restart
✗ Rate limiting not working
```

### Why Redis is Critical
1. **Matching Job** - Matches shipments to transporters every 5 min
2. **Notification Job** - Sends SMS/WhatsApp notifications
3. **USSD Sessions** - Persists user state across requests
4. **Token Blacklist** - Tracks logged-out users
5. **Rate Limiting** - Prevents abuse

**Without Redis:** Most background features silently fail.

### What Needs to Happen

**Option A: Use Local Redis (Development)**
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows (using WSL)
wsl sudo service redis-server start

# Verify it's running
redis-cli ping
# Should output: PONG
```

**Option B: Use Upstash Redis (Cloud)**
1. Go to https://upstash.com/console/redis
2. Create database (Europ region for Malawi latency)
3. Copy connection string
4. Add to `.env.local`:
```bash
REDIS_URL="redis://default:password@host:port"
```

**Option C: Skip Redis (Dev Only)**
```bash
# Disable in development
REDIS_ENABLED=false
```
⚠️ Warning: Skipping breaks background jobs

### Step-by-Step Setup

**For Local Redis:**
```bash
# 1. Install
brew install redis

# 2. Start service
brew services start redis

# 3. Verify connection
redis-cli ping
# Output: PONG

# 4. Test with Node
node -e "
const redis = require('redis');
const client = redis.createClient();
client.on('connect', () => console.log('Connected!'));
"
```

**For Upstash Redis:**
```bash
# 1. Create account at https://upstash.com
# 2. Create database (select EU region)
# 3. Copy REST API endpoint
# 4. Add to .env.local:
REDIS_URL="redis://default:ey-password@us-east-1-redis.upstash.io:38271"

# 5. Test:
npm install redis
node -e "
const { createClient } = require('redis');
const client = createClient({ url: process.env.REDIS_URL });
client.on('connect', () => console.log('Connected to Upstash!'));
client.connect();
"
```

### Files to Check
- [ ] `lib/redis/client.ts` - Redis connection code
- [ ] `.env.local` - `REDIS_URL` set
- [ ] `redis-cli ping` returns PONG (if using local)
- [ ] No Redis errors in startup logs

### Verification Checklist
- [ ] `redis-cli info` shows server running (local) OR
- [ ] Upstash console shows active connections (cloud)
- [ ] `npm run start:workers` runs without errors
- [ ] Background jobs visible in logs
- [ ] USSD sessions persist after request

---

## Task 1.4: Start App & Verify Startup (45 minutes)

### Current State
```
✗ App won't start (missing dependencies)
✗ Can't reach http://localhost:3000
```

### What Needs to Happen

**Step 1a: Install Dependencies**
```bash
# Make sure all npm packages are installed
npm install

# Verify no missing packages
npm audit

# Fix any critical vulnerabilities
npm audit fix
```

**Step 1b: Build the App**
```bash
# Compile TypeScript
npm run build

# If build fails, fix errors (usually import issues)
# Look for: "Cannot find module", "Property 'X' does not exist"
```

**Step 1c: Start Development Server**
```bash
# Start Next.js dev server
npm run dev

# Should output:
#   ▲ Next.js 16.x.x
#   - Local:        http://localhost:3000
#   - Environments: .env.local
#   ✓ Ready in 2.5s
```

**Step 1d: Verify App is Running**
```bash
# In new terminal:
curl http://localhost:3000

# Should return HTML (homepage)
# NOT: 502 Bad Gateway, 500 error, or connection refused
```

**Step 1e: Check Admin Dashboard**
```bash
# Open in browser
http://localhost:3000/dashboard/admin

# Should ask for login (not 500 error)
```

### Common Startup Issues & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module 'prisma'` | Prisma not installed | `npm install @prisma/client` |
| `DATABASE_URL is not set` | Env var missing | Add `DATABASE_URL` to `.env.local` |
| `ECONNREFUSED (database)` | Database not running | `pg_ctl start` or Docker: `docker-compose up` |
| `ECONNREFUSED (redis)` | Redis not running | `redis-cli ping` then `brew services start redis` |
| `Cannot find module 'lib/...'` | Broken import path | Check `tsconfig.json` paths |
| `Error: ENAMETOOLONG` | Tailwind CSS cache issue | `rm -rf .next && npm run build` |

### Files to Check
- [ ] `package.json` - All dependencies listed
- [ ] `npm ls` - No conflicting versions
- [ ] Terminal shows "Ready in Xs" (not error)
- [ ] `curl http://localhost:3000` returns HTML

### Verification Checklist
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads homepage
- [ ] http://localhost:3000/api/health returns `{"status":"ok"}`
- [ ] http://localhost:3000/dashboard/admin redirects to login
- [ ] Console shows no red errors

---

## Task 1.5: Test Basic Functionality (1 hour)

### Current State
```
✓ App is running
? Core features working?
? Can users authenticate?
? Can shipments be created?
```

### Manual Tests to Run

**Test 1: User Registration**
```bash
# 1. Open http://localhost:3000/register
# 2. Fill form:
#    - Name: Test User
#    - Phone: +265999999001
#    - Password: TestPassword123!
#    - Role: Shipper
# 3. Submit
# Expected: Redirects to login, no errors

# 4. Verify in database:
psql $DATABASE_URL -c "SELECT * FROM users WHERE phone = '+265999999001';"
# Should return one row
```

**Test 2: User Login**
```bash
# 1. Go to http://localhost:3000/login
# 2. Enter:
#    - Phone: +265999999001
#    - Password: TestPassword123!
# 3. Submit
# Expected: Redirects to /dashboard, shows user profile
```

**Test 3: Create Shipment**
```bash
# 1. Click "New Shipment" button
# 2. Fill form:
#    - From: Lilongwe
#    - To: Blantyre
#    - Weight: 500kg
#    - Price: MWK 15,000
# 3. Submit
# Expected: Shipment created, shows in list

# 4. Verify in database:
psql $DATABASE_URL -c "SELECT * FROM shipments ORDER BY created_at DESC LIMIT 1;"
# Should show your shipment
```

**Test 4: Background Jobs Running**
```bash
# 1. Start workers (in new terminal):
npm run start:workers

# 2. Check logs for:
#    - "Matching job running..."
#    - "Notification job running..."
#    - No error messages

# 3. Verify in Redis:
redis-cli keys "*"
# Should show keys like: "match:queue:*", "notification:*"
```

### Verification Checklist
- [ ] User registration works
- [ ] User login works
- [ ] JWT token issued and stored in cookies
- [ ] Shipment creation works
- [ ] Admin dashboard accessible with auth
- [ ] Background jobs start without errors
- [ ] No 500 errors in console

---

## End of Phase 1 Verification

Run this checklist to confirm Phase 1 is complete:

```bash
# 1. Database migrations exist and ran
npx prisma migrate status
# Output: Database schema is up to date

# 2. Environment variables configured
node -e "console.log(process.env.DATABASE_URL ? '✓' : '✗ DATABASE_URL')"
node -e "console.log(process.env.JWT_SECRET ? '✓' : '✗ JWT_SECRET')"

# 3. App starts without errors
npm run build 2>&1 | grep -i error
# Output: (nothing if no errors)

# 4. App runs locally
npm run dev &
sleep 5
curl -s http://localhost:3000/api/health | grep -q "ok"
echo "✓ Health check passed"
kill %1

# 5. Database has test data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
# Output: 1+

# 6. Can authenticate
# (Manual test through UI)
```

**If all pass:** ✅ **Phase 1 Complete** → Proceed to Phase 2

**If any fail:** ⚠️ Fix the failing item before continuing

---

## Quick Reference: Phase 1 Commands

```bash
# Setup
npm install
cp .env.example .env.local
# (edit .env.local with your values)

# Database
npx prisma migrate dev --name init
npm run seed-database
npx prisma studio

# Redis (optional)
brew services start redis
# or use Upstash cloud

# Run
npm run dev

# Workers (separate terminal)
npm run start:workers

# Test
curl http://localhost:3000/api/health
# Open http://localhost:3000 in browser
```

---

## Estimated Timeline

| Task | Time | Status |
|---|---|---|
| 1.1 Database Migrations | 1.5h | ⬜ |
| 1.2 Env Variables | 0.5h | ⬜ |
| 1.3 Redis Setup | 1.5h | ⬜ |
| 1.4 Start App | 0.75h | ⬜ |
| 1.5 Test Functionality | 1h | ⬜ |
| **PHASE 1 TOTAL** | **~5h** | ⬜ |

**Expected Completion:** Today (if starting fresh) → Tomorrow (if troubleshooting)

---

## Next Step

Once Phase 1 ✅ is complete, proceed to **PHASE 2: SECURITY FIXES** (webhook verification, ownership checks, idempotency).

DO NOT skip to Phase 2 until the app boots locally and basic tests pass.
