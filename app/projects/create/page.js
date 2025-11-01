'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    'Visual Arts',
    'Performance',
    'Music',
    'Dance',
    'Theater',
    'Film & Video',
    'Writing',
    'Digital Arts',
    'Installation',
    'Community Project',
    'Research',
    'Other',
  ];

  const projectShapes = [
    'Workshop',
    'Exhibition',
    'Performance',
    'Residency',
    'Collaboration',
    'Commission',
    'Open Call',
    'Festival',
    'Other',
  ];

  const projectSizes = [
    { value: 'small', label: 'Small (1-5 people)' },
    { value: 'medium', label: 'Medium (5-15 people)' },
    { value: 'large', label: 'Large (15+ people)' },
  ];

  const sharingTypes = [
    { value: 'open', label: 'Open - Anyone can join' },
    { value: 'collaborative', label: 'Collaborative - By invitation' },
    { value: 'showcase', label: 'Showcase - Display only' },
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
      setError('Project name must be maximum 10 words');
      setLoading(false);
      return;
    }

    if (countWords(formData.description) > 50) {
      setError('Description must be maximum 50 words');
      setLoading(false);
      return;
    }

    if (formData.tags.length === 0) {
      setError('Please add at least one tag');
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
      setError('Failed to create project. Please try again.');
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
          <div className="text-gray-600">Loading...</div>
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
                {step === 1 ? 'Create New Project' : 'Add Project Images'}
              </h1>
              <p className="text-gray-600">
                {step === 1
                  ? 'Share your artistic collaboration opportunity with the community'
                  : 'Upload images to showcase your project (optional)'}
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
                    <h3 className="text-lg font-semibold text-gray-900">Project Visibility</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.isPublic
                        ? 'Public - Everyone can see this project'
                        : 'Private - Only you can see this project'}
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
                  Project Name * <span className="text-xs text-gray-500">(max 10 words)</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your project name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {countWords(formData.name)}/10 words
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description * <span className="text-xs text-gray-500">(max 50 words)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your project and what kind of collaboration you're looking for..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {countWords(formData.description)}/50 words
                </p>
              </div>

              {/* Project Type and Shape - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kind of Project */}
                <div>
                  <label htmlFor="kindOfProject" className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Project *
                  </label>
                  <select
                    id="kindOfProject"
                    name="kindOfProject"
                    required
                    value={formData.kindOfProject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type...</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shape */}
                <div>
                  <label htmlFor="shape" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Shape *
                  </label>
                  <select
                    id="shape"
                    name="shape"
                    required
                    value={formData.shape}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select shape...</option>
                    {projectShapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
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
                    Type of Sharing *
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
                    Project Size *
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
                  Project Color
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
                  <span className="text-sm text-gray-600">Choose a color that represents your project</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags * <span className="text-xs text-gray-500">(max 5)</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Type a tag and press Enter"
                    disabled={formData.tags.length >= 5}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={formData.tags.length >= 5 || !tagInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
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
                  <p className="text-xs text-gray-500 mt-2">Add at least one tag to help others find your project</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">External Links</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="googleDrive" className="block text-sm font-medium text-gray-700 mb-2">
                      Google Drive Link
                    </label>
                    <input
                      id="googleDrive"
                      type="url"
                      value={formData.links.googleDrive}
                      onChange={(e) => handleLinkChange('googleDrive', e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={formData.links.website}
                      onChange={(e) => handleLinkChange('website', e.target.value)}
                      placeholder="https://yourproject.com"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="trello" className="block text-sm font-medium text-gray-700 mb-2">
                      Trello/Miro Board
                    </label>
                    <input
                      id="trello"
                      type="url"
                      value={formData.links.trello}
                      onChange={(e) => handleLinkChange('trello', e.target.value)}
                      placeholder="https://trello.com/... or https://miro.com/..."
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="moreInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      More Information
                    </label>
                    <input
                      id="moreInfo"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      value={formData.contactPerson.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      required
                      value={formData.contactPerson.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@email.com"
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
                  {loading ? 'Creating...' : 'Next: Add Images'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                >
                  Cancel
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
                    {projectImages.length > 0 ? 'Finish & View Project' : 'Skip & View Project'}
                  </button>
                  {projectImages.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSkipImages}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                    >
                      Skip Images
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
