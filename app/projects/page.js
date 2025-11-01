'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [projectOwners, setProjectOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchTags, setSearchTags] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProjects(projectsData);

        // Fetch owner info for each project
        const owners = {};
        for (const project of projectsData) {
          if (project.ownerId && !owners[project.ownerId]) {
            try {
              const ownerDoc = await getDoc(doc(db, 'users', project.ownerId));
              if (ownerDoc.exists()) {
                owners[project.ownerId] = { uid: ownerDoc.id, ...ownerDoc.data() };
              }
            } catch (err) {
              console.error(`Error fetching owner ${project.ownerId}:`, err);
            }
          }
        }
        setProjectOwners(owners);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProfileClick = (ownerId, projectId, e) => {
    e.stopPropagation();
    // Store the current project ID for back navigation
    sessionStorage.setItem('returnToProject', projectId);
    router.push(`/profile?uid=${ownerId}`);
  };

  const handleProjectClick = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    const matchesTitle = !searchTitle ||
      project.name?.toLowerCase().includes(searchTitle.toLowerCase());

    const matchesTags = !searchTags ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchTags.toLowerCase()));

    const matchesLocation = !searchLocation ||
      project.location?.toLowerCase().includes(searchLocation.toLowerCase());

    return matchesTitle && matchesTags && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Projects</h1>
          <p className="text-lg text-gray-600">
            Browse and discover creative projects from artists around the world
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by tags..."
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setSearchTitle('');
                setSearchTags('');
                setSearchLocation('');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        )}

        {/* No projects state */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {projects.length === 0 ? 'No projects yet. Be the first to create one!' : 'No projects match your search.'}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const owner = projectOwners[project.ownerId];

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gray-200">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}

                    {/* Author profile image - top right corner */}
                    {owner && (
                      <button
                        onClick={(e) => handleProfileClick(project.ownerId, project.id, e)}
                        className="absolute top-3 right-3 group"
                        title={`View ${owner.displayName}'s profile`}
                      >
                        {owner.avatarUrl ? (
                          <img
                            src={owner.avatarUrl}
                            alt={owner.displayName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:border-blue-500 transition-all group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-semibold hover:border-blue-500 transition-all group-hover:scale-110">
                            {owner.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {project.name || 'Untitled Project'}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details →
                      </span>
                      {owner && (
                        <span className="text-sm text-gray-500">
                          by {owner.displayName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Project Button (fixed bottom right) */}
        <Link
          href="/projects/create"
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
