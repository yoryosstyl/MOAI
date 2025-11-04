'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';
import { notifyUserToolkitApproved } from '@/utils/notifications';

export default function EditToolkitPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Check if accessed from review page
  const isReviewMode = searchParams.get('review') === 'true';

  // Check if user is admin
  const isAdmin = user?.email === 'yoryos.styl@gmail.com' || user?.email === 'stavros.roussos@gmail.com';

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    type: '',
    platforms: [],
    skillLevel: '',
    websiteUrl: '',
    tags: [],
    popularUseCases: '',
    systemRequirements: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toolkitData, setToolkitData] = useState(null); // Store full toolkit data for notifications

  const categories = [
    '3D & Animation',
    'Photo Editing',
    'Video Editing',
    'Music Production',
    'Graphic Design',
    'Game Development',
    'Web Development',
    'Writing & Publishing',
    'Other',
  ];

  const types = ['Free', 'Paid', 'Freemium', 'Open Source'];
  const skillLevels = ['Beginner-friendly', 'Intermediate', 'Professional/Advanced'];
  const platforms = ['Windows', 'Mac', 'Linux', 'Web', 'Android', 'iOS'];

  // Load toolkit data
  useEffect(() => {
    const fetchToolkit = async () => {
      try {
        const toolkitDoc = await getDoc(doc(db, 'toolkits', params.id));
        if (toolkitDoc.exists()) {
          const data = toolkitDoc.data();
          setToolkitData(data); // Store full data for notifications
          setFormData({
            name: data.name || '',
            category: data.category || '',
            description: data.description || '',
            type: data.type || '',
            platforms: data.platforms || [],
            skillLevel: data.skillLevel || '',
            websiteUrl: data.websiteUrl || '',
            tags: data.tags || [],
            popularUseCases: data.popularUseCases || '',
            systemRequirements: data.systemRequirements || '',
          });
          if (data.logoUrl) {
            setLogoPreview(data.logoUrl);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching toolkit:', error);
        setError(t('toolkitEdit.failedToLoad'));
        setLoading(false);
      }
    };

    fetchToolkit();
  }, [params.id]);

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

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/png',
      };
      const compressedFile = await imageCompression(file, options);
      setLogoFile(compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setError(t('toolkitEdit.failedToProcessImage'));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const saveToolkit = async () => {
    let logoUrl = logoPreview;

    // Upload new logo if changed
    if (logoFile) {
      const timestamp = Date.now();
      const storageRef = ref(storage, `toolkits/logos/${timestamp}_${logoFile.name}`);
      await uploadBytes(storageRef, logoFile);
      logoUrl = await getDownloadURL(storageRef);
    }

    // Update toolkit document
    const toolkitRef = doc(db, 'toolkits', params.id);
    await updateDoc(toolkitRef, {
      ...formData,
      logoUrl,
      updatedAt: serverTimestamp(),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await saveToolkit();

      // Redirect based on mode
      if (isReviewMode) {
        router.push('/toolkits/admin/review');
      } else {
        router.push(`/toolkits/${params.id}`);
      }
    } catch (err) {
      console.error('Error updating toolkit:', err);
      setError(t('toolkitEdit.failedToUpdate'));
      setSaving(false);
    }
  };

  const handleSaveAndApprove = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Save the toolkit
      await saveToolkit();

      // Approve the toolkit
      const toolkitRef = doc(db, 'toolkits', params.id);
      await updateDoc(toolkitRef, {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      // Notify the submitter if this was a user submission
      if (toolkitData && toolkitData.submittedBy) {
        await notifyUserToolkitApproved(
          toolkitData.submittedBy,
          params.id,
          formData.name
        );
      }

      router.push('/toolkits/admin/review');
    } catch (err) {
      console.error('Error saving and approving toolkit:', err);
      setError(t('toolkitEdit.failedToSaveAndApprove'));
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isReviewMode) {
      router.push('/toolkits/admin/review');
    } else {
      router.push(`/toolkits/${params.id}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">{t('toolkitEdit.loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('toolkitEdit.accessDenied')}</h1>
            <p className="text-gray-600 mb-4">{t('toolkitEdit.noPermission')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolkitEdit.title')}</h1>
            <p className="text-gray-600">{t('toolkitEdit.subtitle')}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('toolkitEdit.basicInfo')}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.toolName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('toolkitEdit.category')} *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('toolkitEdit.selectCategory')}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolkitEdit.type')} *</label>
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('toolkitEdit.selectType')}</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.description')} *
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.skillLevel')} *
                  </label>
                  <select
                    name="skillLevel"
                    required
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('toolkitEdit.selectSkillLevel')}</option>
                    {skillLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Platforms */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('toolkitEdit.platforms')} *</h3>
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

              {/* Logo */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('toolkitEdit.logoIcon')}</h3>
                <div className="flex items-start gap-6">
                  {logoPreview && (
                    <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t('toolkitEdit.uploadNewLogo')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('toolkitEdit.tags')}</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder={t('toolkitEdit.addTag')}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {t('toolkitEdit.addButton')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('toolkitEdit.additionalInfo')}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.officialWebsite')}
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.popularUseCases')}
                  </label>
                  <textarea
                    name="popularUseCases"
                    value={formData.popularUseCases}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toolkitEdit.systemRequirements')}
                  </label>
                  <textarea
                    name="systemRequirements"
                    value={formData.systemRequirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                {isReviewMode ? (
                  <>
                    {/* Review Mode: 3 buttons */}
                    <button
                      type="submit"
                      disabled={saving || formData.platforms.length === 0}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      {saving ? t('toolkitEdit.saving') : t('toolkitEdit.save')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndApprove}
                      disabled={saving || formData.platforms.length === 0}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                      {saving ? t('toolkitEdit.saving') : t('toolkitEdit.saveAndApprove')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium disabled:opacity-50"
                    >
                      {t('toolkitEdit.cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Normal Mode: 2 buttons */}
                    <button
                      type="submit"
                      disabled={saving || formData.platforms.length === 0}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      {saving ? t('toolkitEdit.saving') : t('toolkitEdit.saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium disabled:opacity-50"
                    >
                      {t('toolkitEdit.cancel')}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
