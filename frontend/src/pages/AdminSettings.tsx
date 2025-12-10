import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    admin_whatsapp: '',
    site_name: '',
    support_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings({
        admin_whatsapp: data.settings.admin_whatsapp?.value || '',
        site_name: data.settings.site_name?.value || '',
        support_email: data.settings.support_email?.value || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await adminApi.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Configure platform settings</p>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Settings Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="admin_whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              Admin WhatsApp Number
            </label>
            <input
              id="admin_whatsapp"
              type="text"
              value={settings.admin_whatsapp}
              onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
              placeholder="628123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Format: 628xxxxxxxxxx (without +, without spaces). This number will be used for payment confirmation.
            </p>
          </div>

          <div>
            <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              id="site_name"
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              placeholder="GAS Link"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              The name displayed on the website and emails.
            </p>
          </div>

          <div>
            <label htmlFor="support_email" className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <input
              id="support_email"
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              placeholder="support@gaslink.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Support email address for user inquiries.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* WhatsApp Preview */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 WhatsApp Integration</h3>
          <p className="text-blue-800 mb-4">
            When users click "Upgrade" on the pricing page, they'll be redirected to WhatsApp with a pre-filled message:
          </p>
          <div className="bg-white rounded p-4 text-sm text-gray-700 font-mono">
            <p>Halo! Saya mau upgrade ke paket *Premium*</p>
            <p>📧 Email: user@example.com</p>
            <p>📦 Paket: Premium - Rp30.000/bulan</p>
            <p>🌐 Limit Subdomain: 10 subdomain</p>
            <p>⏰ Periode: 1 bulan</p>
            <p className="mt-2">Mohon info rekening untuk pembayaran 🙏</p>
          </div>
          <p className="text-blue-700 mt-4 text-sm">
            After payment confirmation, approve the user's subscription from the <Link to="/admin/users" className="underline font-medium">Users Management</Link> page.
          </p>
        </div>
      </main>
    </div>
  );
}
