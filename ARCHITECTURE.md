# Architecture: Cloudflare Free Plan Stack

## Overview
Aplikasi URL shortener SaaS menggunakan **100% Cloudflare services** dengan free plan, optimized untuk performance dan cost-effectiveness.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER REQUEST                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                   │
│                     (Global CDN - Free)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────┐
        │ Cloudflare Pages  │   │ Cloudflare Worker│
        │   (Dashboard UI)  │   │   (API + Redirect)│
        │      - Free       │   │   - 100k req/day │
        └───────────────────┘   └──────────────────┘
                                        │
                            ┌───────────┼───────────┐
                            │           │           │
                            ▼           ▼           ▼
                    ┌─────────┐  ┌─────────┐  ┌─────────┐
                    │  D1 DB  │  │   KV    │  │  R2     │
                    │ (SQLite)│  │ (Cache) │  │ (Files) │
                    │ 5GB Free│  │100k/day │  │ 10GB    │
                    └─────────┘  └─────────┘  └─────────┘
```

## Tech Stack

### 1. Frontend (Dashboard)
**Cloudflare Pages** (Free, Unlimited)
- Framework: React 18 + Vite
- UI: Tailwind CSS + shadcn/ui
- State: Zustand / React Query
- Build: Static export deployed to Pages
- URL: `dashboard.yourdomain.com`

**Features**:
- Automatic deployments from Git
- Preview deployments
- Edge caching
- Custom domains (free)

### 2. Backend (API & Redirect Service)
**Cloudflare Workers** (Free: 100k requests/day)
- Framework: Hono.js (ultra-lightweight, 20KB)
- Runtime: V8 isolates (faster than containers)
- Language: TypeScript
- Routes:
  - `/api/*` - API endpoints
  - `/:slug` - Redirect handler

**Why Hono.js?**
- Extremely fast on Workers
- Express-like API
- Built-in middleware
- TypeScript native
- Tiny bundle size

**Example Worker Structure**:
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

const app = new Hono()

// Redirect handler (FASTEST PATH)
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  // 1. Check KV cache first (< 10ms)
  const cachedUrl = await c.env.KV.get(`link:${slug}`)
  if (cachedUrl) {
    // Log analytics async (non-blocking)
    c.executionCtx.waitUntil(logAnalytics(slug, c.req))
    return c.redirect(cachedUrl, 301)
  }
  
  // 2. Fallback to D1 database
  const result = await c.env.DB.prepare(
    'SELECT destination_url FROM links WHERE slug = ? AND is_active = 1'
  ).bind(slug).first()
  
  if (result) {
    // Cache to KV for next time
    await c.env.KV.put(`link:${slug}`, result.destination_url, {
      expirationTtl: 3600 // 1 hour
    })
    c.executionCtx.waitUntil(logAnalytics(slug, c.req))
    return c.redirect(result.destination_url, 301)
  }
  
  return c.notFound()
})

// API routes
app.post('/api/links', jwt({ secret: 'xxx' }), async (c) => {
  // Create new link
})

export default app
```

### 3. Database Layer

#### Cloudflare D1 (Primary Database)
- Type: SQLite at edge
- Free Limits:
  - 5GB storage
  - 5M row reads/day
  - 100k row writes/day
- Use cases:
  - User accounts
  - Links metadata
  - Analytics data
  - Subscriptions

**Schema**:
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  subscription TEXT DEFAULT 'free',
  subscription_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Links table
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_accessed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_links_slug ON links(slug);
CREATE INDEX idx_links_user_id ON links(user_id);

-- Analytics table
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE INDEX idx_analytics_link_id ON analytics(link_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
```

#### Cloudflare KV (Cache Layer)
- Type: Global key-value store
- Free Limits:
  - 100k reads/day
  - 1k writes/day
  - 1GB storage
- Use cases:
  - Cache hot slugs → destination URLs
  - Session tokens
  - Rate limiting counters

**KV Strategy**:
```typescript
// Cache structure
Key: `link:${slug}`
Value: destination_url
TTL: 1 hour

// Cache popular links
// This reduces D1 reads dramatically
// Example: 1000 clicks on one link = 1 D1 read + 1000 KV reads
```

### 4. File Storage (Optional)
**Cloudflare R2** (Free: 10GB)
- S3-compatible object storage
- Use cases:
  - User avatars
  - QR code images (future)
  - Export files

### 5. Authentication
**Custom JWT Auth** (No external service needed)
```typescript
// Workers can handle JWT natively
import { sign, verify } from 'hono/jwt'

// Login
const token = await sign({ userId: user.id }, SECRET)

// Protect routes
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const payload = await verify(token, SECRET)
  c.set('userId', payload.userId)
  await next()
})
```

Alternative: **Clerk** (free tier: 10k MAU) if you want OAuth providers

### 6. Payments
**Stripe**
- Webhook handled by Worker
- Store subscription status in D1

```typescript
// Worker endpoint
app.post('/api/stripe/webhook', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()
  
  // Verify webhook
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  
  if (event.type === 'checkout.session.completed') {
    // Update user subscription in D1
    await c.env.DB.prepare(
      'UPDATE users SET subscription = ?, subscription_expires_at = ? WHERE id = ?'
    ).bind('pro', expiresAt, userId).run()
  }
  
  return c.json({ received: true })
})
```

### 7. Email
**Resend** (Free: 3k emails/month) or **SendGrid** (Free: 100/day)
- Triggered from Workers
- Transactional emails (welcome, reset password, billing)

## Deployment Flow

### Frontend (Cloudflare Pages)
```bash
# Connect GitHub repo to Cloudflare Pages
# Auto-deploy on push to main

# Build settings:
Build command: npm run build
Build output: dist
Root directory: /frontend
```

### Backend (Cloudflare Workers)
```bash
# Using Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy

# Manage D1
wrangler d1 create gas-link-db
wrangler d1 execute gas-link-db --file=schema.sql

# Manage KV
wrangler kv:namespace create "KV"
```

### Project Structure
```
gas-link/
├── frontend/              # React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── workers/               # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts      # Main worker
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── wrangler.toml     # Worker config
│   └── package.json
├── database/
│   ├── schema.sql        # D1 schema
│   └── migrations/
└── README.md
```

## Performance Optimization

### 1. Redirect Speed (Target: < 50ms)
```
Cold start: 
- KV lookup: ~10ms
- Worker execution: ~5ms
- Redirect: ~35ms
Total: ~50ms

Warm (cached):
- KV lookup: ~5ms
- Worker execution: ~2ms
- Redirect: ~10ms
Total: ~17ms
```

### 2. Caching Strategy
```typescript
// Tiered caching
1. Browser cache: 
   - 301 redirect (permanent) - browsers cache
   
2. KV cache:
   - Hot links (> 10 clicks/day)
   - TTL: 1 hour
   - Auto-refresh on access
   
3. D1 database:
   - Source of truth
   - Indexed on slug for fast lookups
```

### 3. Analytics (Non-blocking)
```typescript
// Don't wait for analytics to complete
app.get('/:slug', async (c) => {
  const url = await getDestinationUrl(slug)
  
  // Execute async without blocking response
  c.executionCtx.waitUntil(
    logAnalytics(slug, c.req)
  )
  
  return c.redirect(url)
})
```

## Cost Analysis (Free Plan)

### Limits (per day)
- Workers: 100k requests (~3M/month)
- D1 reads: 5M
- D1 writes: 100k
- KV reads: 100k
- Pages: Unlimited

### Example Usage (1000 users, 50k redirects/day)
- Redirects: 50k/day (50% of Workers limit) ✅
- D1 reads: ~10k/day (slug lookups not in cache) ✅
- D1 writes: ~50k/day (analytics) ✅
- KV reads: ~40k/day (cached lookups) ✅

**Verdict**: Free plan can handle **MVP with 1000+ users easily**

### When to upgrade?
- Workers Paid ($5/mo): 10M requests = 100x more
- D1 Paid: Higher limits
- Upgrade when hitting consistent 70% of daily limits

## Advantages of Cloudflare Stack

1. **Speed**: Edge computing = ultra-fast redirects worldwide
2. **Cost**: $0 for MVP, can scale to 1000s of users
3. **Simplicity**: No server management, auto-scaling
4. **Global**: Automatic global distribution
5. **Integrated**: All services work together seamlessly
6. **DDoS Protection**: Built-in (Cloudflare network)
7. **SSL**: Free automatic HTTPS
8. **Analytics**: Built-in Cloudflare analytics

## Potential Challenges & Solutions

### Challenge 1: D1 Write Limits (100k/day)
**Solution**: 
- Batch analytics writes
- Sample analytics (e.g., log 1 in 10 requests)
- Use KV for high-frequency writes, batch to D1

### Challenge 2: KV Write Limits (1k/day)
**Solution**:
- Only cache in KV if link has > 10 clicks/day
- Let D1 be primary, KV is optimization
- Implement smart caching policy

### Challenge 3: Cold Starts
**Solution**:
- Workers have minimal cold start (< 10ms)
- Use Durable Objects for stateful needs (future)
- Keep Workers warm with health checks

### Challenge 4: No Postgres
**Solution**:
- D1 is SQLite, supports most SQL features
- Use JSON columns for flexible data
- Denormalize data when needed

## Security Considerations

1. **Rate Limiting**: Use KV to track requests per IP
2. **JWT Secret**: Store in Workers secrets
3. **CORS**: Configure properly for dashboard
4. **URL Validation**: Sanitize all destination URLs
5. **SQL Injection**: Use prepared statements (Prisma-like API)
6. **DDoS**: Cloudflare built-in protection

## Monitoring & Observability

1. **Cloudflare Dashboard**: Built-in analytics
2. **Workers Logs**: Real-time logs via Wrangler
3. **Custom Metrics**: Store in D1, visualize in dashboard
4. **Sentry**: Error tracking (free tier)
5. **Uptime**: Use external service (UptimeRobot free)

## Example wrangler.toml

```toml
name = "gas-link-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "gas-link-db"
database_id = "xxxx-xxxx-xxxx"

# KV Namespace
[[kv_namespaces]]
binding = "KV"
id = "xxxx"

# Environment variables
[vars]
ENVIRONMENT = "production"

# Secrets (set via wrangler secret put)
# JWT_SECRET
# STRIPE_WEBHOOK_SECRET
# STRIPE_SECRET_KEY
```

## Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Setup D1 local
wrangler d1 create gas-link-db --local

# 3. Run migrations
wrangler d1 execute gas-link-db --local --file=schema.sql

# 4. Start local dev
wrangler dev

# 5. Test locally
curl http://localhost:8787/api/health

# 6. Deploy to production
wrangler deploy
```

## Conclusion

Cloudflare free plan stack adalah **perfect fit** untuk MVP URL shortener:
- Zero cost untuk start
- Production-ready performance
- Global edge network
- Easy to scale
- Simple deployment

Tech stack ini akan deliver **< 50ms redirect speed** globally dengan **$0 infrastructure cost**.
