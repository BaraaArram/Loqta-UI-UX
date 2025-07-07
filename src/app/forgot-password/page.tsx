'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const params = useParams();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
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
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send reset email';
      setError(errorMessage);
      
      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-4">We've sent password reset instructions to <strong>{email}</strong></p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition"
          >
            Try again with a different email
          </button>
          <Link
            href={`/${params?.locale || ''}/login`}
            className="block w-full mt-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100 transition"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Forgot your password?</h2>
          <p className="text-gray-600 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
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
              className={`block w-full px-3 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm ${validationError ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter your email"
            />
            {validationError && (
              <p className="mt-1 text-xs text-red-600">{validationError}</p>
            )}
          </div>
          {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <div className="text-center mt-2">
            <Link href={`/${params?.locale || ''}/login`} className="text-sm text-gray-600 hover:underline">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 