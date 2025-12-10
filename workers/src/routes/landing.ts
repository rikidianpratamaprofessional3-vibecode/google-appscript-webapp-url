import { Context } from 'hono';
import type { Env } from '../types';
import { APP_CONFIG } from '../config';

export async function handleLanding(c: Context<{ Bindings: Env }>) {
  const { SEO, PRICING } = APP_CONFIG;
  
  // Get admin WhatsApp from database
  let adminWhatsApp = '6281234567890'; // Default fallback
  try {
    const setting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'admin_whatsapp'"
    ).first<{ value: string }>();
    
    if (setting) {
      adminWhatsApp = setting.value;
    }
  } catch (error) {
    console.error('Failed to fetch admin WhatsApp:', error);
  }
  
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${SEO.TITLE}</title>
  <meta name="title" content="${SEO.TITLE}">
  <meta name="description" content="${SEO.DESCRIPTION}">
  <meta name="keywords" content="${SEO.KEYWORDS}">
  <meta name="author" content="GAS Link">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SEO.URL}">
  <meta property="og:title" content="${SEO.TITLE}">
  <meta property="og:description" content="${SEO.DESCRIPTION}">
  <meta property="og:image" content="${SEO.IMAGE}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SEO.URL}">
  <meta property="twitter:title" content="${SEO.TITLE}">
  <meta property="twitter:description" content="${SEO.DESCRIPTION}">
  <meta property="twitter:image" content="${SEO.IMAGE}">
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --yellow: #FFD700;
      --yellow-bright: #FFEB3B;
      --black: #000000;
      --white: #FFFFFF;
    }
    
    body {
      font-family: 'Arial Black', 'Arial Bold', Arial, sans-serif;
      background: var(--black);
      color: var(--yellow);
      overflow-x: hidden;
    }
    
    /* Neobrutalism Styles */
    .btn {
      display: inline-block;
      padding: 16px 40px;
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      text-decoration: none;
      background: var(--yellow);
      color: var(--black);
      border: 4px solid var(--black);
      box-shadow: 8px 8px 0px var(--yellow-bright);
      transition: all 0.1s;
      cursor: pointer;
      position: relative;
    }
    
    .btn:hover {
      transform: translate(4px, 4px);
      box-shadow: 4px 4px 0px var(--yellow-bright);
    }
    
    .btn:active {
      transform: translate(8px, 8px);
      box-shadow: 0px 0px 0px var(--yellow-bright);
    }
    
    .card {
      background: var(--black);
      border: 6px solid var(--yellow);
      box-shadow: 12px 12px 0px var(--yellow-bright);
      padding: 32px;
      position: relative;
    }
    
    /* Header */
    header {
      padding: 24px 40px;
      border-bottom: 6px solid var(--yellow);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 900;
      color: var(--yellow);
      text-decoration: none;
    }
    
    .header-nav a {
      margin-left: 24px;
      color: var(--yellow);
      text-decoration: none;
      font-weight: 900;
      font-size: 16px;
      transition: transform 0.2s;
    }
    
    .header-nav a:hover {
      transform: scale(1.1);
    }
    
    /* Hero Section */
    .hero {
      padding: 120px 40px;
      text-align: center;
      position: relative;
    }
    
    .hero h1 {
      font-size: clamp(40px, 8vw, 96px);
      line-height: 1.1;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: -2px;
      text-shadow: 6px 6px 0px rgba(255, 235, 59, 0.5);
    }
    
    .hero .subtitle {
      font-size: clamp(18px, 3vw, 28px);
      margin-bottom: 48px;
      font-weight: 700;
      color: var(--yellow-bright);
    }
    
    .hero-cta {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    /* Features */
    .features {
      padding: 80px 40px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .section-title {
      font-size: clamp(32px, 5vw, 56px);
      text-align: center;
      margin-bottom: 64px;
      text-transform: uppercase;
      text-shadow: 4px 4px 0px rgba(255, 235, 59, 0.5);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 40px;
    }
    
    .feature-card {
      background: var(--black);
      border: 6px solid var(--yellow);
      padding: 32px;
      transition: transform 0.2s;
    }
    
    .feature-card:hover {
      transform: translate(-4px, -4px);
      box-shadow: 12px 12px 0px var(--yellow-bright);
    }
    
    .feature-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .feature-title {
      font-size: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    
    .feature-desc {
      font-size: 16px;
      font-weight: 400;
      line-height: 1.6;
      font-family: Arial, sans-serif;
    }
    
    /* Pricing */
    .pricing {
      padding: 80px 40px;
      background: var(--yellow);
      color: var(--black);
    }
    
    .pricing .section-title {
      color: var(--black);
      text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
    }
    
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .pricing-card {
      background: var(--black);
      border: 6px solid var(--black);
      padding: 40px;
      text-align: center;
      position: relative;
      box-shadow: 12px 12px 0px rgba(0, 0, 0, 0.2);
    }
    
    .pricing-card.featured {
      transform: scale(1.05);
      border-color: var(--yellow-bright);
      box-shadow: 16px 16px 0px rgba(0, 0, 0, 0.3);
    }
    
    .plan-name {
      font-size: 32px;
      color: var(--yellow);
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    
    .plan-price {
      font-size: 48px;
      color: var(--yellow-bright);
      margin-bottom: 8px;
    }
    
    .plan-period {
      font-size: 18px;
      color: var(--yellow);
      margin-bottom: 24px;
    }
    
    .plan-features {
      list-style: none;
      margin: 32px 0;
      text-align: left;
    }
    
    .plan-features li {
      padding: 12px 0;
      border-bottom: 2px solid rgba(255, 215, 0, 0.2);
      color: var(--yellow);
      font-size: 16px;
      font-weight: 700;
    }
    
    .plan-features li:before {
      content: "✓ ";
      color: var(--yellow-bright);
      font-weight: 900;
      margin-right: 8px;
    }
    
    .btn-black {
      background: var(--yellow);
      color: var(--black);
      border: 4px solid var(--black);
      box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.3);
    }
    
    /* CTA Section */
    .cta {
      padding: 120px 40px;
      text-align: center;
      background: var(--black);
      border-top: 6px solid var(--yellow);
    }
    
    .cta h2 {
      font-size: clamp(32px, 6vw, 64px);
      margin-bottom: 24px;
      text-transform: uppercase;
    }
    
    .cta p {
      font-size: 20px;
      margin-bottom: 48px;
      font-weight: 700;
    }
    
    /* Footer */
    footer {
      padding: 40px;
      text-align: center;
      border-top: 6px solid var(--yellow);
      font-size: 14px;
      font-weight: 700;
    }
    
    footer a {
      color: var(--yellow-bright);
      text-decoration: none;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      header {
        flex-direction: column;
        gap: 16px;
      }
      
      .hero {
        padding: 80px 20px;
      }
      
      .hero-cta {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 300px;
      }
      
      .pricing-card.featured {
        transform: scale(1);
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <a href="/" class="logo">🚀 GAS LINK</a>
    <nav class="header-nav">
      <a href="#features">FEATURES</a>
      <a href="#pricing">PRICING</a>
      <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/login">LOGIN</a>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <h1>SUBDOMAIN GRATIS<br>UNTUK GOOGLE APPS SCRIPT</h1>
    <p class="subtitle">Hilangkan Pesan "This Application Was Created By..." • Subdomain Gratis • Professional Look</p>
    <div class="hero-cta">
      <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn">MULAI GRATIS</a>
      <a href="#pricing" class="btn">LIHAT HARGA</a>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features" id="features">
    <h2 class="section-title">KENAPA GAS LINK?</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🎁</div>
        <h3 class="feature-title">SUBDOMAIN GRATIS</h3>
        <p class="feature-desc">Dapatkan 1 subdomain gratis selamanya untuk host aplikasi Google Apps Script Anda.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3 class="feature-title">TANPA PESAN GOOGLE</h3>
        <p class="feature-desc">Hilangkan pesan "This application was created by a Google Apps Script user" dari webapp Anda.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3 class="feature-title">ANALYTICS</h3>
        <p class="feature-desc">Track berapa banyak orang yang mengakses webapp Anda dengan analytics lengkap.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3 class="feature-title">LOADING CEPAT</h3>
        <p class="feature-desc">Powered by Cloudflare global CDN, webapp Anda load dalam hitungan milidetik.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3 class="feature-title">AMAN & SECURE</h3>
        <p class="feature-desc">Iframe wrapper yang aman dengan sandbox protection dan HTTPS enforcement.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">💼</div>
        <h3 class="feature-title">PROFESSIONAL</h3>
        <p class="feature-desc">Tingkatkan kredibilitas aplikasi Anda dengan tampilan yang lebih profesional.</p>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section class="pricing" id="pricing">
    <h2 class="section-title">HARGA TERJANGKAU</h2>
    <div class="pricing-grid">
      <!-- Free Plan -->
      <div class="pricing-card">
        <h3 class="plan-name">FREE</h3>
        <div class="plan-price">Rp0</div>
        <div class="plan-period">Selamanya</div>
        <ul class="plan-features">
          <li>1 Subdomain Gratis</li>
          <li>Basic Analytics</li>
          <li>Community Support</li>
          <li>Cloudflare CDN</li>
        </ul>
        <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn btn-black">DAFTAR GRATIS</a>
      </div>
      
      <!-- Basic Plan -->
      <div class="pricing-card">
        <h3 class="plan-name">BASIC</h3>
        <div class="plan-price">Rp15.000</div>
        <div class="plan-period">/bulan</div>
        <ul class="plan-features">
          <li>3 Subdomain</li>
          <li>Advanced Analytics</li>
          <li>Priority Support</li>
          <li>Custom Domain Ready</li>
          <li>No Branding</li>
        </ul>
        <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn btn-black">UPGRADE BASIC</a>
      </div>
      
      <!-- Premium Plan -->
      <div class="pricing-card featured">
        <h3 class="plan-name">⭐ PREMIUM</h3>
        <div class="plan-price">Rp30.000</div>
        <div class="plan-period">/bulan</div>
        <ul class="plan-features">
          <li>10 Subdomain</li>
          <li>Advanced Analytics</li>
          <li>Priority Support</li>
          <li>Custom Domain</li>
          <li>API Access</li>
          <li>White Label</li>
        </ul>
        <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn btn-black">UPGRADE PREMIUM</a>
      </div>
      
      <!-- Enterprise Plan -->
      <div class="pricing-card">
        <h3 class="plan-name">🚀 ENTERPRISE</h3>
        <div class="plan-price">Rp100.000</div>
        <div class="plan-period">/bulan</div>
        <ul class="plan-features">
          <li>Unlimited Subdomain</li>
          <li>Advanced Analytics</li>
          <li>Dedicated Support</li>
          <li>Custom Domain</li>
          <li>API Access</li>
          <li>White Label</li>
          <li>SLA 99.9%</li>
          <li>Priority Deployment</li>
        </ul>
        <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn btn-black">UPGRADE ENTERPRISE</a>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta">
    <h2>SIAP TINGKATKAN<br>APLIKASI ANDA?</h2>
    <p>Mulai gratis hari ini. Tidak perlu kartu kredit.</p>
    <a href="https://d5ca7df6.gas-link-dashboard.pages.dev/signup" class="btn">DAFTAR SEKARANG</a>
  </section>

  <!-- Footer -->
  <footer>
    <p>© 2024 GAS Link. Built with 💛 using Cloudflare Workers.</p>
    <p style="margin-top: 8px;">
      <a href="/api/health">API Status</a> • 
      <a href="https://d5ca7df6.gas-link-dashboard.pages.dev">Dashboard</a> • 
      <a href="https://wa.me/${adminWhatsApp}">Support</a>
    </p>
  </footer>

  <!-- JSON-LD Structured Data for SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GAS Link",
    "applicationCategory": "WebApplication",
    "description": "${SEO.DESCRIPTION}",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "IDR"
      },
      {
        "@type": "Offer",
        "name": "Basic Plan",
        "price": "15000",
        "priceCurrency": "IDR"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan",
        "price": "30000",
        "priceCurrency": "IDR"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  }
  </script>
</body>
</html>`;

  return c.html(html);
}
