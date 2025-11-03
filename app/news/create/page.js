'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';
import { notifyAdminsNewNews } from '@/utils/notifications';

export default function CreateNewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Check if user is admin
  const isAdmin = user?.email === 'gstylianopoulos@gmail.com' || user?.email === 'factanonverba2002@gmail.com';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    platforms: [],
    externalLink: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const platforms = ['Windows', 'Mac', 'Linux', 'Web', 'Android', 'iOS'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setError(t('newsCreate.errorProcessingImage'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        const timestamp = Date.now();
        const storageRef = ref(storage, `news/images/${timestamp}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Create news document
      const newsData = {
        ...formData,
        imageUrl,
        status: isAdmin ? 'approved' : 'pending', // Admin = auto-approved, User = pending review
        submittedBy: user.uid,
        submitterName: user.displayName || user.email,
        submitterEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: isAdmin ? serverTimestamp() : null, // Set publishedAt only if approved
      };

      const docRef = await addDoc(collection(db, 'news'), newsData);

      // Notify admins if this is a user submission (not admin)
      if (!isAdmin) {
        await notifyAdminsNewNews(
          docRef.id,
          formData.title,
          user.displayName || user.email
        );
      }

      // Redirect based on status
      if (isAdmin) {
        router.push('/news');
      } else {
        router.push('/news?submitted=true');
      }
    } catch (err) {
      console.error('Error creating news:', err);
      setError(t('newsCreate.errorCreatingNews'));
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isAdmin ? t('newsCreate.addTitle') : t('newsCreate.title')}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? t('newsCreate.subtitleAdmin')
                : t('newsCreate.subtitleUser')}
            </p>
          </div>

          {/* User submission notice */}
          {!isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">{t('newsCreate.reviewTitle')}</h3>
                  <p className="text-sm text-blue-800">
                    {t('newsCreate.reviewMessage')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('newsCreate.basicInfo')}</h3>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newsCreate.titleRequired')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('newsCreate.titlePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newsCreate.descriptionRequired')}
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('newsCreate.descriptionPlaceholder')}
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newsCreate.contentRequired')}
                  </label>
                  <textarea
                    name="content"
                    required
                    value={formData.content}
                    onChange={handleChange}
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('newsCreate.contentPlaceholder')}
                  />
                </div>
              </div>

              {/* Platforms (Optional) */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('newsCreate.platformsOptional')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('newsCreate.platformsDescription')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`px-4 py-2 rounded-md border-2 transition ${
                        formData.platforms.includes(platform)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('newsCreate.featuredImage')}</h3>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t('newsCreate.imageInstructions')}
                    </p>
                  </div>
                </div>
              </div>

              {/* External Link */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('newsCreate.additionalInfo')}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newsCreate.externalLinkOptional')}
                  </label>
                  <input
                    type="url"
                    name="externalLink"
                    value={formData.externalLink}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('newsCreate.externalLinkPlaceholder')}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {saving
                    ? (isAdmin ? t('newsCreate.publishing') : t('newsCreate.submitting'))
                    : (isAdmin ? t('newsCreate.publish') : t('newsCreate.submit'))}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/news')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                >
                  {t('newsCreate.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
