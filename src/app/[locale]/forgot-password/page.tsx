// ForgotPasswordPage: Handles password reset requests for users who forgot their password.
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const params = useParams();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { t } = useTranslation('common');

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return t('email_required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t('valid_email_required');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }
    setError(null);
    setValidationError(null);
    setLoading(true);
    try {
      await api.post('/auth/reset-password/', { email });
      setIsSubmitted(true);
      Swal.fire({
        icon: 'success',
        title: t('email_sent'),
        text: t('check_your_email_for_reset_link'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#3085d6',
      });
    } catch (error: any) {
      const errorMessage = error?.message || t('failed_to_send_reset_email');
      setError(errorMessage);
      
      // Show error alert
      Swal.fire({
        title: t('error'),
        text: errorMessage,
        icon: 'error',
        confirmButtonText: t('ok'),
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-bodyC">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="max-w-md w-full rounded-2xl shadow-lg p-10 md:p-12 my-12 md:my-20 bg-card text-heading border border-border">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('check_email_title')}</h2>
            <p className="text-muted mb-4">{t('check_email_message', { email })}</p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full px-4 py-2 text-base font-semibold text-heading bg-bg-secondary border border-border rounded hover:bg-accent/10 transition"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16" /></svg>
                {t('try_again_with_different_email')}
              </span>
            </button>
            <Link
              href={`/${params?.locale || ''}/login`}
              className="inline-flex items-center gap-2 font-bold text-accent hover:underline text-base transition mt-3"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                {t('back_to_login')}
              </span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bodyC">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24">
        <div className="max-w-md w-full rounded-2xl shadow-lg p-10 md:p-12 my-12 md:my-20 bg-card text-heading border border-border">
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">{t('forgot_password_title')}</h2>
            <p className="text-muted">{t('forgot_password_subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                {t('email_address')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className={`block w-full px-4 py-3 border rounded text-heading focus:outline-none focus:ring-2 focus:ring-accent text-base ${validationError ? 'border-error' : 'border-border'}`}
                placeholder={t('enter_email')}
              />
              {validationError && (
                <p className="mt-1 text-sm text-error">{validationError}</p>
              )}
            </div>
            {error && <div className="p-2 bg-error/10 border border-error/30 rounded text-error text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-base font-semibold text-white bg-accent rounded hover:bg-accent/90 transition disabled:opacity-60"
            >
              {loading ? t('sending') : t('send_reset_link')}
            </button>
            <div className="text-center mt-4 flex flex-col gap-3 items-center">
              <Link href={`/${params?.locale || ''}/login`} className="inline-flex items-center gap-2 font-bold text-accent hover:underline text-base transition">
                <span className="inline-flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                  {t('back_to_login')}
                </span>
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage; 