'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AvatarUpload from '@/components/AvatarUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { countryCodes, validatePhoneNumber } from '@/utils/phoneUtils';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    website: '',
    telephone: {
      countryCode: '+30',
      number: '',
    },
    location: {
      address: '',
      isVerified: false,
    },
    socialMedia: {
      linkedin: '',
      instagram: '',
      facebook: '',
    },
    avatarUrl: '',
    privacy: {
      emailPublic: false,
      telephonePublic: false,
      locationPublic: false,
      websitePublic: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load user profile data when component mounts
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        telephone: {
          countryCode: userProfile.telephone?.countryCode || '+30',
          number: userProfile.telephone?.number || '',
        },
        location: {
          address: userProfile.location?.address || '',
          isVerified: userProfile.location?.isVerified || false,
        },
        socialMedia: {
          linkedin: userProfile.socialMedia?.linkedin || '',
          instagram: userProfile.socialMedia?.instagram || '',
          facebook: userProfile.socialMedia?.facebook || '',
        },
        avatarUrl: userProfile.avatarUrl || '',
        privacy: {
          emailPublic: userProfile.privacy?.emailPublic || false,
          telephonePublic: userProfile.privacy?.telephonePublic || false,
          locationPublic: userProfile.privacy?.locationPublic || false,
          websitePublic: userProfile.privacy?.websitePublic || false,
        },
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      telephone: {
        ...prev.telephone,
        [field]: value,
      },
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const handlePrivacyChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field],
      },
    }));
  };

  const handleLocationChange = (address) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address,
      },
    }));
  };

  const handleLocationVerifiedChange = (isVerified) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        isVerified,
      },
    }));
  };

  const handleAvatarUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: url,
    }));
  };

  const handleAvatarDelete = () => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate phone number if provided
    if (formData.telephone.number && !validatePhoneNumber(formData.telephone.number)) {
      setError(t('profileEdit.phoneError'));
      setLoading(false);
      return;
    }

    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        website: formData.website,
        telephone: formData.telephone,
        location: formData.location,
        socialMedia: formData.socialMedia,
        avatarUrl: formData.avatarUrl,
        privacy: formData.privacy,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth user profile (so navbar updates immediately)
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
        photoURL: formData.avatarUrl,
      });

      // Update user's name in all their projects, news, and toolkits
      const batch = writeBatch(db);

      // Update projects (ownerName field)
      const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const projectsSnapshot = await getDocs(projectsQuery);
      projectsSnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { ownerName: formData.displayName });
      });

      // Update news (submitterName field)
      const newsQuery = query(collection(db, 'news'), where('submittedBy', '==', user.uid));
      const newsSnapshot = await getDocs(newsQuery);
      newsSnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { submitterName: formData.displayName });
      });

      // Update toolkits (submitterName and author fields)
      const toolkitsQuery = query(collection(db, 'toolkits'), where('submittedBy', '==', user.uid));
      const toolkitsSnapshot = await getDocs(toolkitsQuery);
      toolkitsSnapshot.forEach((docSnapshot) => {
        const updateData = { submitterName: formData.displayName };
        // Only update author if it's not 'MOAI' (admin submissions keep 'MOAI' as author)
        if (docSnapshot.data().author !== 'MOAI') {
          updateData.author = formData.displayName;
        }
        batch.update(docSnapshot.ref, updateData);
      });

      // Commit all updates in a single batch
      await batch.commit();

      // Refresh profile data in context
      await refreshUserProfile();

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t('profileEdit.error'));
      setLoading(false);
    }
  };

  // Don't render form if user is not loaded yet
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">{t('profileEdit.loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profileEdit.title')}</h1>
              <p className="text-gray-600">{t('profileEdit.subtitle')}</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600">{t('profileEdit.success')}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Upload */}
              <div className="border-b pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profileEdit.profilePhoto')}</h3>
                <AvatarUpload
                  currentAvatarUrl={formData.avatarUrl}
                  userId={user.uid}
                  onUploadSuccess={handleAvatarUpload}
                  onDelete={handleAvatarDelete}
                />
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profileEdit.displayName')} *
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('profileEdit.displayNamePlaceholder')}
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profileEdit.bio')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('profileEdit.bioPlaceholder')}
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profileEdit.website')}
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('profileEdit.websitePlaceholder')}
                />
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profileEdit.telephone')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.telephone.countryCode}
                    onChange={(e) => handlePhoneChange('countryCode', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.telephone.number}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      handlePhoneChange('number', value);
                    }}
                    placeholder="1234567890"
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location with Autocomplete */}
              <div>
                <LocationAutocomplete
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  onVerifiedChange={handleLocationVerifiedChange}
                />
                {formData.location.isVerified && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('profileEdit.verifiedAddress')}
                  </p>
                )}
              </div>

              {/* Social Media Links */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profileEdit.social')}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profileEdit.linkedin')}
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      placeholder={t('profileEdit.linkedinPlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profileEdit.instagram')}
                    </label>
                    <input
                      id="instagram"
                      type="url"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder={t('profileEdit.instagramPlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profileEdit.facebook')}
                    </label>
                    <input
                      id="facebook"
                      type="url"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder={t('profileEdit.facebookPlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profileEdit.privacy')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('profileEdit.privacySubtitle')}
                </p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">{t('profileEdit.emailPublic')}</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.emailPublic}
                      onChange={() => handlePrivacyChange('emailPublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">{t('profileEdit.telephonePublic')}</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.telephonePublic}
                      onChange={() => handlePrivacyChange('telephonePublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">{t('profileEdit.locationPublic')}</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.locationPublic}
                      onChange={() => handlePrivacyChange('locationPublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">{t('profileEdit.websitePublic')}</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.websitePublic}
                      onChange={() => handlePrivacyChange('websitePublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Security Settings */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profileEdit.security')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('profileEdit.securitySubtitle')}
                </p>
                <Link
                  href="/auth/change-password"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {t('profileEdit.changePassword')}
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('profileEdit.saving') : t('profileEdit.save')}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                >
                  {t('profileEdit.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
