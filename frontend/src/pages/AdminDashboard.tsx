import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, AdminStats } from '../api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of platform statistics</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/settings"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Settings
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.users.total || 0}
                </p>
              </div>
              <div className="ml-4 text-4xl">👥</div>
            </div>
          </div>

          {/* Total Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Subdomain</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.links.total || 0}
                </p>
              </div>
              <div className="ml-4 text-4xl">🔗</div>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.clicks.total || 0}
                </p>
              </div>
              <div className="ml-4 text-4xl">📊</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats?.revenue.formatted || 'Rp0'}
                </p>
              </div>
              <div className="ml-4 text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Pending Payments Alert */}
        {stats && stats.payments.pending > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  {stats.payments.pending} Pending Payment Request{stats.payments.pending > 1 ? 's' : ''}
                </h3>
                <p className="text-yellow-700 mt-1">
                  You have payment requests waiting for approval
                </p>
              </div>
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Review Now
              </Link>
            </div>
          </div>
        )}

        {/* Users by Plan */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Users by Subscription Plan</h2>
          <div className="space-y-4">
            {stats?.users.by_plan.map((plan) => {
              const total = stats.users.total;
              const percentage = total > 0 ? (plan.count / total) * 100 : 0;
              
              return (
                <div key={plan.subscription}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {plan.subscription}
                    </span>
                    <span className="text-sm text-gray-600">
                      {plan.count} users ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
            <p className="text-gray-600 mt-1">
              View all users, approve subscriptions, and manage accounts
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            <p className="text-gray-600 mt-1">
              Configure WhatsApp number and platform settings
            </p>
          </Link>

          <a
            href="https://digitalin.online"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900">Landing Page</h3>
            <p className="text-gray-600 mt-1">
              View the public landing page
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
