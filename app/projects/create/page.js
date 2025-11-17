'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'performative',
    typeOfSharing: 'collaborative',
    shape: '',
    color: '#3B82F6',
    kindOfProject: '',
    tags: [],
    size: 'medium',
    location: '',
    isPublic: true,
    links: {
      googleDrive: '',
      website: '',
      trello: '',
      moreInfo: '',
    },
    contactPerson: {
      name: userProfile?.displayName || '',
      email: userProfile?.email || '',
    },
  });

  const [tagInput, setTagInput] = useState('');
  const [projectImages, setProjectImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = images
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const projectTypes = [
    { value: 'Visual Arts', label: t('projectCreate.types.visualArts') },
    { value: 'Performance', label: t('projectCreate.types.performance') },
    { value: 'Music', label: t('projectCreate.types.music') },
    { value: 'Dance', label: t('projectCreate.types.dance') },
    { value: 'Theater', label: t('projectCreate.types.theater') },
    { value: 'Film & Video', label: t('projectCreate.types.filmVideo') },
    { value: 'Writing', label: t('projectCreate.types.writing') },
    { value: 'Digital Arts', label: t('projectCreate.types.digitalArts') },
    { value: 'Installation', label: t('projectCreate.types.installation') },
    { value: 'Community Project', label: t('projectCreate.types.communityProject') },
    { value: 'Research', label: t('projectCreate.types.research') },
    { value: 'Other', label: t('projectCreate.types.other') },
  ];

  const projectShapes = [
    { value: 'Workshop', label: t('projectCreate.shapes.workshop') },
    { value: 'Exhibition', label: t('projectCreate.shapes.exhibition') },
    { value: 'Performance', label: t('projectCreate.shapes.performance') },
    { value: 'Residency', label: t('projectCreate.shapes.residency') },
    { value: 'Collaboration', label: t('projectCreate.shapes.collaboration') },
    { value: 'Commission', label: t('projectCreate.shapes.commission') },
    { value: 'Open Call', label: t('projectCreate.shapes.openCall') },
    { value: 'Festival', label: t('projectCreate.shapes.festival') },
    { value: 'Other', label: t('projectCreate.shapes.other') },
  ];

  const projectSizes = [
    { value: 'small', label: t('projectCreate.sizes.small') },
    { value: 'medium', label: t('projectCreate.sizes.medium') },
    { value: 'large', label: t('projectCreate.sizes.large') },
  ];

  const sharingTypes = [
    { value: 'open', label: t('projectCreate.sharingTypes.open') },
    { value: 'collaborative', label: t('projectCreate.sharingTypes.collaborative') },
    { value: 'showcase', label: t('projectCreate.sharingTypes.showcase') },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLinkChange = (linkType, value) => {
    setFormData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [linkType]: value,
      },
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value,
      },
    }));
  };

  const handleLocationChange = (address) => {
    setFormData((prev) => ({ ...prev, location: address }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (countWords(formData.name) > 10) {
      setError(t('projectCreate.errorNameMaxWords'));
      setLoading(false);
      return;
    }

    if (countWords(formData.description) > 50) {
      setError(t('projectCreate.errorDescriptionMaxWords'));
      setLoading(false);
      return;
    }

    if (formData.tags.length === 0) {
      setError(t('projectCreate.errorAddTag'));
      setLoading(false);
      return;
    }

    try {
      // Create project in Firestore
      const projectData = {
        ...formData,
        ownerId: user.uid,
        ownerName: userProfile?.displayName || user.displayName,
        images: [],
        thumbnailUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      setCreatedProjectId(docRef.id);

      // Move to step 2 (image upload)
      setLoading(false);
      setStep(2);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(t('projectCreate.errorCreatingProject'));
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    // Update project with images
    if (createdProjectId && projectImages.length > 0) {
      try {
        const projectRef = doc(db, 'projects', createdProjectId);
        await updateDoc(projectRef, {
          images: projectImages,
          thumbnailUrl: projectImages[0] || '',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error updating project images:', err);
      }
    }

    // Redirect to project page
    router.push(`/projects/${createdProjectId}`);
  };

  const handleSkipImages = () => {
    // Skip image upload and go directly to project
    router.push(`/projects/${createdProjectId}`);
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">{t('projectCreate.loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? t('projectCreate.title') : t('projectCreate.addImagesTitle')}
              </h1>
              <p className="text-gray-600">
                {step === 1
                  ? t('projectCreate.subtitle')
                  : t('projectCreate.imagesSubtitle')}
              </p>

              {/* Step Indicator */}
              <div className="flex items-center mt-4 gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                  {step === 1 ? '1' : '✓'}
                </div>
                <div className={`h-1 w-12 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1: Project Details Form */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Privacy Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('projectCreate.visibility')}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.isPublic
                        ? t('projectCreate.visibilityPublic')
                        : t('projectCreate.visibilityPrivate')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPublic ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectCreate.name')} * <span className="text-xs text-gray-500">({t('projectCreate.maxWords', { count: 10 })})</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('projectCreate.enterProjectName')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('projectCreate.wordsCount', { current: countWords(formData.name), max: 10 })}
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectCreate.description')} * <span className="text-xs text-gray-500">({t('projectCreate.maxWords', { count: 50 })})</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('projectCreate.descriptionPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('projectCreate.wordsCount', { current: countWords(formData.description), max: 50 })}
                </p>
              </div>

              {/* Category of Project */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('projectCreate.categoryOfProject')} *
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'educational' })}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      formData.category === 'educational'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {t('projectCreate.educational')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'performative' })}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      formData.category === 'performative'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {t('projectCreate.performative')}
                  </button>
                </div>
              </div>

              {/* Project Type and Shape - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kind of Project */}
                <div>
                  <label htmlFor="kindOfProject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectCreate.typeOfProject')} *
                  </label>
                  <select
                    id="kindOfProject"
                    name="kindOfProject"
                    required
                    value={formData.kindOfProject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('projectCreate.selectType')}</option>
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shape */}
                <div>
                  <label htmlFor="shape" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectCreate.projectShape')} *
                  </label>
                  <select
                    id="shape"
                    name="shape"
                    required
                    value={formData.shape}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('projectCreate.selectShape')}</option>
                    {projectShapes.map((shape) => (
                      <option key={shape.value} value={shape.value}>
                        {shape.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sharing Type and Size - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type of Sharing */}
                <div>
                  <label htmlFor="typeOfSharing" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectCreate.typeOfSharing')} *
                  </label>
                  <select
                    id="typeOfSharing"
                    name="typeOfSharing"
                    required
                    value={formData.typeOfSharing}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sharingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectCreate.projectSize')} *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {projectSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectCreate.projectColor')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{t('projectCreate.colorHelper')}</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectCreate.tags')} * <span className="text-xs text-gray-500">({t('projectCreate.maxTags', { count: 5 })})</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder={t('projectCreate.tagPlaceholder')}
                    disabled={formData.tags.length >= 5}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={formData.tags.length >= 5 || !tagInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {t('projectCreate.addTag')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.tags.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">{t('projectCreate.tagHelper')}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={handleLocationChange}
                  onVerifiedChange={() => {}} // Not needed for projects
                />
              </div>

              {/* External Links */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectCreate.externalLinks')}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="googleDrive" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.googleDriveLink')}
                    </label>
                    <input
                      id="googleDrive"
                      type="url"
                      value={formData.links.googleDrive}
                      onChange={(e) => handleLinkChange('googleDrive', e.target.value)}
                      placeholder={t('projectCreate.googleDrivePlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.website')}
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={formData.links.website}
                      onChange={(e) => handleLinkChange('website', e.target.value)}
                      placeholder={t('projectCreate.websitePlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="trello" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.trelloBoard')}
                    </label>
                    <input
                      id="trello"
                      type="url"
                      value={formData.links.trello}
                      onChange={(e) => handleLinkChange('trello', e.target.value)}
                      placeholder={t('projectCreate.trelloBoardPlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="moreInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.moreInfo')}
                    </label>
                    <input
                      id="moreInfo"
                      type="url"
                      value={formData.links.moreInfo}
                      onChange={(e) => handleLinkChange('moreInfo', e.target.value)}
                      placeholder={t('projectCreate.moreInfoPlaceholder')}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectCreate.contactPerson')}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.contactName')} *
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      value={formData.contactPerson.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('projectCreate.contactNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('projectCreate.contactEmail')} *
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      required
                      value={formData.contactPerson.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('projectCreate.contactEmailPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('projectCreate.creating') : t('projectCreate.nextAddImages')}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                >
                  {t('projectCreate.cancel')}
                </button>
              </div>
            </form>
            )}

            {/* Step 2: Image Upload */}
            {step === 2 && createdProjectId && (
              <div className="space-y-6">
                <ProjectImageUpload
                  projectId={createdProjectId}
                  currentImages={projectImages}
                  onImagesChange={setProjectImages}
                />

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    {projectImages.length > 0 ? t('projectCreate.finishViewProject') : t('projectCreate.skipViewProject')}
                  </button>
                  {projectImages.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSkipImages}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                    >
                      {t('projectCreate.skipImages')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
