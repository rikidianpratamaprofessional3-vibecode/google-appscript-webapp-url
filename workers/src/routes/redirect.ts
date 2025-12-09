import { Context } from 'hono';
import type { Env, Link } from '../types';
import { generateId } from '../utils/auth';

const KV_PREFIX = 'link:';
const KV_TTL = 3600; // 1 hour cache

export async function handleRedirect(c: Context<{ Bindings: Env }>) {
  const slug = c.req.param('slug');

  if (!slug) {
    return c.notFound();
  }

  try {
    let destinationUrl: string;
    let title: string = 'Loading...';

    // Step 1: Check KV cache first (ultra fast)
    const cachedUrl = await c.env.KV.get(`${KV_PREFIX}${slug}`);
    
    if (cachedUrl) {
      destinationUrl = cachedUrl;
      
      // Log analytics asynchronously (non-blocking)
      c.executionCtx.waitUntil(logAnalytics(c, slug));
      
      // Increment click count asynchronously
      c.executionCtx.waitUntil(incrementClickCount(c, slug));
    } else {
      // Step 2: Fallback to D1 database
      const result = await c.env.DB.prepare(
        'SELECT id, destination_url, title FROM links WHERE slug = ? AND is_active = 1'
      ).bind(slug).first<Link>();

      if (!result) {
        return c.notFound();
      }

      destinationUrl = result.destination_url;
      title = result.title || 'Loading...';

      // Step 3: Cache to KV for next time
      await c.env.KV.put(
        `${KV_PREFIX}${slug}`,
        result.destination_url,
        { expirationTtl: KV_TTL }
      );

      // Log analytics and increment clicks asynchronously
      c.executionCtx.waitUntil(logAnalytics(c, slug, result.id));
      c.executionCtx.waitUntil(incrementClickCount(c, slug));
    }

    // Return HTML with iframe wrapper (GAS webapp hosting)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
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
