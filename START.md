# 🚀 Quick Start - Aplikasi Sudah Siap!

## ✅ Setup Selesai!

Aplikasi Anda sudah **READY TO RUN**! Semua konfigurasi sudah diselesaikan:

- ✅ Dependencies terinstall (backend + frontend)
- ✅ Cloudflare D1 database dibuat dan di-migrate
- ✅ Cloudflare KV namespace dibuat
- ✅ JWT secret dikonfigurasi
- ✅ Environment variables disetup
- ✅ Wrangler config dikonfigurasi

## 📝 Database & KV Info

**D1 Database:**
- Database ID: `4f5d0d18-0389-46d4-b5e5-fb816eb65f0a`
- Database Name: `gas-link-db`
- Region: APAC
- Tables: users, links, analytics (sudah di-migrate)

**KV Namespace:**
- KV ID: `bbe76ce0c1d7455e815feb8a08b91a90`
- Binding: KV
- Purpose: Caching redirects

## 🎯 Cara Menjalankan Aplikasi

### Step 1: Start Backend (Terminal 1)

Buka terminal pertama dan jalankan:

```bash
cd "D:\Downloads\Aplikasi penyimpan link web stack GAS\workers"
npm run dev
```

**Expected Output:**
```
✅ Ready on http://127.0.0.1:8787
```

**Jangan tutup terminal ini!** Biarkan tetap berjalan.

### Step 2: Start Frontend (Terminal 2)

Buka terminal kedua (baru) dan jalankan:

```bash
cd "D:\Downloads\Aplikasi penyimpan link web stack GAS\frontend"
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Buka Browser

Buka browser dan akses:
```
http://localhost:5173
```

## 🧪 Testing Aplikasi

### 1. Signup
- Klik "Sign up"
- Isi email: `test@example.com`
- Isi password: `test123`
- Isi name: `Test User`
- Klik "Sign Up"
- **Expected**: Redirect ke dashboard

### 2. Create Link
- Klik tombol "+ Create New Link"
- Isi form:
  - **Destination URL**: `https://script.google.com/macros/s/test123/exec`
  - **Slug**: `my-first-app`
  - **Title**: Invoice Generator
  - **Description**: My awesome app
- Klik "Create Link"
- **Expected**: Link baru muncul di dashboard

### 3. Test Redirect
- Copy short URL: `http://localhost:8787/my-first-app`
- Buka di tab baru
- **Expected**: Redirect ke destination URL
- Kembali ke dashboard, refresh
- **Expected**: Click count bertambah

### 4. Test Link Management
- **Copy**: Klik tombol "Copy" untuk copy short URL
- **Disable**: Klik "Disable" untuk non-aktifkan link
- **Delete**: Klik "Delete" > "Yes" untuk hapus link

## 📊 Features Yang Bisa Dicoba

### Dashboard
- ✅ View statistics (Total Links, Clicks, Active)
- ✅ List all links
- ✅ Search & filter links

### Link Management
- ✅ Create new short link
- ✅ Update link details
- ✅ Toggle active/inactive
- ✅ Delete link
- ✅ Copy short URL

### Analytics
- ✅ Click counting
- ✅ Last accessed timestamp
- ✅ Referrer tracking

### Authentication
- ✅ Signup
- ✅ Login
- ✅ Logout
- ✅ Protected routes

## 🛠️ Development Commands

### Backend (Workers)
```bash
cd workers

# Start dev server
npm run dev

# Deploy to production
npm run deploy

# Check database
npx wrangler d1 execute gas-link-db --command="SELECT * FROM users"
npx wrangler d1 execute gas-link-db --command="SELECT * FROM links"

# Check logs
npx wrangler tail
```

### Frontend
```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 API Testing dengan cURL

### Test Health
```bash
curl http://localhost:8787/api/health
```

### Test Signup
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

### Test Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

## 🐛 Troubleshooting

### Port sudah digunakan
Jika port 8787 atau 5173 sudah digunakan:

**Backend:**
```bash
npx wrangler dev --port 8788
```
Update frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:8788
```

**Frontend:**
```bash
npm run dev -- --port 5174
```

### "Database not found"
```bash
cd workers
npx wrangler d1 execute gas-link-db --file=../database/schema.sql
```

### "Unauthorized" errors
Check JWT_SECRET di `workers/.dev.vars`

### CORS errors
Check CORS origins di `workers/src/index.ts`

## 📚 Next Steps

### Untuk Development:
1. ✅ Sudah bisa mulai develop features baru
2. ✅ Baca TESTING.md untuk test cases lengkap
3. ✅ Baca CONTRIBUTING.md jika mau contribute

### Untuk Production:
1. ✅ Baca DEPLOYMENT.md untuk deploy guide
2. ✅ Setup production JWT secret: `wrangler secret put JWT_SECRET`
3. ✅ Deploy backend: `cd workers && npm run deploy`
4. ✅ Deploy frontend: `cd frontend && npm run build && npx wrangler pages deploy dist`

## 🎓 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| **README.md** | Project overview & features |
| **SETUP.md** | Setup guide lengkap |
| **TESTING.md** | 50+ test cases manual |
| **DEPLOYMENT.md** | Production deployment |
| **ARCHITECTURE.md** | Technical architecture |
| **STATUS.md** | Project status report |

## 💡 Tips

1. **Keep both terminals running** saat development
2. **Refresh browser** setelah code changes (HMR otomatis)
3. **Check browser console** untuk error debugging
4. **Check terminal logs** untuk backend errors
5. **Use incognito mode** untuk test authentication

## 🎉 Selamat!

Aplikasi Anda sudah **100% siap digunakan**!

Mulai dengan:
1. Jalankan kedua servers (backend + frontend)
2. Buka http://localhost:5173
3. Create account & mulai buat short links!

**Happy coding! 🚀**

---

**Need help?** Cek dokumentasi lengkap di folder root atau buka issue di GitHub.
