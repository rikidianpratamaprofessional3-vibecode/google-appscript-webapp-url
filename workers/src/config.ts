// App Configuration
export const APP_CONFIG = {
  // Admin WhatsApp (ganti dengan nomor kamu)
  ADMIN_WHATSAPP: '6281234567890', // Format: 62 + nomor tanpa 0
  
  // Pricing
  PRICING: {
    FREE: {
      name: 'Free',
      price: 0,
      links: 1,
      features: ['1 Subdomain Gratis', 'Basic Analytics', 'Community Support', '1 Bulan']
    },
    BASIC: {
      name: 'Basic',
      price: 15000,
      priceText: 'Rp15.000',
      period: '/bulan',
      links: 3,
      features: ['3 Subdomain', 'Advanced Analytics', 'Priority Support', 'Custom Domain Ready', 'No Branding']
    },
    PREMIUM: {
      name: 'Premium',
      price: 30000,
      priceText: 'Rp30.000',
      period: '/bulan',
      links: 10,
      features: ['10 Subdomain', 'Advanced Analytics', 'Priority Support', 'Custom Domain', 'API Access', 'White Label']
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 100000,
      priceText: 'Rp100.000',
      period: '/bulan',
      links: 999999,
      features: ['Unlimited Subdomain', 'Advanced Analytics', 'Dedicated Support', 'Custom Domain', 'API Access', 'White Label', 'SLA 99.9%', 'Priority Deployment']
    }
  },
  
  // SEO
  SEO: {
    TITLE: 'GAS Link - Subdomain Gratis untuk Google Apps Script',
    DESCRIPTION: 'Platform hosting terbaik untuk Google Apps Script webapps. Dapatkan subdomain gratis, hilangkan pesan "This application was created by...", dan tingkatkan profesionalitas aplikasi Anda. Mulai dari gratis!',
    KEYWORDS: 'google apps script hosting, gas webapp hosting, subdomain gratis gas, custom domain gas, remove gas warning, host gas app, iframe gas, deploy gas webapp, google script domain',
    URL: 'https://gas-link-worker.rikidianpratama-professional3.workers.dev',
    IMAGE: 'https://gas-link-worker.rikidianpratama-professional3.workers.dev/og-image.png',
    TWITTER_HANDLE: '@gaslink'
  }
};

// WhatsApp message generator
export function generateWhatsAppMessage(plan: 'basic' | 'premium' | 'enterprise', userEmail: string): string {
  const planInfo = APP_CONFIG.PRICING[plan.toUpperCase() as 'BASIC' | 'PREMIUM' | 'ENTERPRISE'];
  
  return encodeURIComponent(
    `Halo! Saya mau upgrade ke paket *${planInfo.name}*\n\n` +
    `📧 Email: ${userEmail}\n` +
    `📦 Paket: ${planInfo.name} - ${planInfo.priceText}${planInfo.period}\n` +
    `🌐 Limit Subdomain: ${planInfo.links === 999999 ? 'Unlimited' : planInfo.links} subdomain\n` +
    `⏰ Periode: 1 bulan\n\n` +
    `Mohon info rekening untuk pembayaran 🙏`
  );
}

export function getWhatsAppLink(plan: 'basic' | 'premium' | 'enterprise', userEmail: string): string {
  const message = generateWhatsAppMessage(plan, userEmail);
  return `https://wa.me/${APP_CONFIG.ADMIN_WHATSAPP}?text=${message}`;
}
