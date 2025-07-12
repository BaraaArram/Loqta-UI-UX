"use client";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/lib/axios';
import Header from '@/components/Header';
import NoData from '@/components/NoData';
import Link from 'next/link';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  slug: string;
  thumbnail?: string;
  description: string;
  category: string;
  tags: string[];
}

const UserProductsPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<{id: number, name: string, slug: string}[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.replace('/login'); return null; }
    const fetchUserProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/v1/products/user-products/');
        let data: Product[] = [];
        if (Array.isArray(res.data?.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data?.results)) {
          data = res.data.results;
        }
        setProducts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load your products");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [hydrated, isAuthenticated]);

  useEffect(() => {
    if (!hydrated) return;
    const fetchCategories = async () => {
      setCatLoading(true);
      setCatError('');
      try {
        const res = await axios.get('/api/v1/categories/');
        setCategories(res.data?.data || []);
      } catch (err: any) {
        setCatError('Failed to load categories');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, [hydrated]);

  const handleDelete = async (slug: string) => {
    const result = await Swal.fire({
      title: 'Delete Product',
      text: 'Are you sure you want to delete this product? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    setDeletingSlug(slug);
    try {
      await api.delete(`/api/v1/products/${slug}/`);
      setProducts(prev => prev.filter(p => p.slug !== slug));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Product deleted successfully.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: err?.response?.data?.detail || err?.message || 'Failed to delete product.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      thumbnail: product.thumbnail,
      category: typeof product.category === 'object' && product.category !== null ? (product.category as any).slug : product.category,
      tags: product.tags || [],
    });
    setEditError(null);
    setEditThumbnailFile(null);
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm(null);
    setEditError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, tagInput: e.target.value });
  };

  const handleEditAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newTag = (editForm.tagInput || '').trim();
    if (newTag && !editForm.tags.includes(newTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, newTag], tagInput: '' });
    }
  };

  const handleEditRemoveTag = (tagToRemove: string) => {
    setEditForm({ ...editForm, tags: editForm.tags.filter((t: string) => t !== tagToRemove) });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditThumbnailFile(e.target.files?.[0] || null);
    if (e.target.files?.[0]) {
      setEditForm({ ...editForm, thumbnail: '' }); // Clear URL if file selected
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const formData = new FormData();
      // Only append fields that have changed
      if (editForm.name !== editingProduct.name) formData.append('name', editForm.name);
      if (editForm.description !== editingProduct.description) formData.append('description', editForm.description);
      if (editForm.price !== editingProduct.price) formData.append('price', editForm.price);
      if (editForm.stock !== editingProduct.stock) formData.append('stock', editForm.stock);
      if (editForm.category !== editingProduct.category) formData.append('category', editForm.category);
      // Compare tags as arrays
      if (JSON.stringify(editForm.tags) !== JSON.stringify(editingProduct.tags)) {
        editForm.tags.forEach((tag: string) => formData.append('tags', tag));
      }
      if (editThumbnailFile) {
        formData.append('thumbnail', editThumbnailFile);
      } else if (editForm.thumbnail && editForm.thumbnail !== editingProduct.thumbnail) {
        formData.append('thumbnail', editForm.thumbnail);
      }
      await api.patch(`/api/v1/products/${editingProduct.slug}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProducts(prev => prev.map(p => p.slug === editingProduct.slug ? { ...p, ...editForm, thumbnail: editThumbnailFile ? URL.createObjectURL(editThumbnailFile) : editForm.thumbnail } : p));
      Swal.fire({
        title: 'Updated!',
        text: 'Product updated successfully.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff'
      });
      closeEdit();
      setEditThumbnailFile(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || 'Failed to update product.');
    } finally {
      setEditLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodyC">
        <div className="text-accentC text-xl font-bold animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bodyC pt-24">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative">
        <section className="bg-cardC rounded-3xl shadow-2xl p-8 border border-muted/30">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-heading relative">
              My Products
              <span className="block w-16 h-1 bg-accentC rounded-full mt-2"></span>
            </h1>
            <span className="text-muted text-lg font-semibold">{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
          </div>
          {loading ? (
            <div className="text-center text-muted py-8">Loading your products...</div>
          ) : error ? (
            <NoData message={error} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <img src="/product.png" alt="No products" className="w-32 h-32 mb-4 opacity-60" />
              <NoData message="You have not added any products yet." action={<Link href="/product" className="text-accentC hover:underline font-bold">Add your first product</Link>} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-cardC/80 rounded-lg p-3 shadow-sm border border-muted/20 hover:shadow-lg transition group">
                  <img src={item.thumbnail || '/product.png'} alt={item.name} className="h-14 w-14 object-cover rounded-lg border border-muted group-hover:scale-105 transition" />
                  <div className="flex-1">
                    <div className="font-bold text-heading text-lg group-hover:text-accentC transition">{item.name}</div>
                    <div className="text-accentC font-semibold">{item.price}</div>
                    <div className="text-muted text-xs">Stock: {item.stock}</div>
                  </div>
                  <Link href={`/product/${item.slug}`} className="px-4 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-sm focus:outline-none focus:ring-2 focus:ring-accentC">View</Link>
                  <button
                    onClick={() => handleDelete(item.slug)}
                    disabled={deletingSlug === item.slug}
                    className="ml-2 px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
                    title="Delete Product"
                  >
                    {deletingSlug === item.slug ? (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    title="Edit Product"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" /></svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Floating Add Product Button */}
        <Link
          href="/product"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 bg-accentC text-cardC rounded-full shadow-2xl hover:bg-accentC/90 transition text-lg font-bold group focus:outline-none focus:ring-4 focus:ring-accentC/30"
          title="Add Product"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span className="hidden md:inline">Add Product</span>
        </Link>
        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden border border-muted/30 relative">
              {/* Image Preview Section */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-accentC/10 via-cardC/40 to-bodyC p-4 sm:p-8 relative">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center bg-white/80 rounded-2xl shadow-xl border-2 border-white dark:border-cardC">
                  {editThumbnailFile ? (
                    <img
                      src={URL.createObjectURL(editThumbnailFile)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : editForm.thumbnail ? (
                    <img
                      src={editForm.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-muted text-lg">Image Preview</span>
                  )}
                </div>
                <label className="mt-4 w-full">
                  <span className="block font-medium text-heading mb-2">Product Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="w-full p-2 border border-muted rounded-lg bg-bodyC text-heading"
                  />
                </label>
              </div>
              {/* Form Section */}
              <div className="w-full md:w-1/2 flex flex-col gap-6 p-4 sm:p-8 items-center md:items-start justify-center relative">
                <button onClick={closeEdit} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xl text-muted hover:text-accentC">&times;</button>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-heading relative w-full text-center md:text-left">
                  Edit Product
                  <span className="block w-16 h-1 bg-accentC rounded-full mt-2 mx-auto md:mx-0"></span>
                </h2>
                <form onSubmit={handleEditSubmit} className="w-full flex flex-col gap-4">
                  <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Product Name" className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-semibold" required />
                  <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-base" rows={4} required />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" type="number" step="0.01" className="w-full sm:w-1/2 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-bold" required />
                    <input name="stock" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" type="number" className="w-full sm:w-1/2 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-bold" required />
                  </div>
                  <div className="w-full">
                    <label className="block mb-1 font-medium text-heading">Category</label>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                    {catError && <div className="text-red-600 text-sm mt-1">{catError}</div>}
                  </div>
                  <div className="w-full">
                    <label className="block mb-1 font-medium text-heading">Tags</label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input type="text" value={editForm.tagInput || ''} onChange={handleEditTagInput} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditAddTag(); } }} placeholder="Add a tag and press Enter or click Add" className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC" />
                      <button type="button" onClick={handleEditAddTag} className="w-full sm:w-auto px-3 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition mt-2 sm:mt-0">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.tags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 bg-accentC/10 text-accentC px-3 py-1 rounded-full text-sm font-semibold">
                          {tag}
                          <button type="button" onClick={() => handleEditRemoveTag(tag)} className="ml-1 text-accentC hover:text-red-600 font-bold">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-accentC text-cardC py-3 rounded-lg font-bold text-lg hover:bg-accentC/90 transition mt-2" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                  {editError && <div className="text-red-600 font-semibold text-center">{editError}</div>}
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProductsPage; 