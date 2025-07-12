"use client";
import { useEffect, useState, Fragment, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import Link from 'next/link';
import { CheckCircleIcon, ExclamationCircleIcon, PencilSquareIcon, ArrowPathIcon, ShoppingBagIcon, HeartIcon, HomeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import NoData from '@/components/NoData';
import { Transition } from "@headlessui/react";
import { Dialog, Transition as ModalTransition } from '@headlessui/react';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_pic?: string | null;
}

// Toast component
function Toast({ show, type, message, onClose }: { show: boolean, type: 'success' | 'error', message: string, onClose: () => void }) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        role="alert"
        aria-live="assertive"
      >
        {type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-black/10 focus:outline-none"><XMarkIcon className="h-5 w-5" /></button>
      </div>
    </Transition>
  );
}

const ProfilePage = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [showPasswordChanged, setShowPasswordChanged] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editProfilePic, setEditProfilePic] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [lastEditMethod, setLastEditMethod] = useState<'put' | 'patch' | null>(null);
  const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' });
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  console.log('Redux accessToken:', accessToken, 'hydrated:', hydrated);
  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    console.log('Profile effect accessToken:', accessToken, 'hydrated:', hydrated);
    if (!hydrated || !accessToken) return;
    console.log('PROFILE GET REQUEST:', {
      url: '/auth/me/',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const fetchUser = async () => {
      setUserLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/auth/me/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('PROFILE GET RESPONSE:', data);
        const userData = data?.data?.data || data?.data || data;
        setUser(userData);
        setEditData(userData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
        showToast('error', err.message || 'Failed to fetch user data');
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [hydrated]);

  useEffect(() => {
    if (searchParams && searchParams.get('password_changed') === '1') {
      setShowPasswordChanged(true);
      // Remove the query param after showing
      const params = new URLSearchParams(window.location.search);
      params.delete('password_changed');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    console.log('Logout redirect check:', { hydrated, isAuthenticated });
    if (hydrated && !isAuthenticated) {
      console.log('Redirecting to /login after logout');
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodyC">
        <div className="text-accentC text-xl font-bold animate-pulse">Checking authentication...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  return (
    <div className="min-h-screen bg-bodyC flex flex-col items-center py-8 px-2 pt-24">
      <Header />
      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col gap-8">
        {/* Profile Card */}
        <section className="relative bg-gradient-to-br from-accentC/10 to-cardC rounded-2xl shadow-lg p-10 flex flex-col items-center mb-8">
          {userLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-cardC/80 z-10 rounded-2xl">
              <ArrowPathIcon className="animate-spin h-8 w-8 text-accentC" />
            </div>
          )}
          {showPasswordChanged && (
            <div className="w-full mb-4 p-3 bg-accentC/10 border border-accentC rounded-lg text-accentC text-center flex items-center gap-2 justify-center">
              <CheckCircleIcon className="h-5 w-5 text-accentC" />
              <span>Password changed successfully.</span>
              <button className="ml-2 text-accentC hover:underline text-xs" onClick={() => setShowPasswordChanged(false)}>Dismiss</button>
            </div>
          )}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-accentC rounded-lg text-accentC text-center flex items-center gap-2 justify-center">
              <ExclamationCircleIcon className="h-5 w-5 text-accentC" />
              <span>{error}</span>
            </div>
          )}
          {/* Profile Image */}
          <div className="relative mb-4 group">
            <img
              src={user?.profile_pic || '/profile.png'}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-accentC shadow-lg group-hover:scale-105 transition"
            />
            <button
              className="absolute bottom-2 right-2 bg-cardC rounded-full p-2 shadow hover:bg-accentC/10 border border-accentC transition"
              onClick={() => setEditModalOpen(true)}
              aria-label="Edit Profile"
            >
              <PencilSquareIcon className="h-5 w-5 text-accentC" />
            </button>
          </div>
          <div className="w-full flex flex-col items-center mb-2">
            <div className="font-bold text-3xl text-heading mb-1">{user?.first_name} {user?.last_name}</div>
            <div className="text-muted text-lg mb-2">@{user?.username}</div>
            <div className="text-text text-base mb-2">{user?.email}</div>
            <div className="text-text text-base mb-4">{user?.phone_number}</div>
            {user?.is_active && (
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <button className="px-6 py-2 bg-accentC text-cardC rounded-lg font-bold shadow hover:bg-accentC/90 transition text-base" onClick={() => setEditModalOpen(true)}>
              Edit Profile
            </button>
            <button className="px-6 py-2 bg-cardC text-heading border border-accentC rounded-lg font-bold shadow hover:bg-accentC/10 transition text-base" onClick={() => router.push('/change-password')}>
              Change Password
            </button>
            <button className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-bold shadow hover:bg-red-200 transition text-base" onClick={async () => {
              await dispatch(logout());
              showToast('success', 'Logged out successfully!');
            }}>
              Logout
            </button>
          </div>
        </section>
        {/* Orders Section */}
        <section className="bg-cardC rounded-xl shadow p-6 flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBagIcon className="h-5 w-5 text-accentC" />
            <h2 className="text-lg font-bold text-heading">Recent Orders</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {/* Orders content or placeholder */}
            <li className="text-muted text-center py-4">No recent orders. <Link href="/shop" className="text-accentC underline">Browse products</Link></li>
          </ul>
        </section>
        {/* Addresses Section */}
        <section className="bg-cardC rounded-xl shadow p-6 flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-4">
            <HomeIcon className="h-5 w-5 text-accentC" />
            <h2 className="text-lg font-bold text-heading">Addresses</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {/* Addresses content or placeholder */}
            <li className="text-muted text-center py-4">No saved addresses. <Link href="/addresses" className="text-accentC underline">Add address</Link></li>
          </ul>
        </section>
        {/* Wishlist Section */}
        <section className="bg-cardC rounded-xl shadow p-6 flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="h-5 w-5 text-accentC" />
            <h2 className="text-lg font-bold text-heading">Wishlist</h2>
          </div>
          <div className="flex flex-col gap-4">
            {/* Wishlist content or placeholder */}
            <div className="text-muted text-center py-4">No items in wishlist. <Link href="/shop" className="text-accentC underline">Browse products</Link></div>
          </div>
        </section>
      </main>
      {/* Edit Profile Modal */}
      <ModalTransition appear show={editModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditModalOpen(false)}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-cardC rounded-2xl shadow-xl p-8 flex flex-col gap-8 border border-muted/30 animate-fadeIn">
              <Dialog.Title className="text-2xl font-bold mb-4 text-heading">Edit Profile</Dialog.Title>
              {/* Edit form fields (reuse your previous edit form JSX here) */}
              <form
                className="w-full max-w-lg mx-auto bg-white dark:bg-cardC rounded-2xl shadow-xl p-8 flex flex-col gap-8 border border-muted/30 animate-fadeIn"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditLoading(true);
                  setEditError(null);
                  setEditSuccess(null);
                  try {
                    const allFields = ['username', 'phone_number', 'first_name', 'last_name', 'profile_pic'];
                    const textFields = ['username', 'phone_number', 'first_name', 'last_name'];
                    const allChanged = allFields.every((field) => {
                      if (field === 'profile_pic') {
                        return !!editProfilePic;
                      }
                      return (editData as any)?.[field] !== (user as any)?.[field];
                    });
                    let data;
                    let method: 'put' | 'patch';
                    const isProfilePicChanged = !!editProfilePic;
                    if (allChanged) {
                      method = 'put';
                      if (isProfilePicChanged) {
                        const formData = new FormData();
                        textFields.forEach((field) => {
                          formData.append(field, editData[field]);
                        });
                        formData.append('profile_pic', editProfilePic);
                        const res = await api.put('/auth/me/', formData, {
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        console.log('PROFILE PUT RESPONSE:', res.data);
                        data = res.data;
                      } else {
                        const res = await api.put('/auth/me/', {
                          username: editData?.username,
                          phone_number: editData?.phone_number,
                          first_name: editData?.first_name,
                          last_name: editData?.last_name,
                        }, {
                          headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        console.log('PROFILE PUT RESPONSE:', res.data);
                        data = res.data;
                      }
                    } else {
                      method = 'patch';
                      if (isProfilePicChanged) {
                        const formData = new FormData();
                        textFields.forEach((field) => {
                          if (editData[field] !== (user as any)[field]) {
                            formData.append(field, editData[field]);
                          }
                        });
                        formData.append('profile_pic', editProfilePic);
                        const res = await api.patch('/auth/me/', formData, {
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        console.log('PROFILE PATCH RESPONSE:', res.data);
                        data = res.data;
                      } else {
                        const patchData: any = {};
                        textFields.forEach((field) => {
                          if (editData[field] !== (user as any)[field]) {
                            patchData[field] = editData[field];
                          }
                        });
                        const res = await api.patch('/auth/me/', patchData, {
                          headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        console.log('PROFILE PATCH RESPONSE:', res.data);
                        data = res.data;
                      }
                    }
                    setLastEditMethod(method);
                    // Fix: always extract user from possible nested response
                    const updatedUser = data?.data?.data || data?.data || data;
                    setUser(updatedUser);
                    setEditData(updatedUser);
                    setEditProfilePic(null);
                    showToast('success', `Profile updated successfully! (${method.toUpperCase()} used)`);
                    setEditModalOpen(false);
                  } catch (err: any) {
                    showToast('error', err.message || 'Failed to update profile');
                  } finally {
                    setEditLoading(false);
                  }
                }}
              >
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-base font-semibold text-heading mb-1">Profile Picture</label>
                  <div className="relative group">
                    <img
                      src={editProfilePic ? URL.createObjectURL(editProfilePic) : user?.profile_pic || '/profile.png'}
                      alt="Profile Preview"
                      className="w-28 h-28 rounded-full object-cover border-4 border-accentC shadow-lg bg-white/80 transition group-hover:scale-105"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload new profile picture"
                      onChange={e => setEditProfilePic(e.target.files?.[0] || null)}
                    />
                    <div className="absolute bottom-2 right-2 bg-accentC text-cardC rounded-full p-2 shadow-lg opacity-80 group-hover:opacity-100 transition">
                      <PencilSquareIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-xs text-muted mt-1">Click to upload a new photo</span>
                </div>
                <div className="border-t border-muted/20 my-2"></div>
                {/* Profile Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-heading">First Name</label>
                    <input
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accentC bg-bodyC/60"
                      value={editData?.first_name || ''}
                      onChange={e => setEditData((d: any) => ({ ...d, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-heading">Last Name</label>
                    <input
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accentC bg-bodyC/60"
                      value={editData?.last_name || ''}
                      onChange={e => setEditData((d: any) => ({ ...d, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-heading">Phone Number</label>
                    <input
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accentC bg-bodyC/60"
                      value={editData?.phone_number || ''}
                      onChange={e => setEditData((d: any) => ({ ...d, phone_number: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-heading">Username</label>
                    <input
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accentC bg-bodyC/60"
                      value={editData?.username || ''}
                      onChange={e => setEditData((d: any) => ({ ...d, username: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                {/* Feedback/Error/Success */}
                {editError && <div className="p-2 bg-red-50 border border-accentC rounded text-accentC text-sm flex items-center gap-2 mt-2"><ExclamationCircleIcon className="h-5 w-5 text-accentC" />{editError}</div>}
                {editSuccess && <div className="p-2 bg-green-50 border border-accentC rounded text-accentC text-sm flex items-center gap-2 mt-2"><CheckCircleIcon className="h-5 w-5 text-accentC" />{editSuccess}</div>}
                {/* Save/Cancel Buttons */}
                <div className="flex gap-4 justify-end mt-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-accentC text-cardC border border-accentC rounded-xl font-bold shadow hover:bg-accentC/90 transition text-lg flex items-center gap-2 disabled:opacity-60"
                    disabled={editLoading}
                  >
                    {editLoading && <ArrowPathIcon className="animate-spin h-5 w-5" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="px-8 py-3 bg-cardC text-heading border border-accentC rounded-xl font-bold shadow hover:bg-accentC/10 transition text-lg"
                    onClick={() => { setEditModalOpen(false); setEditError(null); setEditSuccess(null); setEditProfilePic(null); setEditData(user); }}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </ModalTransition>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </div>
  );
};

export default ProfilePage; 