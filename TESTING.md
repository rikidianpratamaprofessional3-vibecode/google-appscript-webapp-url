# Testing Guide

This document provides manual testing steps to verify all features of the GAS Link application.

## Prerequisites

Make sure you have:
- Backend running on http://localhost:8787
- Frontend running on http://localhost:5173
- Database migrated successfully

## Test Checklist

### 1. Authentication Flow ✓

#### Test 1.1: User Signup
1. Open http://localhost:5173/signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click "Sign Up"
4. **Expected**: Redirect to dashboard, see welcome message

#### Test 1.2: User Login
1. Logout if logged in
2. Open http://localhost:5173/login
3. Fill in:
   - Email: test@example.com
   - Password: test123
4. Click "Login"
5. **Expected**: Redirect to dashboard

#### Test 1.3: Invalid Login
1. Open http://localhost:5173/login
2. Fill in wrong password
3. Click "Login"
4. **Expected**: Error message "Invalid email or password"

#### Test 1.4: Protected Routes
1. Logout
2. Try to access http://localhost:5173/dashboard
3. **Expected**: Redirect to login page

### 2. Link Creation ✓

#### Test 2.1: Create Link - Success
1. Login to dashboard
2. Click "Create New Link" button
3. Fill in:
   - Destination URL: `https://script.google.com/macros/s/test123/exec`
   - Slug: `my-first-app`
   - Title: Invoice Generator
   - Description: My awesome invoice app
   - Category: Business Tools
4. Click "Create Link"
5. **Expected**: Modal closes, new link appears in dashboard

#### Test 2.2: Create Link - Duplicate Slug
1. Click "Create New Link"
2. Use same slug: `my-first-app`
3. **Expected**: Error "Slug already exists"

#### Test 2.3: Create Link - Invalid Slug
1. Click "Create New Link"
2. Try slug: `ab` (too short)
3. **Expected**: HTML5 validation error or API error

#### Test 2.4: Create Link - Reserved Slug
1. Click "Create New Link"
2. Try slug: `api` (reserved)
3. **Expected**: Error "This slug is reserved"

#### Test 2.5: Create Link - Invalid URL
1. Click "Create New Link"
2. Destination URL: `not-a-url`
3. **Expected**: HTML5 validation error or API error

### 3. Link Management ✓

#### Test 3.1: View Links
1. Login to dashboard
2. **Expected**: See all created links with:
   - Title/slug
   - Short URL
   - Destination URL
   - Click count
   - Active status badge

#### Test 3.2: Copy Short URL
1. Click "Copy" button on a link card
2. **Expected**: Button text changes to "Copied!"
3. Paste in new tab (Ctrl+V)
4. **Expected**: URL is copied correctly

#### Test 3.3: Disable Link
1. Click "Disable" button on active link
2. **Expected**: 
   - Badge changes to "Inactive"
   - Link still visible in dashboard
   - Test redirect → should fail (404)

#### Test 3.4: Enable Link
1. Click "Enable" button on inactive link
2. **Expected**: 
   - Badge changes to "Active"
   - Test redirect → should work

#### Test 3.5: Delete Link
1. Click "Delete" button
2. **Expected**: Confirmation appears ("Sure? Yes/No")
3. Click "Yes"
4. **Expected**: Link removed from dashboard

### 4. Redirect Functionality ✓

#### Test 4.1: Basic Redirect
1. Create a link with slug `test-redirect`
2. Open new tab: http://localhost:8787/test-redirect
3. **Expected**: Instantly redirect to destination URL

#### Test 4.2: Click Tracking
1. Visit short URL 3 times (refresh)
2. Go back to dashboard
3. **Expected**: Click count increased by 3

#### Test 4.3: Inactive Link Redirect
1. Disable a link
2. Try to visit its short URL
3. **Expected**: 404 Not Found

#### Test 4.4: Non-Existent Slug
1. Visit http://localhost:8787/this-does-not-exist
2. **Expected**: 404 Not Found

#### Test 4.5: Reserved Slug Redirect
1. Visit http://localhost:8787/api/health
2. **Expected**: JSON response `{"status": "ok", ...}` (not 404)

### 5. Dashboard Statistics ✓

#### Test 5.1: Stats Cards
1. Login to dashboard
2. **Expected**: See 3 stat cards:
   - Total Links (count)
   - Total Clicks (sum of all clicks)
   - Active Links (count of active only)

#### Test 5.2: Stats Update
1. Create new link
2. **Expected**: Total Links increases
3. Visit short URL
4. Refresh dashboard
5. **Expected**: Total Clicks increases

#### Test 5.3: Free Tier Limit
1. Create 10 links (free tier max)
2. Try to create 11th link
3. **Expected**: Error "Link limit reached. Upgrade to create more links."

### 6. Subscription Limits ✓

#### Test 6.1: Free User - 10 Links Max
1. Create 10 links
2. Dashboard shows "X/10 used"
3. Try creating 11th → blocked with upgrade message

