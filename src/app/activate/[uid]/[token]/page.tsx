'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';

interface ActivatePageProps {
  params: {
    uid: string;
    token: string;
  };
}

const ActivatePage = ({ params }: ActivatePageProps) => {
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activate = async () => {
      try {
        await axios.post('/auth/activate/', {
          uid: params.uid,
          token: params.token,
        });
        
        setStatus('success');
        
        // Show success alert
        Swal.fire({
          title: 'Account activated!',
          text: 'Your account has been successfully activated. You can now log in.',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: '#10b981',
          color: '#ffffff'
        });
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error?.response?.data?.detail || error?.message || 'Activation failed';
        setError(errorMessage);
        
        // Show error alert
        Swal.fire({
          title: 'Activation failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    };

    activate();
  }, [params.uid, params.token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="animate-spin h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Activating your account
          </h2>
          <p className="text-gray-600">
            Please wait while we activate your account...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Account activated!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been successfully activated. You can now sign in to your account.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 transition-colors"
              >
                Sign in to your account
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
              >
                Go to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Activation failed
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't activate your account. The link may be invalid or expired.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            <Link
              href="/register"
              className="block w-full px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
            >
              Create a new account
            </Link>
            <Link
              href="/login"
              className="block w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivatePage; 