# Deployment Guide

Complete guide to deploy your GAS Link application to production on Cloudflare.

## Prerequisites

- [ ] Cloudflare account (free tier works)
- [ ] Wrangler CLI installed and authenticated
- [ ] Domain name (optional, can use workers.dev subdomain)
- [ ] All tests passing locally

## Deployment Steps

### 1. Prepare Backend (Workers)

#### 1.1 Update wrangler.toml for Production

Edit `workers/wrangler.toml`:
```toml
name = "gas-link-worker"
main = "src/index.ts"
compatibility_date = "2024-01-10"

[[d1_databases]]
binding = "DB"
database_name = "gas-link-db"
database_id = "YOUR_PRODUCTION_DATABASE_ID"  # Make sure this is set

[[kv_namespaces]]
binding = "KV"
id = "YOUR_PRODUCTION_KV_ID"  # Make sure this is set

[vars]
ENVIRONMENT = "production"
JWT_EXPIRES_IN = "7d"
```

#### 1.2 Set Production Secrets

```bash
cd workers

# Set a strong JWT secret for production
wrangler secret put JWT_SECRET
# Enter a secure random string (use: openssl rand -base64 32)
```

#### 1.3 Deploy Worker

```bash
cd workers
npm run deploy
```

**Output example:**
```
✨ Deployed gas-link-worker
   https://gas-link-worker.YOUR-SUBDOMAIN.workers.dev
```

**Save this URL!** You'll need it for frontend configuration.

#### 1.4 Test Production API

```bash
# Test health endpoint
curl https://gas-link-worker.YOUR-SUBDOMAIN.workers.dev/api/health
```

Expected: `{"status":"ok", ...}`

### 2. Deploy Frontend (Cloudflare Pages)

#### Option A: Deploy via Wrangler (Quick)

```bash
cd frontend

# Build production bundle
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=gas-link-dashboard
```

Follow the prompts. Your dashboard will be live at:
`https://gas-link-dashboard.pages.dev`

#### Option B: Deploy via GitHub (Recommended)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/gas-link.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to: Workers & Pages → Pages → Create a project
   - Connect to Git → Select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `frontend`
     - **Install command**: `npm install`

3. **Set Environment Variables** in Pages settings:
   - `VITE_API_BASE_URL`: Your worker URL (e.g., `https://gas-link-worker.YOUR-SUBDOMAIN.workers.dev`)
   - `VITE_SHORT_URL_BASE`: Same as above (or custom domain)

4. **Deploy**: Click "Save and Deploy"

Your app will be live at: `https://gas-link-dashboard.pages.dev`

### 3. Update CORS Settings

Edit `workers/src/index.ts` to allow your production frontend:

```typescript
app.use('/*', cors({
  origin: [
    'http://localhost:5173',  // Development
    'https://gas-link-dashboard.pages.dev',  // Production
    'https://yourdomain.com',  // Custom domain (if any)
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

Redeploy worker:
```bash
cd workers
npm run deploy
```

### 4. Custom Domain Setup (Optional)

#### 4.1 For Worker (API + Redirects)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. Select your worker: `gas-link-worker`
3. Go to Settings → Triggers → Custom Domains
4. Click "Add Custom Domain"
5. Enter: `link.yourdomain.com` (or `yourdomain.com`)
6. Wait for DNS propagation (~5 minutes)

Your short links will now be:
`https://link.yourdomain.com/your-slug`

#### 4.2 For Pages (Dashboard)

1. Go to Cloudflare Dashboard → Workers & Pages → Pages
2. Select your project: `gas-link-dashboard`
3. Custom domains → Add custom domain
4. Enter: `dashboard.yourdomain.com`

Your dashboard will be at:
`https://dashboard.yourdomain.com`

#### 4.3 Update Environment Variables

After adding custom domain, update Pages environment variables:
- `VITE_API_BASE_URL`: `https://link.yourdomain.com`
- `VITE_SHORT_URL_BASE`: `https://link.yourdomain.com`

Redeploy Pages or let it auto-deploy.

### 5. Post-Deployment Verification

#### 5.1 Test Production Application

1. **Open dashboard**: https://gas-link-dashboard.pages.dev
2. **Sign up**: Create a production account
3. **Create link**: 
   - Destination: Any GAS URL
   - Slug: `prod-test`
4. **Test redirect**: Visit `https://YOUR-WORKER.workers.dev/prod-test`
5. **Verify analytics**: Check click count increases

#### 5.2 Test API Endpoints

