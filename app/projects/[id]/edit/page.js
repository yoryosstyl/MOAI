'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const projectTypes = [
    'Visual Arts', 'Performance', 'Music', 'Dance', 'Theater',
    'Film & Video', 'Writing', 'Digital Arts', 'Installation',
    'Community Project', 'Research', 'Other',
  ];

  const projectShapes = [
    'Workshop', 'Exhibition', 'Performance', 'Residency',
    'Collaboration', 'Commission', 'Open Call', 'Festival', 'Other',
  ];

  const projectSizes = [
    { value: 'small', label: t('projectEdit.small') },
    { value: 'medium', label: t('projectEdit.medium') },
    { value: 'large', label: t('projectEdit.large') },
  ];

  const sharingTypes = [
    { value: 'open', label: t('projectEdit.open') },
    { value: 'collaborative', label: t('projectEdit.collaborative') },
    { value: 'showcase', label: t('projectEdit.showcase') },
  ];

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', params.id));

        if (projectDoc.exists()) {
          const projectData = { id: projectDoc.id, ...projectDoc.data() };
          setProject(projectData);
          setFormData({
            name: projectData.name || '',
            description: projectData.description || '',
            category: projectData.category || 'performative',
            typeOfSharing: projectData.typeOfSharing || 'collaborative',
            shape: projectData.shape || '',
            color: projectData.color || '#3B82F6',
            kindOfProject: projectData.kindOfProject || '',
            tags: projectData.tags || [],
            size: projectData.size || 'medium',
            location: projectData.location || '',
            isPublic: projectData.isPublic !== undefined ? projectData.isPublic : true,
            links: projectData.links || { googleDrive: '', website: '', trello: '', moreInfo: '' },
            contactPerson: projectData.contactPerson || { name: '', email: '' },
          });
          setProjectImages(projectData.images || []);
        } else {
          setError(t('projectEdit.projectNotFound'));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(t('projectEdit.failedToUpdate'));
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  // Check if user is owner
  useEffect(() => {
    if (project && user && project.ownerId !== user.uid) {
      router.push(`/projects/${params.id}`);
    }
  }, [project, user, params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (linkType, value) => {
    setFormData((prev) => ({
      ...prev,
      links: { ...prev.links, [linkType]: value },
    }));
  };

  const handleLocationChange = (address) => {
    setFormData((prev) => ({ ...prev, location: address }));
  };

  const handleContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: { ...prev.contactPerson, [field]: value },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const projectRef = doc(db, 'projects', params.id);
      await updateDoc(projectRef, {
        ...formData,
        images: projectImages,
        thumbnailUrl: projectImages[0] || '',
        updatedAt: serverTimestamp(),
      });

      router.push('/my-projects');
    } catch (err) {
      console.error('Error updating project:', err);
      setError(t('projectEdit.failedToUpdate'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">{t('projectEdit.loadingProject')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!formData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('projectEdit.projectNotFound')}</h1>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800">
              ← {t('projectEdit.backToProjects')}
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
            href={`/projects/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('projectEdit.backToProject')}
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('projectEdit.title')}</h1>
              <p className="text-gray-600">{t('projectEdit.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Privacy Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('projectEdit.visibility')}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.isPublic
                        ? t('projectEdit.visibilityPublic')
                        : t('projectEdit.visibilityPrivate')}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectEdit.projectName')} *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectEdit.description')} *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category of Project */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('projectEdit.categoryOfProject')} *
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
                    {t('projectEdit.educational')}
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
                    {t('projectEdit.performative')}
                  </button>
                </div>
              </div>

              {/* Project Type and Shape */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectEdit.typeOfProject')} *
                  </label>
                  <select
                    name="kindOfProject"
                    required
                    value={formData.kindOfProject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('projectEdit.selectType')}</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectEdit.projectShape')} *
                  </label>
                  <select
                    name="shape"
                    required
                    value={formData.shape}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('projectEdit.selectShape')}</option>
                    {projectShapes.map((shape) => (
                      <option key={shape} value={shape}>{shape}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sharing Type and Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectEdit.typeOfSharing')} *
                  </label>
                  <select
                    name="typeOfSharing"
                    required
                    value={formData.typeOfSharing}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sharingTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectEdit.projectSize')} *
                  </label>
                  <select
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {projectSizes.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectEdit.projectColor')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{t('projectEdit.colorHelper')}</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectEdit.tagsMax')}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder={t('projectEdit.tagPlaceholder')}
                    disabled={formData.tags.length >= 5}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={formData.tags.length >= 5 || !tagInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {t('projectEdit.addTag')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
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
              </div>

              {/* Location */}
              <div>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={handleLocationChange}
                  onVerifiedChange={() => {}} // Not needed for projects
                />
              </div>

              {/* Images */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectEdit.projectImages')}</h3>
                <ProjectImageUpload
                  projectId={params.id}
                  currentImages={projectImages}
                  onImagesChange={setProjectImages}
                />
              </div>

              {/* External Links */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectEdit.externalLinks')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.googleDrive')}</label>
                    <input
                      type="url"
                      value={formData.links.googleDrive}
                      onChange={(e) => handleLinkChange('googleDrive', e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.website')}</label>
                    <input
                      type="url"
                      value={formData.links.website}
                      onChange={(e) => handleLinkChange('website', e.target.value)}
                      placeholder="https://yourproject.com"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.trelloMiro')}</label>
                    <input
                      type="url"
                      value={formData.links.trello}
                      onChange={(e) => handleLinkChange('trello', e.target.value)}
                      placeholder="https://trello.com/... or https://miro.com/..."
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.moreInfo')}</label>
                    <input
                      type="url"
                      value={formData.links.moreInfo}
                      onChange={(e) => handleLinkChange('moreInfo', e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectEdit.contactPerson')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.contactName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">{t('projectEdit.contactEmail')} *</label>
                    <input
                      type="email"
                      required
                      value={formData.contactPerson.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {saving ? t('projectEdit.saving') : t('projectEdit.saveAllChanges')}
                </button>
                <Link
                  href="/my-projects"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium text-center"
                >
                  {t('projectEdit.cancel')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
