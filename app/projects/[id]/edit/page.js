'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
            typeOfSharing: projectData.typeOfSharing || 'collaborative',
            shape: projectData.shape || '',
            color: projectData.color || '#3B82F6',
            kindOfProject: projectData.kindOfProject || '',
            tags: projectData.tags || [],
            size: projectData.size || 'medium',
            location: projectData.location || '',
            links: projectData.links || { googleDrive: '', website: '', trello: '', moreInfo: '' },
            contactPerson: projectData.contactPerson || { name: '', email: '' },
          });
          setProjectImages(projectData.images || []);
        } else {
          setError('Project not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
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

  const handleSave = async () => {
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

      router.push(`/projects/${params.id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">Loading project...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!formData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800">
              ← Back to Projects
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
          {/* Back Button */}
          <Link
            href={`/projects/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Project</h1>
              <p className="text-gray-600">Update your project information and images</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* Quick Edit: Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Edit: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = formData.tags.filter((_, i) => i !== index);
                          setFormData({ ...formData, tags: newTags });
                        }}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Images */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Images</h3>
                <ProjectImageUpload
                  projectId={params.id}
                  currentImages={projectImages}
                  onImagesChange={setProjectImages}
                />
              </div>

              {/* External Links */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">External Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Google Drive</label>
                    <input
                      type="url"
                      value={formData.links.googleDrive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          links: { ...formData.links, googleDrive: e.target.value },
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.links.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          links: { ...formData.links, website: e.target.value },
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href={`/projects/${params.id}`}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
