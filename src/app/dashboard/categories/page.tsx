"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useStaffCheck } from '@/hooks/useStaffCheck';
import NoData from '@/components/NoData';
import { PencilSquareIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';

interface Category {
  slug: string;
  name: string;
}

const CategoriesPage = () => {
  const { user, isAuthenticated, hydrated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isStaff = useStaffCheck();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/dashboard');
    } else if (hydrated && isAuthenticated && isStaff === false) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthenticated, isStaff, router]);

  useEffect(() => {
    fetchCategories();
  }, [pathname]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/api/v1/categories/', { withCredentials: true });
      console.log('Categories API response:', res.data);
      let categories: Category[] = [];
      if (Array.isArray(res.data)) {
        categories = res.data;
      } else if (Array.isArray(res.data?.data)) {
        categories = res.data.data;
      } else if (Array.isArray(res.data?.results)) {
        categories = res.data.results;
      }
      setCategories(categories);
    } catch (err) {
      // handle error
    }
    setCategoriesLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/categories/', { name: newCategory }, { withCredentials: true });
      setNewCategory('');
      setShowAdd(false);
      await fetchCategories();
    } catch (err) {
      // handle error
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.put(`/api/v1/categories/${editCategory.slug}/`, { name: editName }, { withCredentials: true });
      setEditCategory(null);
      setEditName('');
      await fetchCategories();
      setActionMessage('Category updated!');
    } catch (err) {
      setActionMessage('Failed to update category.');
    }
    setActionLoading(false);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    setActionLoading(true);
    setActionMessage(null);
    console.log('Deleting category with slug:', deleteCategory.slug);
    try {
      await api.delete(`/api/v1/categories/${deleteCategory.slug}/`, { withCredentials: true });
      setDeleteCategory(null);
      await fetchCategories();
      setActionMessage('Category deleted!');
    } catch (err: any) {
      console.error('Delete category error:', err, err?.response);
      setActionMessage('Failed to delete category.');
    }
    setActionLoading(false);
  };

  if (isStaff === undefined || (hydrated && isAuthenticated && isStaff === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodyC">
        <div className="text-accentC text-xl font-bold animate-pulse">Checking staff status...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bodyC pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <section className="bg-cardC rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-heading">Categories</h1>
              <button
                className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow"
                onClick={() => setShowAdd(true)}
              >
                + Add Category
              </button>
            </div>
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-16">
                <svg className="animate-spin h-8 w-8 text-accentC" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              </div>
            ) : categories.length === 0 ? (
              <NoData message="No categories found." />
            ) : (
              <ul className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <li key={cat.slug} className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-xl shadow p-4 border border-muted/10 hover:shadow-lg transition group">
                    <span className="bg-accentC/10 text-accentC rounded-full p-3">
                      <TagIcon className="h-6 w-6" />
                    </span>
                    <span className="flex-1 text-lg font-semibold text-heading">{cat.name}</span>
                    <button
                      className="p-2 rounded-full hover:bg-accentC/10 text-accentC transition"
                      title="Edit"
                      onClick={() => { setEditCategory(cat); setEditName(cat.name); }}
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                      title="Delete"
                      onClick={() => setDeleteCategory(cat)}
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        {/* Add Category Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-2xl text-muted hover:text-accentC font-bold"
                onClick={() => setShowAdd(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-heading">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                <input
                  type="text"
                  className="pl-10 pr-3 py-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-semibold w-full"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Category Modal */}
        {editCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-2xl text-muted hover:text-accentC font-bold"
                onClick={() => setEditCategory(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-heading">Edit Category</h2>
              <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
                <input
                  type="text"
                  className="pl-10 pr-3 py-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-semibold w-full"
                  placeholder="Category name"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setEditCategory(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {actionMessage && <div className="text-center text-muted text-sm mt-2">{actionMessage}</div>}
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-2xl text-muted hover:text-accentC font-bold"
                onClick={() => setDeleteCategory(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-heading">Delete Category</h2>
              <div className="mb-6 text-muted text-center">Are you sure you want to delete <span className="font-bold text-heading">{deleteCategory.name}</span>? This action cannot be undone.</div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setDeleteCategory(null)}>
                  Cancel
                </button>
                <button type="button" className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-base shadow" onClick={handleDeleteCategory} disabled={actionLoading}>
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              {actionMessage && <div className="text-center text-muted text-sm mt-2">{actionMessage}</div>}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CategoriesPage; 