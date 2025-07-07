"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage, isValidationError, getValidationErrors } from '@/utils/errorHandler';
import { useState as useReactState } from 'react';

// Field label mapping for user-friendly error messages
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  username: 'Username',
  password: 'Password',
  re_password: 'Confirm Password',
  first_name: 'First name',
  last_name: 'Last name',
  phone_number: 'Phone number',
};

const RegisterPage = () => {
  const router = useRouter();
  const { register: registerUser, loading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    re_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [unmatchedFieldErrors, setUnmatchedFieldErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useReactState(false);
  const [showRePassword, setShowRePassword] = useReactState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/profile');
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.re_password) errors.re_password = 'Passwords do not match';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    clearError();
    setValidationErrors({});
    setGeneralError('');
    setUnmatchedFieldErrors([]);
    try {
      await registerUser(formData);
      router.push('/login');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      if (isValidationError(error)) {
        const fieldErrors = getValidationErrors(error);
        const newValidationErrors: Record<string, string> = {};
        const unmatched: string[] = [];
        fieldErrors.forEach(({ field, message }) => {
          if (FIELD_LABELS[field]) {
            newValidationErrors[field] = `${FIELD_LABELS[field]}: ${message}`;
          } else {
            unmatched.push(`${field}: ${message}`);
          }
        });
        setValidationErrors(newValidationErrors);
        setUnmatchedFieldErrors(unmatched);
        // Only show general error if there are no field errors
        if (errorMessage && fieldErrors.length === 0) {
          setGeneralError(errorMessage);
        } else {
          setGeneralError('');
        }
      } else {
        setGeneralError(errorMessage || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Sign up to get started with Loqta</p>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">Sign in here</Link>
          </p>
        </div>
        {/* Show all field errors (matched and unmatched) */}
        {Object.values(validationErrors).flat().length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-center">
            {Object.values(validationErrors).flat().map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        )}
        {unmatchedFieldErrors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-center">
            {unmatchedFieldErrors.map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        )}
        {/* Only show generic error if there are no field errors at all */}
        {(Object.values(validationErrors).flat().length === 0 && unmatchedFieldErrors.length === 0 && (error || generalError)) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-center">
            {generalError || getErrorMessage(error)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
            />
            {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm ${validationErrors.username ? 'border-red-300' : 'border-gray-300'}`}
            />
            {validationErrors.username && <p className="text-sm text-red-600">{validationErrors.username}</p>}
            <input
              name="first_name"
              type="text"
              placeholder="First Name (optional)"
              value={formData.first_name}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm border-gray-300"
            />
            {validationErrors.first_name && <p className="text-sm text-red-600">{validationErrors.first_name}</p>}
            <input
              name="last_name"
              type="text"
              placeholder="Last Name (optional)"
              value={formData.last_name}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm border-gray-300"
            />
            {validationErrors.last_name && <p className="text-sm text-red-600">{validationErrors.last_name}</p>}
            <input
              name="phone_number"
              type="text"
              placeholder="Phone Number (optional)"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm border-gray-300"
            />
            {validationErrors.phone_number && <p className="text-sm text-red-600">{validationErrors.phone_number}</p>}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm ${validationErrors.password ? 'border-red-300' : 'border-gray-300'}`}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.22-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.642 1.67-1.09 2.425M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.88.18-1.717.51-2.47" /></svg>
                )}
              </button>
            </div>
            {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
            <div className="relative">
              <input
                name="re_password"
                type={showRePassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.re_password}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm ${validationErrors.re_password ? 'border-red-300' : 'border-gray-300'}`}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 focus:outline-none"
                onClick={() => setShowRePassword((v) => !v)}
                aria-label={showRePassword ? 'Hide password' : 'Show password'}
              >
                {showRePassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.22-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.642 1.67-1.09 2.425M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.88.18-1.717.51-2.47" /></svg>
                )}
              </button>
            </div>
            {validationErrors.re_password && <p className="text-sm text-red-600">{validationErrors.re_password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 