'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [news, setNews] = useState(null);
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === 'gstylianopoulos@gmail.com' || user?.email === 'factanonverba2002@gmail.com';

  const platforms = ['Windows', 'Mac', 'Linux', 'Web', 'Android', 'iOS'];

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsDoc = await getDoc(doc(db, 'news', params.id));

        if (newsDoc.exists()) {
          const newsData = { id: newsDoc.id, ...newsDoc.data() };
          console.log('Fetched news data:', newsData);
          console.log('News submittedBy:', newsData.submittedBy);
          console.log('Current user UID:', user?.uid);
          console.log('Current user email:', user?.email);
          console.log('Full user object:', user);
          console.log('User providerData:', user?.providerData);
          setNews(newsData);
          setFormData({
            title: newsData.title || '',
            description: newsData.description || '',
            content: newsData.content || '',
            platforms: newsData.platforms || [],
            externalLink: newsData.externalLink || '',
          });
          setImagePreview(newsData.imageUrl || null);
        } else {
          setError(t('newsDetail.notFound'));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(t('newsEdit.failedToLoad'));
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNews();
    }
  }, [params.id, t]);

  // Redirect if not admin (wait for user to load first)
  useEffect(() => {
    if (user && !isAdmin) {
      console.log('Non-admin user detected, redirecting:', user.email);
      router.push(`/news/${params.id}`);
    }
  }, [isAdmin, user, params.id, router]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        platforms: formData.platforms,
        externalLink: formData.externalLink,
        updatedAt: serverTimestamp(),
      };

      // Upload new image if provided
      if (imageFile) {
        const timestamp = Date.now();
        const storageRef = ref(storage, `news/images/${timestamp}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);
        updateData.imageUrl = imageUrl;
      }

      // Update news document
      const newsRef = doc(db, 'news', params.id);
      console.log('Updating news with data:', updateData);
      console.log('News ID:', params.id);
      console.log('User:', user?.email);
      console.log('Is Admin:', isAdmin);

      await updateDoc(newsRef, updateData);

      router.push(`/news/${params.id}`);
    } catch (err) {
      console.error('Error updating news:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(t('newsEdit.failedToUpdate') + ` (${err.code || err.message})`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">{t('newsDetail.loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!formData || error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || t('newsDetail.notFound')}</h1>
            <Link href="/news" className="text-blue-600 hover:text-blue-800">
              ← {t('newsDetail.backToNews')}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/news/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('newsDetail.backToNews')}
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('newsEdit.title')}</h1>
              <p className="text-gray-600">{t('newsEdit.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
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
                  {saving ? t('newsEdit.saving') : t('newsEdit.saveChanges')}
                </button>
                <Link
                  href={`/news/${params.id}`}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium text-center"
                >
                  {t('newsCreate.cancel')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
