# MineComply API - Local Development Setup

> Complete guide for setting up the backend API on your local machine

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Quick Start

**For experienced developers** (~5-10 minutes):

```bash
# 1. Clone and install
git clone <repository-url>
cd minecomplyapi
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Setup database
npm run prisma:generate
npm run prisma:migrate
npx prisma db execute --file prisma/policies/enable_rls.sql

# 4. Start server
npm run start:dev
```

**Verify**: Visit `http://localhost:3000/health` - should return `{"status":"ok"}`

For detailed walkthrough, continue reading below.

---

## Detailed Setup

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Check Command | Download |
|------|---------|---------------|----------|
| **Node.js** | 20.x or higher | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x or higher | `npm --version` | Comes with Node.js |
| **Git** | Latest | `git --version` | [git-scm.com](https://git-scm.com) |

**Optional but recommended:**
- **VS Code** with extensions: ESLint, Prettier, Prisma
- **Postman** or **Insomnia** for API testing

---

### Step 1: Create Supabase Project

You need a Supabase account for authentication and database.

#### 1.1 Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

#### 1.2 Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `minecomply-dev` (or your preference)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for development

4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

#### 1.3 Gather Supabase Credentials

Once your project is ready, collect the following:

**From Project Settings → API:**
- `Project URL` (e.g., `https://xxxxx.supabase.co`)
- `anon` key (public key)
- `service_role` key (secret key - never expose to clients!)

**From Project Settings → Database:**
- Connection string (URI format)
- Direct connection URL

**JWKS URL:**
- Format: `https://YOUR_PROJECT_REF.supabase.co/rest/v1/`
- Replace `YOUR_PROJECT_REF` with your project reference ID from the URL

---

### Step 2: Clone Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd minecomplyapi
```

**Note**: Replace `<repository-url>` with the actual Git URL.

---

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- NestJS framework
- Prisma ORM
- Supabase client
- PDF/DOCX generation libraries
- And more...

**Expected output**: Should complete without errors. If you see warnings, they're usually okay.

---

### Step 4: Configure Environment Variables

#### 4.1 Create .env File

```bash
# Copy the example environment file
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually:

```bash
# Windows
type nul > .env

# Mac/Linux
touch .env
```

#### 4.2 Edit .env File

Open `.env` in your code editor and fill in the following:

```bash
# ==================== APPLICATION ====================
NODE_ENV=development
PORT=3000
GLOBAL_PREFIX=api
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081

# ==================== DATABASE ====================
# Get this from Supabase → Settings → Database → Connection String (URI)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# ==================== SUPABASE AUTHENTICATION ====================
# Get these from Supabase → Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# JWKS URL for JWT validation
# Format: https://YOUR_PROJECT_REF.supabase.co/rest/v1/
SUPABASE_JWKS_URL=https://xxxxx.supabase.co/rest/v1/

# ==================== SUPABASE STORAGE ====================
# We'll create this bucket in the next step
SUPABASE_STORAGE_BUCKET=minecomply-dev-bucket
SUPABASE_STORAGE_UPLOADS_PATH=uploads/
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` in `DATABASE_URL` with your actual database password
- Replace all `xxxxx` with your actual project reference ID
- Keep `service_role` key SECRET - never commit to git
- Update `CORS_ORIGINS` with your local IP for mobile testing

#### 4.3 Find Your Local IP (for CORS)

You'll need your local IP address for the mobile app to connect:

**Windows:**
```cmd
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Or simpler:
ipconfig getifaddr en0  # Mac WiFi
```

Add your IP to `CORS_ORIGINS`:
```bash
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.XXX:8081
```

---

### Step 5: Setup Supabase Storage

#### 5.1 Create Storage Bucket

Go to your Supabase Dashboard → Storage → Buckets:

1. Click "Create bucket"
2. **Name**: `minecomply-dev-bucket` (must match .env)
3. **Public bucket**: ❌ No (keep private)
4. Click "Create bucket"

#### 5.2 Add Storage Policies

Go to Storage → Policies:

Click "New Policy" for your bucket, then "Custom" and add these policies:

**Policy 1: Service Role Insert**
```sql
CREATE POLICY "Service role can insert"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomply-dev-bucket'
);
```

**Policy 2: Service Role Select**
```sql
CREATE POLICY "Service role can select"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomply-dev-bucket'
);
```

**Policy 3: Service Role Delete**
```sql
CREATE POLICY "Service role can delete"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomply-dev-bucket'
);
```

Click "Review" → "Save policy" for each.

---

### Step 6: Setup Database

#### 6.1 Generate Prisma Client

```bash
npm run prisma:generate
```

This generates TypeScript types from your Prisma schema.

**Expected output**: `✔ Generated Prisma Client`

#### 6.2 Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all database tables in your Supabase database.

**Expected output**: 
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

**Verify**: Go to Supabase → Database → Tables. You should see tables like:
- `User`
- `ECCReport`
- `CMVRReport`
- `AttendanceRecord`
- `ValidationSession`
- `ValidationEntry`
- `ECCCondition`
- `profiles`

#### 6.3 Apply Row-Level Security Policies

```bash
npx prisma db execute --file prisma/policies/enable_rls.sql --schema prisma/schema.prisma
```

This enables Row-Level Security on certain tables for multi-tenancy.

**Expected output**: `The SQL file was executed successfully.`

---

### Step 7: Start Development Server

```bash
npm run start:dev
```

**Expected output**:
```
[Nest] 12345  - 12/03/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 12/03/2025, 10:00:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
...
[Nest] 12345  - 12/03/2025, 10:00:02 AM     LOG [NestApplication] Nest application successfully started
```

The server is now running on `http://localhost:3000`!

**Keep this terminal window open** - the server needs to run continuously.

---

## Verification

### Test 1: Health Check

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "environment": "development",
  "service": "MineComply API",
  "time": "2025-12-03T10:00:00.000Z"
}
```

✅ If you see this, your API is running!

### Test 2: Swagger Documentation

Open in browser:
```
http://localhost:3000/api/docs
```

You should see the **Swagger UI** with all API endpoints documented.

✅ If you see the API documentation, Swagger is working!

### Test 3: Database Connection

```bash
# Open Prisma Studio to browse your database
npm run prisma:studio
```

This opens `http://localhost:5555` with a visual database editor.

