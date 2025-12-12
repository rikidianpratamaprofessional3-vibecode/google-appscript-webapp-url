import { useState } from 'react';
import type { Link } from '../types';
import { linksApi } from '../api/links';
import { SHORT_URL_BASE } from '../config';

interface LinkCardProps {
  link: Link;
  onUpdate: () => void;
}

export default function LinkCard({ link, onUpdate }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Generate subdomain URL
  const baseDomain = SHORT_URL_BASE.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const shortUrl = `https://${link.slug}.${baseDomain}`;
  
  // Fallback to path-based for now (until custom domain setup)
  const shortUrlFallback = `${SHORT_URL_BASE}/${link.slug}`;

  const handleCopy = () => {
    // Copy subdomain URL (or fallback if no custom domain yet)
    const urlToCopy = baseDomain.includes('workers.dev') ? shortUrlFallback : shortUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await linksApi.delete(link.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete link:', error);
      alert('Failed to delete link');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await linksApi.update(link.id, { is_active: !link.is_active });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle link:', error);
      alert('Failed to update link');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {link.title || link.slug}
            </h3>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                link.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {link.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {link.description && (
            <p className="text-sm text-gray-600 mb-3">{link.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-24">Subdomain:</span>
          <div className="flex-1">
            <a
              href={shortUrlFallback}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm truncate block"
            >
              {link.slug}.linkku.com
            </a>
            <p className="text-xs text-gray-400 mt-0.5">
              {baseDomain.includes('workers.dev') && '(Needs custom domain setup)'}
              {link.redirect_mode && ` • Mode: ${link.redirect_mode}`}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-24">Target URL:</span>
          <a
            href={link.destination_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 text-sm flex-1 truncate hover:text-gray-900"
            title={link.destination_url}
          >
            {link.destination_url}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Clicks: <strong>{link.click_count}</strong></span>
          {link.category && (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {link.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
          >
            {link.is_active ? 'Disable' : 'Enable'}
          </button>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
              >
                {deleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
