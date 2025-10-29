'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    title: '',
    tags: '',
    location: '',
  });

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const allProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter projects based on visibility
        // Show: all public projects + user's own private projects
        const visibleProjects = allProjects.filter((project) => {
          const isPublic = project.isPublic !== false; // default to public if not set
          const isOwner = user && project.ownerId === user.uid;
          return isPublic || isOwner;
        });

        setProjects(visibleProjects);
        setFilteredProjects(visibleProjects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Filter projects based on search criteria
  useEffect(() => {
    let filtered = projects;

    if (searchFilters.title) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(searchFilters.title.toLowerCase())
      );
    }

    if (searchFilters.tags) {
      filtered = filtered.filter((project) =>
        project.tags?.some((tag) =>
          tag.toLowerCase().includes(searchFilters.tags.toLowerCase())
        )
      );
    }

    if (searchFilters.location) {
      filtered = filtered.filter((project) =>
        project.location?.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [searchFilters, projects]);

  const handleSearchChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      title: '',
      tags: '',
      location: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-lg text-gray-600">
                Browse and discover creative collaboration opportunities
              </p>
            </div>
            {user && (
              <Link
                href="/projects/create"
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Create Project
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchFilters.title}
              onChange={(e) => handleSearchChange('title', e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by tags..."
              value={searchFilters.tags}
              onChange={(e) => handleSearchChange('tags', e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by location..."
              value={searchFilters.location}
              onChange={(e) => handleSearchChange('location', e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
          {(searchFilters.title || searchFilters.tags || searchFilters.location) && (
            <p className="text-sm text-gray-600 mt-3">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading projects...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchFilters.title || searchFilters.tags || searchFilters.location
                ? 'No projects found'
                : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchFilters.title || searchFilters.tags || searchFilters.location
                ? 'Try adjusting your search filters'
                : user
                ? 'Be the first to create a project!'
                : 'Sign in to create and share projects'}
            </p>
            {user && (
              <Link
                href="/projects/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
              >
                Create First Project
              </Link>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                {/* Project Color Strip */}
                <div
                  className="h-2"
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                />

                {/* Project Thumbnail */}
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {project.thumbnailUrl || project.images?.[0] ? (
                    <img
                      src={project.thumbnailUrl || project.images[0]}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg
                        className="w-12 h-12 mx-auto mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Project Type Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {project.kindOfProject || 'Project'}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {project.name}
                  </h3>

                  {/* Project Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
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

                  {/* Project Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
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
                      <span>{project.location || 'Remote'}</span>
                    </div>
                    <span className="text-blue-600 font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Add Button (Mobile) */}
        {user && (
          <Link
            href="/projects/create"
            className="fixed bottom-8 right-8 md:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
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
        )}
      </div>
    </div>
  );
}
