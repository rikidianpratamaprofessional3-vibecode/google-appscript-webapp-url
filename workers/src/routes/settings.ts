import { Context } from 'hono';
import type { Env } from '../types';

interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: number;
  updated_by: string | null;
}

// Get all settings (admin only)
export async function handleGetSettings(c: Context<{ Bindings: Env }>) {
  try {
    const settings = await c.env.DB.prepare(
      'SELECT key, value, description, updated_at, updated_by FROM settings'
    ).all<Setting>();

    // Convert array to object for easier access
    const settingsObj: Record<string, any> = {};
    (settings.results || []).forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
        updated_by: setting.updated_by,
      };
    });

    return c.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get single setting (public for some keys)
export async function handleGetSetting(c: Context<{ Bindings: Env }>) {
  try {
    const key = c.req.param('key');

    if (!key) {
      return c.json({ error: 'Setting key is required' }, 400);
    }

    const setting = await c.env.DB.prepare(
      'SELECT key, value FROM settings WHERE key = ?'
    ).bind(key).first<Pick<Setting, 'key' | 'value'>>();

    if (!setting) {
      return c.json({ error: 'Setting not found' }, 404);
    }

    return c.json({ 
      key: setting.key,
      value: setting.value 
    });
  } catch (error) {
    console.error('Get setting error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Update setting (admin only)
export async function handleUpdateSetting(c: Context<{ Bindings: Env }>) {
  try {
    const adminId = c.get('userId') as string;
    const { key, value } = await c.req.json<{ key: string; value: string }>();

    if (!key || value === undefined) {
      return c.json({ error: 'Key and value are required' }, 400);
    }

    const now = Date.now();

    // Update or insert setting
    await c.env.DB.prepare(
      `INSERT INTO settings (key, value, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`
    ).bind(key, value, now, adminId).run();

    return c.json({ 
      message: 'Setting updated successfully',
      key,
      value
    });
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Batch update settings (admin only)
export async function handleUpdateSettings(c: Context<{ Bindings: Env }>) {
  try {
    const adminId = c.get('userId') as string;
    const { settings } = await c.req.json<{ settings: Record<string, string> }>();

    if (!settings || typeof settings !== 'object') {
      return c.json({ error: 'Settings object is required' }, 400);
    }

    const now = Date.now();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await c.env.DB.prepare(
        `INSERT INTO settings (key, value, updated_at, updated_by)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      ).bind(key, value, now, adminId).run();
    }

    return c.json({ 
      message: 'Settings updated successfully',
      updated: Object.keys(settings).length
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
