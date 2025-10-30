'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const [viewedProfile, setViewedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [returnToPath, setReturnToPath] = useState(null);

  const viewedUid = searchParams.get('uid');
  const isOwnProfile = !viewedUid || (user && viewedUid === user.uid);
  const displayProfile = isOwnProfile ? userProfile : viewedProfile;

  useEffect(() => {
    // Check if we should show a back button
    const projectId = sessionStorage.getItem('returnToProject');
    if (projectId) {
      setReturnToPath(`/projects/${projectId}`);
    } else {
      // Check if we came from projects page
      const fromProjects = sessionStorage.getItem('returnToProjects');
      if (fromProjects) {
        setReturnToPath('/projects');
      }
    }
  }, []);

  useEffect(() => {
    const fetchViewedProfile = async () => {
      if (viewedUid && (!user || viewedUid !== user.uid)) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', viewedUid));
          if (userDoc.exists()) {
            setViewedProfile({ uid: userDoc.id, ...userDoc.data() });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
        setLoading(false);
      }
    };

    fetchViewedProfile();
  }, [viewedUid, user]);

  const handleBackClick = () => {
    if (returnToPath) {
      sessionStorage.removeItem('returnToProject');
      sessionStorage.removeItem('returnToProjects');
      router.push(returnToPath);
    } else {
      router.back();
    }
  };

  const hasPhone = displayProfile?.telephone?.number;
  const hasLocation = displayProfile?.location?.address;
  const hasSocialMedia = displayProfile?.socialMedia?.linkedin ||
                         displayProfile?.socialMedia?.instagram ||
                         displayProfile?.socialMedia?.facebook;
  const hasInterestsOrSkills = (displayProfile?.interests && displayProfile.interests.length > 0) ||
                               (displayProfile?.competencies && displayProfile.competencies.length > 0);

  // Show email only if it's own profile or if email is public
  const showEmail = isOwnProfile || displayProfile?.privacy?.emailPublic;
  // Show phone only if it's own profile or if phone is public
  const showPhone = isOwnProfile || displayProfile?.privacy?.telephonePublic;
  // Show location only if it's own profile or if location is public
  const showLocation = isOwnProfile || displayProfile?.privacy?.locationPublic;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If trying to view own profile but not logged in
  if (isOwnProfile && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {returnToPath && (
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project
          </button>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            {displayProfile?.avatarUrl ? (
              <img
                src={displayProfile.avatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                <span className="text-blue-600 text-4xl font-bold">
                  {displayProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {displayProfile?.displayName || 'Artist'}
              </h1>
              <p className="text-gray-600 mb-4 max-w-2xl">
                {displayProfile?.bio || (isOwnProfile ? 'No bio yet. Click Edit Profile to add one.' : 'No bio available')}
              </p>
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Interests & Competencies */}
        {hasInterestsOrSkills && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Interests & Skills</h2>
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </Link>
              )}
            </div>

            <div className="space-y-6">
              {/* Interests */}
              {displayProfile.interests && displayProfile.interests.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencies */}
              {displayProfile.competencies && displayProfile.competencies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Competencies / Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.competencies.map((competency, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {competency}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* Email */}
            {showEmail && displayProfile?.email && (
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{displayProfile.email}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {showPhone && hasPhone && (
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Telephone</label>
                  <p className="text-gray-900">
                    {formatPhoneNumber(
                      displayProfile.telephone.countryCode,
                      displayProfile.telephone.number
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            {showLocation && hasLocation && (
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">{displayProfile.location.address}</p>
                    {displayProfile.location.isVerified && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show message if viewing someone else's profile and no contact info is public */}
            {!isOwnProfile && !showEmail && !showPhone && !showLocation && (
              <p className="text-gray-500 italic text-center py-4">
                This user has not made their contact information public
              </p>
            )}
          </div>
        </div>

        {/* Social Media */}
        {hasSocialMedia && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Social Media</h2>
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {displayProfile.socialMedia.linkedin && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">in</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                    <a
                      href={displayProfile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {displayProfile.socialMedia.linkedin}
                    </a>
                  </div>
                </div>
              )}

              {displayProfile.socialMedia.instagram && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📷</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Instagram</p>
                    <a
                      href={displayProfile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {displayProfile.socialMedia.instagram}
                    </a>
                  </div>
                </div>
              )}

              {displayProfile.socialMedia.facebook && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xl">f</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Facebook</p>
                    <a
                      href={displayProfile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {displayProfile.socialMedia.facebook}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Settings - only show for own profile */}
        {isOwnProfile && user && (
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
                  displayProfile?.privacy?.emailPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {displayProfile?.privacy?.emailPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Telephone visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  displayProfile?.privacy?.telephonePublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {displayProfile?.privacy?.telephonePublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Location visibility</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  displayProfile?.privacy?.locationPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {displayProfile?.privacy?.locationPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
