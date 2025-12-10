import { Context } from 'hono';
import type { Env, Link, CreateLinkInput, UpdateLinkInput } from '../types';
import { generateId } from '../utils/auth';
import { isValidUrl, isValidSlug, isReservedSlug, sanitizeSlug } from '../utils/validation';

const SUBSCRIPTION_LIMITS = {
  free: 1,
  basic: 3,
  premium: 10,
  enterprise: 999999,
  pro: 100, // Legacy - keep for backward compatibility
  business: Infinity, // Legacy
};

export async function handleCreateLink(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const userSubscription = c.get('subscription') as 'free' | 'pro' | 'business';
    const body = await c.req.json<CreateLinkInput>();

    const { slug, destination_url, title, description, category } = body;

    if (!slug || !destination_url) {
      return c.json({ error: 'Slug and destination URL are required' }, 400);
    }

    // Validate destination URL
    if (!isValidUrl(destination_url)) {
      return c.json({ error: 'Invalid destination URL' }, 400);
    }

    // Validate and sanitize slug
    const cleanSlug = sanitizeSlug(slug);
    if (!isValidSlug(cleanSlug)) {
      return c.json({ error: 'Invalid slug format. Use 3-50 characters: letters, numbers, hyphens, underscores' }, 400);
    }

    if (isReservedSlug(cleanSlug)) {
      return c.json({ error: 'This slug is reserved and cannot be used' }, 400);
    }

    // Check if slug already exists
    const existingLink = await c.env.DB.prepare(
      'SELECT id FROM links WHERE slug = ?'
    ).bind(cleanSlug).first();

    if (existingLink) {
      return c.json({ error: 'Slug already exists' }, 409);
    }

    // Check subscription limits
    const userLinksCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM links WHERE user_id = ?'
    ).bind(userId).first<{ count: number }>();

    const limit = SUBSCRIPTION_LIMITS[userSubscription];
    if (userLinksCount && userLinksCount.count >= limit) {
      return c.json({ 
        error: `Link limit reached. Upgrade to create more links.`,
        limit,
        current: userLinksCount.count,
      }, 403);
    }

    // Create new link
    const linkId = generateId();
    const now = Date.now();

    await c.env.DB.prepare(
      'INSERT INTO links (id, user_id, slug, destination_url, title, description, category, is_active, click_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      linkId,
      userId,
      cleanSlug,
      destination_url,
      title || null,
      description || null,
      category || null,
      1,
      0,
      now,
      now
    ).run();

    // Cache in KV immediately
    await c.env.KV.put(`link:${cleanSlug}`, destination_url, { expirationTtl: 3600 });

    const newLink = {
      id: linkId,
      slug: cleanSlug,
      destination_url,
      title,
      description,
      category,
      is_active: true,
      click_count: 0,
      created_at: now,
      updated_at: now,
      last_accessed_at: null,
    };

    return c.json({ link: newLink }, 201);
  } catch (error) {
    console.error('Create link error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleGetLinks(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;

    const links = await c.env.DB.prepare(
      'SELECT id, slug, destination_url, title, description, category, is_active, click_count, created_at, updated_at, last_accessed_at FROM links WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all<Link>();

    // Convert is_active from number to boolean for frontend
    const formattedLinks = (links.results || []).map(link => ({
      ...link,
      is_active: Boolean(link.is_active),
    }));

    return c.json({
      links: formattedLinks,
      total: formattedLinks.length,
    });
  } catch (error) {
    console.error('Get links error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleGetLink(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const linkId = c.req.param('id');

    const link = await c.env.DB.prepare(
      'SELECT id, slug, destination_url, title, description, category, is_active, click_count, created_at, updated_at, last_accessed_at FROM links WHERE id = ? AND user_id = ?'
    ).bind(linkId, userId).first<Link>();

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
    }

    // Convert is_active from number to boolean
    const formattedLink = {
      ...link,
      is_active: Boolean(link.is_active),
    };

    return c.json({ link: formattedLink });
  } catch (error) {
    console.error('Get link error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleUpdateLink(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const linkId = c.req.param('id');
    const body = await c.req.json<UpdateLinkInput>();

    // Verify link ownership
    const existingLink = await c.env.DB.prepare(
      'SELECT slug FROM links WHERE id = ? AND user_id = ?'
    ).bind(linkId, userId).first<{ slug: string }>();

    if (!existingLink) {
      return c.json({ error: 'Link not found' }, 404);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.slug !== undefined) {
      const cleanSlug = sanitizeSlug(body.slug);
      if (!isValidSlug(cleanSlug)) {
        return c.json({ error: 'Invalid slug format' }, 400);
      }
      if (isReservedSlug(cleanSlug)) {
        return c.json({ error: 'This slug is reserved' }, 400);
      }
      
      // Check if new slug already exists
      if (cleanSlug !== existingLink.slug) {
        const slugExists = await c.env.DB.prepare(
          'SELECT id FROM links WHERE slug = ?'
        ).bind(cleanSlug).first();

        if (slugExists) {
          return c.json({ error: 'Slug already exists' }, 409);
        }
      }

      updates.push('slug = ?');
      values.push(cleanSlug);

      // Update KV cache
      await c.env.KV.delete(`link:${existingLink.slug}`);
    }

    if (body.destination_url !== undefined) {
      if (!isValidUrl(body.destination_url)) {
        return c.json({ error: 'Invalid destination URL' }, 400);
      }
      updates.push('destination_url = ?');
      values.push(body.destination_url);
    }

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title || null);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description || null);
    }

    if (body.category !== undefined) {
      updates.push('category = ?');
      values.push(body.category || null);
    }

    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    updates.push('updated_at = ?');
    values.push(Date.now());

    values.push(linkId);
    values.push(userId);

    await c.env.DB.prepare(
      `UPDATE links SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    // Get updated link
    const updatedLink = await c.env.DB.prepare(
      'SELECT id, slug, destination_url, title, description, category, is_active, click_count, created_at, updated_at, last_accessed_at FROM links WHERE id = ?'
    ).bind(linkId).first<Link>();

    if (!updatedLink) {
      return c.json({ error: 'Link not found after update' }, 500);
    }

    // Update KV cache with new values
    await c.env.KV.put(`link:${updatedLink.slug}`, updatedLink.destination_url, { expirationTtl: 3600 });

    // Convert is_active from number to boolean
    const formattedLink = {
      ...updatedLink,
      is_active: Boolean(updatedLink.is_active),
    };

    return c.json({ link: formattedLink });
  } catch (error) {
    console.error('Update link error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function handleDeleteLink(c: Context<{ Bindings: Env }>) {
  try {
    const userId = c.get('userId') as string;
    const linkId = c.req.param('id');

    // Get link slug for KV deletion
    const link = await c.env.DB.prepare(
      'SELECT slug FROM links WHERE id = ? AND user_id = ?'
    ).bind(linkId, userId).first<{ slug: string }>();

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
    }

    // Delete from database
    await c.env.DB.prepare(
      'DELETE FROM links WHERE id = ? AND user_id = ?'
    ).bind(linkId, userId).run();

    // Delete from KV cache
    await c.env.KV.delete(`link:${link.slug}`);

    return c.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
