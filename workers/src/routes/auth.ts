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
