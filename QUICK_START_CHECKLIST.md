# QUICK START CHECKLIST
## Get the app running in 30 minutes (if you're experienced) or 2 hours (first time)

---

## Pre-Flight Check (5 minutes)

Before you start, verify you have:

```bash
# Check Node version (need 18+)
node --version
# Output should be: v18.x.x or higher

# Check npm version (need 9+)
npm --version
# Output should be: 9.x.x or higher

# Check PostgreSQL
psql --version
# Output should be: psql (PostgreSQL) 14.x or higher

# Check Git
git --version
# Output should be: git version 2.x.x or higher
```

**✅ If all show correct versions, proceed.**
**❌ If any fail, install missing tools first.**

---

## 1. Install Dependencies (2 minutes)

```bash
# Navigate to project root
cd /path/to/matola

# Install npm packages
npm install

# Verify install succeeded
npm ls --depth=0 | head -20
# Should show: npm list without errors
```

**Expected:** No errors, shows list of installed packages

---

## 2. Set Up Environment Variables (3 minutes)

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
# On macOS:
open -e .env.local

# On Linux:
nano .env.local

# On Windows:
notepad .env.local
```

**Minimum required variables:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/matola
JWT_SECRET=dev_secret_key_that_is_at_least_32_chars_long_12345
ENCRYPTION_KEY=dev_encrypt_key_that_is_at_least_32_chars_long123
CSRF_SECRET=dev_csrf_key_that_is_at_least_32_chars_long_12345
NODE_ENV=development
```

**Expected:** .env.local file created with your database URL

---

## 3. Initialize Database (5 minutes)

```bash
# Create database migrations from schema
npx prisma migrate dev --name init

# When prompted: "Enter a name for the new migration" → press Enter

# Seed test data
npm run seed-database

# Verify database
npx prisma studio
# Opens browser to visual database explorer
# Should show tables: users, shipments, payments, etc.
```

**Expected:** 
- Migrations created in `prisma/migrations/`
- Database tables created
- Test data loaded (you can see it in Prisma Studio)

---

## 4. Start Development Server (3 minutes)

```bash
# Kill any existing node processes (if restarting)
# macOS/Linux:
pkill -f "node.*dev"

# Windows:
# Just close the terminal or use Task Manager

# Start dev server
npm run dev

# Watch for this output:
#   ▲ Next.js 16.x.x
#   - Local:        http://localhost:3000
#   - Environments: .env.local
#   ✓ Ready in 2.5s
```

**Expected:** Server starts, listens on http://localhost:3000

---

## 5. Verify App is Running (2 minutes)

**Open new terminal** (keep dev server running in first terminal)

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected output:
# {"status":"ok"}

# Test homepage loads
curl -s http://localhost:3000 | head -20

# Expected output:
# <!DOCTYPE html>
# <html...>
```

Or open browser: http://localhost:3000

**Expected:** Homepage loads, no errors in console

---

## 6. Test User Authentication (5 minutes)

**In browser:**

1. Go to http://localhost:3000/register
2. Fill form:
   - Name: Test User
   - Phone: +265999999001
   - Password: TestPassword123!
   - Role: Shipper
3. Click Register
4. Should redirect to login
5. Fill login form:
   - Phone: +265999999001
   - Password: TestPassword123!
6. Click Login
7. Should show dashboard

**Expected:** Successfully logged in, see dashboard

---

## 7. Start Background Workers (2 minutes - Optional but Recommended)

**In new terminal** (keep dev server running):

```bash
# Set up Redis first (if you want workers to work)
# Option A: Local Redis
redis-cli ping
# Expected: PONG

# Option B: Skip Redis for now
# Workers will queue jobs but not process them

# Start workers
npm run start:workers

# Expected output:
# Bull Worker Queue running
# Listening for jobs...
# (no errors)
```

**Expected:** Worker process running, waiting for jobs

---

## 8. Check Database Connection (1 minute)

```bash
# Verify Prisma connects to database
npx prisma studio

# Should open browser with database explorer
# You can see all tables and data

# Verify test users were created
npx prisma studio
# Users tab should show: Test User (+265999999001)
```

**Expected:** Prisma Studio shows database tables and test data

---

## ✅ DONE! Your app is running

At this point:
- ✅ Development server running (http://localhost:3000)
- ✅ Database initialized and populated
- ✅ User can register & login
- ✅ Environment configured
- ✅ Background workers ready (optional)

---

## Next Steps

### If you want to explore the code:
```bash
# Open code editor
code .

# Key files to understand:
# - app/page.tsx (homepage)
# - app/dashboard/page.tsx (main dashboard)
# - app/api/shipments/route.ts (API example)
# - lib/db/prisma.ts (database)
# - prisma/schema.prisma (database schema)
```

### If you want to run tests:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test

# Run with coverage
npm test -- --coverage
```

