'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center space-x-6">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-3xl font-bold">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userProfile?.displayName || user?.displayName || 'Artist'}
                </h1>
                <p className="text-gray-600 mb-4">
                  {userProfile?.bio || 'No bio yet. Click Edit Profile to add one.'}
                </p>
                <Link
                  href="/profile/edit"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telephone</label>
                <p className="text-gray-900">{userProfile?.telephone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{userProfile?.location || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Preferred Contact</label>
                <p className="text-gray-900">
                  {userProfile?.preferredContact?.join(', ') || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Privacy Settings</h2>
              <Link
                href="/profile/edit"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit Privacy
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Email visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userProfile?.privacy?.emailPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile?.privacy?.emailPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Telephone visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userProfile?.privacy?.telephonePublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile?.privacy?.telephonePublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Location visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userProfile?.privacy?.locationPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile?.privacy?.locationPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
