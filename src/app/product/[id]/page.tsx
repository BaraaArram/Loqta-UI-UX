"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from '@/lib/axios';
import NoData from '@/components/NoData';
import { useAuth } from '@/contexts/AuthContext';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
dayjs.extend(relativeTime);

export default function ProductPage() {
  const params = useParams();
  const slug = params.id;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated, accessToken, hydrated } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/v1/products/${slug}/`, { withCredentials: true });
        setProduct(res.data?.data || null);
      } catch (err) {
        setError('Product not found.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug, hydrated, accessToken]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-accentC text-xl font-bold animate-pulse">Loading authentication...</div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-accentC text-xl font-bold animate-pulse">Loading product...</div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <NoData message={error || 'Product not found.'} action={<Link href="/" className="text-accentC hover:underline">Back to Home</Link>} />
      </>
    );
  }

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !accessToken) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to add items to your cart.',
        icon: 'info',
        confirmButtonText: 'Login',
        confirmButtonColor: '#0ea5e9',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
      return;
    }
    
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }
    
    setCartLoading(true);
    try {
      await addToCart(product.product_id.toString(), 1);
      
      // Show success alert
      Swal.fire({
        title: 'Added to Cart!',
        text: `${product.name} has been added to your cart successfully.`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-lg'
        }
      });
      
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      // Show error alert
      Swal.fire({
        title: 'Oops...',
        text: error.message || 'Failed to add item to cart. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        background: '#fef2f2',
        color: '#991b1b'
      });
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center py-16 px-2">
        <div className="w-full max-w-4xl bg-cardC rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-muted/30">
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-accentC/10 via-cardC/40 to-bodyC p-8 relative">
            <img
              src={product.thumbnail || '/product.png'}
              alt={product.name}
              className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-xl border-2 border-white dark:border-cardC bg-white/80 transition-transform duration-300 hover:scale-105"
            />
            {product.stock <= 5 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Low Stock</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-6 p-8 items-center md:items-start justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-heading mb-2 relative">
              {product.name}
              <span className="block w-16 h-1 bg-accentC rounded-full mt-2 mx-auto md:mx-0"></span>
            </h1>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-accentC bg-accentC/10 px-6 py-2 rounded-xl shadow-inner border border-accentC/20">${product.price}</div>
              <span className="flex items-center gap-1 px-3 py-1 bg-muted/10 text-muted rounded-full text-xs font-semibold border border-muted/20">
                <svg className="h-4 w-4 text-accentC" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                {product.category_detail?.name}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`h-5 w-5 ${i < (product.rating?.average || 0) ? 'text-yellow-400' : 'text-muted/40'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
              ))}
              <span className="ml-2 text-sm text-muted">{product.rating?.average?.toFixed(1) || 0} ({product.rating?.count || 0} reviews)</span>
            </div>
            <p className="text-base md:text-lg text-muted mb-4 whitespace-pre-line">{product.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.tags && product.tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-accentC/10 text-accentC rounded-full text-xs font-semibold">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow border ${product.stock > 0 ? (product.stock <= 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300') : 'bg-red-100 text-red-700 border-red-300'}`}>
                {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
              </span>
            </div>
            <form
              onSubmit={handleAddToCart}
              className="w-full"
            >
              <button
                type="submit"
                className="px-8 py-3 bg-accentC text-cardC rounded-xl font-bold shadow-lg hover:bg-accentC/90 transition text-lg w-full md:w-auto flex items-center gap-2 justify-center disabled:opacity-60 relative"
                disabled={cartLoading || product.stock <= 0}
              >
                {cartLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 mr-2 text-cardC" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.52 17h8.96a1 1 0 00.87-1.45L17 13M7 13V6h10v7" /></svg>
                    Add to Cart
                  </>
                )}
              </button>
            </form>
            <Link href="/" className="text-accentC hover:underline mt-4">Back to Home</Link>
          </div>
        </div>
      </main>
      {/* REVIEWS SECTION */}
      <section className="w-full max-w-4xl mx-auto mt-8 mb-16 px-2">
        {hydrated ? <ReviewsSection productSlug={product.slug} product={product} /> : <div className="text-center text-accentC animate-pulse">Loading authentication...</div>}
      </section>
      {/* PRODUCT CHAT SECTION */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-2">
        <Chat productId={product.product_id || slug} />
      </section>
    </>
  );
}

