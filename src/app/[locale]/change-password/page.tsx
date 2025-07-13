// ChangePasswordPage: Allows authenticated users to change their password.
"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/lib/i18n';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string } | null>(null);
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setLoading(true);
    try {
      await api.post("/auth/set-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      // Show success alert
      Swal.fire({
        title: 'Success!',
        text: 'Password changed successfully!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff'
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => {
        router.push(`/${params?.locale || ''}/profile?password_changed=1`);
      }, 500);
    } catch (err: any) {
      // Try to extract field errors from the API response
      const errors = err?.originalData?.errors;
      if (errors && typeof errors === 'object') {
        const fieldErrs: { [key: string]: string } = {};
        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field]) && errors[field].length > 0) {
            fieldErrs[field] = errors[field][0];
          }
        });
        setFieldErrors(fieldErrs);
        setError(null);
      } else {
        const errorMessage = err?.message || "Failed to change password";
        setError(errorMessage);
        
        // Show error alert
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bodyC">
      <Header />
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="max-w-md w-full bg-cardC border border-border rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-heading mb-4 text-center">{t('change_password')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-1">{t('current_password')}</label>
              <input
                type="password"
                className="block w-full px-3 py-2 border border-border rounded text-heading bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accentC text-sm"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {fieldErrors?.current_password && (
                <div className="mt-1 text-xs text-error">{fieldErrors.current_password}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-heading mb-1">{t('new_password')}</label>
              <input
                type="password"
                className="block w-full px-3 py-2 border border-border rounded text-heading bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accentC text-sm"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {fieldErrors?.new_password && (
                <div className="mt-1 text-xs text-error">{fieldErrors.new_password}</div>
              )}
            </div>
            {error && <div className="p-2 bg-error/10 border border-error/30 rounded text-error text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-accentC rounded hover:bg-accentC/90 transition disabled:opacity-60"
            >
              {loading ? t('changing') : t('change_password')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChangePasswordPage; 