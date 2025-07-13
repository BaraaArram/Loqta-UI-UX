// I18nProvider component: Provides i18n context and language switching for the app.
"use client";
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export default function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      console.log('[I18nProvider] Changing language from', i18n.language, 'to', locale);
      i18n.changeLanguage(locale);
    }
    
    // Wait for i18n to be ready
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      i18n.on('initialized', () => {
        setIsReady(true);
      });
    }
  }, [locale]);

  // Prevent language detector from overriding manual changes
  useEffect(() => {
    if (locale) {
      // Store the locale in localStorage to prevent detection override
      localStorage.setItem('i18nextLng', locale);
      
      // Disable language detection temporarily
      const originalDetector = i18n.services.languageDetector;
      if (originalDetector) {
        originalDetector.detect = () => locale;
      }
    }
  }, [locale]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 