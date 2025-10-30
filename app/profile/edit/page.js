'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AvatarUpload from '@/components/AvatarUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { countryCodes, validatePhoneNumber } from '@/utils/phoneUtils';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    telephone: {
      countryCode: '+30',
      number: '',
      whatsApp: false,
      viber: false,
      signal: false,
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
    preferredContact: [],
    interests: [],
    competencies: [],
    blockedUsers: [],
    privacy: {
      emailPublic: false,
      telephonePublic: false,
      locationPublic: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newCompetency, setNewCompetency] = useState('');

  // Load user profile data when component mounts
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        telephone: {
          countryCode: userProfile.telephone?.countryCode || '+30',
          number: userProfile.telephone?.number || '',
          whatsApp: userProfile.telephone?.whatsApp || false,
          viber: userProfile.telephone?.viber || false,
          signal: userProfile.telephone?.signal || false,
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
        preferredContact: userProfile.preferredContact || ['email'],
        interests: userProfile.interests || [],
        competencies: userProfile.competencies || [],
        blockedUsers: userProfile.blockedUsers || [],
        privacy: {
          emailPublic: userProfile.privacy?.emailPublic || false,
          telephonePublic: userProfile.privacy?.telephonePublic || false,
          locationPublic: userProfile.privacy?.locationPublic || false,
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

  const handleContactChange = (method) => {
    setFormData((prev) => {
      const currentContacts = prev.preferredContact;
      const isSelected = currentContacts.includes(method);

      return {
        ...prev,
        preferredContact: isSelected
          ? currentContacts.filter((m) => m !== method)
          : [...currentContacts, method],
      };
    });
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

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleAddCompetency = (e) => {
    e.preventDefault();
    if (newCompetency.trim() && !formData.competencies.includes(newCompetency.trim())) {
      setFormData((prev) => ({
        ...prev,
        competencies: [...prev.competencies, newCompetency.trim()],
      }));
      setNewCompetency('');
    }
  };

  const handleRemoveCompetency = (competency) => {
    setFormData((prev) => ({
      ...prev,
      competencies: prev.competencies.filter((c) => c !== competency),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate phone number if provided
    if (formData.telephone.number && !validatePhoneNumber(formData.telephone.number)) {
      setError('Phone number can only contain digits');
      setLoading(false);
      return;
    }

    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        telephone: formData.telephone,
        location: formData.location,
        socialMedia: formData.socialMedia,
        avatarUrl: formData.avatarUrl,
        preferredContact: formData.preferredContact,
        interests: formData.interests,
        competencies: formData.competencies,
        blockedUsers: formData.blockedUsers,
        privacy: formData.privacy,
        updatedAt: serverTimestamp(),
      });

      // Refresh profile data in context
      await refreshUserProfile();

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  // Don't render form if user is not loaded yet
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
              <p className="text-gray-600">Update your personal information and privacy settings</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600">Profile updated successfully! Redirecting...</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
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
                  Display Name *
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself and your artistic work..."
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Add areas of interest (e.g., Photography, 3D Animation, Music Production)
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddInterest(e);
                      }
                    }}
                    placeholder="Add an interest..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Competencies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competencies / Skills
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Add tools and skills you're proficient with (e.g., Blender, After Effects, Character Design)
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCompetency(e);
                      }
                    }}
                    placeholder="Add a competency..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompetency}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.competencies.map((competency, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {competency}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(competency)}
                        className="text-green-600 hover:text-green-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone
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

                {/* Messaging Apps */}
                {formData.telephone.number && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">Available on:</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.telephone.whatsApp}
                          onChange={(e) => handlePhoneChange('whatsApp', e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.telephone.viber}
                          onChange={(e) => handlePhoneChange('viber', e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Viber</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.telephone.signal}
                          onChange={(e) => handlePhoneChange('signal', e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Signal</span>
                      </label>
                    </div>
                  </div>
                )}
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
                    Verified address
                  </p>
                )}
              </div>

              {/* Social Media Links */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      type="url"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      type="url"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Contact Methods */}
              <div className="border-t pt-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Contact Methods (select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['email', 'telephone', 'whatsapp', 'viber', 'signal', 'linkedin', 'instagram', 'facebook'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferredContact.includes(method)}
                        onChange={() => handleContactChange(method)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which information is visible to other users
                </p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Make email public</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.emailPublic}
                      onChange={() => handlePrivacyChange('emailPublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Make telephone public</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.telephonePublic}
                      onChange={() => handlePrivacyChange('telephonePublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Make location public</span>
                    <input
                      type="checkbox"
                      checked={formData.privacy.locationPublic}
                      onChange={() => handlePrivacyChange('locationPublic')}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
