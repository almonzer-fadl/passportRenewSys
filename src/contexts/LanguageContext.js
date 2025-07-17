'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translation files
import enTranslations from '../../messages/en.json';
import arTranslations from '../../messages/ar.json';

const translations = {
  en: enTranslations,
  ar: arTranslations
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [direction, setDirection] = useState('ltr');

  // Update document direction and language when locale changes
  useEffect(() => {
    const newDirection = locale === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    if (typeof window !== 'undefined') {
      document.documentElement.dir = newDirection;
      document.documentElement.lang = locale;
      
      // Save preference to localStorage
      localStorage.setItem('preferred-language', locale);
    }
  }, [locale]);

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage && ['en', 'ar'].includes(savedLanguage)) {
        setLocale(savedLanguage);
      }
    }
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const toggleLanguage = () => {
    setLocale(prev => prev === 'en' ? 'ar' : 'en');
  };

  const value = {
    locale,
    direction,
    t,
    toggleLanguage,
    setLocale
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 