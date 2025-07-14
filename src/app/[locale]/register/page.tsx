// RegisterPage: Handles user registration and account creation for the selected locale.
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { register } from '@/features/auth/authSlice';
import { getErrorMessage, isValidationError, getValidationErrors } from '@/utils/errorHandler';
import { useState as useReactState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/hooks/useI18n';
import { useParams } from 'next/navigation';

const RegisterPage = () => {
  const { t } = useTranslation('common');
  const { i18n } = useI18n();
  const isRTL = i18n.language === 'ar';
  // Field label mapping for user-friendly error messages
  const FIELD_LABELS: Record<string, string> = {
    email: t('email_address'),
    username: t('username'),
    password: t('password'),
    re_password: t('confirm_password'),
    first_name: t('first_name_optional'),
    last_name: t('last_name_optional'),
    phone_number: t('phone_number_optional'),
  };
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    re_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [unmatchedFieldErrors, setUnmatchedFieldErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useReactState(false);
  const [showRePassword, setShowRePassword] = useReactState(false);
  const params = useParams();
  const locale = params?.locale || i18n.language || 'en';

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace('/profile');
  }, [hydrated, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: [] }));
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    if (!formData.email.trim()) errors.email = [t('email_required')];
    if (!formData.username.trim()) errors.username = [t('username_required')];
    if (!formData.password) errors.password = [t('password_required')];
    if (formData.password !== formData.re_password) errors.re_password = [t('passwords_do_not_match')];
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setValidationErrors({});
    setGeneralError('');
    setUnmatchedFieldErrors([]);
    try {
      await dispatch(register(formData) as any).unwrap();
      router.push(`/${locale}/register/confirmation`);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      if (isValidationError(error)) {
        const fieldErrors = getValidationErrors(error);
        const newValidationErrors: Record<string, string[]> = {};
        const unmatched: string[] = [];
        fieldErrors.forEach(({ field, message }) => {
          if (FIELD_LABELS[field]) {
            if (!newValidationErrors[field]) newValidationErrors[field] = [];
            newValidationErrors[field].push(`${FIELD_LABELS[field]}: ${message}`);
          } else {
            unmatched.push(`${t(field)}: ${t(message)}`);
          }
        });
        setValidationErrors(newValidationErrors);
        setUnmatchedFieldErrors(unmatched);
        if (errorMessage && fieldErrors.length === 0) {
          setGeneralError(errorMessage);
        } else {
          setGeneralError('');
        }
      } else {
        setGeneralError(errorMessage || t('registration_failed'));
      }
    }
  };

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
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--color-accent-light)' }}>
              <svg className="h-8 w-8" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-heading">{t('create_account')}</h2>
            <p className="text-muted">{t('signup_to_get_started')}</p>
            <p className="mt-2 text-sm text-muted">
              {t('already_have_account')}{' '}
              <Link href={`/${locale}/login`} className="font-medium text-accent hover:text-accent-dark transition-colors">{t('sign_in_here')}</Link>
            </p>
          </div>
          {/* Show all field errors (matched and unmatched) */}
          {Object.values(validationErrors).flat().length > 0 && (
            <div className="mb-6 p-4 rounded-md text-status-error text-center"
              style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              {Object.values(validationErrors).flat().map((msg, i) => <div key={i}>{msg}</div>)}
            </div>
          )}
          {unmatchedFieldErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-md text-status-error text-center"
              style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              {unmatchedFieldErrors.map((msg, i) => <div key={i}>{msg}</div>)}
            </div>
          )}
          {/* Only show generic error if there are no field errors at all */}
          {(Object.values(validationErrors).flat().length === 0 && unmatchedFieldErrors.length === 0 && (error || generalError)) && (
            <div className="mb-6 p-4 rounded-md text-status-error text-center"
              style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              {generalError || getErrorMessage(error)}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <input
                name="email"
                type="email"
                placeholder={t('email_address')}
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.email && validationErrors.email.length > 0 ? 'border-status-error' : ''}`}
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  borderColor: validationErrors.email && validationErrors.email.length > 0 ? 'var(--color-error)' : 'var(--color-border)'
                }}
              />
              {validationErrors.email && validationErrors.email.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <input
                name="username"
                type="text"
                placeholder={t('username')}
                value={formData.username}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.username && validationErrors.username.length > 0 ? 'border-status-error' : ''}`}
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  borderColor: validationErrors.username && validationErrors.username.length > 0 ? 'var(--color-error)' : 'var(--color-border)'
                }}
              />
              {validationErrors.username && validationErrors.username.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <input
                name="first_name"
                type="text"
                placeholder={t('first_name_optional')}
                value={formData.first_name}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm border-gray-300"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              />
              {validationErrors.first_name && validationErrors.first_name.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <input
                name="last_name"
                type="text"
                placeholder={t('last_name_optional')}
                value={formData.last_name}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm border-gray-300"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              />
              {validationErrors.last_name && validationErrors.last_name.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <input
                name="phone_number"
                type="text"
                placeholder={t('phone_number_optional')}
                value={formData.phone_number}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm border-gray-300"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              />
              {validationErrors.phone_number && validationErrors.phone_number.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.password && validationErrors.password.length > 0 ? 'border-status-error' : ''}`}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text)',
                    borderColor: validationErrors.password && validationErrors.password.length > 0 ? 'var(--color-error)' : 'var(--color-border)'
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted hover:text-accent focus:outline-none ${isRTL ? 'left-3' : 'right-3'}`}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402-3.22 1.125-4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.642 1.67-1.09 2.425M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.88.18-1.717.51-2.47" /></svg>
                  )}
                </button>
              </div>
              {validationErrors.password && validationErrors.password.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
              <div className="relative">
                <input
                  name="re_password"
                  type={showRePassword ? 'text' : 'password'}
                  placeholder={t('confirm_password')}
                  value={formData.re_password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${validationErrors.re_password && validationErrors.re_password.length > 0 ? 'border-status-error' : ''}`}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text)',
                    borderColor: validationErrors.re_password && validationErrors.re_password.length > 0 ? 'var(--color-error)' : 'var(--color-border)'
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted hover:text-accent focus:outline-none ${isRTL ? 'left-3' : 'right-3'}`}
                  onClick={() => setShowRePassword((v) => !v)}
                  aria-label={showRePassword ? t('hide_password') : t('show_password')}
                >
                  {showRePassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402-3.22 1.125-4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.642 1.67-1.09 2.425M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.88.18-1.717.51-2.47" /></svg>
                  )}
                </button>
              </div>
              {validationErrors.re_password && validationErrors.re_password.map((msg, i) => <p key={i} className="text-sm text-status-error">{msg}</p>)}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-button-text bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('registering') : t('register')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage; 