### 7. Edge Cases & Error Handling ✓

#### Test 7.1: Empty Dashboard
1. Create new user (or delete all links)
2. **Expected**: Empty state with "No links yet" message

#### Test 7.2: Logout Functionality
1. Click "Logout" button in header
2. **Expected**: Redirect to login page
3. Try accessing dashboard → redirect to login

#### Test 7.3: Token Expiration (manual)
1. Login
2. Manually clear token from localStorage (DevTools)
3. Refresh dashboard
4. **Expected**: Redirect to login

#### Test 7.4: Long URLs
1. Create link with very long destination URL (500+ chars)
2. **Expected**: Should work, truncate display in UI

#### Test 7.5: Special Characters in Slug
1. Try slug: `test@#$%link`
2. **Expected**: Auto-sanitized to `testlink`

### 8. UI/UX Tests ✓

#### Test 8.1: Responsive Design
1. Open DevTools (F12)
2. Switch to mobile view (iPhone 12)
3. **Expected**: Layout adjusts properly, buttons accessible

#### Test 8.2: Loading States
1. Open Network tab in DevTools
2. Throttle to "Slow 3G"
3. Create link or fetch links
4. **Expected**: See loading states ("Creating...", "Loading...")

#### Test 8.3: Form Validation
1. Try submitting empty forms
2. **Expected**: HTML5 validation or error messages

### 9. Performance Tests ⚡

#### Test 9.1: Redirect Speed
1. Create link
2. Open DevTools → Network tab
3. Visit short URL
4. Check timing
5. **Expected**: < 100ms total (ideally < 50ms)

#### Test 9.2: Dashboard Load
1. Logout
2. Clear cache
3. Login and measure time to dashboard
4. **Expected**: < 2 seconds

### 10. Database & Cache Tests 🗄️

#### Test 10.1: KV Cache Working
1. Create link
2. Visit short URL (first time - populates cache)
3. Visit again (should use cache)
4. Check backend logs
5. **Expected**: Second request faster, uses KV

#### Test 10.2: Cache Invalidation
1. Create link, visit it (caches)
2. Update destination URL
3. Visit short URL again
4. **Expected**: Redirects to NEW destination (cache updated)

## API Testing (cURL)

### Test API Directly

#### Signup
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123","name":"API Test"}'
```

Expected: `{"token":"...", "user":{...}}`

#### Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123"}'
```

Expected: `{"token":"...", "user":{...}}`

#### Get Me (with token)
```bash
curl -X GET http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `{"user":{...}}`

#### Create Link
```bash
curl -X POST http://localhost:8787/api/links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"slug":"api-test","destination_url":"https://example.com","title":"API Test"}'
```

Expected: `{"link":{...}}`

#### Get All Links
```bash
curl -X GET http://localhost:8787/api/links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `{"links":[...], "total":N}`

#### Update Link
```bash
curl -X PUT http://localhost:8787/api/links/LINK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

Expected: `{"link":{...}}`

#### Delete Link
```bash
curl -X DELETE http://localhost:8787/api/links/LINK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `{"message":"Link deleted successfully"}`

#### Test Redirect
```bash
curl -L http://localhost:8787/your-slug
```

Expected: Redirect to destination (follow redirects with -L)

## Database Inspection

### View Data in D1

```bash
cd workers

# View all users
wrangler d1 execute gas-link-db --command="SELECT * FROM users"

# View all links
wrangler d1 execute gas-link-db --command="SELECT * FROM links"

# View analytics
wrangler d1 execute gas-link-db --command="SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10"

# Count links per user
wrangler d1 execute gas-link-db --command="SELECT user_id, COUNT(*) as count FROM links GROUP BY user_id"
```

## Common Issues & Solutions

### Issue: "Database not found"
```bash
wrangler d1 execute gas-link-db --file=../database/schema.sql
```

### Issue: "Unauthorized" on API calls
- Check JWT_SECRET is set: `wrangler secret put JWT_SECRET`
- Check token in Authorization header
- Token format: `Bearer YOUR_TOKEN`

### Issue: Redirect not working
- Check link is active (`is_active = 1`)
- Check slug exists in database
- Check KV namespace is bound in wrangler.toml

### Issue: CORS errors
- Check CORS origins in `workers/src/index.ts`
- Make sure frontend URL is allowed

## Test Coverage Summary

- ✅ Authentication (signup, login, protected routes)
- ✅ Link CRUD (create, read, update, delete)
- ✅ Redirect functionality
- ✅ Click tracking & analytics
- ✅ Subscription limits
- ✅ Form validations
- ✅ Error handling
- ✅ UI/UX (responsive, loading states)
- ✅ Edge cases
- ✅ Performance

## Next Steps

After manual testing passes:
1. Consider adding automated tests (Vitest, Playwright)
2. Set up CI/CD pipeline
3. Deploy to production
4. Monitor with Cloudflare Analytics
5. Gather user feedback

---

**All tests passing? You're ready to deploy! 🚀**
