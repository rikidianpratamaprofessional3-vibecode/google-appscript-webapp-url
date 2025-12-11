import { Context } from 'hono';
import type { Env, User, JWTPayload } from '../types';
import { hashPassword, verifyPassword, generateToken, generateId } from '../utils/auth';
import { isValidEmail } from '../utils/validation';

export async function handleSignup(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Create new user
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name, subscription, subscription_status, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      userId,
      email.toLowerCase(),
      passwordHash,
      name || null,
      'free',
      'active',
      0,
      now,
      now
    ).run();

    // Generate JWT token
    const payload: JWTPayload = {
      userId,
      email: email.toLowerCase(),
      subscription: 'free',
    };

    const token = await generateToken(payload, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name || null,
        subscription: 'free',
      },
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleLogin(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, subscription, is_admin FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first<User>();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      subscription: user.subscription,
    };

    const token = await generateToken(payload, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        is_admin: user.is_admin || false,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleGetMe(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, subscription, subscription_expires_at, is_admin, created_at FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        subscription_expires_at: user.subscription_expires_at,
        is_admin: user.is_admin || false,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleUpdateProfile(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json();
    const { name, email } = body;

    if (!name && !email) {
      return c.json({ error: 'At least one field (name or email) is required' }, 400);
    }

    // If email is being changed, check if it's already taken
    if (email) {
      if (!isValidEmail(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      const existingUser = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ? AND id != ?'
      ).bind(email.toLowerCase(), userId).first();

      if (existingUser) {
        return c.json({ error: 'Email already in use' }, 409);
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email.toLowerCase());
    }

    updates.push('updated_at = ?');
    values.push(Date.now());

    values.push(userId);

    await c.env.DB.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get updated user
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, subscription, subscription_expires_at, is_admin, created_at FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    return c.json({
      message: 'Profile updated successfully',
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        subscription: user!.subscription,
        subscription_expires_at: user!.subscription_expires_at,
        is_admin: user!.is_admin || false,
        created_at: user!.created_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleChangePassword(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'New password must be at least 6 characters' }, 400);
    }

    // Get current user
    const user = await c.env.DB.prepare(
      'SELECT id, password_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(newPasswordHash, Date.now(), userId).run();

    return c.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
