# Quick Setup Guide

This is a step-by-step guide to get your GAS Link application running in 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Cloudflare account (sign up at cloudflare.com - free!)

## Step 1: Install Wrangler CLI (2 min)

```bash
npm install -g wrangler
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 2: Setup Backend (4 min)

```bash
# Navigate to workers directory
cd workers

# Install dependencies
npm install

# Create D1 Database
wrangler d1 create gas-link-db
```

**⚠️ IMPORTANT**: Copy the `database_id` from the output!

Edit `workers/wrangler.toml` and paste your `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gas-link-db"
database_id = "paste-your-database-id-here"  # ← PASTE HERE
```

```bash
# Create KV Namespace
wrangler kv:namespace create "KV"
```

**⚠️ IMPORTANT**: Copy the `id` from the output!

Edit `workers/wrangler.toml` and paste your KV `id`:
```toml
[[kv_namespaces]]
binding = "KV"
id = "paste-your-kv-id-here"  # ← PASTE HERE
```

```bash
# Run database migration
wrangler d1 execute gas-link-db --file=../database/schema.sql

# Set JWT secret (use any random string)
wrangler secret put JWT_SECRET
# When prompted, enter: my-super-secret-jwt-key-12345
```

## Step 3: Setup Frontend (2 min)

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Your `.env` should look like this:
```
VITE_API_BASE_URL=http://localhost:8787
VITE_SHORT_URL_BASE=http://localhost:8787
```

## Step 4: Run Development Servers (2 min)

Open **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd workers
npm run dev
```

Wait until you see: `⎔ Ready on http://localhost:8787`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait until you see: `Local: http://localhost:5173`

## Step 5: Test the Application

1. **Open browser**: http://localhost:5173
2. **Sign up**: Create a new account
3. **Create a link**:
   - Paste any Google Apps Script URL (or use: `https://script.google.com/macros/s/test123/exec`)
   - Choose slug: `test-app`
   - Click "Create Link"
4. **Test redirect**: Open new tab → http://localhost:8787/test-app
   - Should redirect to your destination URL!
5. **Check analytics**: Back to dashboard → see click count increased

## ✅ Success!

Your app is now running locally!

## Next Steps

### Deploy to Production

**Deploy Backend:**
```bash
cd workers
npm run deploy
# Note your worker URL: https://gas-link-worker.YOUR-SUBDOMAIN.workers.dev
```

**Deploy Frontend:**
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=gas-link-dashboard
```

Update frontend production URL in Cloudflare Pages environment variables:
- `VITE_API_BASE_URL`: Your worker URL
- `VITE_SHORT_URL_BASE`: Your worker URL

## Troubleshooting

### "Database not found"
```bash
cd workers
wrangler d1 execute gas-link-db --file=../database/schema.sql
```

### "Unauthorized" errors
```bash
cd workers
wrangler secret put JWT_SECRET
# Enter a secret key
```

### CORS errors
Check `workers/src/index.ts` - make sure CORS origin includes `http://localhost:5173`

### Port already in use
- Frontend: Edit `frontend/vite.config.ts` to change port
- Backend: Use `wrangler dev --port 8788`

## Common Commands

```bash
# Start development
cd workers && npm run dev          # Backend
cd frontend && npm run dev         # Frontend

# Deploy
cd workers && npm run deploy       # Backend
cd frontend && npm run build       # Frontend

# Database
cd workers
wrangler d1 execute gas-link-db --file=../database/schema.sql  # Migrate
wrangler d1 execute gas-link-db --command="SELECT * FROM users"  # Query

# View logs
wrangler tail  # Live logs
```

## Architecture Overview

```
User Browser
    ↓
Frontend (React) ← Cloudflare Pages
    ↓ API calls
Backend (Workers) ← Cloudflare Workers
    ↓
├── D1 Database (SQLite)
└── KV Cache (Redis-like)
```

## Free Tier Limits

- **100k requests/day** on Workers
- **5M database reads/day**
- **100k KV reads/day**
- **Can handle 1000+ users easily!**

## Need Help?

- Check README.md for detailed documentation
- See PRD.md for product requirements
- See ARCHITECTURE.md for technical architecture

---

**You're all set! Happy building! 🚀**
