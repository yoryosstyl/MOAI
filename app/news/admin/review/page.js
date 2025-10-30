'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notifyUserNewsApproved, notifyUserNewsRejected } from '@/utils/notifications';

export default function NewsAdminReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'yoryos.styl@gmail.com' || user?.email === 'stavros.roussos@gmail.com';

  // Fetch all pending news
  useEffect(() => {
    const fetchPendingNews = async () => {
      try {
        const newsRef = collection(db, 'news');
        const q = query(
          newsRef,
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const newsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNews(newsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending news:', error);
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchPendingNews();
    }
  }, [isAdmin]);

  const handleApprove = async (newsId) => {
    if (!confirm('Approve this news article?')) return;

    // Find the news to get submitter info
    const newsItem = news.find((n) => n.id === newsId);
    if (!newsItem) return;

    setProcessing(true);
    try {
      const newsRef = doc(db, 'news', newsId);
      await updateDoc(newsRef, {
        status: 'approved',
        publishedAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      // Notify the submitter
      await notifyUserNewsApproved(
        newsItem.submittedBy,
        newsId,
        newsItem.title
      );

      // Remove from list
      setNews(news.filter((n) => n.id !== newsId));
      alert('News approved successfully!');
    } catch (error) {
      console.error('Error approving news:', error);
      alert('Failed to approve news');
    }
    setProcessing(false);
  };

  const handleRejectClick = (newsItem) => {
    setSelectedNews(newsItem);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const newsRef = doc(db, 'news', selectedNews.id);
      await updateDoc(newsRef, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      // Notify the submitter
      await notifyUserNewsRejected(
        selectedNews.submittedBy,
        selectedNews.title,
        rejectionReason.trim()
      );

      // Remove from list
      setNews(news.filter((n) => n.id !== selectedNews.id));
      setShowRejectModal(false);
      alert('News rejected successfully!');
    } catch (error) {
      console.error('Error rejecting news:', error);
      alert('Failed to reject news');
    }
    setProcessing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <Link href="/news" className="text-blue-600 hover:text-blue-800">
              ← Back to News
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/news"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to News
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">News Review</h1>
            <p className="text-gray-600">Review and approve pending news submissions</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{news.length}</p>
              <p className="text-gray-600 mt-1">Pending Submissions</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading pending news...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && news.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending news submissions to review.</p>
            </div>
          )}

          {/* Pending News List */}
          {!loading && news.length > 0 && (
            <div className="space-y-6">
              {news.map((newsItem) => (
                <div key={newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Image Preview */}
                  {newsItem.imageUrl && (
                    <div className="w-full h-64">
                      <img
                        src={newsItem.imageUrl}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-semibold text-gray-900">{newsItem.title}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          Submitted by <span className="font-medium">{newsItem.submitterName}</span> ({newsItem.submitterEmail}) on {formatDate(newsItem.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Short Description:</h4>
                      <p className="text-gray-600 text-sm">{newsItem.description}</p>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Content:</h4>
                      <p className="text-gray-600 text-sm line-clamp-3">{newsItem.content}</p>
                    </div>

                    {/* Platforms */}
                    {newsItem.platforms && newsItem.platforms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Platforms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {newsItem.platforms.map((platform, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Link */}
                    {newsItem.externalLink && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">External Link:</h4>
                        <a
                          href={newsItem.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {newsItem.externalLink}
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Link
                        href={`/news/${newsItem.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                      >
                        View Full Article
                      </Link>
                      <button
                        onClick={() => handleApprove(newsItem.id)}
                        disabled={processing}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(newsItem)}
                        disabled={processing}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reject News</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedNews?.title}". This will be sent to the submitter.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Reason for rejection..."
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRejectSubmit}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject News'}
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
