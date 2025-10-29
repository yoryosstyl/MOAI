'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ToolkitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [toolkit, setToolkit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.email === 'yoryos.styl@gmail.com' || user?.email === 'stavros.roussos@gmail.com';

  useEffect(() => {
    const fetchToolkit = async () => {
      try {
        const toolkitDoc = await getDoc(doc(db, 'toolkits', params.id));
        if (toolkitDoc.exists()) {
          setToolkit({ id: toolkitDoc.id, ...toolkitDoc.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching toolkit:', error);
        setLoading(false);
      }
    };

    fetchToolkit();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this toolkit?')) return;

    try {
      await deleteDoc(doc(db, 'toolkits', params.id));
      router.push('/toolkits');
    } catch (error) {
      console.error('Error deleting toolkit:', error);
      alert('Failed to delete toolkit');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading toolkit...</div>
      </div>
    );
  }

  if (!toolkit) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Toolkit Not Found</h1>
          <Link href="/toolkits" className="text-blue-600 hover:text-blue-800">
            ← Back to Toolkits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/toolkits"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Toolkits
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                {toolkit.logoUrl ? (
                  <img
                    src={toolkit.logoUrl}
                    alt={toolkit.name}
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="text-blue-600 text-6xl font-bold">
                    {toolkit.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title and Badges */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="px-3 py-1 text-sm font-medium bg-white text-gray-800 rounded">
                    {toolkit.category}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      toolkit.type === 'Free'
                        ? 'bg-green-100 text-green-800'
                        : toolkit.type === 'Open Source'
                        ? 'bg-blue-100 text-blue-800'
                        : toolkit.type === 'Freemium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {toolkit.type}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-white text-gray-800 rounded">
                    {toolkit.skillLevel}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">{toolkit.name}</h1>

                <div className="flex items-center text-white text-sm">
                  <span>Added by {toolkit.author}</span>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/toolkits/${toolkit.id}/edit`}
                    className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{toolkit.description}</p>
            </div>

            {/* Platforms */}
            {toolkit.platforms && toolkit.platforms.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Available Platforms</h2>
                <div className="flex flex-wrap gap-2">
                  {toolkit.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {toolkit.tags && toolkit.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {toolkit.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Use Cases */}
            {toolkit.popularUseCases && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Popular Use Cases</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {toolkit.popularUseCases}
                </p>
              </div>
            )}

            {/* System Requirements */}
            {toolkit.systemRequirements && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">System Requirements</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {toolkit.systemRequirements}
                </p>
              </div>
            )}

            {/* Website Link */}
            {toolkit.websiteUrl && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Official Website</h2>
                <a
                  href={toolkit.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  {toolkit.websiteUrl}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
