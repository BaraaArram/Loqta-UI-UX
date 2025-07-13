// useI18n: Custom hook for accessing and switching i18n language in the app.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

export function useI18n() {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const { t, i18n: i18nInstance } = useTranslation('common');

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsReady(true);
      setCurrentLanguage(i18n.language);
    } else {
      const handleInitialized = () => {
        setIsReady(true);
        setCurrentLanguage(i18n.language);
      };
      
      i18n.on('initialized', handleInitialized);
      
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      console.log('[useI18n] Language changed to:', lng);
      setCurrentLanguage(lng);
      // Persist the language choice
      localStorage.setItem('i18nextLng', lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return {
    t: isReady ? t : (key: string) => key, // Return key as fallback if not ready
    i18n: i18nInstance,
    isReady,
    currentLanguage,
  };
} 