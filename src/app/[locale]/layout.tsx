// LocaleLayout: Provides locale-aware layout, Redux, i18n, and theme hydration for all pages.
"use client";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Footer from '@/components/Footer';
import { Provider } from 'react-redux';
import store from '@/store';
import ClientLayout from '../ClientLayout';
import { usePathname } from 'next/navigation';
import '@/lib/i18n';
import { useEffect, useState } from 'react';
import I18nProvider from '@/components/I18nProvider';
import { hydrateTheme } from '@/features/theme/themeSlice';
import { useDispatch } from 'react-redux';

function ThemeHydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateTheme());
  }, [dispatch]);
  return null;
}

const inter = Inter({ subsets: ["latin"] });

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isRTL = locale === 'ar';

  useEffect(() => {
    setMounted(true);
    console.log('Locale param in [locale]/layout.tsx:', locale);
    
    // Set the document direction based on locale
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale, isRTL]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <I18nProvider locale={locale}>
        <ClientLayout>
          <ThemeHydrator />
          {children}
          {/* Only show Footer if not on documentation page */}
          {!pathname.startsWith('/documentation') && <Footer />}
        </ClientLayout>
      </I18nProvider>
    </Provider>
  );
} 