// --- Reviews Section ---
function ReviewsSection({ productSlug, product }: { productSlug: string, product: any }) {
  const { user, isAuthenticated, hydrated, accessToken } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ rating: 0, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ rating: 0, text: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reviewAuthError, setReviewAuthError] = useState('');
  const [reviewValidationErrors, setReviewValidationErrors] = useState<string[]>([]);
  const [meUsername, setMeUsername] = useState<string | null>(null);

  // Fetch current user's username from /auth/me/
  useEffect(() => {
    const fetchMe = async () => {
      if (!hydrated || !accessToken) return;
      try {
        const res = await axios.get('/auth/me/', { withCredentials: true, headers: { Authorization: `Bearer ${accessToken}` } });
        const username = res.data?.data?.data?.username;
        setMeUsername(username);
      } catch (err) {
        setMeUsername(null);
      }
    };
    fetchMe();
  }, [hydrated, accessToken]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/v1/products/${productSlug}/reviews/`, { withCredentials: true });
      // API returns { data: [ { user, rating, comment, created } ], ... }
      setReviews(res.data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    fetchReviews();
  }, [fetchReviews, hydrated, accessToken]);

  // Add review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating || !form.text.trim()) return;
    if (!accessToken) {
      setReviewAuthError('You must be logged in to submit a review.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/api/v1/products/${productSlug}/reviews/`, {
        rating: form.rating,
        text: form.text.trim(),
      }, { withCredentials: true });
      setForm({ rating: 0, text: '' });
      setReviewAuthError('');
      setReviewValidationErrors([]);
      await fetchReviews();
      Swal.fire({
        icon: 'success',
        title: 'Review submitted!',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#10b981',
        color: '#fff',
      });
    } catch (err: any) {
      if (Array.isArray(err.originalData)) {
        setReviewValidationErrors(err.originalData.map((msg: any) => String(msg)));
        setReviewAuthError('');
      } else if (err.status === 403 && err.originalData && err.originalData.message) {
        setReviewAuthError(err.originalData.message);
        setReviewValidationErrors([]);
      } else if (err.status === 403 && err.message) {
        setReviewAuthError(err.message);
        setReviewValidationErrors([]);
      } else if (err.message) {
        setReviewAuthError(err.message);
        setReviewValidationErrors([]);
      } else {
        setReviewAuthError('Failed to submit review.');
        setReviewValidationErrors([]);
      }
      Swal.fire({
        icon: 'error',
        title: 'Failed to submit review',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#ef4444',
        color: '#fff',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit review
  const handleEditReview = async (e: React.FormEvent, review: any) => {
    e.preventDefault();
    if (!editForm.rating || !editForm.text.trim()) return;
    if (!accessToken) {
      setReviewAuthError('You must be logged in to edit a review.');
      return;
    }
    setSubmitting(true);
    try {
      // Try PATCH first
      try {
        await axios.patch(`/api/v1/products/${productSlug}/reviews/${review.id || review.pk || review._id}/`, {
          rating: editForm.rating,
          comment: editForm.text.trim(),
        }, { withCredentials: true });
      } catch (patchErr) {
        // If PATCH fails, fallback to PUT
        await axios.put(`/api/v1/products/${productSlug}/reviews/${review.id || review.pk || review._id}/`, {
          rating: editForm.rating,
          comment: editForm.text.trim(),
        }, { withCredentials: true });
      }
      setEditingId(null);
      setEditForm({ rating: 0, text: '' });
      setReviewAuthError('');
      setReviewValidationErrors([]);
      await fetchReviews();
      Swal.fire({
        icon: 'success',
        title: 'Review updated!',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#10b981',
        color: '#fff',
      });
    } catch (err: any) {
      setReviewAuthError('Failed to update review.');
      Swal.fire({
        icon: 'error',
        title: 'Failed to update review',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#ef4444',
        color: '#fff',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (review: any, idx: number) => {
    const result = await Swal.fire({
      title: 'Delete Review',
      text: 'Are you sure you want to delete this review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    if (!accessToken) {
      setReviewAuthError('You must be logged in to delete a review.');
      return;
    }
    setDeletingId(idx);
    try {
      await axios.delete(`/api/v1/products/${productSlug}/reviews/${review.id || review.pk || review._id}/`, { withCredentials: true });
      await fetchReviews();
      Swal.fire({
        icon: 'success',
        title: 'Review deleted!',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#10b981',
        color: '#fff',
      });
    } catch (err: any) {
      setReviewAuthError('Failed to delete review.');
      Swal.fire({
        icon: 'error',
        title: 'Failed to delete review',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
        background: '#ef4444',
        color: '#fff',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Clear reviewAuthError and reviewValidationErrors on form change
  useEffect(() => {
    if (reviewAuthError || reviewValidationErrors.length > 0) {
      setReviewAuthError('');
      setReviewValidationErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.rating, form.text, editForm.rating, editForm.text]);

  // UI helpers
  const renderStars = (count: number) => (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < count ? 'text-yellow-400' : 'text-muted/30'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
      ))}
    </span>
  );

  // --- Render ---
  return (
    <div className="bg-cardC rounded-3xl shadow-xl border border-muted/30 p-6">
      {(reviewAuthError || reviewValidationErrors.length > 0) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-center flex flex-col items-center gap-2">
          {reviewAuthError && (
            <div className="flex items-center gap-2 text-lg font-bold text-red-700">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
              <span>{reviewAuthError}</span>
            </div>
          )}
          {reviewValidationErrors.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-base font-semibold text-red-700">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        Reviews
        <span className="text-base font-normal text-muted">({reviews.length})</span>
        {/* No average rating in new API, so omit */}
      </h2>
      {loading ? (
        <div className="py-8 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 items-center bg-white/80 dark:bg-bodyC/80 rounded-xl p-4 shadow border border-muted/20">
              <div className="w-12 h-12 rounded-full bg-muted/30" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-1/3 bg-muted/30 rounded" />
                <div className="h-3 w-2/3 bg-muted/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500 flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
          {error}
        </div>
      ) : (
        <Fragment>
          {reviews.length === 0 ? (
            <NoData message="No reviews yet. Be the first to review!" />
          ) : (
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
              {reviews.map((review: any, idx: number) => {
                const isOwnReview =
                  hydrated && meUsername &&
                  typeof review.user === 'string' &&
                  typeof meUsername === 'string' &&
                  review.user.trim().toLowerCase() === meUsername.trim().toLowerCase();
                console.log('Review user:', review.user, 'Current user (me):', meUsername, 'isOwnReview:', isOwnReview);
                return (
                  <div key={idx} className="bg-white/80 dark:bg-bodyC/80 rounded-xl p-4 shadow flex flex-col md:flex-row gap-4 border border-muted/20 relative group transition hover:shadow-lg">
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
                      <div className="w-12 h-12 rounded-full bg-accentC/10 flex items-center justify-center text-accentC font-bold text-lg">
                        {review.user ? review.user[0]?.toUpperCase() : '?'}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-muted ml-2">{dayjs(review.created).fromNow()}</span>
                      </div>
                      <span className="text-xs text-muted font-semibold mb-1 text-left w-full break-words">{review.user || 'User'}</span>
                      {editingId === idx ? (
                        <form onSubmit={e => handleEditReview(e, review)} className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map((star) => (
                              <button type="button" key={star} onClick={() => setEditForm(f => ({...f, rating: star}))} className={editForm.rating >= star ? 'text-yellow-400' : 'text-muted/30'}>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                              </button>
                            ))}
                          </div>
                          <textarea className="w-full rounded border border-muted/30 p-2 text-sm" rows={2} value={editForm.text} onChange={e => setEditForm(f => ({...f, text: e.target.value}))} required maxLength={500} />
                          <div className="flex gap-2 mt-1">
                            <button type="submit" className="px-4 py-1 rounded bg-accentC text-white font-bold hover:bg-accentC/90 transition disabled:opacity-60" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                            <button type="button" className="px-4 py-1 rounded bg-muted text-heading font-bold hover:bg-muted/80 transition" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-heading whitespace-pre-line min-h-[1.5em]">{review.comment ?? <span className='italic text-muted'>No comment provided.</span>}</p>
                      )}
                    </div>
                    {isOwnReview && editingId !== idx && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-100 group-hover:opacity-100 transition">
                        <button
                          className="p-2 rounded-full bg-accentC/10 hover:bg-accentC/20 text-accentC transition flex items-center justify-center"
                          title="Edit Review"
                          aria-label="Edit Review"
                          onClick={() => { setEditingId(idx); setEditForm({ rating: review.rating, text: review.comment || '' }); }}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition flex items-center justify-center disabled:opacity-60"
                          title="Delete Review"
                          aria-label="Delete Review"
                          disabled={deletingId === idx}
                          onClick={() => handleDeleteReview(review, idx)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Fragment>
      )}
      {/* Add Review Form */}
      {hydrated && isAuthenticated && !reviews.some(r => r.user === user?.username) && (
        <form onSubmit={handleAddReview} className="mt-8 bg-white/80 dark:bg-bodyC/80 rounded-xl p-4 shadow flex flex-col gap-2 border border-muted/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Your Rating:</span>
            {[1,2,3,4,5].map((star) => (
              <button type="button" key={star} onClick={() => setForm(f => ({...f, rating: star}))} className={form.rating >= star ? 'text-yellow-400' : 'text-muted/30'}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
              </button>
            ))}
          </div>
          <textarea className="w-full rounded border border-muted/30 p-2 text-sm" rows={3} value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} required maxLength={500} placeholder="Write your review..." />
          <button type="submit" className="px-6 py-2 rounded bg-accentC text-white font-bold hover:bg-accentC/90 transition mt-2 disabled:opacity-60" disabled={submitting || !form.rating || !form.text.trim()}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
        </form>
      )}
      {!hydrated && (
        <div className="mt-8 text-center text-muted animate-pulse">Loading authentication...</div>
      )}
      {hydrated && !isAuthenticated && (
        <div className="mt-8 text-center text-muted">Please <Link href="/login" className="text-accentC hover:underline">log in</Link> to write a review.</div>
      )}
    </div>
  );
} 