# Product Requirements Document (PRD)
## GAS Link - Professional URL Shortener for Google Apps Script Webapps (SaaS)

### 1. Overview
Platform SaaS untuk membuat short link professional dari webapp Google Apps Script (GAS). User dapat copy-paste link webapp GAS panjang, memberikan nama custom, dan mendapatkan URL pendek yang professional untuk dibagikan.

### 2. Problem Statement
- Link webapp GAS sangat panjang dan tidak professional (`https://script.google.com/macros/s/AKfycbz...../exec`)
- Sulit untuk share dan remember link GAS yang panjang
- User ingin branding sendiri untuk webapp mereka
- Butuh dashboard terpusat untuk manage multiple webapp GAS

### 3. Target Users
- **Freelancers & Developers**: Yang deploy automation tools dengan GAS
- **Small Business**: Yang menggunakan GAS untuk internal tools
- **Educators**: Yang membuat learning apps dengan GAS
- **Entrepreneurs**: Yang ingin branding professional untuk GAS webapp mereka

### 4. Core Features

#### 4.1 Link Shortening & Management
- **Create Short Link**: 
  - User copy-paste long GAS webapp URL
  - User input custom slug/nama (e.g., "invoice-generator")
  - System generate short URL: `yourdomain.com/invoice-generator`
  - Optional: custom description, category
- **Dashboard**: Tampilkan semua short links user
  - List view dengan: short URL, original URL, clicks count
  - Quick copy button untuk short URL
  - Show creation date dan last accessed
- **Update**: Edit slug, destination URL, atau info lainnya
- **Delete**: Hapus short link
- **Enable/Disable**: Toggle link aktif/nonaktif tanpa hapus

#### 4.2 URL Redirection
- Short link redirect ke original GAS webapp URL
- Fast redirect (< 100ms)
- Track clicks dan analytics
- Optional: Preview page sebelum redirect (untuk security)
- Support query parameters passthrough

#### 4.3 Analytics (Basic)
- Click tracking per short link
- Total clicks count
- Last accessed timestamp
- Referrer tracking (where clicks came from)
- Click history/timeline

#### 4.4 User Management (SaaS)
- **Authentication**: Sign up / Login (email/password, Google OAuth)
- **User Dashboard**: Personal workspace untuk manage links
- **Profile Settings**: Edit profile, change password
- **Subscription Management**: Plan selection & billing

#### 4.5 Organization Features
- Kategorisasi/folder untuk organize links
- Search dan filter by name, category, date
- Bulk actions (delete, move to folder)
- Tags support

### 5. SaaS Pricing Tiers

#### 5.1 Free Tier
- 10 short links max
- Basic analytics (total clicks only)
- Standard support
- Ads on redirect page (optional)

#### 5.2 Pro Tier ($9/month)
- 100 short links
- Advanced analytics
- Custom slugs
- No ads
- Priority support

#### 5.3 Business Tier ($29/month)
- Unlimited short links
- Full analytics + export
- Custom domain support
- API access
- Team collaboration (5 users)
- Premium support

### 6. Technical Requirements

#### 6.1 Frontend (Dashboard)
- **Framework**: React + Next.js
- **UI Library**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- Responsive design (mobile & desktop)

#### 6.2 Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers (Edge Runtime, V8)
- **Framework**: Hono.js (lightweight, fast)
- **Database**: Cloudflare D1 (SQLite) + KV untuk caching
- **Authentication**: JWT stored in httpOnly cookies
- **Payment**: Stripe integration via Workers

#### 6.3 Infrastructure (Cloudflare Free Plan)
- **Frontend Hosting**: Cloudflare Pages (unlimited bandwidth)
- **API Hosting**: Cloudflare Workers (100k requests/day free)
- **Database**: D1 (5GB, 5M reads/day) + KV (100k reads/day)
- **CDN**: Cloudflare global edge network (automatic)
- **Domain**: Custom domain dengan Cloudflare DNS