```bash
# Replace with your production URL
WORKER_URL="https://gas-link-worker.YOUR-SUBDOMAIN.workers.dev"

# Test health
curl $WORKER_URL/api/health

# Test signup
curl -X POST $WORKER_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"prod@test.com","password":"test123"}'

# Save the token from response
TOKEN="YOUR_TOKEN_HERE"

# Test create link
curl -X POST $WORKER_URL/api/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test123","destination_url":"https://example.com"}'
```

### 6. Monitoring & Analytics

#### 6.1 Enable Cloudflare Analytics

- Workers: Analytics are automatic (see Workers dashboard)
- Pages: Analytics are automatic (see Pages dashboard)

#### 6.2 View Logs

```bash
# Live tail worker logs
cd workers
wrangler tail

# View recent logs
wrangler tail --format=pretty
```

#### 6.3 Monitor Performance

- Go to Cloudflare Dashboard → Workers & Pages
- Select your worker/page
- View metrics:
  - Requests per second
  - Error rate
  - CPU time
  - Duration

### 7. Database Backup (Important!)

Cloudflare D1 doesn't auto-backup on free tier. Manual backup:

```bash
cd workers

# Export all data
wrangler d1 export gas-link-db --output=backup.sql

# Save backup file somewhere safe (Google Drive, GitHub private repo, etc.)
```

**Set up cron job for regular backups** (example for Linux/Mac):
```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/project/workers && wrangler d1 export gas-link-db --output=backup-$(date +\%Y\%m\%d).sql
```

### 8. Security Best Practices

#### 8.1 Secure JWT Secret
- Use strong random string (32+ characters)
- Never commit to git
- Use `wrangler secret put` only

#### 8.2 Rate Limiting (Future Enhancement)
Consider adding rate limiting middleware in `workers/src/middleware/`

#### 8.3 HTTPS Only
Cloudflare enforces HTTPS by default ✅

#### 8.4 Environment Variables
- Never commit `.env` files
- Use Cloudflare Pages environment variables
- Use Wrangler secrets for sensitive data

### 9. CI/CD Setup (Optional)

#### 9.1 GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Worker
        working-directory: workers
        run: |
          npm install
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-pages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Build and Deploy Pages
        working-directory: frontend
        run: |
          npm install
          npm run build
          npx wrangler pages deploy dist --project-name=gas-link-dashboard
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets.

### 10. Cost Estimation

#### Cloudflare Free Tier (per day):
- Workers: 100k requests
- D1: 5M reads, 100k writes
- KV: 100k reads, 1k writes
- Pages: Unlimited

**Estimated capacity**: ~3M requests/month = ~1,000 active users

#### When to Upgrade:
- Workers Paid ($5/mo): 10M requests (100x more)
- Consistent usage > 70% of daily limits

### 11. Rollback Procedure

If deployment fails:

#### Rollback Worker:
```bash
cd workers

# View deployments
wrangler deployments list

# Rollback to previous
wrangler rollback --message="Rolling back to stable version"
```

#### Rollback Pages:
- Go to Cloudflare Dashboard → Pages
- Select project → Deployments
- Find previous stable deployment
- Click "..." → "Rollback to this deployment"

### 12. Production Checklist

Before going live:

- [ ] Worker deployed and accessible
- [ ] Pages deployed and accessible
- [ ] Custom domain configured (if applicable)
- [ ] JWT_SECRET set in production
- [ ] Database migrated
- [ ] KV namespace created
- [ ] CORS configured for production URLs
- [ ] Environment variables set in Pages
- [ ] Test signup flow
- [ ] Test link creation
- [ ] Test redirect functionality
- [ ] Test analytics tracking
- [ ] Database backup created
- [ ] Monitoring enabled
- [ ] Documentation complete

### 13. Post-Launch

- Monitor error rates in Cloudflare dashboard
- Check user feedback
- Monitor database size
- Set up alerts for high usage
- Plan scaling strategy

## Troubleshooting

### "Worker not found"
```bash
wrangler deploy
```

### "Database not found in production"
- Check `database_id` in wrangler.toml
- Re-run migration if needed

### CORS errors in production
- Update CORS origins in `workers/src/index.ts`
- Redeploy worker

### Environment variables not working
- Check Pages → Settings → Environment Variables
- Redeploy Pages after changing variables

### Custom domain not working
- Wait 5-10 minutes for DNS propagation
- Check DNS records in Cloudflare Dashboard

## Support & Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Congratulations! Your app is live! 🎉**
