import { Context, Next } from 'hono';
import type { Env, JWTPayload } from '../types';
import { verifyToken } from '../utils/auth';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      return c.json({ error: 'Unauthorized: Token not provided' }, 401);
    }

    const payload = await verifyToken(token, c.env.JWT_SECRET);

    // Set user info in context
    c.set('userId', payload.userId);
    c.set('email', payload.email);
    c.set('subscription', payload.subscription);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}
