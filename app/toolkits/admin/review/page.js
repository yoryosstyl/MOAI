'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [toolkits, setToolkits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolkit, setSelectedToolkit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'yoryos.styl@gmail.com' || user?.email === 'stavros.roussos@gmail.com';

  // Fetch all pending toolkits
  useEffect(() => {
    const fetchPendingToolkits = async () => {
      try {
        const toolkitsRef = collection(db, 'toolkits');
        const q = query(
          toolkitsRef,
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const toolkitsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setToolkits(toolkitsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending toolkits:', error);
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchPendingToolkits();
    }
  }, [isAdmin]);

  const handleApprove = async (toolkitId) => {
    if (!confirm('Approve this toolkit?')) return;

    setProcessing(true);
    try {
      const toolkitRef = doc(db, 'toolkits', toolkitId);
      await updateDoc(toolkitRef, {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      // Remove from list
      setToolkits(toolkits.filter((t) => t.id !== toolkitId));
      alert('Toolkit approved successfully!');
    } catch (error) {
      console.error('Error approving toolkit:', error);
      alert('Failed to approve toolkit');
    }
    setProcessing(false);
  };

  const handleRejectClick = (toolkit) => {
    setSelectedToolkit(toolkit);
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
      const toolkitRef = doc(db, 'toolkits', selectedToolkit.id);
      await updateDoc(toolkitRef, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      // Remove from list
      setToolkits(toolkits.filter((t) => t.id !== selectedToolkit.id));
      setShowRejectModal(false);
      alert('Toolkit rejected successfully!');
    } catch (error) {
      console.error('Error rejecting toolkit:', error);
      alert('Failed to reject toolkit');
    }
    setProcessing(false);
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <Link href="/toolkits" className="text-blue-600 hover:text-blue-800">
              ← Back to Toolkits
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
              href="/toolkits"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Toolkits
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Toolkit Review</h1>
            <p className="text-gray-600">Review and approve pending toolkit submissions</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{toolkits.length}</p>
              <p className="text-gray-600 mt-1">Pending Submissions</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading pending toolkits...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && toolkits.length === 0 && (
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
              <p className="text-gray-600">No pending toolkit submissions to review.</p>
            </div>
          )}

          {/* Pending Toolkits List */}
          {!loading && toolkits.length > 0 && (
            <div className="space-y-6">
              {toolkits.map((toolkit) => (
                <div key={toolkit.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold text-gray-900">{toolkit.name}</h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Submitted by <span className="font-medium">{toolkit.submitterName}</span> ({toolkit.submitterEmail})
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {toolkit.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {toolkit.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {toolkit.skillLevel}
                        </span>
                      </div>
                    </div>

                    {/* Logo Preview */}
                    {toolkit.logoUrl && (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                        <img src={toolkit.logoUrl} alt={toolkit.name} className="w-20 h-20 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                    <p className="text-gray-600 text-sm">{toolkit.description}</p>
                  </div>

                  {/* Platforms */}
                  {toolkit.platforms && toolkit.platforms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Platforms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {toolkit.platforms.map((platform, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {toolkit.tags && toolkit.tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {toolkit.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {toolkit.websiteUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Website:</h4>
                      <a
                        href={toolkit.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {toolkit.websiteUrl}
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Link
                      href={`/toolkits/${toolkit.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/toolkits/${toolkit.id}/edit?review=true`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
                    >
                      Edit & Approve
                    </Link>
                    <button
                      onClick={() => handleApprove(toolkit.id)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(toolkit)}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reject Toolkit</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedToolkit?.name}". This will be sent to the submitter.
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
                  {processing ? 'Rejecting...' : 'Reject Toolkit'}
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