✅ If you can see your tables, database is connected!

### Test 4: Liveness Probe

```bash
curl http://localhost:3000/health/live
```

**Expected response:**
```json
{
  "status": "live",
  "uptime": 123.456
}
```

### Test 5: Readiness Probe

```bash
curl http://localhost:3000/health/ready
```

**Expected response:**
```json
{
  "status": "ready",
  "dependencies": {
    "supabaseAuth": true,
    "supabaseStorage": true
  }
}
```

✅ If both are `true`, your Supabase configuration is correct!

---

## Troubleshooting

### Issue: Port 3000 Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Or change the port in `.env`:
```bash
PORT=3001
```

---

### Issue: Prisma Migration Fails

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solution:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check your database password has no special characters that need escaping
3. Ensure your Supabase project is running (not paused)
4. Try resetting the connection:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

---

### Issue: Invalid JWT Token / JWKS Errors

**Symptoms:**
```
Error: Unable to verify JWT token
```

**Solution:**
1. Verify `SUPABASE_JWKS_URL` ends with `/rest/v1/`
2. Ensure `SUPABASE_URL` matches your project URL
3. Check that you're using the correct `service_role` key
4. Restart the server after changing .env

---

### Issue: Storage Policies Not Working

**Symptoms:**
```
Error: new row violates row-level security policy
```

**Solution:**
1. Verify you created all 3 storage policies (INSERT, SELECT, DELETE)
2. Ensure `bucket_id` in policies matches your bucket name exactly
3. Check you're using `service_role` key, not `anon` key
4. Try recreating the policies from Supabase dashboard

---

### Issue: CORS Errors from Mobile App

**Symptoms:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
1. Add your local IP to `CORS_ORIGINS` in `.env`:
```bash
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```
2. Restart the server after changing .env
3. Ensure your IP hasn't changed (DHCP can reassign IPs)

---

### Issue: npm install Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: BigInt Serialization Error

**Symptoms:**
```
TypeError: Do not know how to serialize a BigInt
```

**Solution:**
This is already handled in `main.ts`. If you still see this:
1. Ensure `main.ts` has this code:
```typescript
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
```
2. Restart the server

---

### Issue: Environment Variables Not Loading

**Symptoms:**
```
Error: Config validation error: "DATABASE_URL" is required
```

**Solution:**
1. Ensure `.env` file is in the project root (next to `package.json`)
2. Check file name is exactly `.env` (not `.env.txt`)
3. Verify no extra spaces around `=` in `.env`
4. Restart the server after changing `.env`

---

### Getting Help

If you're still stuck:

1. **Check the logs**: Look for specific error messages in the terminal
2. **Review documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md) and [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
3. **Verify credentials**: Double-check all Supabase credentials in `.env`
4. **Clean restart**: Stop server, `npm install`, restart
5. **Ask the team**: Share the specific error message and what you tried

---

## Next Steps

Now that your backend is running:

### 1. Setup the Frontend

Follow the setup guide in `minecomplyapp/docs/LOCAL_SETUP.md` to get the mobile app running.

### 2. Create a Test User

Go to your Supabase Dashboard → Authentication → Users:
- Click "Add user"
- Enter email and password
- Click "Create user"

Or use the mobile app signup screen (once frontend is set up).

### 3. Explore the API

- **Swagger Docs**: `http://localhost:3000/api/docs`
- **Test endpoints**: Use Postman or Swagger UI
- **Review API Reference**: See [API_REFERENCE.md](API_REFERENCE.md)

### 4. Development Workflow

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for:
- Adding new endpoints
- Working with database migrations
- PDF/DOCX generation
- Testing strategies
- Deployment process

### 5. Team Collaboration

- **Keep .env private**: Never commit to git
- **Share .env.example**: Update when adding new variables
- **Document changes**: Update documentation when changing APIs
- **Use branches**: Create feature branches, not direct commits to main

---

## Quick Reference

### Common Commands

```bash
# Development
npm run start:dev          # Start dev server with hot reload
npm run start:debug        # Start with debugger

# Database
npm run prisma:studio      # Open database GUI
npm run prisma:generate    # Regenerate Prisma client
npm run prisma:migrate     # Run migrations

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Generate coverage report

# Build & Production
npm run build              # Build for production
npm run start:prod         # Run production build
```

### Important URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Swagger Docs | http://localhost:3000/api/docs |
| Prisma Studio | http://localhost:5555 |
| Supabase Dashboard | https://app.supabase.com |

### Project Structure

```
minecomplyapi/
├── src/
│   ├── app.module.ts      # Root module
│   ├── main.ts            # Entry point
│   ├── auth/              # Authentication
│   ├── cmvr/              # CMVR reports
│   ├── ecc/               # ECC reports
│   ├── attendance/        # Attendance records
│   ├── storage/           # File storage
│   └── prisma/            # Database service
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration history
│   └── policies/          # RLS policies
├── .env                   # Environment config (create this)
├── .env.example           # Environment template
└── package.json           # Dependencies
```

---

**Congratulations! 🎉** Your MineComply API backend is now running locally!

For frontend setup, continue to `minecomplyapp/docs/LOCAL_SETUP.md`

