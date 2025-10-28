'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPhoneNumber } from '@/utils/phoneUtils';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  const hasPhone = userProfile?.telephone?.number;
  const hasLocation = userProfile?.location?.address;
  const hasSocialMedia = userProfile?.socialMedia?.linkedin ||
                         userProfile?.socialMedia?.instagram ||
                         userProfile?.socialMedia?.facebook;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                  <span className="text-blue-600 text-4xl font-bold">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userProfile?.displayName || user?.displayName || 'Artist'}
                </h1>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  {userProfile?.bio || 'No bio yet. Click Edit Profile to add one.'}
                </p>
                <Link
                  href="/profile/edit"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
              <Link
                href="/profile/edit"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Telephone</label>
                  {hasPhone ? (
                    <>
                      <p className="text-gray-900">
                        {formatPhoneNumber(
                          userProfile.telephone.countryCode,
                          userProfile.telephone.number
                        )}
                      </p>
                      {/* Messaging Apps */}
                      {(userProfile.telephone.whatsApp || userProfile.telephone.viber || userProfile.telephone.signal) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userProfile.telephone.whatsApp && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              WhatsApp
                            </span>
                          )}
                          {userProfile.telephone.viber && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Viber
                            </span>
                          )}
                          {userProfile.telephone.signal && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Signal
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 italic">Not provided</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  {hasLocation ? (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{userProfile.location.address}</p>
                      {userProfile.location.isVerified && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Not provided</p>
                  )}
                </div>
              </div>

              {/* Preferred Contact Methods */}
              {userProfile?.preferredContact && userProfile.preferredContact.length > 0 && (
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Preferred Contact</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.preferredContact.map((method) => (
                        <span
                          key={method}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          {hasSocialMedia && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Social Media</h2>
                <Link
                  href="/profile/edit"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-4">
                {userProfile.socialMedia.linkedin && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">in</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                      <a
                        href={userProfile.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {userProfile.socialMedia.linkedin}
                      </a>
                    </div>
                  </div>
                )}

                {userProfile.socialMedia.instagram && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📷</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Instagram</p>
                      <a
                        href={userProfile.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {userProfile.socialMedia.instagram}
                      </a>
                    </div>
                  </div>
                )}

                {userProfile.socialMedia.facebook && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xl">f</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Facebook</p>
                      <a
                        href={userProfile.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {userProfile.socialMedia.facebook}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Email visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile?.privacy?.emailPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {userProfile?.privacy?.emailPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Telephone visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile?.privacy?.telephonePublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {userProfile?.privacy?.telephonePublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Location visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile?.privacy?.locationPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
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
