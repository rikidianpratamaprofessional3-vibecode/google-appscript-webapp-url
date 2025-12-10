import { Context, Next } from 'hono';
import type { Env, User } from '../types';

export async function adminMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const userId = c.get('userId') as string;

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if user is admin
  const user = await c.env.DB.prepare(
    'SELECT is_admin FROM users WHERE id = ?'
  ).bind(userId).first<Pick<User, 'is_admin'>>();

  if (!user || !user.is_admin) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
}
