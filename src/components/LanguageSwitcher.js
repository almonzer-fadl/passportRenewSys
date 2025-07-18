'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { locale, toggleLanguage } = useLanguage();
  const [isToggling, setIsToggling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-20 h-8 bg-base-300 animate-pulse rounded"></div>
    );
  }

  const handleToggle = async () => {
    setIsToggling(true);
    toggleLanguage();
    
    // Small delay for visual feedback
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
        ${isToggling 
          ? 'opacity-50 cursor-not-allowed' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95'
        }
      `}
      aria-label={`Switch to ${locale === 'en' ? 'Arabic' : 'English'}`}
    >
      <span className="flex items-center space-x-2 rtl:space-x-reverse">
        <span className="text-lg">
          {locale === 'en' ? '🇸🇩' : '🇺🇸'}
        </span>
        <span className={`transition-opacity ${isToggling ? 'opacity-50' : ''}`}>
          {locale === 'en' ? 'العربية' : 'English'}
        </span>
      </span>
    </button>
  );
} 