#### 6.4 Core Components

**Frontend (React + Cloudflare Pages)**:
```
- AuthPage: Login/Signup
- Dashboard: Main workspace
- LinkList: Display all short links
- CreateLinkForm: Form untuk buat short link baru
- LinkCard: Individual link item dengan analytics
- AnalyticsView: Detailed analytics per link
- SettingsPage: User settings & subscription
- BillingPage: Manage subscription
```

**Backend (Cloudflare Workers + Hono.js)**:
```
Workers:
- /api/auth/* - Authentication endpoints
- /api/links/* - CRUD operations untuk links
- /api/analytics/* - Analytics endpoints
- /api/stripe/* - Stripe webhook handler
- /:slug - Redirect handler (CRITICAL: fast edge redirect)

Services:
- AuthService: JWT validation, user management
- LinkService: Link CRUD with D1 + KV caching
- RedirectService: Fast lookup & redirect (KV first, D1 fallback)
- AnalyticsService: Track clicks to D1 (async)
- SubscriptionService: Manage user plans & limits
```

**Data Flow (Redirect)**:
```
1. User visits: yourdomain.com/my-app
2. Cloudflare Worker receives request at edge (nearest location)
3. Check KV cache for slug "my-app" (< 10ms)
4. If found: redirect immediately
5. If not: query D1, cache to KV, then redirect
6. Log analytics to D1 asynchronously (non-blocking)
```

#### 6.5 Data Structure
```json
User Schema:
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "subscription": "free|pro|business",
  "createdAt": "timestamp",
  "subscriptionExpiresAt": "timestamp"
}

Link Schema:
{
  "id": "link-uuid",
  "userId": "user-uuid",
  "slug": "invoice-generator",
  "shortUrl": "yourdomain.com/invoice-generator",
  "destinationUrl": "https://script.google.com/macros/s/...",
  "title": "Invoice Generator",
  "description": "My invoice webapp",
  "category": "Business Tools",
  "tags": ["invoice", "automation"],
  "isActive": true,
  "clickCount": 1250,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastAccessedAt": "timestamp"
}

Analytics Schema:
{
  "id": "analytics-uuid",
  "linkId": "link-uuid",
  "timestamp": "timestamp",
  "referrer": "https://...",
  "userAgent": "...",
  "ipAddress": "..." (hashed for privacy)
}
```

### 7. User Flow

#### 7.1 Onboarding
1. User visit landing page
2. Sign up dengan email atau Google OAuth
3. Choose pricing tier (start with Free)
4. Redirect to dashboard

#### 7.2 Create Short Link
1. User klik "Create New Link" button
2. Form muncul:
   - Paste GAS webapp URL (long)
   - Input custom slug (e.g., "my-app")
   - Preview: `yourdomain.com/my-app`
   - Optional: title, description, category
3. Validate slug availability
4. Submit → short link created
5. Show success with copy button

#### 7.3 Share & Use Short Link
1. User copy short link dari dashboard
2. Share link ke client/user/social media
3. When someone clicks:
   - System logs click (analytics)
   - Redirect to original GAS webapp
   - Fast redirect (seamless)

#### 7.4 Monitor Analytics
1. User buka dashboard
2. View click counts per link
3. Klik detail untuk analytics lengkap
4. Export data (Pro/Business tier)

#### 7.5 Upgrade Subscription
1. User reach limit (e.g., 10 links di Free tier)
2. Prompt untuk upgrade
3. Click upgrade → Billing page
4. Choose plan → Stripe checkout
5. Success → limits increased

### 8. UI/UX Requirements

#### 8.1 Layout (Dashboard)
- **Top Nav**: Logo, Search, User menu, Upgrade button
- **Sidebar**: Navigation (Dashboard, Analytics, Settings, Billing)
- **Main Area**: Link cards grid/list view
- **Action Bar**: Create Link button (prominent CTA)

#### 8.2 Key Pages

