"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import axios from '../../lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Swal from 'sweetalert2';
import Link from 'next/link';

const ProductsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Debug log for auth state at render (match profile page)
  console.log('PRODUCT PAGE AUTH STATE', { hydrated, isAuthenticated, loading });
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    tags: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState(searchParams.get('name__icontains') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // All other useEffects (fetchCategories, fetchProducts, etc.) should only run after hydrated
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

  useEffect(() => {
    if (!hydrated) return;
    setCategory(searchParams.get('category') || '');
  }, [hydrated, searchParams]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnail(e.target.files?.[0] || null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, category: e.target.value });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductsLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      formData.append('category', form.category);
      tags.forEach(tag => formData.append('tags', tag));
      await axios.post('/api/v1/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Swal.fire({
        title: 'Success!',
        text: 'Product added successfully!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff'
      });
      setForm({ name: '', description: '', price: '', stock: '', category: '', tags: '' });
      setThumbnail(null);
      setTags([]);
      setTagInput('');
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message || 'Failed to add product.';
      Swal.fire({
        title: 'Error!',
        text: apiMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      setError(apiMessage);
      if (apiErrors && typeof apiErrors === 'object') {
        setFieldErrors(apiErrors);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  // Build query string from filters
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (search) params.set('name__icontains', search);
    if (category) params.set('category', category);
    // ... add more filters as needed
    return params.toString();
  };

  // Fetch products with filters
  useEffect(() => {
    if (!hydrated) return;
    const fetchProducts = async () => {
      setProductsLoading(true);
      setError('');
      try {
        const query = buildQuery();
        const res = await axios.get(`/api/v1/products/${query ? '?' + query : ''}`);
        setProducts(res.data?.data || []);
      } catch (err: any) {
        setError('Failed to load products.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [hydrated, search, category]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = buildQuery();
    router.push(`/product?${query}`);
  };

  // Add this new handler for the filter dropdown (not the add product form)
  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(window.location.search);
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    router.push(`/product?${params.toString()}`);
  };

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

  return (
    <div className="min-h-screen bg-bodyC pt-24">
      <Header />
      <main className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-2">
        <div className="w-full max-w-4xl bg-cardC rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-muted/30 mb-8">
          {/* Image Preview Section */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-accentC/10 via-cardC/40 to-bodyC p-8 relative">
            <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-white/80 rounded-2xl shadow-xl border-2 border-white dark:border-cardC">
              {thumbnail ? (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-muted text-lg">Image Preview</span>
              )}
            </div>
            <label className="mt-6 w-full">
              <span className="block font-medium text-heading mb-2">Product Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-muted rounded-lg bg-bodyC text-heading"
                required
              />
            </label>
          </div>
          {/* Form Section */}
          <div className="flex-1 flex flex-col gap-6 p-8 items-center md:items-start justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-heading mb-2 relative">
              Add New Product
              <span className="block w-16 h-1 bg-accentC rounded-full mt-2 mx-auto md:mx-0"></span>
            </h1>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-semibold"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-base"
                rows={4}
                required
              />
              <div className="flex gap-4">
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-bold"
                  required
                />
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stock"
                  type="number"
                  className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC text-lg font-bold"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block mb-1 font-medium text-heading">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
                  required
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
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Add a tag and press Enter or click Add"
                    className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-accentC/10 text-accentC px-3 py-1 rounded-full text-sm font-semibold">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-accentC hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-accentC text-cardC py-3 rounded-lg font-bold text-lg hover:bg-accentC/90 transition mt-2"
                disabled={productsLoading}
              >
                {productsLoading ? 'Adding...' : 'Add Product'}
              </button>
              {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
              {Object.keys(fieldErrors).length > 0 && (
                <div className="mt-2 text-red-500 text-sm">
                  <ul className="list-disc list-inside">
                    {Object.entries(fieldErrors).map(([field, messages]) =>
                      messages.map((msg, idx) => (
                        <li key={field + idx}><span className="font-semibold">{field}:</span> {msg}</li>
                      ))
                    )}
                  </ul>
                </div>
              )}
              {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
            </form>
          </div>
        </div>
        {/* Product list and search/filter UI below */}
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-extrabold text-heading">Products</h1>
          </div>
          {/* Search and filter UI */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
            />
            <select
              value={category}
              onChange={handleCategoryFilterChange}
              className="p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-accentC text-cardC px-4 py-2 rounded-lg font-bold hover:bg-accentC/90 transition">
              Search
            </button>
          </form>
          {/* Product list UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productsLoading ? (
              <div className="col-span-2 text-center text-accentC font-bold animate-pulse">Loading products...</div>
            ) : error ? (
              <div className="col-span-2 text-center text-red-600 font-bold">{error}</div>
            ) : products.length === 0 ? (
              <div className="col-span-2 text-center text-muted font-semibold">No products found.</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="bg-white dark:bg-cardC rounded-xl shadow p-4 flex flex-col gap-2 border border-muted/20">
                  <div className="flex items-center gap-4">
                    <img src={product.thumbnail} alt={product.name} className="w-20 h-20 object-cover rounded-lg border border-muted/30" />
                    <div>
                      <h2 className="text-xl font-bold text-heading">{product.name}</h2>
                      <div className="text-muted text-sm">{product.category_name}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-accentC">${product.price}</div>
                  <div className="text-sm text-muted">Stock: {product.stock}</div>
                  <Link href={`/product/${product.id}`} className="mt-2 text-accentC font-bold hover:underline">View Details</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage; 