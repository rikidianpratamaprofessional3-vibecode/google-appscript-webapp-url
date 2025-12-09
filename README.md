# GAS Link - Professional URL Shortener for Google Apps Script

A SaaS platform to create professional short links for Google Apps Script webapps. Built with Cloudflare stack for ultra-fast performance.

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router

### Backend
- Cloudflare Workers (Hono.js)
- Cloudflare D1 (SQLite database)
- Cloudflare KV (caching)
- TypeScript

## Features

- 🔐 User authentication (signup/login)
- 🔗 Create custom short links
- 📊 Click tracking and analytics
- ⚡ Ultra-fast redirects (< 50ms)
- 🗂️ Link management dashboard
- 🎯 Free tier: 10 links max
- 🚀 Cloudflare global edge network

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Cloudflare account (free tier works!)
- Wrangler CLI

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend (Workers):**
```bash
cd workers
npm install
```

### 2. Install Wrangler CLI (Cloudflare)

```bash
npm install -g wrangler
```

### 3. Cloudflare Setup

**Login to Cloudflare:**
```bash
wrangler login
```

**Create D1 Database:**
```bash
cd workers
wrangler d1 create gas-link-db
```

Copy the database ID from output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gas-link-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with your ID
```

**Create KV Namespace:**
```bash
wrangler kv:namespace create "KV"
```

Copy the KV ID and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"  # Replace with your ID
```

**Run Database Migrations:**
```bash
wrangler d1 execute gas-link-db --file=../database/schema.sql
```

**Set JWT Secret:**
```bash
wrangler secret put JWT_SECRET
# Enter a random secret string (e.g., generated from: openssl rand -base64 32)
```

### 4. Frontend Environment Setup

Create `.env` file in `frontend/` directory:
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:8787
VITE_SHORT_URL_BASE=http://localhost:8787
```

### 5. Development

**Terminal 1 - Start Backend (Workers):**
```bash
cd workers
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Open browser: http://localhost:5173

### 6. Test the Application

1. **Signup**: Create a new account at http://localhost:5173/signup
2. **Login**: Login with your credentials
3. **Create Link**: 
   - Paste GAS webapp URL (e.g., `https://script.google.com/macros/s/...`)
   - Choose a custom slug (e.g., `my-app`)
   - Click "Create Link"
4. **Test Redirect**: Visit `http://localhost:8787/my-app` - should redirect to your GAS webapp
5. **Check Analytics**: View click counts in dashboard

## Deployment

### Deploy Backend (Workers)

```bash
cd workers

# Deploy to Cloudflare Workers
npm run deploy

# Your worker will be live at: https://your-worker.workers.dev
```

### Deploy Frontend (Cloudflare Pages)

**Option 1: Via Wrangler**
```bash
cd frontend

# Build frontend
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=gas-link-dashboard
```

**Option 2: Via Cloudflare Dashboard**
1. Go to Cloudflare Dashboard → Pages
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
4. Add environment variables:
   - `VITE_API_BASE_URL`: Your worker URL
   - `VITE_SHORT_URL_BASE`: Your custom domain or worker URL
5. Deploy

### Production Environment Variables

**Frontend (.env.production or Pages settings):**
```
VITE_API_BASE_URL=https://your-worker.workers.dev
VITE_SHORT_URL_BASE=https://yourlink.com
```

**Backend (Wrangler secrets):**
```bash
wrangler secret put JWT_SECRET
# Enter your production JWT secret
```

Update `wrangler.toml` for production:
```toml
[vars]
ENVIRONMENT = "production"
```

## Custom Domain Setup

### For Worker (API + Redirects)

1. Go to Cloudflare Dashboard → Workers
2. Select your worker
3. Go to Settings → Triggers
4. Add Custom Domain (e.g., `link.yourdomain.com`)
5. Update frontend `.env`:
   ```
   VITE_API_BASE_URL=https://link.yourdomain.com
   VITE_SHORT_URL_BASE=https://link.yourdomain.com
   ```

### For Pages (Dashboard)

1. Go to Cloudflare Dashboard → Pages
2. Select your project
3. Custom domains → Add custom domain (e.g., `dashboard.yourdomain.com`)

## Project Structure

```
gas-link/
├── frontend/              # React dashboard
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── workers/              # Cloudflare Workers API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   ├── utils/        # Helper functions
│   │   └── index.ts      # Main worker
│   ├── wrangler.toml
│   └── package.json
├── database/
│   └── schema.sql        # D1 database schema
├── PRD.md
├── ARCHITECTURE.md
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Links
- `GET /api/links` - Get all user links
- `POST /api/links` - Create new link
- `GET /api/links/:id` - Get link by ID
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Redirect
- `GET /:slug` - Redirect to destination URL

## Subscription Limits

- **Free**: 10 links max
- **Pro**: 100 links (future)
- **Business**: Unlimited (future)

## Troubleshooting

### "Database not found" error
```bash
# Make sure you've created and migrated the database
cd workers
wrangler d1 create gas-link-db
wrangler d1 execute gas-link-db --file=../database/schema.sql
```

### "KV namespace not found" error
```bash
# Create KV namespace
cd workers
wrangler kv:namespace create "KV"
# Update the ID in wrangler.toml
```

### CORS errors
- Check that CORS origins in `workers/src/index.ts` include your frontend URL
- For production, update CORS origins to your production domain

### JWT errors
```bash
# Set JWT secret
cd workers
wrangler secret put JWT_SECRET
```

## Performance

- **Redirect speed**: < 50ms (edge caching)
- **Dashboard load**: < 2s
- **API response**: < 300ms
- **Global CDN**: Cloudflare's 300+ edge locations

## Cloudflare Free Tier Limits

- Workers: 100k requests/day
- D1: 5M reads/day, 100k writes/day
- KV: 100k reads/day, 1k writes/day
- Pages: Unlimited bandwidth

**Can handle ~3M requests/month on free tier!**

## Future Features (Roadmap)

- [ ] Advanced analytics with charts
- [ ] Stripe payment integration
- [ ] Custom domains per user
- [ ] QR code generation
- [ ] Team collaboration
- [ ] API access
- [ ] Link expiration
- [ ] Password-protected links

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Cloudflare Stack**