**Landing Page**:
- Hero section dengan value proposition
- Feature highlights
- Pricing comparison table
- CTA: Sign up free

**Dashboard**:
- Stats cards: Total links, Total clicks, Active links
- Link cards dengan quick actions (copy, edit, delete, analytics)
- Empty state untuk new users

**Create Link Modal/Page**:
- Clean form
- Real-time slug validation
- Preview short URL
- One-click create

**Analytics Page**:
- Charts untuk click trends
- Metrics cards
- Table untuk click details

#### 8.3 Interactions
- One-click copy short URL
- Smooth transitions
- Confirm dialog untuk delete action
- Toast notifications untuk success/error
- Loading states yang jelas
- Real-time slug availability check

#### 8.4 Accessibility
- Keyboard navigation support
- ARIA labels
- Readable font sizes
- Color contrast compliance (WCAG AA)

### 9. Non-Functional Requirements

#### 9.1 Performance
- Dashboard load < 2 seconds (static from Pages)
- **Redirect speed < 50ms** (critical! KV at edge = ultra fast)
- API response < 300ms (Workers at edge)
- D1 queries < 100ms (with KV caching layer)

#### 9.2 Scalability (Cloudflare Free Plan Limits)
- **Workers**: 100k requests/day (~3M/month) - enough untuk MVP
- **D1 Reads**: 5M/day - plenty untuk queries
- **D1 Writes**: 100k/day - enough untuk analytics logging
- **KV Reads**: 100k/day - untuk hot links caching
- **Pages**: Unlimited bandwidth & requests
- Strategy: Cache popular slugs in KV untuk reduce D1 reads
- Upgrade path: Workers Paid ($5/mo) = 10M requests

#### 9.3 Security
- HTTPS only
- Secure authentication (JWT, httpOnly cookies)
- Rate limiting untuk prevent abuse
- SQL injection prevention
- XSS protection
- CSRF tokens
- Validate & sanitize URLs
- Hash sensitive analytics data (IP addresses)

#### 9.4 Reliability
- 99.9% uptime target
- Database backups (daily)
- Error monitoring (Sentry)
- Logging untuk debugging

#### 9.5 Compatibility
- Modern browsers (Chrome, Firefox, Edge, Safari)
- Responsive untuk mobile devices
- PWA support (future)

### 10. MVP Features (Phase 1 - 2 weeks)
Must-have untuk launch:
- User authentication (email/password)
- Create, edit, delete short links
- URL redirect functionality
- Basic dashboard dengan link list
- Basic click counting
- Free tier limit enforcement (10 links)
- Responsive UI

### 11. Post-MVP Features (Phase 2)
- Google OAuth login
- Advanced analytics dengan charts
- Subscription tiers & Stripe integration
- Custom domain support
- Folder/category organization
- Bulk operations
- API access
- Team collaboration
- Export analytics data

### 12. Future Enhancements (Phase 3+)
- QR code generation untuk short links
- Link expiration/scheduling
- A/B testing (multiple destinations)
- Password-protected links
- Custom branded redirect pages
- Mobile apps (iOS/Android)
- Browser extensions
- Webhooks untuk events
- White-label solution
- Advanced security (malware scanning)

### 13. Success Metrics (KPIs)

#### 13.1 User Metrics
- Monthly Active Users (MAU)
- Sign-up conversion rate
- User retention rate (30-day)
- Free to paid conversion rate (target: 5-10%)

#### 13.2 Product Metrics
- Total short links created
- Average links per user
- Total redirects/clicks per month
- Average redirect speed
- Dashboard load time

#### 13.3 Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Churn rate
- Customer Acquisition Cost (CAC)

### 14. Go-to-Market Strategy

#### 14.1 Target Channels
- Google Apps Script community forums
- Reddit: r/gsuite, r/GoogleAppsScript
- Product Hunt launch
- Dev.to / Medium articles (SEO)
- YouTube tutorials
- Twitter/X promotion

