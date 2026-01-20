'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

// Simple cache to avoid re-translating the same content
const translationCache = new Map();

// Helper to detect if text contains Greek characters
function containsGreek(text) {
  if (!text || typeof text !== 'string') return false;
  // Greek Unicode range: \u0370-\u03FF (Greek and Coptic) and \u1F00-\u1FFF (Greek Extended)
  return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
}

// Generate cache key
function getCacheKey(text, targetLang) {
  return `${targetLang}:${text}`;
}

export function useContentTranslation() {
  const { language } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  // Translate a single text field
  const translateText = useCallback(async (text) => {
    // If Greek is selected, always show original content
    if (language === 'el') {
      return text;
    }

    // If English is selected and text contains Greek, translate it
    if (language === 'en' && containsGreek(text)) {
      const cacheKey = getCacheKey(text, 'en');

      // Check cache first
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
      }

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: 'en' })
        });

        if (!response.ok) {
          console.error('Translation API error:', response.status);
          return text;
        }

        const data = await response.json();
        const { translatedText } = data;

        // Cache the result
        translationCache.set(cacheKey, translatedText);

        return translatedText;
      } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original on error
      }
    }

    // If English is selected but text is not Greek, return as-is
    return text;
  }, [language]);

  // Translate multiple fields of an object
  const translateContent = useCallback(async (item, fieldsToTranslate = ['title', 'description', 'content']) => {
    if (!item) return item;

    // If Greek is selected, return original
    if (language === 'el') {
      return item;
    }

    const translatedItem = { ...item };

    for (const field of fieldsToTranslate) {
      if (item[field] && typeof item[field] === 'string') {
        translatedItem[field] = await translateText(item[field]);
      }
    }

    return translatedItem;
  }, [language, translateText]);

  // Translate an array of items
  const translateItems = useCallback(async (items, fieldsToTranslate = ['title', 'description', 'content']) => {
    if (!items || !Array.isArray(items)) return items;

    // If Greek is selected, return original
    if (language === 'el') {
      return items;
    }

    setIsTranslating(true);

    try {
      const translatedItems = await Promise.all(
        items.map(item => translateContent(item, fieldsToTranslate))
      );
      return translatedItems;
    } finally {
      setIsTranslating(false);
    }
  }, [language, translateContent]);

  return {
    translateText,
    translateContent,
    translateItems,
    isTranslating,
    currentLanguage: language,
    shouldTranslate: language === 'en'
  };
}
