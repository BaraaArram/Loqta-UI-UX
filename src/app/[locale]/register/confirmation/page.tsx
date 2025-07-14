// Registration Confirmation Page
"use client";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/hooks/useI18n';
import { useParams } from 'next/navigation';

export default function RegistrationConfirmationPage() {
  const { t } = useTranslation('common');
  const { i18n } = useI18n();
  const isRTL = i18n.language === 'ar';
  const params = useParams();
  const locale = params?.locale || i18n.language || 'en';

  return (
    <div className="min-h-screen flex flex-col bg-bodyC">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24">
        <div className="max-w-md w-full rounded-2xl shadow-lg p-10 md:p-12 my-12 md:my-20"
          style={{
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)'
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--color-accent-light)' }}>
              <svg className="h-8 w-8" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v1a4 4 0 01-8 0v-1m8 0V7a4 4 0 00-8 0v5m8 0H8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-heading">{t('registration_confirmation_title', 'Check your email!')}</h2>
            <p className="text-muted mb-2">{t('registration_confirmation_message', 'We have sent you an email with an activation link. Please check your inbox and spam folder to activate your account.')}</p>
            <p className="text-muted mb-4">{t('registration_confirmation_spam', 'Didn\'t receive the email? Please check your spam or junk folder.')}</p>
            <Link href={`/${locale}/login`} className="font-medium text-accent hover:text-accent-dark transition-colors">
              {t('back_to_login', 'Back to Login')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 