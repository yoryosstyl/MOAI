'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('moai-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'el')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`@/locales/${language}.json`);
        setTranslations(translations.default);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('@/locales/en.json');
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'en' || newLanguage === 'el') {
      setLanguage(newLanguage);
      localStorage.setItem('moai-language', newLanguage);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
