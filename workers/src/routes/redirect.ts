import { Context } from 'hono';
import type { Env, Link } from '../types';
import { generateId } from '../utils/auth';

const KV_PREFIX = 'link:';
const KV_TTL = 3600; // 1 hour cache

export async function handleRedirect(c: Context<{ Bindings: Env }>) {
  // Get subdomain or slug from request
  const host = c.req.header('host') || '';
  const path = c.req.path;
  
  let subdomain: string | null = null;
  let slug: string | null = null;
  
  // Check if request is to subdomain (e.g., myapp.digitalin.online)
  if (host.includes('.')) {
    const parts = host.split('.');
    // Check if it's a subdomain (not root domain)
    if (parts.length > 2 || (parts.length === 2 && !['localhost', 'workers', 'dev'].some(d => host.includes(d)))) {
      subdomain = parts[0];
      // Skip common subdomains
      if (!['www', 'api', 'dashboard', 'admin'].includes(subdomain)) {
        slug = subdomain; // Use subdomain as slug for lookup
      }
    }
  }
  
  // Fallback to path-based slug if not subdomain
  if (!slug) {
    slug = c.req.param('slug');
  }

  if (!slug) {
    return c.notFound();
  }

  try {
    let destinationUrl: string;
    let title: string | null = null;
    let linkId: string | null = null;
    let shouldUseIframe = false;

    // Step 1: Check KV cache first (ultra fast)
    let cachedData = await c.env.KV.get(`${KV_PREFIX}${slug}`, 'json') as { url: string; title?: string; id: string; useIframe?: boolean } | null;
    
    if (cachedData) {
      destinationUrl = cachedData.url;
      title = cachedData.title || null;
      linkId = cachedData.id;
      shouldUseIframe = cachedData.useIframe || false;
      
      // Log analytics asynchronously (non-blocking)
      c.executionCtx.waitUntil(logAnalytics(c, slug, linkId));
      
      // Increment click count asynchronously
      c.executionCtx.waitUntil(incrementClickCount(c, slug));
    } else {
      // Step 2: Fallback to D1 database
      const result = await c.env.DB.prepare(
        'SELECT id, destination_url, title, redirect_mode, user_id FROM links WHERE slug = ? AND is_active = 1'
      ).bind(slug).first<Link & { redirect_mode: string }>();

      if (!result) {
        return c.notFound();
      }

      destinationUrl = result.destination_url;
      title = result.title || null;
      linkId = result.id;
      
      // Check subscription status for paid users
      const user = await c.env.DB.prepare(
        'SELECT subscription, subscription_expires_at, subscription_grace_until FROM users WHERE id = ?'
      ).bind(result.user_id).first<{ subscription: string; subscription_expires_at: number | null; subscription_grace_until: number | null }>();
      
      if (user && user.subscription !== 'free') {
        const now = Date.now();
        const graceEnd = user.subscription_grace_until || 0;
        
        // Check if subscription is expired (past grace period)
        if (now > graceEnd && graceEnd > 0) {
          return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subdomain Expired</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 16px; }
    p { color: #666; margin-bottom: 24px; }
    a { color: #4f46e5; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Subdomain Expired</h1>
    <p>This subdomain subscription has expired.</p>
    <p>Please <a href="https://app.digitalin.online/login">renew your subscription</a> to reactivate.</p>
  </div>
</body>
</html>`, 403);
        }
      }
      
      // Determine redirect mode
      const mode = result.redirect_mode || 'auto';
      let shouldUseIframe = false;
      
      if (mode === 'iframe') {
        shouldUseIframe = true;
      } else if (mode === 'direct') {
        shouldUseIframe = false;
      } else {
        // Auto-detect: check if it's a GAS URL
        shouldUseIframe = destinationUrl.includes('script.google.com');
      }
      
      // Store redirect mode decision in cache
      cachedData = { url: destinationUrl, title: result.title, id: result.id, useIframe: shouldUseIframe };

      // Step 3: Cache to KV for next time (store as JSON with title and iframe flag)
      await c.env.KV.put(
        `${KV_PREFIX}${slug}`,
        JSON.stringify(cachedData),
        { expirationTtl: KV_TTL }
      );

      // Log analytics and increment clicks asynchronously
      c.executionCtx.waitUntil(logAnalytics(c, slug, linkId));
      c.executionCtx.waitUntil(incrementClickCount(c, slug));
    }

    // Set default title if not provided
    const pageTitle = title || 'Redirecting...';
    
    // If direct redirect mode (non-GAS URLs), use 302 redirect
    if (!shouldUseIframe) {
      return c.redirect(destinationUrl, 302);
    }

    // Return HTML with iframe wrapper (for GAS webapps or forced iframe mode)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      max-width: 100vw;
      max-height: 100vh;
      background: #fff;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <iframe 
    src="${escapeHtml(destinationUrl)}"
    loading="lazy"
    referrerpolicy="no-referrer"
    allow="fullscreen; autoplay; clipboard-write; geolocation; microphone; camera"
  ></iframe>
</body>
</html>`;

    return c.html(html);
  } catch (error) {
    console.error('Redirect error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function logAnalytics(c: Context<{ Bindings: Env }>, slug: string, linkId?: string) {
  try {
    // If linkId not provided, fetch it
    if (!linkId) {
      const link = await c.env.DB.prepare(
        'SELECT id FROM links WHERE slug = ?'
      ).bind(slug).first<{ id: string }>();
      
      if (!link) return;
      linkId = link.id;
    }

    const timestamp = Date.now();
    const referrer = c.req.header('referer') || null;
    const userAgent = c.req.header('user-agent') || null;
    const country = c.req.raw.cf?.country as string || null;

    await c.env.DB.prepare(
      'INSERT INTO analytics (id, link_id, timestamp, referrer, user_agent, country) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      generateId(),
      linkId,
      timestamp,
      referrer,
      userAgent,
      country
    ).run();
  } catch (error) {
    console.error('Analytics logging error:', error);
  }
}

async function incrementClickCount(c: Context<{ Bindings: Env }>, slug: string) {
  try {
    await c.env.DB.prepare(
      'UPDATE links SET click_count = click_count + 1, last_accessed_at = ? WHERE slug = ?'
    ).bind(Date.now(), slug).run();
  } catch (error) {
    console.error('Click count increment error:', error);
  }
}
