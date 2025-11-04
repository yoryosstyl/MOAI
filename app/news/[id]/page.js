'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.email === 'gstylianopoulos@gmail.com' || user?.email === 'factanonverba2002@gmail.com';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsDoc = await getDoc(doc(db, 'news', params.id));
        if (newsDoc.exists()) {
          setNews({ id: newsDoc.id, ...newsDoc.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(t('newsDetail.deleteConfirm'))) return;

    try {
      await deleteDoc(doc(db, 'news', params.id));
      router.push('/news');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert(t('newsDetail.deleteFailed'));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">{t('newsDetail.loading')}</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('newsDetail.notFound')}</h1>
          <Link href="/news" className="text-blue-600 hover:text-blue-800">
            ← {t('newsDetail.backToNews')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/news"
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
          {t('newsDetail.backToNews')}
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Featured Image */}
          {news.imageUrl ? (
            <div className="w-full h-96">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-white opacity-50"
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
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
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
                  {formatDate(news.publishedAt)}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Link
                      href={`/news/${news.id}/edit`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      {t('newsDetail.edit')}
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                    >
                      {t('newsDetail.delete')}
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
              <p className="text-xl text-gray-600">{news.description}</p>
            </div>

            {/* Platforms */}
            {news.platforms && news.platforms.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {t('newsDetail.relevantPlatformsUpper')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {news.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {news.content}
              </div>
            </div>

            {/* External Link */}
            {news.externalLink && (
              <div className="pt-8 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('newsDetail.readMore')}</h2>
                <a
                  href={news.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  {news.externalLink}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-8 border-t mt-8">
              <div className="text-sm text-gray-500">
                <p>
                  {t('newsDetail.submittedBy')} {news.submitterName || t('newsDetail.unknown')}
                  {news.createdAt && (
                    <span> {t('newsDetail.on')} {formatDate(news.createdAt)}</span>
                  )}
                </p>
                {news.updatedAt && news.updatedAt !== news.createdAt && (
                  <p className="mt-1">
                    {t('newsDetail.lastUpdated')} {formatDate(news.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
