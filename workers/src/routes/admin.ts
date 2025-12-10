import { Context } from 'hono';
import type { Env, User, PaymentRequest } from '../types';

// Get all users (admin only)
export async function handleGetAllUsers(c: Context<{ Bindings: Env }>) {
  try {
    const users = await c.env.DB.prepare(
      `SELECT 
        id, email, name, subscription, subscription_status, 
        subscription_requested, subscription_expires_at, 
        is_admin, created_at, updated_at
       FROM users 
       ORDER BY created_at DESC`
    ).all<Omit<User, 'password_hash'>>();

    // Get link counts for each user
    const usersWithStats = await Promise.all(
      (users.results || []).map(async (user) => {
        const linkCount = await c.env.DB.prepare(
          'SELECT COUNT(*) as count FROM links WHERE user_id = ?'
        ).bind(user.id).first<{ count: number }>();

        return {
          ...user,
          link_count: linkCount?.count || 0,
        };
      })
    );

    return c.json({
      users: usersWithStats,
      total: usersWithStats.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get all payment requests (admin only)
export async function handleGetPaymentRequests(c: Context<{ Bindings: Env }>) {
  try {
    const status = c.req.query('status'); // pending, approved, rejected, all

    let query = 'SELECT * FROM payment_requests';
    const bindings: string[] = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      bindings.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const requests = await c.env.DB.prepare(query)
      .bind(...bindings)
      .all<PaymentRequest>();

    return c.json({
      requests: requests.results || [],
      total: requests.results?.length || 0,
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Approve subscription upgrade (admin only)
export async function handleApproveSubscription(c: Context<{ Bindings: Env }>) {
  try {
    const adminId = c.get('userId') as string;
    const { userId, plan } = await c.req.json<{ userId: string; plan: 'basic' | 'premium' | 'enterprise' }>();

    if (!userId || !plan) {
      return c.json({ error: 'User ID and plan are required' }, 400);
    }

    if (plan !== 'basic' && plan !== 'premium' && plan !== 'enterprise') {
      return c.json({ error: 'Invalid plan. Must be basic, premium, or enterprise' }, 400);
    }

    const now = Date.now();
    const oneMonthFromNow = now + (30 * 24 * 60 * 60 * 1000); // 1 month in milliseconds

    // Update user subscription
    await c.env.DB.prepare(
      `UPDATE users 
       SET subscription = ?, 
           subscription_status = 'active',
           subscription_expires_at = ?,
           subscription_requested = NULL,
           updated_at = ?
       WHERE id = ?`
    ).bind(plan, oneMonthFromNow, now, userId).run();

    // Update or create payment request record
    await c.env.DB.prepare(
      `INSERT INTO payment_requests (id, user_id, email, requested_plan, amount, status, created_at, updated_at, approved_by, approved_at)
       SELECT ?, ?, email, ?, ?, 'approved', ?, ?, ?, ?
       FROM users WHERE id = ?
       ON CONFLICT(id) DO UPDATE SET
         status = 'approved',
         approved_by = excluded.approved_by,
         approved_at = excluded.approved_at,
         updated_at = excluded.updated_at`
    ).bind(
      `pay_${Date.now()}`,
      userId,
      plan,
      plan === 'basic' ? 15000 : (plan === 'premium' ? 30000 : 100000),
      now,
      now,
      adminId,
      now,
      userId
    ).run();

    return c.json({ 
      message: 'Subscription approved successfully',
      user_id: userId,
      plan,
      expires_at: oneMonthFromNow
    });
  } catch (error) {
    console.error('Approve subscription error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Reject subscription request (admin only)
export async function handleRejectSubscription(c: Context<{ Bindings: Env }>) {
  try {
    const adminId = c.get('userId') as string;
    const { userId, reason } = await c.req.json<{ userId: string; reason?: string }>();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const now = Date.now();

    // Clear subscription request
    await c.env.DB.prepare(
      `UPDATE users 
       SET subscription_requested = NULL,
           updated_at = ?
       WHERE id = ?`
    ).bind(now, userId).run();

    return c.json({ 
      message: 'Subscription request rejected',
      user_id: userId,
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Reject subscription error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get dashboard stats (admin only)
export async function handleGetAdminStats(c: Context<{ Bindings: Env }>) {
  try {
    // Get total users by subscription
    const userStats = await c.env.DB.prepare(
      `SELECT 
        subscription,
        COUNT(*) as count
       FROM users
       GROUP BY subscription`
    ).all<{ subscription: string; count: number }>();

    // Get total links
    const totalLinks = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM links'
    ).first<{ count: number }>();

    // Get total clicks
    const totalClicks = await c.env.DB.prepare(
      'SELECT SUM(click_count) as total FROM links'
    ).first<{ total: number }>();

    // Get pending payment requests
    const pendingPayments = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM payment_requests WHERE status = 'pending'"
    ).first<{ count: number }>();

    // Calculate revenue (approximate)
    const revenue = await c.env.DB.prepare(
      `SELECT SUM(amount) as total 
       FROM payment_requests 
       WHERE status = 'approved'`
    ).first<{ total: number }>();

    return c.json({
      users: {
        total: userStats.results?.reduce((sum, s) => sum + s.count, 0) || 0,
        by_plan: userStats.results || [],
      },
      links: {
        total: totalLinks?.count || 0,
      },
      clicks: {
        total: totalClicks?.total || 0,
      },
      payments: {
        pending: pendingPayments?.count || 0,
      },
      revenue: {
        total: revenue?.total || 0,
        formatted: `Rp${(revenue?.total || 0).toLocaleString('id-ID')}`,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Downgrade/Cancel user subscription (admin only)
export async function handleDowngradeUser(c: Context<{ Bindings: Env }>) {
  try {
    const { userId } = await c.req.json<{ userId: string }>();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const now = Date.now();

    // Downgrade to free
    await c.env.DB.prepare(
      `UPDATE users 
       SET subscription = 'free',
           subscription_status = 'active',
           subscription_expires_at = NULL,
           subscription_requested = NULL,
           updated_at = ?
       WHERE id = ?`
    ).bind(now, userId).run();

    return c.json({ 
      message: 'User downgraded to free plan',
      user_id: userId
    });
  } catch (error) {
    console.error('Downgrade user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
