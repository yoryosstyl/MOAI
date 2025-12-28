'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t('landing.hero.title')}
            </h1>
            <div className="text-xl text-gray-600 max-w-4xl whitespace-pre-line">
              {t('landing.hero.subtitle')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Projects Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {t('landing.features.projects.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('landing.features.projects.description')}
            </p>
            <Link href="/projects" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              {t('landing.features.projects.button')}
            </Link>
          </div>

          {/* Toolkits Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {t('landing.features.toolkits.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('landing.features.toolkits.description')}
            </p>
            <Link href="/toolkits" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              {t('landing.features.toolkits.button')}
            </Link>
          </div>

          {/* Community Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {t('landing.features.community.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('landing.features.community.description')}
            </p>
            <Link href="/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              {t('landing.features.community.button')}
            </Link>
          </div>
        </div>

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
  )
}