#### 14.2 Value Proposition
"Professional short URLs untuk webapp Google Apps Script Anda dalam 30 detik"

#### 14.3 Content Marketing
- Blog: "How to make your GAS webapp URLs professional"
- Tutorial: "Deploy dan share GAS webapp dengan elegant URLs"
- Case studies dari early users

### 15. Timeline (Estimasi)

**Week 1-2: MVP Development**
- Setup project (Next.js + database)
- Authentication system
- Core link CRUD + redirect
- Basic dashboard UI

**Week 3: Testing & Polish**
- Bug fixes
- UI/UX improvements
- Performance optimization
- Security audit

**Week 4: Launch Preparation**
- Landing page
- Documentation
- Beta testing
- Soft launch

**Month 2: Post-Launch**
- Gather feedback
- Implement payment system
- Advanced analytics
- Marketing push

### 16. Technical Stack (Cloudflare Free Plan Architecture)

**Frontend Dashboard**:
- React + Vite (atau Next.js static export)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod validation
- Deployed to: **Cloudflare Pages** (Free)

**Backend API**:
- **Cloudflare Workers** (Free: 100k requests/day)
- Hono.js (lightweight framework untuk Workers)
- TypeScript

**Database**:
- **Cloudflare D1** (Free: SQLite, 5GB storage, 5M reads/day)
- **Cloudflare KV** (Free: 100k reads/day, 1k writes/day) - untuk caching redirects

**Authentication**:
- Custom JWT auth di Workers
- atau Clerk (free tier) / Auth.js

**Payment**:
- Stripe (webhook handled by Workers)

**Storage/Assets**:
- **Cloudflare R2** (Free: 10GB storage) - untuk user uploads (optional)

**Email**:
- Resend / SendGrid (free tier)
- atau Cloudflare Email Workers

**Analytics**:
- **Cloudflare Analytics** (Free, built-in)
- Custom analytics stored in D1
- Cloudflare Web Analytics (free)

**DNS & CDN**:
- **Cloudflare DNS** (Free)
- **Cloudflare CDN** (Free, global edge network)

**Domain**:
- Custom domain (user provided, ~$10/year)
- Cloudflare managed DNS

**Monitoring**:
- Cloudflare Dashboard (built-in)
- Workers logs
- Sentry (free tier for errors)

### 17. Risks & Mitigations

#### 17.1 Technical Risks
- **Risk**: Slow redirect performance
  - **Mitigation**: Database indexing, caching layer, CDN
- **Risk**: Slug collision
  - **Mitigation**: Unique constraint di database, real-time validation
- **Risk**: Malicious URLs
  - **Mitigation**: URL validation, blacklist known bad domains, user reporting

#### 17.2 Business Risks
- **Risk**: Low conversion rate free to paid
  - **Mitigation**: Clear value differentiation, generous free tier untuk trust
- **Risk**: High competition (Bitly, TinyURL, etc.)
  - **Mitigation**: Niche focus (GAS webapp specific), better UX untuk target audience
- **Risk**: Abuse (spam links)
  - **Mitigation**: Rate limiting, CAPTCHA, email verification, moderation

#### 17.3 Legal Risks
- **Risk**: DMCA/copyright issues dengan linked content
  - **Mitigation**: Terms of Service clear, user responsibility clause, takedown process
- **Risk**: Privacy compliance (GDPR, CCPA)
  - **Mitigation**: Privacy policy, data anonymization, user data export/delete options

### 18. Competitive Analysis

**Bitly**: General URL shortener, complex pricing, enterprise focus
**TinyURL**: Simple but outdated UI, limited analytics
**Short.io**: Good but expensive, not GAS-specific

**Our Differentiation**:
- Niche focus: GAS webapp specific
- Simple pricing: affordable untuk small users
- Better UX: tailored untuk developer workflow
- Fast: optimized untuk redirect speed
- Professional: focused on business use cases
