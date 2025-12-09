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
