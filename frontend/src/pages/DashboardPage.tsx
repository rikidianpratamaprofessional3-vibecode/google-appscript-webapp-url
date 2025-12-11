import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLinkStore } from '../store/linkStore';
import { linksApi } from '../api/links';
import LinkCard from '../components/LinkCard';
import CreateLinkModal from '../components/CreateLinkModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { links, setLinks, isLoading, setLoading } = useLinkStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await linksApi.getAll();
      setLinks(response.links);
    } catch (error: any) {
      console.error('Failed to load links:', error);
      if (error.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0);
  const activeLinks = links.filter((link) => link.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GAS Link</h1>
              <p className="text-sm text-gray-600">
                {user?.email} • <span className="capitalize">{user?.subscription}</span> Plan
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/profile"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Profile
              </a>
              {user?.is_admin && (
                <a
                  href="/admin"
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Admin Panel
                </a>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Links</div>
            <div className="text-3xl font-bold text-gray-900">{links.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {user?.subscription === 'free' && `${links.length}/1 used`}
              {user?.subscription === 'basic' && `${links.length}/5 used`}
              {user?.subscription === 'premium' && `${links.length}/10 used`}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-gray-900">{totalClicks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Active Links</div>
            <div className="text-3xl font-bold text-gray-900">{activeLinks}</div>
          </div>
        </div>

        {/* Create Link Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Links</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
          >
            + Create New Link
          </button>
        </div>

        {/* Links List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-600 mb-4">No links yet. Create your first short link!</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
            >
              Create Link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onUpdate={loadLinks} />
            ))}
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadLinks}
        />
      )}
    </div>
  );
}
