'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import FavoriteButton from '@/components/FavoriteButton';
import RatingDisplay from '@/components/RatingDisplay';
import { getToolkitFavoriteCount } from '@/utils/favorites';
import { getToolkitAverageRating } from '@/utils/reviews';

export default function ToolkitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [toolkits, setToolkits] = useState([]);
  const [filteredToolkits, setFilteredToolkits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: '',
    type: '',
    skillLevel: '',
  });
  const [showSubmittedMessage, setShowSubmittedMessage] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'gstylianopoulos@gmail.com' || user?.email === 'factanonverba2002@gmail.com';

  // Check for submission success message
  useEffect(() => {
    if (searchParams.get('submitted') === 'true') {
      setShowSubmittedMessage(true);
      // Clear the URL parameter after a delay
      setTimeout(() => {
        router.replace('/toolkits');
      }, 100);
    }
  }, [searchParams, router]);

  // Fetch all approved toolkits
  useEffect(() => {
    const fetchToolkits = async () => {
      try {
        const toolkitsRef = collection(db, 'toolkits');
        const q = query(
          toolkitsRef,
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const toolkitsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch favorites and ratings for each toolkit
        const toolkitsWithStats = await Promise.all(
          toolkitsData.map(async (toolkit) => {
            const [favoriteCount, ratingData] = await Promise.all([
              getToolkitFavoriteCount(toolkit.id),
              getToolkitAverageRating(toolkit.id),
            ]);

            return {
              ...toolkit,
              favoriteCount,
              averageRating: ratingData.average,
              reviewCount: ratingData.count,
            };
          })
        );

        setToolkits(toolkitsWithStats);
        setFilteredToolkits(toolkitsWithStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching toolkits:', error);
        setLoading(false);
      }
    };

    fetchToolkits();
  }, []);

  // Filter toolkits based on search criteria
  useEffect(() => {
    let filtered = toolkits;

    if (searchFilters.search) {
      filtered = filtered.filter(
        (toolkit) =>
          toolkit.name.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
          toolkit.description?.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
          toolkit.tags?.some((tag) =>
            tag.toLowerCase().includes(searchFilters.search.toLowerCase())
          )
      );
    }

    if (searchFilters.category) {
      filtered = filtered.filter((toolkit) => toolkit.category === searchFilters.category);
    }

    if (searchFilters.type) {
      filtered = filtered.filter((toolkit) => toolkit.type === searchFilters.type);
    }

    if (searchFilters.skillLevel) {
      filtered = filtered.filter((toolkit) => toolkit.skillLevel === searchFilters.skillLevel);
    }

    setFilteredToolkits(filtered);
  }, [searchFilters, toolkits]);

  const handleFilterChange = (filterName, value) => {
    setSearchFilters((prev) => ({ ...prev, [filterName]: value }));
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolkits.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('toolkits.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Link
                  href="/toolkits/admin/review"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('toolkits.adminReview')}
                </Link>
              )}
              {user && (
                <Link
                  href="/toolkits/create"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {isAdmin ? t('toolkits.add') : t('toolkits.submit')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Submission Success Message */}
        {showSubmittedMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-600 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-1">{t('toolkits.successTitle')}</h3>
                <p className="text-sm text-green-800">
                  {t('toolkits.successMessage')}
                </p>
              </div>
              <button
                onClick={() => setShowSubmittedMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolkits.searchLabel')}</label>
              <input
                type="text"
                placeholder={t('toolkits.search')}
                value={searchFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolkits.categoryLabel')}</label>
              <select
                value={searchFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('toolkits.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolkits.typeLabel')}</label>
              <select
                value={searchFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('toolkits.allTypes')}</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolkits.skillLevelLabel')}</label>
              <select
                value={searchFilters.skillLevel}
                onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('toolkits.allLevels')}</option>
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Count */}
          {(searchFilters.search || searchFilters.category || searchFilters.type || searchFilters.skillLevel) && (
            <div className="mt-4 text-sm text-gray-600">
              {t('toolkits.showing')} {filteredToolkits.length} {t('toolkits.of')} {toolkits.length} {t('toolkits.toolkitsCount')}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('toolkits.loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredToolkits.length === 0 && (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('toolkits.noToolkitsFound')}</h3>
            <p className="text-gray-600 mb-6">
              {toolkits.length === 0
                ? t('toolkits.noToolkitsYet')
                : t('toolkits.adjustFilters')}
            </p>
          </div>
        )}

        {/* Toolkits Grid */}
        {!loading && filteredToolkits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredToolkits.map((toolkit) => (
              <Link
                key={toolkit.id}
                href={`/toolkits/${toolkit.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
              >
                {/* Logo/Icon */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {toolkit.logoUrl ? (
                    <img
                      src={toolkit.logoUrl}
                      alt={toolkit.name}
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="text-white text-6xl font-bold">
                      {toolkit.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {toolkit.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        toolkit.type === 'Free'
                          ? 'bg-green-100 text-green-800'
                          : toolkit.type === 'Open Source'
                          ? 'bg-blue-100 text-blue-800'
                          : toolkit.type === 'Freemium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {toolkit.type}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{toolkit.description}</p>

                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{toolkit.category}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{toolkit.skillLevel}</span>
                  </div>

                  {/* Tags */}
                  {toolkit.tags && toolkit.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {toolkit.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {toolkit.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{toolkit.tags.length - 3} {t('toolkits.more')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4"></div>
                  )}

                  {/* Stats: Favorites and Rating */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <FavoriteButton
                        toolkitId={toolkit.id}
                        showCount={true}
                        favoriteCount={toolkit.favoriteCount || 0}
                      />
                    </div>
                    <div className="flex-1">
                      <RatingDisplay
                        rating={toolkit.averageRating || 0}
                        count={toolkit.reviewCount || 0}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* EU Funding Section */}
        <div className="mt-16 pb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center gap-6 flex-wrap">
            {/* Black logo for light mode (visible on white background) */}
            <img
              src="/eu_black_logo.png"
              alt="European Union Logo"
              className="h-16 w-auto object-contain dark:hidden"
            />
            {/* White logo for dark mode (visible on dark background) */}
            <img
              src="/eu_white_logo.png"
              alt="European Union Logo"
              className="h-16 w-auto object-contain hidden dark:block"
            />
            <p className="text-gray-600 text-sm text-center max-w-md">
              {t('landing.euFunding.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
