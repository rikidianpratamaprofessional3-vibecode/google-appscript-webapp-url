import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Routes
import { handleRedirect } from './routes/redirect';
import { handleSignup, handleLogin, handleGetMe } from './routes/auth';
import { 
  handleCreateLink, 
  handleGetLinks, 
  handleGetLink, 
  handleUpdateLink, 
  handleDeleteLink 
} from './routes/links';

// Middleware
import { authMiddleware } from './middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Root homepage
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GAS Link - Google Apps Script Webapp Hosting</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      color: #1a202c;
      margin-bottom: 16px;
    }
    .tagline {
      font-size: 1.25rem;
      color: #4a5568;
      margin-bottom: 32px;
    }
    .features {
      text-align: left;
      margin: 32px 0;
    }
    .feature {
      display: flex;
      align-items: center;
      margin: 16px 0;
      color: #2d3748;
    }
    .feature-icon {
      font-size: 1.5rem;
      margin-right: 12px;
    }
    .cta {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      margin-top: 24px;
      transition: background 0.3s;
    }
    .cta:hover {
      background: #5568d3;
    }
    .footer {
      margin-top: 32px;
      color: #718096;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 GAS Link</h1>
    <p class="tagline">Host Your Google Apps Script Webapps on Custom Domains</p>
    
    <div class="features">
      <div class="feature">
        <span class="feature-icon">✨</span>
        <span>Remove "This application was created by..." message</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🌐</span>
        <span>Custom short URLs for your GAS webapps</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📊</span>
        <span>Track clicks and analytics</span>
      </div>
      <div class="feature">
        <span class="feature-icon">⚡</span>
        <span>Ultra-fast loading with global CDN</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🔒</span>
        <span>Secure iframe wrapper for your apps</span>
      </div>
    </div>

    <a href="/api/health" class="cta">API Status</a>
    
    <div class="footer">
      <p>Powered by Cloudflare Workers • Built with ❤️</p>
    </div>
  </div>
</body>
</html>`;
  
  return c.html(html);
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    environment: c.env.ENVIRONMENT,
  });
});

// Auth routes (public)
app.post('/api/auth/signup', handleSignup);
app.post('/api/auth/login', handleLogin);

// Auth routes (protected)
app.get('/api/auth/me', authMiddleware, handleGetMe);

// Links routes (protected)
app.post('/api/links', authMiddleware, handleCreateLink);
app.get('/api/links', authMiddleware, handleGetLinks);
app.get('/api/links/:id', authMiddleware, handleGetLink);
app.put('/api/links/:id', authMiddleware, handleUpdateLink);
app.delete('/api/links/:id', authMiddleware, handleDeleteLink);

// Redirect handler (public) - MUST BE LAST
// Catches all routes that don't match API routes
app.get('/:slug', handleRedirect);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Global error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
