// LoginPage: Handles user authentication and login for the selected locale.
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { login, clearError } from '@/features/auth/authSlice';
import { RootState } from '@/store';
import { getErrorMessage, isValidationError, getValidationErrors } from '@/utils/errorHandler';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const loading = useSelector((state: RootState) => state.auth?.loading ?? false);
  const error = useSelector((state: RootState) => state.auth?.error ?? null);
  const hydrated = useSelector((state: RootState) => state.auth?.hydrated);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation('common');
  const params = useParams();
  const locale = params?.locale || 'en';

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace('/profile');
  }, [hydrated, isAuthenticated, router]);

  if (hydrated !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodyC">
        <div className="text-accentC text-xl font-bold animate-pulse">{t('checking_auth')}</div>
      </div>
    );
  }
  if (hydrated && isAuthenticated) {
    // Prevent flicker if user is already authenticated
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = t('email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('valid_email_required');
    if (!formData.password) errors.password = t('password_required');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(clearError());
    setValidationErrors({});
    try {
      await dispatch(login({ email: formData.email, password: formData.password }) as any).unwrap();
      router.push('/profile');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      if (isValidationError(error)) {
        const fieldErrors = getValidationErrors(error);
        const newValidationErrors: Record<string, string> = {};
        fieldErrors.forEach(({ field, message }) => { newValidationErrors[field] = message; });
        setValidationErrors(newValidationErrors);
      } else {
        alert(t('login_failed') + ': ' + errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bodyC">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24">
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8"
          style={{
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--color-accent-light)' }}>
              <svg className="h-8 w-8" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-heading">{t('welcome_back')}</h2>
            <p className="text-muted">{t('sign_in_to_continue')}</p>
            <p className="mt-2 text-sm text-muted">
              {t('no_account')}{' '}
              <Link href={`/${locale}/register`} className="font-medium text-accent hover:text-accent-dark transition-colors">{t('create_one_here')}</Link>
            </p>
          </div>
          {error && (
            <div className="mb-4 p-4 rounded-md text-status-error text-center"
              style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              {getErrorMessage(error)}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-heading">{t('email_address')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.email ? 'border-status-error' : ''}`}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text)',
                    borderColor: validationErrors.email ? 'var(--color-error)' : 'var(--color-border)'
                  }}
                  placeholder={t('enter_email')}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-status-error">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-heading">{t('password')}</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.password ? 'border-status-error' : ''}`}
                    style={{
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text)',
                      borderColor: validationErrors.password ? 'var(--color-error)' : 'var(--color-border)'
                    }}
                    placeholder={t('enter_password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-muted" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-muted" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-status-error">{validationErrors.password}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-button-text bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('signing_in') : t('sign_in')}
            </button>
            <div className="text-center mt-2">
              <Link href="/forgot-password" className="text-sm text-accent hover:text-accent-dark transition-colors">{t('forgot_password')}</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage; 