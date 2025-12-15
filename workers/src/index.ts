import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Routes
import { handleLanding } from './routes/landing';
import { handleRedirect } from './routes/redirect';
import { handleSignup, handleLogin, handleGetMe, handleUpdateProfile, handleChangePassword } from './routes/auth';
import { 
  handleCreateLink, 
  handleGetLinks, 
  handleGetLink, 
  handleUpdateLink, 
  handleDeleteLink 
} from './routes/links';
import {
  handleGetAllUsers,
  handleGetPaymentRequests,
  handleApproveSubscription,
  handleRejectSubscription,
  handleGetAdminStats,
  handleDowngradeUser
} from './routes/admin';
import {
  handleGetSettings,
  handleGetSetting,
  handleUpdateSetting,
  handleUpdateSettings
} from './routes/settings';

// Middleware
import { authMiddleware } from './middleware/auth';
import { adminMiddleware } from './middleware/admin';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://app.digitalin.online',
    'https://google-appscript-webapp-url.pages.dev'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Root homepage - Neobrutalism Landing Page
app.get('/', handleLanding);

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
app.put('/api/auth/profile', authMiddleware, handleUpdateProfile);
app.post('/api/auth/change-password', authMiddleware, handleChangePassword);

// Links routes (protected)
app.post('/api/links', authMiddleware, handleCreateLink);
app.get('/api/links', authMiddleware, handleGetLinks);
app.get('/api/links/:id', authMiddleware, handleGetLink);
app.put('/api/links/:id', authMiddleware, handleUpdateLink);
app.delete('/api/links/:id', authMiddleware, handleDeleteLink);

// Admin routes (protected - admin only)
app.get('/api/admin/users', authMiddleware, adminMiddleware, handleGetAllUsers);
app.get('/api/admin/payments', authMiddleware, adminMiddleware, handleGetPaymentRequests);
app.get('/api/admin/stats', authMiddleware, adminMiddleware, handleGetAdminStats);
app.post('/api/admin/approve', authMiddleware, adminMiddleware, handleApproveSubscription);
app.post('/api/admin/reject', authMiddleware, adminMiddleware, handleRejectSubscription);
app.post('/api/admin/downgrade', authMiddleware, adminMiddleware, handleDowngradeUser);

// Settings routes
app.get('/api/settings', authMiddleware, adminMiddleware, handleGetSettings);
app.get('/api/settings/:key', handleGetSetting); // Public for some keys like admin_whatsapp
app.put('/api/settings/:key', authMiddleware, adminMiddleware, handleUpdateSetting);
app.post('/api/settings', authMiddleware, adminMiddleware, handleUpdateSettings);

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
