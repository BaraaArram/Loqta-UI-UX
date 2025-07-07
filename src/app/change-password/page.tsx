"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import Swal from 'sweetalert2';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string } | null>(null);
  const router = useRouter();
  const params = useParams();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="block w-full px-3 py-2 border rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {fieldErrors?.current_password && (
              <div className="mt-1 text-xs text-red-600">{fieldErrors.current_password}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="block w-full px-3 py-2 border rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {fieldErrors?.new_password && (
              <div className="mt-1 text-xs text-red-600">{fieldErrors.new_password}</div>
            )}
          </div>
          {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition disabled:opacity-60"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage; 