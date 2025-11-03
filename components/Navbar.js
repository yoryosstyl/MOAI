'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-blue-600">MOAI</span>
              <span className="text-gray-400">|</span>
              <img
                src="/facta-non-verba-logo.png"
                alt="Facta Non Verba"
                className="h-10 w-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/projects" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.projects')}
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.news')}
            </Link>
            <Link href="/toolkits" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.toolkits')}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.contact')}
            </Link>

            {user ? (
              <>
                <Link
                  href="/my-projects"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {t('nav.myProjects')}
                </Link>
                <NotificationBell />
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {user.displayName || t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="text-gray-700 hover:text-blue-600 transition flex items-center space-x-1"
              >
                <span>{language === 'en' ? 'English' : 'Ελληνικά'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('el');
                      setLangDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      language === 'el' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Ελληνικά
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/projects"
                className="text-gray-700 hover:text-blue-600 transition py-2"
              >
                {t('nav.projects')}
              </Link>
              <Link
                href="/news"
                className="text-gray-700 hover:text-blue-600 transition py-2"
              >
                {t('nav.news')}
              </Link>
              <Link
                href="/toolkits"
                className="text-gray-700 hover:text-blue-600 transition py-2"
              >
                {t('nav.toolkits')}
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition py-2"
              >
                {t('nav.contact')}
              </Link>

              {user ? (
                <>
                  <Link
                    href="/my-projects"
                    className="text-gray-700 hover:text-blue-600 transition py-2"
                  >
                    {t('nav.myProjects')}
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 transition py-2"
                  >
                    {user.displayName || t('nav.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition text-center"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition py-2"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}

              {/* Language Switcher for Mobile */}
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => changeLanguage(language === 'en' ? 'el' : 'en')}
                  className="w-full text-left text-gray-700 hover:text-blue-600 transition py-2"
                >
                  {language === 'en' ? 'Ελληνικά' : 'English'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