### If something doesn't work:

**Problem: "Cannot connect to database"**
```bash
# Verify PostgreSQL is running
psql -U postgres -d template1 -c "SELECT 1;"

# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL
```

**Problem: "Prisma migration failed"**
```bash
# Reset and try again
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

**Problem: "Port 3000 already in use"**
```bash
# macOS/Linux: Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Problem: "npm install fails"**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Common Commands Reference

```bash
# Development
npm run dev                # Start dev server
npm run build             # Build for production
npm run start             # Start production server

# Database
npx prisma studio        # Open database explorer
npx prisma migrate dev   # Create new migration
npx prisma migrate reset # Reset database (DESTRUCTIVE)

# Workers
npm run start:workers    # Start background job workers

# Testing
npm test                 # Run all tests
npm run test:e2e         # Run end-to-end tests
npm run test:load        # Load test (concurrent users)

# Security
npm audit               # Check for vulnerabilities
npm audit fix          # Fix vulnerabilities

# Code Quality
npm run lint           # Check code style
npm run type-check     # TypeScript type checking
```

---

## Troubleshooting Flowchart

```
App won't start?
├─ Check: npm install completed?
│  ├─ NO → Run: npm install
│  └─ YES → Continue
├─ Check: .env.local exists?
│  ├─ NO → Run: cp .env.example .env.local
│  └─ YES → Continue
├─ Check: DATABASE_URL correct?
│  ├─ NO → Edit: .env.local
│  └─ YES → Continue
├─ Check: npm run build succeeds?
│  ├─ NO → Check error message, fix
│  └─ YES → Continue
└─ Check: Port 3000 available?
   ├─ NO → Kill process: lsof -i :3000 | kill -9
   └─ YES → npm run dev should work!

Database won't connect?
├─ Check: PostgreSQL running?
│  ├─ NO → Start: brew services start postgresql
│  └─ YES → Continue
├─ Check: DATABASE_URL format correct?
│  ├─ NO → Fix format: postgresql://user:pass@host:port/db
│  └─ YES → Continue
└─ Check: Can connect manually?
   └─ Run: psql $DATABASE_URL

User can't login?
├─ Check: User registered?
│  ├─ NO → Register first
│  └─ YES → Continue
├─ Check: Password correct?
│  ├─ NO → Re-register
│  └─ YES → Check logs
└─ Check: JWT token set?
   └─ Run: curl -v http://localhost:3000/api/auth/login
```

---

## What to Avoid During Setup

❌ **DON'T:**
- Modify `prisma/schema.prisma` without understanding migrations
- Delete `.env.local` (contains sensitive data)
- Share secrets/API keys in chat or version control
- Use `npm install --legacy-peer-deps` (means something is wrong)
- Skip database initialization (will cause cryptic errors later)

✅ **DO:**
- Keep one dev server running
- Keep dev terminal output visible (shows errors)
- Test after each major step
- Document problems you encounter
- Use version control (git commit frequently)

---

## Success! Now What?

You now have:
1. ✅ Running development environment
2. ✅ Functional database
3. ✅ Authenticated users
4. ✅ API endpoints ready to test

**Next:** Read `/PHASE_1_CRITICAL_BLOCKERS.md` to verify everything is working correctly.

**Then:** Read `/PHASE_2_SECURITY_FIXES.md` to implement security features.

---

## Getting Help

**If something is wrong:**

1. **Check the error message carefully** - Most errors are self-explanatory
2. **Search for error in `/PHASE_1_CRITICAL_BLOCKERS.md`** - Common issues documented
3. **Check `/AUDIT_TO_INVARIANTS_MAPPING.md`** - Explains what should work
4. **Read `/APP_DEVELOPMENT_AUDIT_REPORT.md`** - Full technical details
5. **Ask your team lead** - Keep them updated on blockers

**Capture information:**
```bash
# If reporting an error, include:
npm --version
node --version
cat .env.local | grep DATABASE_URL
npm run build 2>&1 | tail -50
```

---

## Time Investment

| Step | Estimated Time | Actual Time |
|------|---|---|
| 1. Install deps | 2m | ___ |
| 2. Env vars | 3m | ___ |
| 3. Database | 5m | ___ |
| 4. Start server | 3m | ___ |
| 5. Verify running | 2m | ___ |
| 6. Test auth | 5m | ___ |
| 7. Workers (opt) | 2m | ___ |
| 8. Database check | 1m | ___ |
| **TOTAL** | **~23 minutes** | **___ minutes** |

**Pro tip:** If you take longer, note where the slowdown is. Might indicate an issue.

---

**Ready? Start with Step 1 above. Good luck! 🚀**
