'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', params.id));

        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        } else {
          console.error('Project not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'projects', params.id));
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/projects" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.uid === project.ownerId;
  const isPublic = project.isPublic !== false; // default to public if not set

  // If project is private and user is not the owner, show not found
  if (!isPublic && !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-4">This project is private or does not exist.</p>
          <Link href="/projects" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Projects
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Color Strip */}
          <div className="h-4" style={{ backgroundColor: project.color || '#3B82F6' }} />

          {/* Project Header */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded">
                    {project.kindOfProject || 'Project'}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded">
                    {project.shape}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded capitalize">
                    {project.typeOfSharing}
                  </span>
                  {/* Show visibility status */}
                  {isOwner && (
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      isPublic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isPublic ? '👁️ Public' : '🔒 Private'}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>

                <div className="flex flex-wrap gap-4 text-gray-600">
                  {project.location && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {project.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {project.size === 'small' && '1-5 people'}
                    {project.size === 'medium' && '5-15 people'}
                    {project.size === 'large' && '15+ people'}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    Posted by {project.ownerName || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Project</h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Images */}
            {project.images && project.images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project.name} - Image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {(project.links?.googleDrive ||
              project.links?.website ||
              project.links?.trello ||
              project.links?.moreInfo) && (
              <div className="mb-8 pb-8 border-b">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">External Resources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.links.googleDrive && (
                    <a
                      href={project.links.googleDrive}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <svg
                        className="w-6 h-6 mr-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0L1.75 6L0 17.25L10.25 24L22 18V6L12 0M12 2.5L20.5 6.5V17.5L12 21.5L3.5 17.5V6.5L12 2.5Z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Google Drive</p>
                        <p className="text-sm text-gray-500">Project files</p>
                      </div>
                    </a>
                  )}

                  {project.links.website && (
                    <a
                      href={project.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <svg
                        className="w-6 h-6 mr-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Website</p>
                        <p className="text-sm text-gray-500">Project website</p>
                      </div>
                    </a>
                  )}

                  {project.links.trello && (
                    <a
                      href={project.links.trello}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <svg
                        className="w-6 h-6 mr-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Trello/Miro Board</p>
                        <p className="text-sm text-gray-500">Project planning</p>
                      </div>
                    </a>
                  )}

                  {project.links.moreInfo && (
                    <a
                      href={project.links.moreInfo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <svg
                        className="w-6 h-6 mr-3 text-blue-600"
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
                        <p className="font-medium text-gray-900">More Information</p>
                        <p className="text-sm text-gray-500">Additional details</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contact Person */}
            {project.contactPerson && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-gray-900">
                        {project.contactPerson.name}
                      </p>
                      {project.contactPerson.email && (
                        <a
                          href={`mailto:${project.contactPerson.email}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center mt-2"
                        >
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {project.contactPerson.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
