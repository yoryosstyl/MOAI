'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTranslation } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Fetch project
        const projectDoc = await getDoc(doc(db, 'projects', params.id));

        if (!projectDoc.exists()) {
          setError(t('projectDetail.projectNotFound'));
          setLoading(false);
          return;
        }

        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        setProject(projectData);

        // Fetch owner profile
        if (projectData.ownerId) {
          const ownerDoc = await getDoc(doc(db, 'users', projectData.ownerId));
          if (ownerDoc.exists()) {
            setOwner({ uid: ownerDoc.id, ...ownerDoc.data() });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(t('projectDetail.failedToLoadProject'));
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleProfileClick = () => {
    if (owner) {
      // Store current project ID in session storage for back navigation
      sessionStorage.setItem('returnToProject', params.id);
      router.push(`/profile?uid=${owner.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('projectDetail.loadingProject')}</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || t('projectDetail.projectNotFound')}</p>
          <Link href="/projects" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← {t('projectDetail.backToProjects')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('projectDetail.backToProjects')}
        </Link>

        {/* Main project content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Project image */}
          {project.thumbnailUrl && (
            <div className="w-full h-96 bg-gray-200">
              <img
                src={project.thumbnailUrl}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Project details */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>

            <p className="text-lg text-gray-700 mb-6">{project.description}</p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Project metadata */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {project.typeOfSharing && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('projectDetail.typeOfSharing')}</h3>
                  <p className="text-gray-900">{project.typeOfSharing}</p>
                </div>
              )}
              {project.kindOfProject && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('projectDetail.kindOfProject')}</h3>
                  <p className="text-gray-900">{project.kindOfProject}</p>
                </div>
              )}
              {project.size && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('projectDetail.size')}</h3>
                  <p className="text-gray-900">{project.size}</p>
                </div>
              )}
              {project.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('projectDetail.location')}</h3>
                  <p className="text-gray-900">{project.location}</p>
                </div>
              )}
            </div>

            {/* External links */}
            {project.links && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('projectDetail.links')}</h3>
                <div className="space-y-2">
                  {project.links.website && (
                    <a
                      href={project.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      🌐 {t('projectDetail.website')}
                    </a>
                  )}
                  {project.links.googleDrive && (
                    <a
                      href={project.links.googleDrive}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      📁 {t('projectDetail.googleDrive')}
                    </a>
                  )}
                  {project.links.trello && (
                    <a
                      href={project.links.trello}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      📋 {t('projectDetail.trelloMiro')}
                    </a>
                  )}
                  {project.links.moreInfo && (
                    <a
                      href={project.links.moreInfo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      ℹ️ {t('projectDetail.moreInfo')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Author/Owner info - clickable profile image at bottom left */}
            {owner && (
              <div className="border-t pt-6 mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('projectDetail.createdBy')}</h3>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                >
                  <div className="relative">
                    {owner.avatarUrl ? (
                      <img
                        src={owner.avatarUrl}
                        alt={owner.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all">
                        {owner.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {owner.displayName}
                    </p>
                    {owner.bio && (
                      <p className="text-sm text-gray-500 line-clamp-1">{owner.bio}</p>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
