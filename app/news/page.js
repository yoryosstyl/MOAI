'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmittedMessage, setShowSubmittedMessage] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'gstylianopoulos@gmail.com' || user?.email === 'factanonverba2002@gmail.com';

  // Check for submission success message
  useEffect(() => {
    if (searchParams.get('submitted') === 'true') {
      setShowSubmittedMessage(true);
      // Clear the URL parameter after a delay
      setTimeout(() => {
        router.replace('/news');
      }, 100);
    }
  }, [searchParams, router]);

  // Fetch all approved news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsRef = collection(db, 'news');
        const q = query(
          newsRef,
          where('status', '==', 'approved'),
          orderBy('publishedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const newsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNews(newsData);
        setFilteredNews(newsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = news.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(news);
    }
  }, [searchQuery, news]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('news.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('news.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Link
                  href="/news/admin/review"
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
                  {t('news.adminReview')}
                </Link>
              )}
              {user && (
                <Link
                  href="/news/create"
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
                  {isAdmin ? t('news.add') : t('news.submit')}
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
                <h3 className="text-sm font-semibold text-green-900 mb-1">{t('news.successTitle')}</h3>
                <p className="text-sm text-green-800">
                  {t('news.successMessage')}
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

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('news.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              {t('news.showing')} {filteredNews.length} {t('news.of')} {news.length} {t('news.newsItems')}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('news.loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNews.length === 0 && (
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('news.noNewsFound')}</h3>
            <p className="text-gray-600 mb-6">
              {news.length === 0
                ? t('news.noNewsYet')
                : t('news.adjustSearch')}
            </p>
          </div>
        )}

        {/* News List */}
        {!loading && filteredNews.length > 0 && (
          <div className="space-y-6">
            {filteredNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group block"
              >
                <div className="md:flex">
                  {/* Image */}
                  {item.imageUrl ? (
                    <div className="md:w-1/3 h-64 md:h-auto">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-white opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 md:flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {item.title}
                      </h2>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

                    {/* Platforms */}
                    {item.platforms && item.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.platforms.map((platform, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(item.publishedAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
